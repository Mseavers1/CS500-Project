/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      animation: {
        'fade-in-out': 'fadeInOut 5s ease-in-out',
      },
      keyframes: {
        fadeInOut: {
          '0%': { opacity: '0', transform: 'translate(-50%, -50%) scale(0.5) rotate(var(--rotate))' },
          '10%': { opacity: 'var(--start-opacity)', transform: 'translate(-50%, -50%) scale(1) rotate(var(--rotate))' },
          '90%': { opacity: 'var(--start-opacity)', transform: 'translate(-50%, -50%) scale(1) rotate(var(--rotate))' },
          '100%': { opacity: '0', transform: 'translate(-50%, -50%) scale(0.5) rotate(var(--rotate))' },
        },
      },
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
