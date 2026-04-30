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
        // Sora: geometric, warm, modern — pairs well with friendly AI apps
        sans: ["Sora", "sans-serif"],
        // Lora: elegant serif for display text
        display: ["Lora", "serif"],
      },
      colors: {
        cream: {
          50: "#FDFAF5",
          100: "#F9F3E8",
          200: "#F2E8D5",
        },
        sage: {
          100: "#E8F0E9",
          200: "#C8DCC9",
          400: "#7FAE81",
          600: "#4A7D4C",
          700: "#3A6B3C",
        },
        warm: {
          100: "#FEF3E2",
          200: "#FDE4B8",
          400: "#F5A623",
          600: "#D4880A",
        },
        ink: {
          50: "#F5F4F2",
          200: "#C8C5BE",
          400: "#7A7570",
          600: "#4A4540",
          800: "#1E1B17",
          900: "#110F0C",
        },
      },
      borderRadius: {
        "2xl": "1rem",
        "3xl": "1.5rem",
        "4xl": "2rem",
      },
      animation: {
        "fade-in": "fadeIn 0.4s ease-out",
        "slide-up": "slideUp 0.4s ease-out",
        pulse: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
