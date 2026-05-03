/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Premier League style pastels
        pl: {
          pink: '#f9c5d1',
          blue: '#4bb0ff',
          green: '#b8e986',
          yellow: '#f8d24b',
          dark: '#0f172a',
          brand: '#ff4b4b'
        },
        background: "var(--background)",
        foreground: "var(--foreground)",
        surface: "var(--surface)",
        "surface-foreground": "var(--surface-foreground)",
        brand: {
          50: '#fff1f2',
          100: '#ffe4e6',
          200: '#fecdd3',
          300: '#fda4af',
          400: '#fb7185',
          500: '#f43f5e',
          600: '#e11d48',
          700: '#be123c',
          800: '#9f1239',
          900: '#881337',
          950: '#4c0519',
        },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        display: ['Bebas Neue', 'sans-serif'],
        heavy: ['Anton', 'sans-serif'],
      },
      boxShadow: {
        'pl-solid': '4px 4px 0px 0px rgba(15, 23, 42, 1)',
        'pl-solid-white': '4px 4px 0px 0px rgba(255, 255, 255, 1)',
      },
      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.5rem',
      }
    },
  },
  plugins: [],
}
