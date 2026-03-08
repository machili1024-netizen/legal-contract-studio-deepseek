import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "var(--ink)",
        paper: "var(--paper)",
        muted: "var(--muted)",
        line: "var(--line)",
        accent: "var(--accent)",
        accentSoft: "var(--accent-soft)",
        success: "var(--success)",
        danger: "var(--danger)"
      },
      boxShadow: {
        card: "0 24px 80px rgba(27, 38, 31, 0.12)"
      },
      fontFamily: {
        display: ["\"Noto Serif SC\"", "\"Songti SC\"", "serif"],
        sans: ["\"Noto Sans SC\"", "\"PingFang SC\"", "\"Microsoft YaHei\"", "sans-serif"]
      },
      backgroundImage: {
        "hero-radial": "radial-gradient(circle at top, rgba(167, 129, 71, 0.18), transparent 36%), radial-gradient(circle at 85% 10%, rgba(34, 84, 61, 0.18), transparent 26%)"
      },
      keyframes: {
        rise: {
          "0%": { opacity: "0", transform: "translateY(18px)" },
          "100%": { opacity: "1", transform: "translateY(0)" }
        }
      },
      animation: {
        rise: "rise 700ms ease-out both"
      }
    }
  },
  plugins: []
};

export default config;
