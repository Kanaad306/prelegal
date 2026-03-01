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
        // ── Prelegal Design System ─────────────────────────────────────────
        // Canonical semantic tokens — use these in all new UI
        primary:    "#209dd7",  // Blue Primary  — buttons, links
        accent:     "#ecad0a",  // Accent Yellow — highlights
        purple:     "#753991",  // Purple        — submit buttons
        "dark-navy": "#032147", // Dark Navy     — headings
        "gray-text": "#888888", // Gray Text     — body / secondary

        // Legacy tokens remapped to new palette — existing classNames unchanged
        // (bg-navy, text-brand-light, bg-brand, hover:bg-brand-dark, etc.)
        brand: {
          DEFAULT: "#209dd7",  // was #2d5be3 → Blue Primary
          light:   "#4bbfe8",  // was #4f8ef7 → lighter Blue Primary
          dark:    "#1780b0",  // was #1e44c4 → darker Blue Primary (hover states)
        },
        navy: {
          DEFAULT: "#032147",  // was #1a1a2e → Dark Navy
          mid:     "#042e63",  // was #16213e → mid Dark Navy
          dark:    "#021635",  // was #0f3460 → dark Dark Navy
        },
      },
      fontFamily: {
        serif: ["Georgia", "Times New Roman", "serif"],
      },
    },
  },
  plugins: [],
};

export default config;
