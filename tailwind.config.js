/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink: {
          950: "#0E1730",
          900: "#131F42",
          800: "#1C2C58",
          700: "#28397A",
        },
        paper: {
          DEFAULT: "#F6F0E2",
          dim: "#CBC4B2",
        },
        gold: {
          DEFAULT: "#E8A33D",
          dim: "#8A6B2E",
        },
        coral: "#E85D3F",
        leaf: "#5FA875",
      },
      fontFamily: {
        display: ["'Space Grotesk'", "sans-serif"],
        body: ["'Inter'", "sans-serif"],
        mono: ["'JetBrains Mono'", "monospace"],
      },
    },
  },
  plugins: [],
}
