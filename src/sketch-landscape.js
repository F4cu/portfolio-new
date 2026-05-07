// src/sketch2.js
import p5 from 'p5';

// ---------------------------------------------------------------------------
// TERRAIN CONFIG — edit these values to reshape the scene
// ---------------------------------------------------------------------------
export const TERRAIN_CONFIG = {
  // Camera & observer
  cameraHeight:     150,
  cameraElevationX:  180,
  cameraYaw:          0,

  // Mountain ring
  mountainHeight:   1000,
  mountainScale:   0.038,
  mountainRidges:  0.018,

  // Per-quadrant ruggedness — from the camera's point of view:
  //   FL = front-left  (near, left)    FR = front-right (near, right)
  //   BL = back-left   (far,  left)    BR = back-right  (far,  right)
  ruggednessFR: 1,
  ruggednessFL: 6,
  ruggednessBR: 5,
  ruggednessBL: 4,

  // Valley floor
  valleyDepth:      220,
  valleyFalloff:    0.9,

  // Grid resolution
  gridSize:          90,
  cellSize:          28,

  // Fog
  fogStart:        0.35,
  fogEnd:          0.95,

  // Startup fade
  fadeDuration:    900,
};
// ---------------------------------------------------------------------------

// --- SHADERS ---
const vertShader = `
  attribute vec3 aPosition;
  attribute vec2 aTexCoord;
  varying vec2 vTexCoord;
  void main() {
    vTexCoord = aTexCoord;
    vec4 pos = vec4(aPosition, 1.0);
    pos.xy = pos.xy * 2.0 - 1.0;
    gl_Position = pos;
  }
`;

const fragShader = `
  precision mediump float;
  varying vec2 vTexCoord;
  uniform sampler2D tex;
  void main() {
    vec2 uv = vTexCoord;
    uv.y = 1.0 - uv.y;
    vec4 color = texture2D(tex, uv);
    vec2 center = uv - 0.5;
    float vignette = 1.0 - dot(center, center) * 2.2;
    vignette = clamp(vignette, 0.0, 1.0);
    color.rgb *= vignette;
    gl_FragColor = color;
  }
`;

// --- STATE ---
let theShader;
let graphics;
let terrain = [];
let startTime = null;
let currentLineOpacity = 0;

// --- HELPERS ---

function getCurrentTheme() {
  try {
    const saved = document.documentElement.getAttribute('data-theme');
    return saved === 'light' || saved === 'dark' ? saved : 'light';
  } catch { return 'light'; }
}

function generateTerrain() {
  const cfg = TERRAIN_CONFIG;
  terrain = [];
  const half = (cfg.gridSize * cfg.cellSize) / 2;
  for (let z = 0; z <= cfg.gridSize; z++) {
    const row = [];
    for (let x = 0; x <= cfg.gridSize; x++) {
      row.push({ x: x * cfg.cellSize - half, y: 0, z: z * cfg.cellSize - half });
    }
    terrain.push(row);
  }
}

/**
 * Returns a bilinearly interpolated ruggedness value for a grid vertex.
 * nx, nz in [0, 1].
 *
 * Grid orientation vs camera view:
 *   z=0 → back (far from camera)     z=1 → front (close to camera)
 *   x=0 → left                       x=1 → right
 *
 *   BL (back-left)  | BR (back-right)      z=0 (far)
 *   ----------------+----------------
 *   FL (front-left) | FR (front-right)     z=1 (near)
 */
function getBlendedRuggedness(nx, nz, cfg) {
  const tx     = nx;   // 0 = left,  1 = right
  const tFront = nz;   // 0 = back,  1 = front

  const back  = cfg.ruggednessBL + (cfg.ruggednessBR - cfg.ruggednessBL) * tx;
  const front = cfg.ruggednessFL + (cfg.ruggednessFR - cfg.ruggednessFL) * tx;

  return back + (front - back) * tFront;
}

function updateTerrain(p) {
  const cfg = TERRAIN_CONFIG;
  let yoff = 0;

  for (let z = 0; z <= cfg.gridSize; z++) {
    let xoff = 0;
    const nz = z / cfg.gridSize; // normalised z in [0,1]

    for (let x = 0; x <= cfg.gridSize; x++) {
      const nx = x / cfg.gridSize; // normalised x in [0,1]

      const noiseVal = p.noise(xoff, yoff);

      // Blend ruggedness from all four quadrant corners
      const ruggedness = getBlendedRuggedness(nx, nz, cfg);
      const shaped = Math.pow(noiseVal, ruggedness);

      terrain[z][x].y = p.map(shaped, 0, 1, -cfg.mountainHeight, cfg.mountainHeight);

      xoff += cfg.mountainScale;
    }

    yoff += cfg.mountainScale;
  }
}

// --- SKETCH ---

export function startSketch() {
  const sketch = (p) => {

    const palette = {
      light: { bg: '#e5e5e5', stroke: '#737373', fogColor: '#e5e5e5' },
      dark:  { bg: '#171717', stroke: '#a3a3a3', fogColor: '#171717' },
    };

    let shapeScale = 1.0;

    function applyResponsiveLayout() {
      const w = window.innerWidth;
      if      (w < 640)  shapeScale = 0.55;
      else if (w < 1024) shapeScale = 0.80;
      else               shapeScale = 1.00;
    }

    function hexToRgb(hex) {
      const n = parseInt(hex.replace('#', ''), 16);
      return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
    }

    function fogAlpha(normZ) {
      const { fogStart, fogEnd } = TERRAIN_CONFIG;
      if (normZ < fogStart) return 1.0;
      if (normZ > fogEnd)   return 0.0;
      return 1.0 - (normZ - fogStart) / (fogEnd - fogStart);
    }

    p.setup = () => {
      const container = document.getElementById('canvas-container');
      const w = container.clientWidth;
      const h = container.clientHeight;

      const c = p.createCanvas(w, h, p.WEBGL);
      c.parent(container);

      graphics = null;

      p.noiseSeed(42);

      generateTerrain();
      updateTerrain(p);

      startTime = p.millis();

      window.addEventListener('resize', () => {
        const nw = container.clientWidth;
        const nh = container.clientHeight;
        p.resizeCanvas(nw, nh);
        applyResponsiveLayout();
      });

      applyResponsiveLayout();

      const cfg = TERRAIN_CONFIG;

      // --- DEBUG SLIDERS ---
      const controls = document.createElement('div');
      controls.style.cssText = `
        position: absolute;
        bottom: 20px;
        left: 20px;
        z-index: 100;
        background: rgba(0,0,0,0.55);
        padding: 14px 16px;
        border-radius: 10px;
        color: white;
        font-family: monospace;
        font-size: 11px;
        display: flex;
        flex-direction: column;
        gap: 8px;
        min-width: 220px;
      `;

      // Section label helper
      function addLabel(text) {
        const el = document.createElement('div');
        el.textContent = text;
        el.style.cssText = 'font-size:10px; text-transform:uppercase; letter-spacing:0.08em; opacity:0.5; margin-top:4px;';
        controls.appendChild(el);
      }

      // Divider
      function addDivider() {
        const el = document.createElement('hr');
        el.style.cssText = 'border:none; border-top:1px solid rgba(255,255,255,0.15); margin:2px 0;';
        controls.appendChild(el);
      }

      function createSlider({ label, min, max, step, getValue, setValue }) {
        const wrapper = document.createElement('label');
        wrapper.style.cssText = 'display:flex; flex-direction:column; gap:2px;';

        const titleRow = document.createElement('div');
        titleRow.style.cssText = 'display:flex; justify-content:space-between;';

        const labelEl = document.createElement('span');
        labelEl.textContent = label;

        const valueEl = document.createElement('span');
        valueEl.style.opacity = '0.7';
        valueEl.textContent = getValue();

        titleRow.appendChild(labelEl);
        titleRow.appendChild(valueEl);

        const input = document.createElement('input');
        input.type = 'range';
        input.min = min;
        input.max = max;
        input.step = step;
        input.value = getValue();
        input.style.width = '100%';

        input.oninput = (e) => {
          const v = parseFloat(e.target.value);
          setValue(v);
          valueEl.textContent = v.toFixed(2);
        };

        wrapper.appendChild(titleRow);
        wrapper.appendChild(input);
        controls.appendChild(wrapper);
      }

      // --- Camera controls ---
      addLabel('Camera');
      createSlider({
        label: 'Rotate X',
        min: -200, max: 200, step: 1,
        getValue: () => cfg.cameraElevationX,
        setValue: (v) => cfg.cameraElevationX = v
      });
      createSlider({
        label: 'Rotate Y',
        min: -300, 300: 90, step: 1,
        getValue: () => cfg.cameraYaw,
        setValue: (v) => cfg.cameraYaw = v
      });
      createSlider({
        label: 'Camera Height',
        min: 0, max: 400, step: 10,
        getValue: () => cfg.cameraHeight,
        setValue: (v) => cfg.cameraHeight = v
      });

      addDivider();

      // --- Per-quadrant ruggedness controls ---
      // Presented as a 2×2 spatial grid to match the terrain quadrants
      addLabel('Ruggedness per quadrant');

      // Row 1: NW | NE
      const row1 = document.createElement('div');
      row1.style.cssText = 'display:grid; grid-template-columns:1fr 1fr; gap:8px;';

      function createCompactSlider(label, getValue, setValue) {
        const wrap = document.createElement('div');
        wrap.style.cssText = 'display:flex; flex-direction:column; gap:2px;';

        const titleRow = document.createElement('div');
        titleRow.style.cssText = 'display:flex; justify-content:space-between;';

        const lbl = document.createElement('span');
        lbl.textContent = label;
        lbl.style.opacity = '0.85';

        const val = document.createElement('span');
        val.style.opacity = '0.6';
        val.textContent = getValue().toFixed(1);

        titleRow.appendChild(lbl);
        titleRow.appendChild(val);

        const input = document.createElement('input');
        input.type = 'range';
        input.min = 1;
        input.max = 10;
        input.step = 0.1;
        input.value = getValue();
        input.style.width = '100%';

        input.oninput = (e) => {
          const v = parseFloat(e.target.value);
          setValue(v);
          val.textContent = v.toFixed(1);
          updateTerrain(p); // live regeneration
        };

        wrap.appendChild(titleRow);
        wrap.appendChild(input);
        return wrap;
      }

      row1.appendChild(createCompactSlider('BL ↖', () => cfg.ruggednessBL, v => cfg.ruggednessBL = v));
      row1.appendChild(createCompactSlider('BR ↗', () => cfg.ruggednessBR, v => cfg.ruggednessBR = v));
      controls.appendChild(row1);

      // Row 2: FL | FR  (front = near camera = bottom of UI)
      const row2 = document.createElement('div');
      row2.style.cssText = 'display:grid; grid-template-columns:1fr 1fr; gap:8px;';

      row2.appendChild(createCompactSlider('FL ↙', () => cfg.ruggednessFL, v => cfg.ruggednessFL = v));
      row2.appendChild(createCompactSlider('FR ↘', () => cfg.ruggednessFR, v => cfg.ruggednessFR = v));
      controls.appendChild(row2);

      document.body.appendChild(controls);

      window.addEventListener('scroll', () => {
        TERRAIN_CONFIG.cameraElevationX = 65;
      });
    };

    p.draw = () => {
      const cfg   = TERRAIN_CONFIG;
      const now   = p.millis();
      const theme = getCurrentTheme();
      const pal   = palette[theme];

      currentLineOpacity = Math.min((now - startTime) / cfg.fadeDuration, 1.0);

      p.background(p.color(pal.bg));
      p.push();
      
      // 1. Position the camera globally
      // We translate the world backward so the rotation feels natural
      p.translate(0, -cfg.cameraHeight, -600); 

      // 2. Adjust Rotation Logic
      // Adding 180 means when elevation is -180, the result is 0.
      // We use p.rotateX(p.radians(cfg.cameraElevationX + 180));
      p.rotateX(p.radians(cfg.cameraElevationX + 180));
      p.rotateY(p.radians(cfg.cameraYaw));
      
      // Squashing the Y axis for a more "topographical" feel
      p.scale(1, 0.5, 1);

      const w = cfg.gridSize * cfg.cellSize;
      const h = cfg.gridSize * cfg.cellSize;

      // 3. Center the Grid
      // Since our generateTerrain handles centering via 'half', 
      // we just need to ensure we aren't double-translating.
      // We move the scene up slightly to center the mountains vertically.
      p.translate(0, 100, 0);

      for (let z = 0; z < cfg.gridSize; z++) {
        // Calculate fog/alpha based on distance from the camera (z-index)
        // If -180 is now "front", z=0 is the far back, z=gridSize is the front.
        const depth = z / cfg.gridSize;
        const alpha = 255 * depth; // Fades out the back rows

        p.stroke(...hexToRgb(pal.stroke), alpha);
        p.noFill();

        p.beginShape(p.TRIANGLE_STRIP);
        for (let x = 0; x <= cfg.gridSize; x++) {
          const v1 = terrain[z][x];
          const v2 = terrain[z + 1][x];

          // Use the raw coordinates from generateTerrain()
          p.vertex(v1.x, v1.y, v1.z);
          p.vertex(v2.x, v2.y, v2.z);
        }
        p.endShape();
      }

      p.pop();
    };
  };

  if (window.p5instance) window.p5instance.remove();
  window.p5instance = new p5(sketch);
}