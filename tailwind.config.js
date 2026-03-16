/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: 'var(--brand-primary)',
          secondary: 'var(--brand-secondary)',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          900: '#14532d',
          surface: 'var(--brand-surface)',
          card: 'var(--brand-card)',
          border: 'var(--brand-border)',
          hover: 'var(--brand-hover)',
        },
        surface: {
          DEFAULT:  'var(--background)',
          card:     'var(--surface-card)',
          border:   'var(--surface-border)',
          hover:    'var(--surface-hover)',
        },
        text: {
          primary:   'var(--text-primary)',
          secondary: 'var(--text-secondary)',
          muted:     'var(--text-muted)',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['monospace'],
      },
    },
  },
  plugins: [],
}
