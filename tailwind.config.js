/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}", "./public/index.html"],
  theme: {
    extend: {
      /*
       * Semua keyframe animasi fitur gacha didefinisikan di sini (bukan hanya
       * diindex.css) agar utility `animate-*` benar-benar di-generate Tailwind
       * dan tidak bergantung pada CSS manual yang mudah hilang saat refactor.
       */
      keyframes: {
        "gacha-float": {
          "0%": { transform: "translate3d(0, 0, 0) scale(1)", opacity: "0.12" },
          "50%": { transform: "translate3d(10px, -30px, 0) scale(1.4)", opacity: "0.45" },
          "100%": { transform: "translate3d(0, 0, 0) scale(1)", opacity: "0.12" },
        },
        "fade-in": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        "pop-in": {
          "0%": { opacity: "0", transform: "scale(0.85) translateY(12px)" },
          "60%": { opacity: "1", transform: "scale(1.03) translateY(0)" },
          "100%": { opacity: "1", transform: "scale(1) translateY(0)" },
        },
        shine: {
          from: { transform: "translateX(-130%)" },
          to: { transform: "translateX(130%)" },
        },
        "rarity-burst": {
          "0%": { opacity: "0.85", transform: "scale(0.7)" },
          "70%": { opacity: "0.35", transform: "scale(1.35)" },
          "100%": { opacity: "0", transform: "scale(1.6)" },
        },
        "slide-in": {
          from: { transform: "translateX(100%)" },
          to: { transform: "translateX(0)" },
        },
      },
      animation: {
        "gacha-float": "gacha-float 16s ease-in-out infinite",
        "fade-in": "fade-in 0.25s ease-out both",
        "pop-in": "pop-in 0.5s cubic-bezier(0.22, 0.8, 0.24, 1) both",
        shine: "shine 1.4s ease-out 0.2s both",
        "rarity-burst": "rarity-burst 1s ease-out both",
        "slide-in": "slide-in 0.3s ease-out both",
      },
    },
  },
  plugins: [],
};
