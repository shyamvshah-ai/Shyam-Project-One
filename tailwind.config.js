/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // "Midnight" dark theme. Green = up, red = down.
        up: {
          DEFAULT: '#34d399',
          soft: '#10b98126', // translucent green for pills on dark
        },
        down: {
          DEFAULT: '#fb7185',
          soft: '#fb718526',
        },
        brand: {
          50: '#eef2ff',
          100: '#e0e7ff',
          200: '#c7d2fe',
          300: '#a5b4fc',
          400: '#818cf8',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',
        },
        mint: '#5eead4',
        // Text tones for a dark ground.
        ink: {
          DEFAULT: '#e9edf7',
          dim: '#9aa3bd',
          faint: '#6b7391',
        },
        // Page + card grounds.
        night: {
          900: '#0b0f1e',
          800: '#0f1424',
          700: '#131a30',
        },
      },
      fontFamily: {
        // Crisp modern grotesk via the system stack (no web-font download).
        sans: [
          'ui-sans-serif',
          'system-ui',
          '-apple-system',
          '"Segoe UI"',
          'Roboto',
          '"Helvetica Neue"',
          'Arial',
          'sans-serif',
        ],
      },
      borderRadius: {
        xl2: '1.25rem',
      },
    },
  },
  plugins: [],
}
