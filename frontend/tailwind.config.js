/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#fef6ec',
          100: '#fce8cc',
          500: '#c8860b', // matches the "dartcodes" brand accent tone
          600: '#a86e09',
          700: '#875607',
        },
      },
    },
  },
  plugins: [],
};
