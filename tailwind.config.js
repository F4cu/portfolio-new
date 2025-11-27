/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ['variant', '&:where([data-theme="dark"], [data-theme="dark"] *)'],
  content: [
    "./index.html",
    "./projects/**/*.html",
    "./src/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Roboto', 'sans-serif'],
        condensed: ['Roboto Condensed', 'sans-serif'],
      },
    },
  },
  plugins: [],
}