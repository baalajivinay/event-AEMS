/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}", // Checks all files in src folder
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