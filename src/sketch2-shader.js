// src/sketch2.js
import p5 from 'p5';

// --- SHADER CODE DEFINITIONS ---
// The vertex shader is standard, passing screen coordinates and texture coordinates.
const vertShader = `
  attribute vec3 aPosition;
  attribute vec2 aTexCoord;
  
  varying vec2 vTexCoord;
  
  void main() {
    vTexCoord = aTexCoord;
    // Map coordinates to clip space (-1 to 1)
    vec4 positionVec4 = vec4(aPosition, 1.0);
    positionVec4.xy = positionVec4.xy * 2.0 - 1.0;
    gl_Position = positionVec4; // <-- CORRECTED TYPO HERE
  }
`;

// The fragment shader implements the VHS/glitch effects using uniform variables for control.
const fragShader = `
  precision highp float;
  
  varying vec2 vTexCoord;
  uniform sampler2D tex;
  uniform float time;
  uniform float glitchStrength;
  uniform float chromaOffset;
  uniform float radialDistortion;
  uniform float scanlineDensity;
  uniform float scanlineWarpAmount;
  uniform float shakeAmount;
  uniform float noiseAmount;
  uniform float scanlineEffect;
  uniform float blockGlitchChance;
  uniform vec3 scanlineColor;
  uniform float aberrationAmount;
  
  // Random function for noise and jitter effects
  float random(vec2 st) {
      return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
  }
  
  void main() {
      vec2 uv = vTexCoord;
      // Invert Y coordinate for p5.js texture handling
      uv.y = 1.0 - uv.y; 

      // --- 1. Glitch/Jitter Calculations ---
      
      // Create high-frequency noise bands along the Y axis
      float glitchNoiseA = random(vec2(time * 0.1, floor(uv.y * 30.0)));
      float glitchNoiseB = random(vec2(time * 0.23, floor(uv.y * 70.0)));
      
      // Trigger major/minor horizontal displacement based on noise thresholds
      float majorGlitch = step(0.99, glitchNoiseA);
      float minorGlitch = step(0.98, glitchNoiseB);
      
      // Combine glitch noise into a single displacement factor
      float totalGlitchDisplacement = (majorGlitch * 0.5 + minorGlitch * 0.2); 
      
      // Apply horizontal shift scaled by user uniform
      uv.x += totalGlitchDisplacement * sin(time * 5.0) * glitchStrength;
      
      // Vertical jitter/shake with controllable amount
      float shakeFactor = random(vec2(time * 0.7));
      if (shakeFactor > 0.95) {
          uv.y += random(vec2(time * 0.5)) * shakeAmount;
      }
      
      // --- 2. Chromatic Aberration & Radial Distortion ---
      
      // Center UV coordinates for radial math
      vec2 center = uv - 0.5;
      float dist = length(center);
      
      // Calculate total offset (user chroma + radial factor)
      float totalOffset = chromaOffset + dist * radialDistortion;
      
      // --- 3. Texture Sampling ---
      
      float aberr = totalOffset * aberrationAmount;
      float r = texture2D(tex, uv + vec2(aberr, 0.0)).r;
      float g = texture2D(tex, uv + vec2(0.0, scanlineWarpAmount)).g;
      float b = texture2D(tex, uv - vec2(aberr, 0.0)).b;
      
      vec3 col = vec3(r, g, b);
      
      // --- 4. Post-Processing Effects (Scanlines & Noise) ---

      // Scanline effect with controllable color and opacity
      float scanlineIntensity = sin(uv.y * 800.0 * scanlineDensity) * scanlineEffect;
      col = mix(col, scanlineColor, clamp(scanlineIntensity, 0.0, 1.0));
      
      // Add overall VHS static noise with controllable amount
      float noise = random(uv * time * 0.1) * noiseAmount;
      col += noise;
      
      // Random block shift (color shift blocks) with controllable chance
      float blockGlitch = step(1.0 - blockGlitchChance, random(vec2(floor(uv.x * 10.0), floor(time * 0.3))));
      col.r += blockGlitch * 0.3;
      col.b -= blockGlitch * 0.2;
      
      // Final color output
      gl_FragColor = vec4(col, 1.0);
  }
`;

// --- GLITCH AND EFFECT PARAMETERS CONSOLIDATED ---

const GLITCH_SETTINGS = {
    // --- Constant/Ambient Settings (Default values) ---
    DEFAULT: {
        glitchStrength: 0.00,
        shakeAmount: 0.00,
        aberrationAmount: 2.0,
        blockGlitchChance: 0.00,
        noiseAmount: 0.00,
        scanlineEffect: 0.01,
        chromaOffset: 0.0,
        radialDistortion: 0.01,
        scanlineDensity: 1.0,
        scanlineWarpAmount: 0.002,
    },
    
    // --- Initial Glitch/Startup Animation Settings ---
    INITIAL: {
        duration: 700, // ms
        maxAberrationLoops: 3,
        aberrationInterval: 100, // ms
        
        // Target high values for interpolation
        startStrength: 1.0, 
        endStrength: 0.00, // Note: Setting to 0.00 ensures a clean transition to minimalGlitch
        startShake: 0.12,
        endShake: 0.0,
        
    },
    
    // --- Occasional Short Glitch Settings ---
    SHORT_SPIKE: {
        minimalGlitch: 0.00, // Minimal background glitch after initial sequence
        spikeInterval: 15000, // 15 seconds
        spikeDuration: 100, // 100ms spike
        spikeStrength: 0.05,
        spikeShake: 0.005,
        spikeAberration: 0.8,
    }
};

// --- GLOBAL VARIABLES (State and P5.js References) ---
let theShader;
let graphics;
let shapePoints = [];
let wallOrder = [];

// Dynamic Shader Uniforms (Will be updated in p.draw based on glitch state)
let currentUniforms = {
    glitchStrength: GLITCH_SETTINGS.DEFAULT.glitchStrength,
    shakeAmount: GLITCH_SETTINGS.DEFAULT.shakeAmount,
    aberrationAmount: GLITCH_SETTINGS.DEFAULT.aberrationAmount,
    chromaOffset: GLITCH_SETTINGS.DEFAULT.chromaOffset,
    radialDistortion: GLITCH_SETTINGS.DEFAULT.radialDistortion,
    scanlineDensity: GLITCH_SETTINGS.DEFAULT.scanlineDensity,
    scanlineWarpAmount: GLITCH_SETTINGS.DEFAULT.scanlineWarpAmount,
    noiseAmount: GLITCH_SETTINGS.DEFAULT.noiseAmount,
    scanlineEffect: GLITCH_SETTINGS.DEFAULT.scanlineEffect,
    blockGlitchChance: GLITCH_SETTINGS.DEFAULT.blockGlitchChance,
};

// Internal Glitch State Variables
let initialGlitchStartTime = null;
let initialGlitchActive = true; 
let aberrationLoops = 0;
let lastAberrationTime = 0;
let lastShortGlitchTime = 0;
let tempShortGlitchActive = false;
let shortGlitchStartTime = 0; 


// --- SHAPE & LAYOUT CONFIGURATION ---
let customSvgPath =
  'M233.649 107.76H106.207L106.199 125.001H155.768V155.843H233.654L256 200H178.117L155.772 155.845H103.845V200H0L0.00031157 51.947H103.845V0H233.649V107.76Z';

let extrusionDepth = 100;
let strokeThickness = 1;
let rotationX = 48;
let rotationY = -21;
let rotationZ = -2;
let easedMouseRotationY = 0;
let posX = -20;
let posY = 0;
let shapeScale = 2;
let cameraZoom = 1;


// --- HELPER FUNCTIONS ---

function parseSVGPath(str) {
  const cmds = str.match(/[MLHVZ][^MLHVZ]*/gi) || [];
  const pts = [];
  let cx = 0,
    cy = 0,
    sx = 0,
    sy = 0;

  cmds.forEach((cmd) => {
    const t = cmd[0];
    const nums = cmd
      .slice(1)
      .trim()
      .split(/[,\s]+/)
      .filter(Boolean)
      .map(Number);

    if (t === 'M') {
      cx = nums[0];
      cy = nums[1];
      sx = cx;
      sy = cy;
      pts.push({ x: cx, y: cy });
    }
    if (t === 'L') {
      cx = nums[0];
      cy = nums[1];
      pts.push({ x: cx, y: cy });
    }
    if (t === 'H') {
      cx = nums[0];
      pts.push({ x: cx, y: cy });
    }
    if (t === 'V') {
      cy = nums[0];
      pts.push({ x: cx, y: cy });
    }
    if (t === 'Z' || t === 'z') {
      pts.push({ x: sx, y: sy });
    }
  });
  return pts;
}

function getCurrentTheme() {
  try {
    const html = document.documentElement;
    const savedTheme = html.getAttribute('data-theme');
    return savedTheme === 'light' || savedTheme === 'dark' ? savedTheme : 'light';
  } catch (e) {
    return 'light';
  }
}

// --- P5 SKETCH FUNCTION ---

export function startSketch() {
  const sketch = (p) => {

    const colors = {
      neutral: {
        50: '#fafafa',
        100: '#f5f5f5',
        200: '#e5e5e5',
        300: '#d4d4d4',
        400: '#a3a3a3',
        500: '#737373',
        600: '#525252',
        700: '#404040',
        800: '#262626',
        900: '#171717',
        950: '#0a0a0a'
      },
      amber: {
        300: '#cdbf7a',
        400: '#675b1e'
      }
    };
    
    // Responsive layout logic moved inside sketch to access p methods if needed
    function applyResponsiveLayout() {
      const w = window.innerWidth;

      if (w < 640) {
        shapeScale = 1.1;
        posX = -100;
        posY = 80;
      } else if (w < 1024) {
        shapeScale = 1.8;
        posX = -50;
        posY = 5;
      } else {
        shapeScale = 2.0;
        posX = -50;
        posY = 0;
      }
    }
    
    // Function to handle the Initial and Short Glitch sequences
    function updateGlitchState(now) {
        const INIT = GLITCH_SETTINGS.INITIAL;
        const SHORT = GLITCH_SETTINGS.SHORT_SPIKE;
        const DEFAULT = GLITCH_SETTINGS.DEFAULT;

        // Apply constant/ambient settings first
        currentUniforms = { ...currentUniforms, ...DEFAULT };

        // --- 1. Initial Glitch Sequence (Startup) ---
        if (initialGlitchActive) {
            const elapsed = now - initialGlitchStartTime;
            const progress = p.constrain(elapsed / INIT.duration, 0, 1);
            const easeProgress = p.pow(progress, 0.8);

            // Interpolate glitch values from high to low
            currentUniforms.glitchStrength = p.lerp(INIT.startStrength, INIT.endStrength, easeProgress);
            currentUniforms.shakeAmount = p.lerp(INIT.startShake, INIT.endShake, easeProgress);

            // Aberration: jitter only a few times, then settle
            if (aberrationLoops < INIT.maxAberrationLoops && now - lastAberrationTime > INIT.aberrationInterval) {
                currentUniforms.aberrationAmount = 2.0 + Math.random() * 5.0;
                aberrationLoops++;
                lastAberrationTime = now;
            } else if (aberrationLoops >= INIT.maxAberrationLoops) {
                currentUniforms.aberrationAmount = 2.0; // settle to normal
            }

            if (progress >= 1.0) {
                initialGlitchActive = false;
                // Ensure final state matches the minimal glitch setting
                currentUniforms.glitchStrength = SHORT.minimalGlitch;
                currentUniforms.shakeAmount = 0.0;
                currentUniforms.aberrationAmount = 2.0;
            }
        } 
        // --- 2. Occasional Short Glitch (After initial sequence) ---
        else {
            // Trigger new short glitch if interval passed
            if (!tempShortGlitchActive && now - lastShortGlitchTime >= SHORT.spikeInterval) {
                tempShortGlitchActive = true;
                shortGlitchStartTime = now;
                lastShortGlitchTime = now; // update the last trigger time
            }

            if (tempShortGlitchActive) {
                // Apply spike values
                currentUniforms.glitchStrength = SHORT.spikeStrength; 
                currentUniforms.shakeAmount = SHORT.spikeShake;
                currentUniforms.aberrationAmount = SHORT.spikeAberration;
                
                if (now - shortGlitchStartTime >= SHORT.spikeDuration) {
                    tempShortGlitchActive = false;
                    // Reset to minimal/ambient values
                    currentUniforms.glitchStrength = SHORT.minimalGlitch; 
                    currentUniforms.shakeAmount = 0.0;
                    currentUniforms.aberrationAmount = 2.0;
                }
            } else {
                // Apply ambient minimal glitch
                currentUniforms.glitchStrength = SHORT.minimalGlitch; 
            }
        }
    }


    p.setup = () => {
      const container = document.getElementById('canvas-container');
      const w = container.clientWidth;
      const h = container.clientHeight;

      // 1. Create main p5 canvas in WEBGL mode
      const c = p.createCanvas(w, h, p.WEBGL);
      c.parent(container);

      // 2. Load the shader
      theShader = p.createShader(vertShader, fragShader);

      // 3. Create an off-screen buffer (graphics) for 3D rendering
      graphics = p.createGraphics(w, h, p.WEBGL);

      shapePoints = parseSVGPath(customSvgPath);
      // Initialize and shuffle wall indices
      wallOrder = [];
      for (let i = 0; i < shapePoints.length - 1; i++) {
        wallOrder.push(i);
      }
      // Shuffle order
      for (let i = wallOrder.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [wallOrder[i], wallOrder[j]] = [wallOrder[j], wallOrder[i]];
      }
      
      // Initialize Timers
      initialGlitchStartTime = p.millis(); 
      lastShortGlitchTime = p.millis(); 

      window.addEventListener('resize', () => {
        const newW = container.clientWidth;
        const newH = container.clientHeight;
        p.resizeCanvas(newW, newH);
        graphics.resizeCanvas(newW, newH); // Resize the off-screen buffer too!
        applyResponsiveLayout();
      });
      applyResponsiveLayout(); // Initial layout call

      // Add scroll event listener to rotate shape along X-axis
      window.addEventListener('scroll', () => {
        const scrollY = window.scrollY;
        const docHeight = document.body.scrollHeight - window.innerHeight;
        const scrollPercent = docHeight > 0 ? scrollY / docHeight : 0;
        rotationX = 48 + scrollPercent * 120;
      });
    };

    p.lerpHex = (c1, c2, t) => {
      const a = parseInt(c1.substring(1), 16);
      const b = parseInt(c2.substring(1), 16);
      const r = Math.round(p.lerp((a >> 16) & 255, (b >> 16) & 255, t));
      const g = Math.round(p.lerp((a >> 8) & 255, (b >> 8) & 255, t));
      const bl = Math.round(p.lerp(a & 255, b & 255, t));
      return (
        '#' +
        ((r << 16) | (g << 8) | bl)
          .toString(16)
          .padStart(6, '0')
      );
    };

    const themeColors = {
      light: {
        bg: colors.neutral[200],
        stroke: colors.neutral[500],
        fill: colors.neutral[200],
        floorStroke: colors.neutral[300],
      },
      dark: {
        bg: colors.neutral[900],
        stroke: colors.neutral[400],
        fill: colors.neutral[900],
        floorStroke: colors.neutral[700],
      }
    };
    
    p.draw = () => {
      const now = p.millis();
      const currentTheme = getCurrentTheme();
      const t = themeColors[currentTheme];
      const unifiedBg = t.bg;
      const unifiedStroke = t.stroke;
      const unifiedFill = t.fill;
      const floorStrokeColor = t.floorStroke;

      // Update Glitch State and get current uniforms
      updateGlitchState(now); 

      // 1. Draw 3D scene to the off-screen buffer (graphics)
      graphics.background(p.color(unifiedBg));

      // --- Draw Horizon / floor lines ---
      const totalLines = 7;
      const floorTop = graphics.height * 0.75;
      const floorBottom = graphics.height;
      graphics.push();
      graphics.stroke(floorStrokeColor);
      graphics.strokeWeight(1);
      for (let i = 0; i < totalLines; i++) {
        const tLine = i / (totalLines - 1);
        const y = p.lerp(floorBottom, floorTop, 1 - Math.pow(tLine, 2));
        graphics.line(-graphics.width, y - graphics.height / 2, graphics.width, y - graphics.height / 2);
      }
      graphics.pop();

      // --- Draw shape (graphics buffer) ---
      graphics.push();
      graphics.stroke(unifiedStroke);
      graphics.strokeWeight(strokeThickness);
      graphics.fill(unifiedFill);

      graphics.scale(shapeScale * cameraZoom);
      graphics.translate(posX, posY);
      graphics.rotateX(p.radians(rotationX));

      easedMouseRotationY = 0;
      graphics.rotateY(p.radians(rotationY + easedMouseRotationY));
      graphics.rotateZ(p.radians(rotationZ));

      // --- Progressive Extrusion Rendering without vertex removal ---
      const totalEdges = shapePoints.length - 1;
      const depth = extrusionDepth;
      // Reveal factor based on frame count (0 to 1)
      const revealFactor = Math.min(1, p.frameCount * 0.05);

      // --- Extrusion walls ---
      graphics.beginShape(p.QUADS);
      for (let wi = 0; wi < totalEdges; wi++) {
        const visibility = Math.min(1, revealFactor * totalEdges - wi);
        if (visibility <= 0) continue; // hide wall until its turn
        const a = shapePoints[wi];
        const b = shapePoints[wi + 1];
        graphics.vertex(a.x, a.y, depth / 2);
        graphics.vertex(b.x, b.y, depth / 2);
        graphics.vertex(b.x, b.y, -depth / 2);
        graphics.vertex(a.x, a.y, -depth / 2);
      }
      graphics.endShape();

      // --- Front face ---
      graphics.beginShape();
      for (let i = 0; i < shapePoints.length; i++) {
        const visibility = Math.min(1, revealFactor * shapePoints.length - i);
        if (visibility <= 0) continue;
        const pt = shapePoints[i];
        graphics.vertex(pt.x, pt.y, depth / 2);
      }
      graphics.endShape(p.CLOSE);

      // --- Back face ---
      graphics.beginShape();
      for (let i = 0; i < shapePoints.length; i++) {
        const visibility = Math.min(1, revealFactor * shapePoints.length - i);
        if (visibility <= 0) continue;
        const pt = shapePoints[i];
        graphics.vertex(pt.x, pt.y, -depth / 2);
      }
      graphics.endShape(p.CLOSE);
      graphics.pop();

      // 2. Apply the shader to the main canvas
      p.background(0);

      // --- Activate shader and set uniforms from consolidated state ---
      p.shader(theShader);

      theShader.setUniform('tex', graphics);
      theShader.setUniform('time', p.frameCount * 0.05);
      theShader.setUniform('glitchStrength', currentUniforms.glitchStrength);
      theShader.setUniform('chromaOffset', currentUniforms.chromaOffset);
      theShader.setUniform('radialDistortion', currentUniforms.radialDistortion);
      theShader.setUniform('scanlineDensity', currentUniforms.scanlineDensity);
      theShader.setUniform('scanlineWarpAmount', currentUniforms.scanlineWarpAmount);
      theShader.setUniform('shakeAmount', currentUniforms.shakeAmount);
      theShader.setUniform('noiseAmount', currentUniforms.noiseAmount);
      theShader.setUniform('scanlineEffect', currentUniforms.scanlineEffect);
      theShader.setUniform('blockGlitchChance', currentUniforms.blockGlitchChance);
      theShader.setUniform('aberrationAmount', currentUniforms.aberrationAmount);
      theShader.setUniform('scanlineColor', [1.0, 1.0, 1.0]);

      // Draw shader quad (centered in WEBGL)
      p.rect(-p.width / 2, -p.height / 2, p.width, p.height);

      p.resetShader();
    };

  };

  if (window.p5instance) {
    window.p5instance.remove();
  }
  window.p5instance = new p5(sketch);
}