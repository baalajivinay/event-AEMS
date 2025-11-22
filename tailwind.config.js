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
          primary: '#A6192E', // Amrita Maroon
          secondary: '#F37021', // Amrita Saffron
        }
      }
    },
  },
  plugins: [],
}