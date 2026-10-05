# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

Personal portfolio for Facundo Rosales (product designer), live at facundorosales.com. Static multi-page site built with Vite, Tailwind CSS 3, GSAP and p5.js. The README is outdated: it says there's no build step, but there is one.

## Commands

- `npm run dev`: Vite dev server
- `npm run build`: build to `dist/`
- `npm run preview`: serve the built `dist/`

The repo has no tests or linter.

**Pushing to `main` deploys to production.** `.github/workflows/deploy.yml` runs `npm ci && npm run build` and publishes `dist/` to GitHub Pages. `public/CNAME` sets the custom domain.

## Architecture

- **Multi-page Vite build.** Each page is a standalone HTML file: `index.html` plus case studies in `projects/`. Every page has to be listed in `build.rollupOptions.input` in `vite.config.js`, or it won't be built or deployed. Files named `* copy.html` in `projects/` are scratch duplicates and aren't built.
- **No templating.** Each page repeats the whole shell inline: GA tag, theme script, header and nav, mobile menu, footer. A change to shared chrome has to be made in every HTML file.
- **One shared script.** Every page loads `src/main.js` as a module, and it imports `src/styles.css`. It handles behaviour that pages switch on through markup:
  - GSAP ScrollSmoother needs the `#smooth-wrapper` > `#smooth-content` wrappers and a `#main-content` element.
  - `.fade-in` elements animate in.
  - `[data-toggle="<id>"]` with `data-show-text` / `data-hide-text` opens and closes the element with that id, which uses the `.collapsible` class.
  - `.lightbox-trigger` images open a lightbox.
  - `[data-code-lightbox]` figures with `.code-tab-link` tabs open a code lightbox highlighted by highlight.js (json/js/ts/bash).
  - `.theme-image` images with `data-src-light` / `data-src-dark` swap source when the theme changes.
- **Home page only:** the p5 shader sketch (`src/sketch2-shader.js`) is loaded with a dynamic import on the home page only. The other `src/sketch*.js` files are unused alternates.
- **Theming.** Dark mode is set by `data-theme="dark"` on `<html>`. The Tailwind `darkMode` setting is a variant keyed on that attribute, not on the `media` query. An inline script in each page's `<head>` sets the attribute from `localStorage` or the OS preference, so `dark:` utilities depend on it.
- **Styles.** Tailwind utilities go inline in the markup. `src/styles.css` holds the base heading styles (Roboto Condensed for headings) and a few component classes: `.tag`, `.cta`, `.link`, `.eyebrow`, `.speech-bubble`, `.collapsible`, `.code-preview`.
- **Assets.** Images and PDFs live in `public/images` and `public/files` and are referenced with root-absolute paths (`/images/...`).

## Case study pages

- **Section order.** Case studies follow a fixed set of sections: `#project-intro` (h1, `text-xl` subtitle, role and goal), `#challenge`, `#approach` (numbered h3 subsections), `#solution`, `#impact`, then optional extras and `#more-projects`. They use a 12-column grid with the h2 in one column and the body in the other.
- **Home page cards.** The project cards in `index.html` repeat a short version of each case study's intro. When a case study's framing changes, check that the card still matches.
- **Writing style:** pages are written for recruiters and should read as one voice:
  - plain declarative sentences, light first person, bold only on system nouns
  - concrete mechanisms instead of abstract qualities
  - no em dashes in new copy
  - no "not just X but Y" constructions or hype adjectives
  - avoid "delve", "seamless", "robust", "leverage", "empower", "streamline", "elevate", "comprehensive", "holistic"
  - headings are short noun phrases, not "phrase: phrase" constructions
- **Handoff briefs.** `.claude/handoff/` holds Claude-only working briefs that stay out of the published site.
