/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        amrita: {
          primary: '#A6192E',
          secondary: '#F37021',
        }
      }
    },
  },
  plugins: [],
}