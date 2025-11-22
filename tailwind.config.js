/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['DD', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      fontSize: {
        '24': '1.5rem',
      },
      borderRadius: {
        '12': '12px',
        'full': '9999px',
      },
      colors: {
        gray5: 'var(--color-gray5)',
        gray6: 'var(--color-gray6)',
        gray7: 'var(--color-gray7)',
        red: 'var(--color-red)',
        orange: 'var(--color-orange)',
      },
      transitionTimingFunction: {
        'swift': 'cubic-bezier(0.23, 0.88, 0.26, 0.92)',
      },
    },
  },
  plugins: [],
}

