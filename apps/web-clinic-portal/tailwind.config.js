/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Space Grotesk"', '"Inter"', 'system-ui', 'sans-serif'],
      },
      colors: {
        ink: {
          900: '#0b1224',
          800: '#10192f',
          700: '#13233f',
          600: '#1b2f52',
        },
        brand: {
          50: '#e5f5ff',
          100: '#cceafe',
          200: '#99d5fd',
          300: '#66c0fb',
          400: '#33a9f8',
          500: '#0d8ae8',
          600: '#056db9',
          700: '#04548f',
        },
        accent: {
          100: '#ffe9d6',
          200: '#ffd2ac',
          400: '#ff9f52',
          500: '#ff7f17',
          600: '#e0640a',
        },
      },
      boxShadow: {
        soft: '0 10px 30px rgba(7, 15, 36, 0.24)',
        card: '0 8px 20px rgba(12, 16, 39, 0.18)',
      },
    },
  },
  plugins: [],
}
