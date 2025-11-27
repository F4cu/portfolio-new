// src/sketch2.js
import p5 from 'p5';

let customSvgPath =
  'M233.649 107.76H106.207L106.199 125.001H155.768V155.843H233.654L256 200H178.117L155.772 155.845H103.845V200H0L0.00031157 51.947H103.845V0H233.649V107.76Z';

// State variables
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
let shapePoints = [];

let keyframes = [];
let isPlayingTimeline = false;
let timelineIndex = 0;
let timelineStartTime = 0;
let animationDuration = 2;
let animateRotation = false;

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

export function startSketch() {
  const sketch = (p) => {

    const colors = {
      neutral: {
        50:  '#fafafa',
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

    // Responsive breakpoint system for scale and position
    function applyResponsiveLayout() {
      const w = window.innerWidth;

      if (w < 640) {
        // Mobile
        shapeScale = 1.4;   // adjust freely
        posX = -100;
        posY = 50;
      } else if (w < 1024) {
        // Tablet
        shapeScale = 1.8;   // adjust freely
        posX = -50;
        posY = 5;
      } else {
        // Desktop
        shapeScale = 2.0;   // adjust freely
        posX = -50;
        posY = 0;
      }
    }

    applyResponsiveLayout();
    window.addEventListener('resize', applyResponsiveLayout);

    p.setup = () => {
      const container = document.getElementById('canvas-container');
      const c = p.createCanvas(
        container.clientWidth,
        container.clientHeight,
        p.WEBGL
      );
      c.parent(container);

      shapePoints = parseSVGPath(customSvgPath);
      timelineStartTime = p.millis();

      window.addEventListener('resize', () => {
        p.resizeCanvas(container.clientWidth, container.clientHeight);
      });

      // Add scroll event listener to rotate shape along X-axis
      window.addEventListener('scroll', () => {
        const scrollY = window.scrollY;
        const docHeight = document.body.scrollHeight - window.innerHeight;
        const scrollPercent = docHeight > 0 ? scrollY / docHeight : 0;
        rotationX = 48 + scrollPercent * 120; // adjust for tilt
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
        stroke: colors.amber[300],
        fill: colors.neutral[200],
        floorStroke: colors.neutral[300],
      },
      dark: {
        bg: colors.neutral[900],
        stroke: colors.amber[400],
        fill: colors.neutral[900],
        floorStroke: colors.neutral[800],
      }
    };

    p.draw = () => {
      const currentTheme = getCurrentTheme();

      const t = themeColors[currentTheme];
      const unifiedBg = t.bg;
      const unifiedStroke = t.stroke;
      const unifiedFill = t.fill;
      const floorStrokeColor = t.floorStroke;

      p.background(unifiedBg);

      // Horizon / floor lines
      const totalLines = 7;
      const floorTop = p.height * 0.75;
      const floorBottom = p.height;
      p.push();
      p.stroke(floorStrokeColor);
      p.strokeWeight(1);
      for (let i = 0; i < totalLines; i++) {
        const t = i / (totalLines - 1);
        const y = p.lerp(floorBottom, floorTop, 1 - Math.pow(t, 2));
        p.line(-p.width, y - p.height / 2, p.width, y - p.height / 2);
      }
      p.pop();

      // Timeline interpolation (optional)
      if (isPlayingTimeline && keyframes.length > 1) {
        const now = p.millis();
        const t = (now - timelineStartTime) / (animationDuration * 1000);
        if (t >= 1) {
          timelineIndex++;
          if (timelineIndex >= keyframes.length - 1) {
            isPlayingTimeline = false;
          } else {
            timelineStartTime = now;
          }
        } else {
          const a = keyframes[timelineIndex];
          const b = keyframes[timelineIndex + 1];
          extrusionDepth = p.lerp(a.extrusionDepth, b.extrusionDepth, t);
          strokeThickness = p.lerp(a.strokeThickness, b.strokeThickness, t);
          rotationX = p.lerp(a.rotationX, b.rotationX, t);
          rotationY = p.lerp(a.rotationY, b.rotationY, t);
          rotationZ = p.lerp(a.rotationZ, b.rotationZ, t);
          shapeScale = p.lerp(a.shapeScale, b.shapeScale, t);
          cameraZoom = p.lerp(a.cameraZoom, b.cameraZoom, t);
          posX = p.lerp(a.posX, b.posX, t);
          posY = p.lerp(a.posY, b.posY, t);
        }
      }

      // Draw shape
      p.push();
      p.stroke(unifiedStroke);
      p.strokeWeight(strokeThickness);
      p.fill(unifiedFill);

      p.scale(shapeScale * cameraZoom);
      p.translate(posX, posY);
      p.rotateX(p.radians(rotationX));

      // Mouse-based rotation around Y axis WITH EASING
      let dx = p.mouseX - p.width / 2;
      let maxDist = p.width / 2;
      let mouseFactor = p.constrain(dx / maxDist, -1, 0);
      let targetMouseRotation = mouseFactor * 5; // max ±5 degrees

      // Easing factor (smaller = smoother)
      easedMouseRotationY = p.lerp(easedMouseRotationY, targetMouseRotation, 0.1);

      p.rotateY(p.radians(rotationY + easedMouseRotationY));

      if (animateRotation) rotationY += 0.1;

      p.rotateZ(p.radians(rotationZ));

      const depth = extrusionDepth;

      p.beginShape();
      shapePoints.forEach((pt) => p.vertex(pt.x, pt.y, depth / 2));
      p.endShape(p.CLOSE);

      p.beginShape();
      shapePoints.forEach((pt) => p.vertex(pt.x, pt.y, -depth / 2));
      p.endShape(p.CLOSE);

      p.fill(unifiedFill);
      p.beginShape(p.QUADS);
      for (let i = 0; i < shapePoints.length - 1; i++) {
        const a = shapePoints[i];
        const b = shapePoints[i + 1];

        p.vertex(a.x, a.y,  depth / 2);
        p.vertex(b.x, b.y,  depth / 2);
        p.vertex(b.x, b.y, -depth / 2);
        p.vertex(a.x, a.y, -depth / 2);
      }
      p.endShape();

      p.pop();
    };
  };

  if (window.p5instance) {
    window.p5instance.remove();
  }
  window.p5instance = new p5(sketch);
}