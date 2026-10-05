# Portfolio – Facundo Rosales

This repository contains the source code for my personal portfolio website. It showcases selected work in UX/UI design, design systems, and data visualization.

## Overview

The portfolio highlights:

- Case studies around design systems and data visualization  
- Selected projects such as the Awin Design System and the UpSkill design system  
- A short biography and background as a product designer  
- Contact and external links  

The site is a static, multi-page portfolio: a home page (`index.html`) and one HTML page per case study in `projects/`.

## Tech Stack

- HTML pages, built with [Vite](https://vite.dev/)  
- Tailwind CSS 3 (`src/styles.css`)  
- GSAP for scroll and page animations, p5.js for the home page sketch  

## Development

```bash
npm install
npm run dev       # local dev server
npm run build     # build to dist/
npm run preview   # serve the built site
```

New pages must be added to `build.rollupOptions.input` in `vite.config.js` to be included in the build.

## Deployment

Every push to `main` runs the GitHub Actions workflow in `.github/workflows/deploy.yml`, which builds the site and publishes `dist/` to GitHub Pages at facundorosales.com.

## License

You can choose a license for the code in this repository (for example MIT) and add it as a separate `LICENSE` file.  

The visual design, case studies, and written content are Facundo Rosales' personal intellectual property and may not be reused without permission.
   
