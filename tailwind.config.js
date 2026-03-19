/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./utils/**/*.{js,ts,jsx,tsx}",
    "./App.tsx",
    "./index.tsx"
  ],
  theme: {
    extend: {
      colors: {
        primary: '#cc0000', // Docomo-like red
        secondary: '#333333',
        accent: '#0099cc', // Ahamo-like accent?
      },
      padding: {
        'safe-bottom': 'env(safe-area-inset-bottom)',
      },
      spacing: {
        'safe-bottom': 'env(safe-area-inset-bottom)',
      }
    },
  },
  plugins: [],
}
