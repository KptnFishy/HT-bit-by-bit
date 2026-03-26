/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all of your component files.
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: '#8aebff',
        'primary-container': '#22d3ee',
        surface: '#0b1326',
        'surface-container-low': '#131b2e',
        'surface-container-high': '#222a3d',
        'surface-bright': '#ffffff',
      }
    },
  },
  plugins: [],
}
