import p5 from 'p5';

export function startSketch() {
  const sketch = (p) => {
    let img;
    const pixelSize = 80;
    const factor = 3;
    let cols;

    p.setup = async function() {
      const container = document.getElementById('canvas-container');
      const canvas = p.createCanvas(container.clientWidth, container.clientHeight);
      canvas.parent(container);
      p.noStroke();
      p.noLoop();

      const theme = document.documentElement.getAttribute('data-theme');
      const isDark = theme === 'dark';
      const imagePath = isDark ? '/images/pixel-heatmap4-v3.png' : '/images/pixel-heatmap5-v2.png';

      try {
        img = await p.loadImage(imagePath);
        img.loadPixels();
        p.redraw();
      } catch (err) {
        console.error('❌ Failed to load image', err);
      }
    };

    // Watch for theme changes and reload image dynamically
    const observer = new MutationObserver(async (mutationsList) => {
      for (const mutation of mutationsList) {
        if (mutation.attributeName === 'data-theme') {
          const newTheme = document.documentElement.getAttribute('data-theme');
          const isDark = newTheme === 'dark';
          const newImagePath = isDark ? '/images/pixel-heatmap4-v3.png' : '/images/pixel-heatmap5-v2.png';

          try {
            img = await p.loadImage(newImagePath);
            img.loadPixels();
            p.redraw();
          } catch (err) {
            console.error('❌ Failed to reload image on theme change', err);
          }
        }
      }
    });

    observer.observe(document.documentElement, { attributes: true });

    p.draw = function() {
      if (!img || !img.pixels || img.pixels.length === 0) return;

      const pureBlackRender = [18, 18, 18, 255]; // change as desired
      const pureWhiteRender = [240, 240, 240, 255]; // change as desired

      const theme = document.documentElement.getAttribute('data-theme');
      const isDark = theme === 'dark';
      const bgColor = isDark ? '#171717' : '#e5e5e5';
      p.background(bgColor);

      cols = Math.ceil(p.width / pixelSize);
      const sx = 0;
      const sy = 0;
      const sw = img.width;
      const sh = img.height;

      let currentY = 0;
      while (currentY < p.height) {
        const progress = currentY / p.height;
        const logScale = Math.pow(1 / factor, progress);
        let cellHeight = pixelSize * logScale;
        if (cellHeight < 1) break;

        if (currentY + cellHeight > p.height) {
          cellHeight = p.height - currentY;
        }

        for (let j = 0; j < cols; j++) {
          const imgX = p.map(j + 0.5, 0, cols, sx, sx + sw);
          const imgY = p.map(currentY + cellHeight / 2, 0, p.height, sy, sy + sh);
          let c = img.get(imgX, imgY);

          const brightness = (c[0] + c[1] + c[2]) / 3;

          // Handle exact black and white with custom render colors
          if (brightness <= 5) {
            c = pureBlackRender;
          } else if (brightness >= 250) {
            c = pureWhiteRender;
          } else if (isDark) {
            // Keep pure black visible, but snap near-dark tones to background
            if (brightness >= 10 && brightness < 26) {
              c = [23, 23, 23, 255]; // exact dark background
            }
          } else {
            // Keep pure white visible, but snap near-light tones to background
            if (brightness <= 245 && brightness > 225) {
              c = [229, 229, 229, 255]; // exact light background
            }
          }
          p.fill(c);
          const x = Math.round(j * pixelSize);
          const y = Math.round(currentY);
          const w = Math.ceil(pixelSize);
          const h = Math.ceil(cellHeight);
          p.rect(x, y, w, h);
        }

        currentY += cellHeight;
      }
    };

    p.windowResized = function() {
      const container = document.getElementById('canvas-container');
      p.resizeCanvas(container.clientWidth, container.clientHeight);
    };
  };

  window.p5instance = new p5(sketch);
}