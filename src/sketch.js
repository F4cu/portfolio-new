// src/sketch.js
import p5 from 'p5';
import twColors from 'tailwindcss/colors';

export function startSketch() {
  const sketch = (p) => {
    // ──────────────────────
    // 1. Colors (Tailwind v4 – dynamic from tailwindcss/colors)
    // ──────────────────────
    const colors = {
      // Neutral
      'neutral-50':  twColors.neutral[50],
      'neutral-100': twColors.neutral[100],
      'neutral-200': twColors.neutral[200],
      'neutral-300': twColors.neutral[300],
      'neutral-400': twColors.neutral[400],
      'neutral-500': twColors.neutral[500],
      'neutral-600': twColors.neutral[600],
      'neutral-700': twColors.neutral[700],
      'neutral-800': twColors.neutral[800],
      'neutral-900': twColors.neutral[900],
      'neutral-950': twColors.neutral[950],

      // Red
      'red-50':  twColors.red[50],
      'red-100': twColors.red[100],
      'red-200': twColors.red[200],
      'red-300': twColors.red[300],
      'red-400': twColors.red[400],
      'red-500': twColors.red[500],
      'red-600': twColors.red[600],
      'red-700': twColors.red[700],
      'red-800': twColors.red[800],
      'red-900': twColors.red[900],
      'red-950': twColors.red[950],

      // Yellow
      'yellow-50':  twColors.yellow[50],
      'yellow-100': twColors.yellow[100],
      'yellow-200': twColors.yellow[200],
      'yellow-300': twColors.yellow[300],
      'yellow-400': twColors.yellow[400],
      'yellow-500': twColors.yellow[500],
      'yellow-600': twColors.yellow[600],
      'yellow-700': twColors.yellow[700],
      'yellow-800': twColors.yellow[800],
      'yellow-900': twColors.yellow[900],
      'yellow-950': twColors.yellow[950],

      // Pink
      'pink-50':  twColors.pink[50],
      'pink-100': twColors.pink[100],
      'pink-200': twColors.pink[200],
      'pink-300': twColors.pink[300],
      'pink-400': twColors.pink[400],
      'pink-500': twColors.pink[500],
      'pink-600': twColors.pink[600],
      'pink-700': twColors.pink[700],
      'pink-800': twColors.pink[800],
      'pink-900': twColors.pink[900],
      'pink-950': twColors.pink[950],

      // Purple
      'purple-50':  twColors.purple[50],
      'purple-100': twColors.purple[100],
      'purple-500': twColors.purple[500],
      'purple-600': twColors.purple[600],
      'purple-700': twColors.purple[700],
      'purple-800': twColors.purple[800],
      'purple-900': twColors.purple[900],
      'purple-950': twColors.purple[950],

      // Blue
      'blue-50':  twColors.blue[50],
      'blue-100': twColors.blue[100],
      'blue-200': twColors.blue[200],
      'blue-300': twColors.blue[300],
      'blue-400': twColors.blue[400],
      'blue-500': twColors.blue[500],
      'blue-600': twColors.blue[600],
      'blue-700': twColors.blue[700],
      'blue-800': twColors.blue[800],
      'blue-900': twColors.blue[900],
      'blue-950': twColors.blue[950],

      // Stone
      'stone-200': twColors.stone[200],

      // Orange
      'orange-200': twColors.orange[200],
      'orange-300': twColors.orange[300],
      'orange-400': twColors.orange[400],
      'orange-500': twColors.orange[500],
      'orange-600': twColors.orange[600],
      'orange-700': twColors.orange[700],

      // Amber
      'amber-200': twColors.amber[200],
      'amber-300': twColors.amber[300],
      'amber-400': twColors.amber[400],
      'amber-500': twColors.amber[500],

      // Fuchsia
      'fuchsia-600': twColors.fuchsia[600],

      // Green
      'green-100': twColors.green[100],
      'green-200': twColors.green[200],
      'green-300': twColors.green[300],
      'green-400': twColors.green[400],
    };

    // ──────────────────────
    // 2. Grid definitions (dark theme)
    // ──────────────────────
    const desktopGrid = [   // 10 × 14
      ['neutral-900','neutral-900','neutral-900','neutral-900','neutral-900','neutral-900','neutral-900','neutral-900','neutral-900','neutral-900'],
      ['neutral-900','neutral-900','neutral-900','neutral-900','neutral-900','neutral-900','neutral-900','blue-950','blue-950','blue-950'],
      ['neutral-900','neutral-900','neutral-900','neutral-900','neutral-900','neutral-900','neutral-900','blue-900','blue-900','blue-900'],
      ['neutral-900','neutral-900','neutral-900','neutral-900','neutral-900','neutral-900','neutral-900','blue-800','blue-800','blue-800'],
      ['neutral-900','neutral-900','neutral-900','neutral-900','neutral-900','neutral-900','neutral-900','blue-700','blue-700','blue-700'],
      ['neutral-900','neutral-900','neutral-900','neutral-900','neutral-800','red-400','pink-900','blue-600','blue-600','blue-600'],
      ['neutral-900','neutral-900','neutral-900','neutral-900','neutral-800','red-500','pink-900','blue-700','blue-700','blue-700'],
      ['neutral-900','neutral-900','neutral-900','neutral-900','neutral-800','red-500','pink-800','neutral-900','neutral-900','neutral-900'],
      ['neutral-900','neutral-900','neutral-900','neutral-900','red-700','red-600','pink-700','blue-800','blue-900','neutral-900'],
      ['neutral-900','neutral-900','neutral-900','neutral-900','red-800','yellow-500','pink-600','neutral-900','neutral-900','neutral-900'],
      ['neutral-900','neutral-900','neutral-900','neutral-900','red-900','yellow-600','pink-500','neutral-900','neutral-900','neutral-900'],
      ['neutral-900','neutral-900','neutral-900','neutral-800','neutral-500','yellow-600','pink-500','neutral-900','neutral-900','neutral-900'],
      ['neutral-900','neutral-900','neutral-900','neutral-800','neutral-600','yellow-700','neutral-900','neutral-900','neutral-900','neutral-900'],
      ['neutral-700','neutral-800','neutral-700','neutral-700','neutral-700','neutral-900','neutral-900','neutral-900','neutral-900','neutral-900']
    ];

    const mobileGrid = [ // 5 × 14  (matches last 5 columns of desktopGrid)
      ['neutral-900','neutral-900','neutral-900','neutral-900','neutral-900'],
      ['neutral-900','neutral-900','neutral-900','neutral-900','neutral-900'],
      ['neutral-900','neutral-900','neutral-900','blue-900','blue-900'],
      ['neutral-900','neutral-900','neutral-900','blue-800','blue-800'],
      ['neutral-900','neutral-900','neutral-900','blue-700','blue-700'],
      ['neutral-800','red-400','pink-900','blue-600','blue-600'],
      ['neutral-700','red-500','pink-900','blue-700','blue-700'],
      ['neutral-600','red-500','pink-800','neutral-900','neutral-900'],
      ['red-700','red-600','pink-700','blue-800','neutral-900'],
      ['red-800','yellow-500','pink-600','neutral-900','neutral-900'],
      ['red-900','yellow-600','pink-500','neutral-900','neutral-900'],
      ['neutral-500','yellow-600','pink-500','neutral-900','neutral-900'],
      ['neutral-600','yellow-700','neutral-900','neutral-900','neutral-900'],
      ['neutral-900','neutral-900','neutral-900','neutral-900','neutral-900']
    ];

    // ──────────────────────
    // 2b. Grid definitions (light theme)
    // ──────────────────────
    const desktopGridLight = [
      ['neutral-200','neutral-200','neutral-200','neutral-200','neutral-200','neutral-200','neutral-200','neutral-200','neutral-200','neutral-200'],
      ['neutral-200','neutral-200','neutral-200','neutral-200','neutral-200','neutral-200','neutral-200','orange-500','orange-500','orange-500'],
      ['neutral-200','neutral-200','neutral-200','neutral-200','neutral-200','neutral-200','neutral-200','pink-600','pink-600','pink-600'],
      ['neutral-200','neutral-200','neutral-200','neutral-200','neutral-200','neutral-200','neutral-200','pink-500','pink-500','pink-500'],
      ['neutral-200','neutral-200','neutral-200','neutral-200','neutral-200','neutral-200','neutral-200','pink-400','pink-400','pink-400'],
      ['neutral-200','neutral-200','neutral-200','neutral-200','neutral-300','red-300','orange-300','pink-300','pink-300','pink-300'],
      ['neutral-200','neutral-200','neutral-200','neutral-200','neutral-300','red-400','orange-300','pink-200','pink-200','pink-200'],
      ['neutral-200','neutral-200','neutral-200','neutral-200','neutral-300','red-500','pink-400','neutral-200','neutral-200','neutral-200'],
      ['neutral-200','neutral-200','neutral-200','neutral-200','orange-300','red-500','pink-500','pink-300','pink-300','neutral-200'],
      ['neutral-200','neutral-200','neutral-200','neutral-200','orange-400','green-300','pink-600','neutral-200','neutral-200','neutral-200'],
      ['neutral-200','neutral-200','neutral-200','neutral-200','amber-400','green-400','pink-500','neutral-200','neutral-200','neutral-200'],
      ['neutral-200','neutral-200','neutral-200','neutral-100','neutral-200','green-400','pink-500','neutral-200','neutral-200','neutral-200'],
      ['neutral-200','neutral-200','neutral-200','neutral-100','neutral-300','green-300','neutral-200','neutral-200','neutral-200','neutral-200'],
      ['neutral-200','neutral-200','neutral-200','neutral-100','neutral-400','green-300','neutral-200','neutral-200','neutral-200','neutral-200']
    ];

    const mobileGridLight = [
      ['neutral-200','neutral-200','neutral-200','neutral-200','neutral-200'],
      ['neutral-200','neutral-200','neutral-200','neutral-200','neutral-200'],
      ['neutral-200','neutral-200','neutral-200','neutral-200','neutral-200'],
      ['neutral-200','neutral-200','neutral-200','pink-500','pink-500'],
      ['neutral-200','neutral-200','neutral-200','pink-400','pink-400'],
      ['neutral-200','red-300','orange-300','pink-300','pink-300'],
      ['neutral-200','red-400','orange-300','pink-100','pink-100'],
      ['neutral-200','red-500','pink-400','neutral-200','neutral-200'],
      ['neutral-200','red-500','pink-500','pink-200','pink-200'],
      ['neutral-200','green-300','pink-600','neutral-200','neutral-200'],
      ['neutral-200','green-400','pink-500','neutral-200','neutral-200'],
      ['orange-400','neutral-200','green-400','neutral-200','neutral-200'],
      ['orange-300','neutral-300','green-300','neutral-200','neutral-200'],
      ['orange-200','neutral-400','green-300','neutral-200','neutral-200'],
    ];

    // ──────────────────────
    // 3. Layout constants
    // ──────────────────────
    const BREAKPOINT        = 768;   // switch to mobile at < 768 px
    const CENTER_ROW        = 7;     // row G (0‑based)
    const CENTER_COL_DESK   = 6;     // column 7 in 10‑col grid
    const CENTER_COL_MOB    = 2;     // column 3 in 5‑col grid
    const LOG_FACTOR        = 3;

    let cols, rows, cellColors;
    let colWidths = [], rowHeights = [];
    let currentTheme = 'dark';

    // ──────────────────────
    // 4. Helpers
    // ──────────────────────
    function updateThemeColors() {
      const theme = document.documentElement.getAttribute('data-theme');
      if (theme === 'light' || theme === 'Light') {
        currentTheme = 'light';
      } else {
        currentTheme = 'dark';
      }
      updateLayout();
    }

    function updateLayout() {
      const mobile = p.width < BREAKPOINT;
      cols = mobile ? 5 : 8;  // change this number as needed
      rows = mobile ? 10 : 11;

      let baseGrid;
      if (currentTheme === 'light') {
        baseGrid = mobile ? mobileGridLight : desktopGridLight;
      } else {
        baseGrid = mobile ? mobileGrid : desktopGrid;
      }

      if (!mobile) {
        // Remove columns from the left by slicing from (length - cols) to end
        cellColors = baseGrid.map(row => row.slice(row.length - cols));
      } else {
        cellColors = baseGrid;
      }

      calculateDimensions();
    }

    function calculateDimensions() {
      const w = p.width, h = p.height;
      const centerCol = (cols === 5) ? CENTER_COL_MOB : CENTER_COL_DESK;

      // ---- columns ----
      let totalCol = 0;
      const colW = [];
      for (let c = 0; c < cols; c++) {
        const d = Math.abs(c - centerCol);
        const max = Math.max(centerCol, cols - 1 - centerCol);
        const t = max > 0 ? d / max : 0;
        const weight = Math.pow(LOG_FACTOR, t);
        colW[c] = weight;
        totalCol += weight;
      }
      colWidths = colW.map(v => (v / totalCol) * w);

      // ---- rows ----
      let totalRow = 0;
      const rowW = [];
      for (let r = 0; r < rows; r++) {
        const d = Math.abs(r - CENTER_ROW);
        const max = Math.max(CENTER_ROW, rows - 1 - CENTER_ROW);
        const t = max > 0 ? d / max : 0;
        const weight = Math.pow(LOG_FACTOR, t);
        rowW[r] = weight;
        totalRow += weight;
      }
      rowHeights = rowW.map(v => (v / totalRow) * h);
    }

    // ──────────────────────
    // 5. p5 lifecycle
    // ──────────────────────
    p.setup = () => {
      const container = document.getElementById('canvas-container');
      if (!container) {
        console.error('canvas-container not found');
        return;
      }
      const canvas = p.createCanvas(container.clientWidth, container.clientHeight);
      canvas.parent(container);
      p.pixelDensity(1);
      p.noStroke();
      updateThemeColors();
    };

    p.windowResized = () => {
      const container = document.getElementById('canvas-container');
      if (container) {
        p.resizeCanvas(container.clientWidth, container.clientHeight);
        updateThemeColors();
      }
    };

    p.draw = () => {
      updateThemeColors();
      p.background(currentTheme === 'light' ? '#ffffff' : '#000000');
      p.noStroke();

      let x = 0, y = 0;
      for (let r = 0; r < rows; r++) {
        x = 0;
        for (let c = 0; c < cols; c++) {
          const key = cellColors[r][c];
          const hex = colors[key] || (currentTheme === 'light' ? '#ffffff' : '#000000');
          p.fill(hex);
          p.rect(x - 0.5, y - 0.5, colWidths[c] + 1, rowHeights[r] + 1);
          x += colWidths[c];
        }
        y += rowHeights[r];
      }
    };
  };

  // ---- instantiate ----
  window.p5instance = new p5(sketch);
}