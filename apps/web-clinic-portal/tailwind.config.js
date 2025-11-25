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
          900: '#1F1F2D',
          800: '#232b3a',
          700: '#273349',
          600: '#2c3b54',
        },
        brand: {
          50: '#e9f4fb',
          100: '#d7ebf7',
          200: '#b1d9ef',
          300: '#8bc7e7',
          400: '#54b3d7', // provided light blue
          500: '#186aaf', // primary
          600: '#1966a3', // strong
          700: '#155489',
        },
        accent: {
          100: '#e9f4fb',
          200: '#d2e9f7',
          400: '#54b3d7',
          500: '#186aaf',
          600: '#1966a3',
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
