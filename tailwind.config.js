/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        luxury: {
          50: '#fcfaf8',
          100: '#f7f1e9',
          200: '#efe0cd',
          300: '#e3c7a9',
          400: '#d5aa81',
          500: '#c8905d',
          600: '#bc7948',
          700: '#9d5f3a',
          800: '#804f34',
          900: '#67412d',
          950: '#382116',
        },
        gold: {
          light: '#F3E5AB',
          DEFAULT: '#D4AF37',
          dark: '#AA8C2C',
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        serif: ['Playfair Display', 'serif'],
      }
    },
  },
  plugins: [],
}
