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
        // === THE NORTHERN CONSTELLATIONS ===
        // Primary: Icy constellation blue (replaces old yellow)
        'primary':        '#6aa0e8',   // Polaris star blue
        'primary-active': '#4d84d4',   // Deeper ice blue

        // Surface system — mapped to CSS variables
        'canvas':           'var(--color-canvas)',
        'surface-card':     'var(--color-surface-card)',
        'surface-elevated': 'var(--color-surface-elevated)',
        'hairline':         'var(--color-hairline)',

        // Trading signals — aurora tones (softer, not neon)
        'trading-up':   '#3ecf8e',   // Aurora green
        'trading-down': '#e05a6a',   // Aurora red

        // Info
        'info':         '#5b9cf6',

        // Text system
        'strong':       'var(--color-text-strong)',
        'body':         'var(--color-text-body)',
        'muted':        'var(--color-text-muted)',
        'muted-strong': 'var(--color-text-muted-strong)',
      },
      fontFamily: {
        // Regal headings — star map / guild charter feel
        nova:    ['Cinzel', 'Georgia', 'serif'],
        // Monospaced data readouts
        plex:    ['"IBM Plex Sans"', 'sans-serif'],
        // General UI
        sans:    ['Inter', 'sans-serif'],
      },
      backgroundImage: {
        // Subtle aurora gradient for selected/active states
        'aurora-glow': 'linear-gradient(135deg, rgba(60,120,220,0.15), rgba(80,200,180,0.08))',
      },
      boxShadow: {
        'star':  '0 0 12px 2px rgba(100,160,255,0.20), 0 2px 8px rgba(0,0,0,0.40)',
        'card':  '0 4px 24px rgba(0,0,0,0.35), 0 1px 4px rgba(0,0,0,0.20)',
      },
      animation: {
        'twinkle': 'twinkle 3s ease-in-out infinite',
      },
      keyframes: {
        twinkle: {
          '0%, 100%': { opacity: '0.8' },
          '50%':      { opacity: '0.3' },
        }
      }
    },
  },
  plugins: [],
}
