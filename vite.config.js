import { defineConfig } from 'vite'

export default defineConfig({
  base: '/',
  build: {
    rollupOptions: {
      input: {
        main: './index.html',
        awinProject: './projects/awin-design-system.html',
        datavizProject: './projects/data-visualization-guide.html',
        upskillProject: './projects/upskill-design-system.html',
        project4: './projects/project-4.html',
      }
    }
  }
})