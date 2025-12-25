/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'crackzone-yellow': '#FFD700',
        'crackzone-black': '#0A0A0A',
        'crackzone-gray': '#1A1A1A',
      },
      fontFamily: {
        'gaming': ['Orbitron', 'monospace'],
      }
    },
  },
  plugins: [],
}