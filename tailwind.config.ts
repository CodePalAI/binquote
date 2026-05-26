import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx,js,jsx,mdx}"],
  theme: {
    extend: {
      colors: {
        paper: "#F4EFE6",
        paperdark: "#EAE2D2",
        ink: "#16110D",
        ink2: "#2A2018",
        sub: "#6E6253",
        rule: "#1C140E",
        safety: "#FF5A1F",
        safetydk: "#D9430F",
        leaf: "#3A4A2A",
        mint: "#DCEBC4",
      },
      fontFamily: {
        display: ['"Fraunces"', "ui-serif", "Georgia", "serif"],
        sans: ['"Geist"', "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ['"Geist Mono"', "ui-monospace", "SFMono-Regular", "monospace"],
      },
      boxShadow: {
        hard: "6px 6px 0 0 #16110D",
        hardsm: "3px 3px 0 0 #16110D",
        hardlg: "10px 10px 0 0 #16110D",
        inset: "inset 0 0 0 1px #16110D",
      },
      letterSpacing: {
        tightest: "-0.045em",
      },
    },
  },
  plugins: [],
};

export default config;
