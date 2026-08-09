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
          // Pure Midnight Onyx (Rich Deep Dark, zero dullness)
          dark:       "#070A12",
          darker:     "#04060A",
          card:       "#0F172A",
          cardHover:  "#141E33",
          border:     "#1E293B",
          borderHi:   "#334155",

          // Premium Royal Gold
          gold:       "#F59E0B",
          goldLight:  "#FBBF24",
          goldBright: "#FACC15",
          goldDim:    "#B45309",

          // Metals & Accents
          silver:     "#94A3B8",
          silverLight:"#E2E8F0",
          platinum:   "#E2E8F0",
          bronze:     "#D97706",
          cyan:       "#38BDF8",
          emerald:    "#10B981",
          rose:       "#F43F5E",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "-apple-system", "sans-serif"],
        mono: ["JetBrains Mono", "Fira Code", "monospace"],
      },
      backgroundImage: {
        "gold-metallic": "linear-gradient(135deg, #F59E0B 0%, #FACC15 50%, #D97706 100%)",
        "gold-shine":    "linear-gradient(105deg, #D97706 0%, #FACC15 50%, #F59E0B 100%)",
        "silver-metallic": "linear-gradient(135deg, #E2E8F0 0%, #94A3B8 100%)",
        "card-gradient": "linear-gradient(145deg, rgba(15,23,42,0.9) 0%, rgba(7,10,18,0.95) 100%)",
      },
      boxShadow: {
        "gold-glow": "0 0 25px rgba(245, 158, 11, 0.22), 0 4px 20px rgba(0,0,0,0.6)",
        "gold-sm":   "0 0 12px rgba(245, 158, 11, 0.18)",
        "card-glow": "0 8px 32px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.06)",
        "navbar":    "0 4px 30px rgba(0,0,0,0.8), 0 1px 0 rgba(245,158,11,0.15)",
      },
    },
  },
  plugins: [],
};
export default config;
