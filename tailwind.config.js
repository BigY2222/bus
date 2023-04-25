/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'white-10': '#F6F6F4',
        'red-10': '#D61B0A',
        'gray-10': '#DADAE1'
      }
    },
  },
  plugins: [],
}

