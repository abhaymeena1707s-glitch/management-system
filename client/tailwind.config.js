/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          900: '#0b132b',
          800: '#0f172a',
          700: '#1e293b',
          600: '#334155',
        },
        brand: {
          50: '#fff7ed',
          100: '#ffedd5',
          200: '#ffd6b8',
          300: '#ffa666',
          400: '#ff8033',
          500: '#ff6b00',
          600: '#f95800',
          700: '#d94400',
          800: '#b33600',
          900: '#7a2b00',
        }
      },
      boxShadow: {
        'brand': '0 10px 25px -5px rgba(255, 107, 0, 0.3)',
        'brand-sm': '0 4px 14px 0 rgba(255, 107, 0, 0.2)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      }
    },
  },
  plugins: [],
}

