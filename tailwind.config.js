/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        base: "#0a0a0f",
        surface: "#111118",
        card: "#16161f",
        elevated: "#1c1c28",
        border: "rgba(255,255,255,0.06)",
        "border-hover": "rgba(255,255,255,0.1)",
        primary: "#6c63ff",
        "primary-hover": "#7c73ff",
        "primary-glow": "rgba(108,99,255,0.25)",
        secondary: "#00d4aa",
        danger: "#ff4757",
        warning: "#ffa502",
        success: "#2ed573",
        "text-primary": "#f0f0ff",
        "text-secondary": "#8888aa",
        "text-muted": "#55556a",
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
      },
      borderRadius: {
        card: "16px",
        btn: "10px",
        input: "10px",
      },
      boxShadow: {
        glow: "0 0 20px rgba(108,99,255,0.19)",
        "glow-sm": "0 0 10px rgba(108,99,255,0.13)",
        card: "0 4px 24px rgba(0,0,0,0.25)",
      },
      animation: {
        shimmer: "shimmer 1.5s infinite",
        "pulse-glow": "pulseGlow 2s infinite",
      },
      keyframes: {
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        pulseGlow: {
          "0%, 100%": { opacity: 1 },
          "50%": { opacity: 0.5 },
        },
      },
    },
  },
  plugins: [],
};
