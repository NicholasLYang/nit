/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{ts,tsx,jsx,js}"],
  theme: {
    extend: {
      boxShadow: {
        block: "1px 1px #1e293b",
      },
    },
  },
  plugins: [require("@tailwindcss/forms")],
};
