import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#0a0a0a", // Softer dark from the SeamFlow example
        foreground: "#f3f4f6", // soft white
        primary: "#facc15", // Yellow 400
        primaryHover: "#eab308", // Yellow 500
        secondary: "#10b981", // Emerald 500 for stats/success
        card: "#111111", // very dark gray for cards
        border: "#222222", // subtle dark borders
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'sans-serif'],
      }
    },
  },
  plugins: [],
};
export default config;
