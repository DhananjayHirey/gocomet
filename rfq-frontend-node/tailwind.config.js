/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#0a0a0c",
        card: "#18181b",
        primary: "#3b82f6",
        secondary: "#1d4ed8",
      },
      backdropBlur: {
        xs: '2px',
      }
    },
  },
  plugins: [],
}
