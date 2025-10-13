/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#e6f4fa',
          100: '#cce9f5',
          200: '#99d3eb',
          300: '#66bde1',
          400: '#33a7d7',
          500: '#5BA3D0', // Main blue from mockup
          600: '#4982a6',
          700: '#37627d',
          800: '#254153',
          900: '#12212a',
        },
      },
    },
  },
  plugins: [],
}
