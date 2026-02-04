import { defineConfig } from 'vite'

export default defineConfig({
  base: '/',
  build: {
    rollupOptions: {
      input: {
        main: './index.html',
        awinProject: './projects/awin-design-system.html',
        awinLegacy: './projects/awin-legacy.html',
        datavizProject: './projects/data-visualization-guide.html',
        upskillProject: './projects/upskill-design-system.html',
        upskillPreview: './projects/upskill-preview.html',
      }
    }
  }
})