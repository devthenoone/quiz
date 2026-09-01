import type { Config } from "tailwindcss";

export default {
  content: ["./src/**/*.{ts,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: "#1a73e8",
          dark: "#1557b0",
          light: "#e8f0fe",
        },
        // Admin dashboard palette — separate from the public-site "brand" blue.
        admin: {
          crimson: "#E31C4D",
          "crimson-dark": "#C81640",
          purple: "#6C5CE7",
          "purple-dark": "#4C3FC0",
          pink: "#EC4899",
          "pink-dark": "#DB2777",
          navy: "#0F172A",
          bg: "#FAFAFB",
          border: "#E5E7EB",
        },
      },
      keyframes: {
        pulseIn: {
          "0%": { opacity: "0", transform: "translateY(4px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        pulseIn: "pulseIn 0.4s ease-out",
      },
    },
  },
  plugins: [],
} satisfies Config;
