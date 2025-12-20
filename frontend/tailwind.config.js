export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#1c6bf2",
        "background-dark": "#101722",
        "background-light": "#f5f6f8","card-light": "#ffffff",
        "card-dark": "#18212f",
        "text-light-primary": "#18212f",
        "text-dark-primary": "#f5f6f8",
        "text-light-secondary": "#6b7280",
        "text-dark-secondary": "#9ca7ba",
        "border-light": "#e5e7eb",
        "border-dark": "#282e39"
      },
      fontFamily: {
        display: ["Inter", "sans-serif"]
      },
      borderRadius: {
        DEFAULT: "0.5rem",
        lg: "0.75rem",
        xl: "1rem",
        full: "9999px"
      }
    }
  },
  plugins: []
};
