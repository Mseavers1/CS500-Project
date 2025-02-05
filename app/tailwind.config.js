/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      animation: {
        wave: 'waveAnimation 10s linear infinite',
        wave2: 'waveAnimation2 10s linear infinite',
      },
      keyframes: {
        waveAnimation : {
          '0%' : {
            transform : 'translateX(100%)',
          },
          '100%' : {
            transform : 'translateX(0%)',
          },
        },
        waveAnimation2 : {
          '0%' : {
            transform : 'translateX(0%)',
          },
          '100%' : {
            transform : 'translateX(-100%)',
          },
        }
      },
      fontFamily: {
        poppins: ["Poppins", "sans-serif"],
        nunito: ["Nunito", "sans-serif"],
      },
      colors: {
        primary_bars: "#1E3A8A",
        secondary_bars: "#3B82F6",
        accent: "#E63946",
        highlight: "#FACC15",
        background: "#F8FAFC"
      }
    },
  },
  plugins: [],
};
