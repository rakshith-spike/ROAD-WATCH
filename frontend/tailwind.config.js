/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        display: ["Space Grotesk", "ui-sans-serif", "system-ui"],
        body: ["Manrope", "ui-sans-serif", "system-ui"],
      },
      colors: {
        ink: {
          900: "#08111f",
          800: "#10233a",
          700: "#183251",
        },
        mint: {
          300: "#9cf7e1",
          500: "#29d8b0",
          600: "#17bc96",
        },
        coral: {
          400: "#ff7d71",
          500: "#f75546",
        },
        amberx: {
          400: "#f7bf45",
        },
      },
      boxShadow: {
        glass: "0 10px 35px rgba(4, 13, 30, 0.18)",
      },
      backgroundImage: {
        "aurora-light": "radial-gradient(circle at 20% 20%, rgba(41,216,176,0.22), transparent 30%), radial-gradient(circle at 85% 10%, rgba(83,174,255,0.22), transparent 40%)",
        "aurora-dark": "radial-gradient(circle at 20% 20%, rgba(41,216,176,0.24), transparent 30%), radial-gradient(circle at 85% 10%, rgba(255,125,113,0.24), transparent 40%)",
      },
      keyframes: {
        shimmer: {
          "100%": { transform: "translateX(100%)" },
        },
      },
      animation: {
        shimmer: "shimmer 1.8s infinite",
      },
    },
  },
  plugins: [],
};
