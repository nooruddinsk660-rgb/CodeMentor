/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#1c6bf2",
        "background-light": "#f5f6f8",
        "background-dark": "#101722",
        "card-light": "#ffffff",
        "card-dark": "#18212f",
        "text-light-primary": "#18212f",
        "text-dark-primary": "#f5f6f8",
        "text-light-secondary": "#6b7280",
        "text-dark-secondary": "#9ca7ba",
        "border-light": "#e5e7eb",
        "border-dark": "#282e39",
      },
      fontFamily: {
        display: ["Inter", "sans-serif"],
      },
      animation: {
        "gradient-x": "gradient-x 15s ease infinite",
        shine: "shine 2s linear infinite",
        marquee: "marquee 30s linear infinite",
      },
      keyframes: {
        "gradient-x": {
          "0%, 100%": {
            "background-size": "200% 200%",
            "background-position": "left center",
          },
          "50%": {
            "background-size": "200% 200%",
            "background-position": "right center",
          },
        },
        shine: {
          from: { "background-position": "0 0" },
          to: { "background-position": "-200% 0" },
        },
        marquee: {
          from: { transform: "translateX(0)" },
          to: { transform: "translateX(-50%)" },
        },
      },
    },
  },
  plugins: [],
};
