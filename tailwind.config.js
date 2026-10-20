/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{html,ts}'],
  theme: {
    extend: {
      colors: {
        primary: { DEFAULT: '#1e3a5f', light: '#2d5a8a', dark: '#0f2744' },
        accent: { DEFAULT: '#0ea5e9', dark: '#0284c7' }
      },
      screens: {
        xs: '420px'
      }
    }
  },
  plugins: []
};
