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
        'primary': '#fcd535',
        'primary-active': '#f0b90b',
        'canvas': 'var(--color-canvas)',
        'surface-card': 'var(--color-surface-card)',
        'surface-elevated': 'var(--color-surface-elevated)',
        'hairline': 'var(--color-hairline)',
        'trading-up': '#0ecb81',
        'trading-down': '#f6465d',
        'info-ring': '#3b82f6',
        'strong': 'var(--color-text-strong)',
        'body': 'var(--color-text-body)',
        'muted': 'var(--color-text-muted)',
        'muted-strong': 'var(--color-text-muted-strong)',
      },
      fontFamily: {
        nova: ['Inter', 'sans-serif'],
        plex: ['"IBM Plex Sans"', 'sans-serif'],
      }
    },
  },
  plugins: [],
}

