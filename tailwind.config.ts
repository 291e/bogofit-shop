import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        "line-seed": ["var(--font-line-seed-kr)", "sans-serif"],
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        gradient: {
          "0%": {
            "background-image": "linear-gradient(45deg, #ec4899, #a855f7)",
          },
          "25%": {
            "background-image": "linear-gradient(45deg, #a855f7, #3b82f6)",
          },
          "50%": {
            "background-image": "linear-gradient(45deg, #3b82f6, #10b981)",
          },
          "75%": {
            "background-image": "linear-gradient(45deg, #10b981, #f59e0b)",
          },
          "100%": {
            "background-image": "linear-gradient(45deg, #f59e0b, #ec4899)",
          },
        },
      },
      animation: {
        fadeIn: "fadeIn 0.5s ease-out forwards",
        gradient: "gradient 4s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
