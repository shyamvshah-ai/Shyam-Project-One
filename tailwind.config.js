/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Friendly, high-contrast palette. Green = up, red = down.
        up: {
          DEFAULT: '#16a34a',
          soft: '#dcfce7',
        },
        down: {
          DEFAULT: '#dc2626',
          soft: '#fee2e2',
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
      },
      fontFamily: {
        // Friendly, rounded system fonts — no web-font download, works offline.
        sans: [
          'ui-rounded',
          '"SF Pro Rounded"',
          '"Segoe UI"',
          'system-ui',
          'Nunito',
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
