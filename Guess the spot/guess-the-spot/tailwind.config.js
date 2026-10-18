/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      keyframes: {
        "flash-green": {
          "0%": { boxShadow: "0 0 0 6px rgba(34, 197, 94, 0.9), 0 0 40px rgba(34, 197, 94, 0.6)" },
          "100%": { boxShadow: "0 0 0 0 rgba(34, 197, 94, 0), 0 0 0 rgba(34, 197, 94, 0)" },
        },
        "flash-red": {
          "0%": { boxShadow: "0 0 0 6px rgba(239, 68, 68, 0.9), 0 0 40px rgba(239, 68, 68, 0.6)" },
          "100%": { boxShadow: "0 0 0 0 rgba(239, 68, 68, 0), 0 0 0 rgba(239, 68, 68, 0)" },
        },
      },
      // Celebration animations for the results screen live in src/index.css.
      animation: {
        "flash-green": "flash-green 0.6s ease-out",
        "flash-red": "flash-red 0.6s ease-out",
      },
    },
  },
  plugins: [],
}
