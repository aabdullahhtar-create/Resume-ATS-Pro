import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        ink: "#0F172A",
        navy: "#17384A",
        mint: "#B9FBC0",
        skyglass: "#EAF7FF",
        brand: {
          50: "#EBF8FF",
          100: "#D7F0FF",
          500: "#1298E8",
          600: "#0079C6",
          900: "#0B2E40"
        }
      },
      boxShadow: {
        soft: "0 22px 70px rgba(15, 23, 42, 0.14)",
        glow: "0 0 40px rgba(18, 152, 232, 0.32)"
      },
      borderRadius: {
        '4xl': '2rem'
      }
    }
  },
  plugins: []
};
export default config;
