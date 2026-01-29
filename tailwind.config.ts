import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#fef9ed",
        card: "#fef9ed",
        button: "#f7edd9",
        text: "#261e0d",
        highlight: "#9cf6f6",
        category: {
          plants: "#c8ddbb",
          birds: "#fbdf9d",
          general: "#fbb39d",
          "fish-aquatic": "#b6e2dd",
          places: "#fba09d",
          names: "#e9e5af",
        },
      },
      fontFamily: {
        body: ["Lora", "serif"],
        nav: ["Times", "serif"],
        heading: ["Times", "serif"],
        mono: ["Red Hat Mono", "monospace"],
      },
    },
  },
  plugins: [],
};
export default config;
