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
        vault: {
          // Core backgrounds
          dark:       "#07091a",   // deepest bg
          darker:     "#04060f",   // navbar / glass overlay
          card:       "#0e1330",   // card bg
          cardHover:  "#121840",   // card hover
          border:     "#1a2550",   // subtle border
          borderHi:   "#2a3a70",   // highlighted border

          // Accent colours
          gold:       "#d4a843",   // rich warm gold
          goldLight:  "#f0c860",   // highlight gold
          goldDim:    "#8a6c1e",   // muted gold for subtext
          silver:     "#a8b8cc",   // cool silver
          silverHi:   "#c8d8e8",   // bright silver
          platinum:   "#d0dae8",   // platinum white-blue
          bronze:     "#b97340",   // bronze / copper

          // Accent / FX
          accent:     "#38bdf8",   // sky blue for currencies
          accentDim:  "#0e5f80",   // dimmed accent
          emerald:    "#10b981",   // up / positive
          rose:       "#f43f5e",   // down / negative

          // Gradients (used as arbitrary values in JSX)
          gradGold:   "linear-gradient(135deg, #d4a843 0%, #f0c860 50%, #b88c2a 100%)",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "-apple-system", "sans-serif"],
        mono: ["JetBrains Mono", "Fira Code", "monospace"],
      },
      backgroundImage: {
        "gold-gradient":     "linear-gradient(135deg, #d4a843 0%, #f0c860 60%, #b88c2a 100%)",
        "gold-shine":        "linear-gradient(105deg, #b88c2a 0%, #f0c860 50%, #b88c2a 100%)",
        "card-gradient":     "linear-gradient(145deg, #0e1330 0%, #0a0f24 100%)",
        "hero-gradient":     "radial-gradient(ellipse 80% 60% at 50% -10%, rgba(212,168,67,0.12) 0%, transparent 60%)",
        "glow-gold":         "radial-gradient(ellipse at center, rgba(212,168,67,0.15) 0%, transparent 70%)",
        "glow-silver":       "radial-gradient(ellipse at center, rgba(168,184,204,0.10) 0%, transparent 70%)",
        "glow-blue":         "radial-gradient(ellipse at center, rgba(56,189,248,0.10) 0%, transparent 70%)",
      },
      boxShadow: {
        "gold-sm":   "0 0 12px rgba(212,168,67,0.15), 0 2px 8px rgba(0,0,0,0.4)",
        "gold-md":   "0 0 24px rgba(212,168,67,0.20), 0 4px 16px rgba(0,0,0,0.5)",
        "gold-lg":   "0 0 40px rgba(212,168,67,0.25), 0 8px 32px rgba(0,0,0,0.6)",
        "silver-sm": "0 0 12px rgba(168,184,204,0.12), 0 2px 8px rgba(0,0,0,0.4)",
        "blue-sm":   "0 0 12px rgba(56,189,248,0.12), 0 2px 8px rgba(0,0,0,0.4)",
        "card":      "0 4px 24px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.04)",
        "navbar":    "0 1px 32px rgba(0,0,0,0.6), 0 0 0 1px rgba(212,168,67,0.08)",
      },
      keyframes: {
        "pulse-gold": {
          "0%, 100%": { opacity: "1" },
          "50%":      { opacity: "0.5" },
        },
        "shimmer": {
          "0%":   { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        "float": {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%":      { transform: "translateY(-6px)" },
        },
        "glow-pulse": {
          "0%, 100%": { opacity: "0.6" },
          "50%":      { opacity: "1" },
        },
        "ticker": {
          "0%":   { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
      },
      animation: {
        "pulse-gold":  "pulse-gold 2s ease-in-out infinite",
        "shimmer":     "shimmer 3s linear infinite",
        "float":       "float 4s ease-in-out infinite",
        "glow-pulse":  "glow-pulse 3s ease-in-out infinite",
        "ticker":      "ticker 30s linear infinite",
      },
    },
  },
  plugins: [],
};
export default config;
