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
        background: "#0e0e0e",
        surface: "#0e0e0e",
        "surface-low": "#131313",
        "surface-container": "#1a1a1a",
        "surface-high": "#20201f",
        "surface-highest": "#262626",
        "surface-bright": "#2c2c2c",
        "surface-variant": "#262626",
        primary: "#ff9069",
        "primary-container": "#ff7441",
        "primary-dim": "#ff7441",
        secondary: "#59ee50",
        "secondary-container": "#006e0a",
        tertiary: "#ff7070",
        "tertiary-container": "#fc3847",
        outline: "#767575",
        "outline-variant": "#484847",
        "on-surface": "#ffffff",
        "on-surface-variant": "#adaaaa",
        "on-primary": "#000000",
        error: "#ff716c",
      },
      fontFamily: {
        serif: ["var(--font-noto-serif)", "Georgia", "serif"],
        sans: ["var(--font-manrope)", "system-ui", "sans-serif"],
      },
      borderRadius: {
        xl: "1.5rem",
        "2xl": "2rem",
        full: "9999px",
      },
      backdropBlur: {
        nav: "12px",
        glass: "20px",
        "glass-active": "40px",
      },
      keyframes: {
        "scan-line": {
          "0%": { top: "10%" },
          "50%": { top: "85%" },
          "100%": { top: "10%" },
        },
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "scan-line": "scan-line 2.5s ease-in-out infinite",
        "fade-up": "fade-up 0.4s ease-out forwards",
      },
    },
  },
  plugins: [],
};

export default config;
