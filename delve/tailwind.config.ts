import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: "#0E1512",
          light: "#161F1A",
          lighter: "#1E2A23",
        },
        parchment: "#EDE6D6",
        brass: {
          DEFAULT: "#C89B3C",
          bright: "#E0B65C",
        },
        moss: "#4F6D5A",
        rust: "#B5502D",
      },
      fontFamily: {
        display: ["var(--font-fraunces)", "serif"],
        body: ["var(--font-inter)", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      backgroundImage: {
        grain: "url('/grain.svg')",
      },
    },
  },
  plugins: [],
};
export default config;
