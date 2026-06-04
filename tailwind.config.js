/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,ts}"],
  theme: {
    extend: {
      colors: {
        gazety: {
          red: "#d4b66a",
          dark: "#2d3944",
          gray: "#545e67",
          accent: "#d8be7b",
          black: "#000000",
          green: "#545e67",
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
          50: "#fdf9ef",
          100: "#faf2dd",
          200: "#f3e3b8",
          300: "#ebd292",
          400: "#d8be7b",
          500: "#d4b66a",
          600: "#b89853",
          700: "#967a43",
        },
        vip: {
          50: "#fdf9ef",
          100: "#faf2dd",
          200: "#f3e3b8",
          300: "#d4b66a",
          400: "#545e67",
          500: "#2d3944",
          600: "#2d3944",
          700: "#1a2530",
          800: "#000000",
          900: "#000000",
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
