/** @type {import('tailwindcss').Config} */
module.exports = {
  corePlugins: {
    preflight: true,
  },
  darkMode: "class",
  content: [
    "./src/components/**/*.{js,ts,jsx,tsx}",
    "./src/pages/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      screens: {
        xsm: "370px",
        // => @media (min-width: 370px) {...}
      },
      aspectRatio: {
        "9/12": "9 / 12",
        "9/16": "9 / 16",
      },
    },
  },
  plugins: [],
};
