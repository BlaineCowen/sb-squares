module.exports = {
  darkMode: "class",
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  safelist: [
    {
      pattern: /from-(.+)\/30/,
      variants: ["hover"],
    },
    {
      pattern: /to-(.+)\/50/,
      variants: ["hover"],
    },
  ],
  theme: {
    extend: {
      transitionProperty: {
        scale: "transform",
        shadow: "box-shadow",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideIn: {
          "0%": { transform: "translateY(-20px)" },
          "100%": { transform: "translateY(0)" },
        },
      },
      animation: {
        fadeIn: "fadeIn 0.3s ease-out",
        slideIn: "slideIn 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
      },
      backgroundColor: ({ theme }) => ({
        ...theme("colors"),
        "custom-opacity": "rgba(var(--color), <alpha-value>)",
      }),
    },
  },
  plugins: [],
};
