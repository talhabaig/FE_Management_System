/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        paper: '#f3efe6',
        card: '#fffdf8',
        ink: '#1c1915',
        pine: '#1e2f28',
        moss: '#2f6a4a',
        clay: '#b5522a',
        sand: '#e7dfd0',
        gold: '#8a6a32',
        danger: '#8f2d2d',
      },
      fontFamily: {
        sans: ['"Source Sans 3"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['Fraunces', 'Georgia', 'serif'],
      },
      boxShadow: {
        card: '0 1px 2px rgba(28, 25, 21, 0.06), 0 12px 32px rgba(28, 25, 21, 0.05)',
      },
    },
  },
  plugins: [],
};
