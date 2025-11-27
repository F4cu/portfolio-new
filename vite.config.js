import { defineConfig } from 'vite'

export default defineConfig({
  base: '/portfolio-new/',
  build: {
    rollupOptions: {
      input: {
        main: './index.html',
        project1: './projects/project-1.html',
        project2: './projects/data-visualization-guide.html',
        project3: './projects/project-3.html',
        project4: './projects/project-4.html',
      }
    }
  }
})