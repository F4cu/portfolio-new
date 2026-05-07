// src/sketch-led.js
import p5 from 'p5';

// --- LED PARAMS ---
const LED = {
  subW:      2,
  aspect:    4,
  gap:       1,
  minBright: 12,
  boost:     1.2,
  bloom:     0.15,
};

// --- GLOBAL VARIABLES ---
let graphics;
let shapePoints = [];
let wallOrder   = [];

// --- SHAPE & LAYOUT CONFIGURATION ---
let customSvgPath =
  'M233.649 107.76H106.207L106.199 125.001H155.768V155.843H233.654L256 200H178.117L155.772 155.845H103.845V200H0L0.00031157 51.947H103.845V0H233.649V107.76Z';

let extrusionDepth  = 100;
let strokeThickness = 1;

let highlightStrokeThickness  = 2;
let highlightStrokeColorLight = '#C58CA7';
let highlightStrokeColorDark  = '#A2D0B0';
let highlightEdgeIndex = 3;
const highlightPattern = [-3, -2, -1, 0, 5, 6, 7];

let rotationX = 48;
let rotationY = -21;
let rotationZ = -2;
let easedMouseRotationY = 0;
let posX = -20;
let posY = 0;
let shapeScale  = 2;
let cameraZoom  = 1;

// --- HELPER FUNCTIONS ---

function parseSVGPath(str) {
  const cmds = str.match(/[MLHVZ][^MLHVZ]*/gi) || [];
  const pts = [];
  let cx = 0, cy = 0, sx = 0, sy = 0;

  cmds.forEach((cmd) => {
    const t    = cmd[0];
    const nums = cmd.slice(1).trim().split(/[,\s]+/).filter(Boolean).map(Number);

    if (t === 'M') { cx = nums[0]; cy = nums[1]; sx = cx; sy = cy; pts.push({ x: cx, y: cy }); }
    if (t === 'L') { cx = nums[0]; cy = nums[1]; pts.push({ x: cx, y: cy }); }
    if (t === 'H') { cx = nums[0]; pts.push({ x: cx, y: cy }); }
    if (t === 'V') { cy = nums[0]; pts.push({ x: cx, y: cy }); }
    if (t === 'Z' || t === 'z') { pts.push({ x: sx, y: sy }); }
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

    let sourceImg = null;
    let imgBuffer = null;

    const colors = {
      neutral: {
        50: '#fafafa', 100: '#f5f5f5', 200: '#e5e5e5', 300: '#d4d4d4',
        400: '#a3a3a3', 500: '#737373', 600: '#525252', 700: '#404040',
        800: '#262626', 900: '#171717', 950: '#0a0a0a',
      },
      amber: { 300: '#cdbf7a', 400: '#675b1e' },
    };

    function applyResponsiveLayout() {
      const w = window.innerWidth;
      if (w < 640)       { shapeScale = 1.1; posX = -100; posY = 80; }
      else if (w < 1024) { shapeScale = 1.8; posX = -50;  posY = 5;  }
      else               { shapeScale = 2.0; posX = -50;  posY = 0;  }
    }

    function buildBuffer() {
      if (!sourceImg) return;
      if (imgBuffer) imgBuffer.remove();

      const cw = p.width, ch = p.height;
      const sc = Math.max(cw / sourceImg.width, ch / sourceImg.height);
      const dw = sourceImg.width  * sc;
      const dh = sourceImg.height * sc;

      imgBuffer = p.createGraphics(cw, ch);
      imgBuffer.background(0);
      imgBuffer.image(sourceImg, (cw - dw) / 2, (ch - dh) / 2, dw, dh);
      imgBuffer.loadPixels();
    }

    function drawLEDLayer() {
      if (!imgBuffer) return;

      const { subW, aspect, gap, minBright, boost, bloom } = LED;
      const subH  = subW * aspect;
      const cellW = subW * 3 + gap;
      const cellH = subH + gap;
      const cols  = Math.ceil(p.width  / cellW);
      const rows  = Math.ceil(p.height / cellH);

      p.noStroke();

      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          const cellX = col * cellW;
          const cellY = row * cellH;

          const x0 = Math.max(0, Math.floor(cellX));
          const y0 = Math.max(0, Math.floor(cellY));
          const x1 = Math.min(imgBuffer.width  - 1, Math.floor(cellX + cellW));
          const y1 = Math.min(imgBuffer.height - 1, Math.floor(cellY + cellH));

          let r = 0, g = 0, b = 0;
          for (let sy = y0; sy <= y1; sy++) {
            for (let sx = x0; sx <= x1; sx++) {
              const idx = (sy * imgBuffer.width + sx) * 4;
              if (imgBuffer.pixels[idx]     > r) r = imgBuffer.pixels[idx];
              if (imgBuffer.pixels[idx + 1] > g) g = imgBuffer.pixels[idx + 1];
              if (imgBuffer.pixels[idx + 2] > b) b = imgBuffer.pixels[idx + 2];
            }
          }

          r = Math.min(255, Math.max(minBright, r * boost));
          g = Math.min(255, Math.max(minBright, g * boost));
          b = Math.min(255, Math.max(minBright, b * boost));

          if (bloom > 0 && (r + g + b) / 3 > minBright + 10) {
            p.fill(r, g, b, bloom * 255);
            p.rect(cellX - subW, cellY - subW, cellW + subW * 2, subH + subW * 2);
          }

          p.fill(r, 0, 0); p.rect(cellX,           cellY, subW, subH);
          p.fill(0, g, 0); p.rect(cellX + subW,     cellY, subW, subH);
          p.fill(0, 0, b); p.rect(cellX + subW * 2, cellY, subW, subH);
        }
      }
    }

    p.setup = async () => {
      const container = document.getElementById('canvas-container');
      const w = container.clientWidth;
      const h = container.clientHeight;

      const c = p.createCanvas(w, h, p.WEBGL);
      c.parent(container);

      graphics = p.createGraphics(w, h, p.WEBGL);

      shapePoints = parseSVGPath(customSvgPath);

      wallOrder = [];
      for (let i = 0; i < shapePoints.length - 1; i++) wallOrder.push(i);
      for (let i = wallOrder.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [wallOrder[i], wallOrder[j]] = [wallOrder[j], wallOrder[i]];
      }

      window.addEventListener('resize', () => {
        const newW = container.clientWidth;
        const newH = container.clientHeight;
        p.resizeCanvas(newW, newH);
        graphics.resizeCanvas(newW, newH);
        buildBuffer();
        applyResponsiveLayout();
      });

      window.addEventListener('scroll', () => {
        const scrollY   = window.scrollY;
        const docHeight = document.body.scrollHeight - window.innerHeight;
        const scrollPct = docHeight > 0 ? scrollY / docHeight : 0;
        rotationX = 48 + scrollPct * 120;
      });

      applyResponsiveLayout();
      sourceImg = await p.loadImage('/images/background-home-test2.png');
      buildBuffer();
    };

    p.lerpHex = (c1, c2, t) => {
      const a  = parseInt(c1.substring(1), 16);
      const b  = parseInt(c2.substring(1), 16);
      const r  = Math.round(p.lerp((a >> 16) & 255, (b >> 16) & 255, t));
      const g  = Math.round(p.lerp((a >> 8)  & 255, (b >> 8)  & 255, t));
      const bl = Math.round(p.lerp( a        & 255,  b        & 255, t));
      return '#' + ((r << 16) | (g << 8) | bl).toString(16).padStart(6, '0');
    };

    const themeColors = {
      light: {
        bg:          colors.neutral[200],
        stroke:      colors.neutral[500],
        fill:        colors.neutral[200],
        floorStroke: colors.neutral[300],
      },
      dark: {
        bg:          colors.neutral[900],
        stroke:      colors.neutral[400],
        fill:        colors.neutral[900],
        floorStroke: colors.neutral[700],
      },
    };

    p.draw = () => {
      const currentTheme   = getCurrentTheme();
      const t              = themeColors[currentTheme];
      const unifiedBg      = t.bg;
      const unifiedStroke  = t.stroke;
      const unifiedFill    = t.fill;
      const floorStrokeColor = t.floorStroke;

      // 1. Draw 3D scene to the off-screen buffer (unchanged from reference)
      graphics.background(p.color(unifiedBg));

      const totalLines  = 7;
      const floorTop    = graphics.height * 0.75;
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

      const totalEdges    = shapePoints.length - 1;
      const depth         = extrusionDepth;
      const revealFactor  = Math.min(1, p.frameCount * 0.05);
      const isFullyRevealed = revealFactor >= 1.0;

      if (!isFullyRevealed) {
        graphics.beginShape(p.LINES);
        for (let wi = 0; wi < totalEdges; wi++) {
          const visibility = Math.min(1, revealFactor * totalEdges - wi);
          if (visibility <= 0) continue;
          const a = shapePoints[wi];
          const b = shapePoints[wi + 1];
          graphics.vertex(a.x, a.y,  depth / 2);
          graphics.vertex(b.x, b.y,  depth / 2);
          graphics.vertex(a.x, a.y, -depth / 2);
          graphics.vertex(b.x, b.y, -depth / 2);
          graphics.vertex(a.x, a.y,  depth / 2);
          graphics.vertex(a.x, a.y, -depth / 2);
        }
        graphics.endShape();
      } else {
        graphics.beginShape(p.QUADS);
        for (let wi = 0; wi < totalEdges; wi++) {
          const a = shapePoints[wi];
          const b = shapePoints[wi + 1];
          graphics.vertex(a.x, a.y,  depth / 2);
          graphics.vertex(b.x, b.y,  depth / 2);
          graphics.vertex(b.x, b.y, -depth / 2);
          graphics.vertex(a.x, a.y, -depth / 2);
        }
        graphics.endShape();
      }

      if (isFullyRevealed) {
        graphics.push();
        graphics.noStroke();
        graphics.fill(unifiedFill);
        graphics.beginShape();
        for (let i = 0; i < shapePoints.length; i++) {
          const pt = shapePoints[i];
          graphics.vertex(pt.x, pt.y, depth / 2);
        }
        graphics.endShape(p.CLOSE);
        graphics.pop();

        const highlightStrokeColor =
          currentTheme === 'dark' ? highlightStrokeColorDark : highlightStrokeColorLight;
        graphics.push();
        graphics.noFill();
        graphics.stroke(highlightStrokeColor);
        graphics.strokeWeight(highlightStrokeThickness);
        graphics.beginShape(p.LINES);
        for (const offset of highlightPattern) {
          const i = highlightEdgeIndex + offset;
          if (i < 0 || i >= shapePoints.length - 1) continue;
          const a = shapePoints[i];
          const b = shapePoints[i + 1];
          graphics.vertex(a.x, a.y, depth / 2);
          graphics.vertex(b.x, b.y, depth / 2);
        }
        graphics.endShape();
        graphics.pop();
      }

      if (isFullyRevealed) {
        graphics.beginShape();
        for (let i = 0; i < shapePoints.length; i++) {
          const pt = shapePoints[i];
          graphics.vertex(pt.x, pt.y, -depth / 2);
        }
        graphics.endShape(p.CLOSE);
      }
      graphics.pop();

      // 2. LED pixel grid replacing the shader
      // In WEBGL mode (0,0) is canvas centre — shift origin to top-left for rect coords.
      p.background(0);
      p.push();
      p.translate(-p.width / 2, -p.height / 2);
      drawLEDLayer();
      p.pop();

      // 3D extrusion on top via SCREEN blend (same pattern as led-face.html)
      p.blendMode(p.SCREEN);
      p.image(graphics, -p.width / 2, -p.height / 2);
      p.blendMode(p.BLEND);
    };
  };

  if (window.p5instance) {
    window.p5instance.remove();
  }
  window.p5instance = new p5(sketch);
}
