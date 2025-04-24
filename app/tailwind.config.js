/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        poppins: ["Poppins", "sans-serif"],
        nunito: ["Nunito", "sans-serif"],
      },
      colors: {
        primary_bars: "#113F5F",
        secondary_bars: "#3B82F6",
        accent: "#E63946",
        highlight: "#FACC15",
        background: "#F8FAFC"
      }
    },
  },
  plugins: [],
};
