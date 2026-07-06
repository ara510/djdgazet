/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,ts}"],
  theme: {
    extend: {
      colors: {
        gazety: {
          red: "#1e5fd4",     // accent principal = bleu du logo Haydlines
          dark: "#1c2637",    // bleu-nuit du logo
          gray: "#3a4a63",    // gris-bleu
          accent: "#4b83ea",  // bleu clair
          black: "#0f1620",
          green: "#3a4a63",
        },
        silver: {
          50: "#F8F9FA",
          100: "#E9ECEF",
          200: "#DEE2E6",
          300: "#CED4DA",
          400: "#ADB5BD",
          500: "#8C96A0",
          600: "#6C757D",
          700: "#545e67",
        },
        gold: {
          50: "#eff5ff",
          100: "#dbe8fe",
          200: "#bfd6fd",
          300: "#93b8fb",
          400: "#6098f6",
          500: "#3b78ec",
          600: "#1e5fd4",
          700: "#1b4fb0",
        },
        vip: {
          50: "#eff5ff",
          100: "#dbe8fe",
          200: "#bfd6fd",
          300: "#4b83ea",
          400: "#1e5fd4",
          500: "#1c2637",
          600: "#1c2637",
          700: "#141d2b",
          800: "#0f1620",
          900: "#0a0f17",
        },
      },
      fontFamily: {
        serif: ['"Source Serif Pro"', '"Georgia"', "serif"],
        sans: ['"Inter"', '"Helvetica Neue"', "Arial", "sans-serif"],
        display: ['"Playfair Display"', '"Georgia"', "serif"],
      },
      animation: {
        "marquee": "marquee 40s linear infinite",
        "fade-in": "fadeIn 0.4s ease-out",
        "slide-up": "slideUp 0.5s ease-out",
      },
      keyframes: {
        marquee: {
          "0%": { transform: "translateX(0%)" },
          "100%": { transform: "translateX(-50%)" },
        },
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { transform: "translateY(20px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
      },
    },
  },
  plugins: [],
};
