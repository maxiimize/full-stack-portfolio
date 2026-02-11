/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'selector', // Tailwind v4 class strategy (adds .dark to <html>)
  content: ['./src/**/*.{html,ts}'],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          '"Inter"',
          'system-ui',
          '-apple-system',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          'Roboto',
          '"Helvetica Neue"',
          'Arial',
          '"Noto Sans"',
          'sans-serif',
          '"Apple Color Emoji"',
          '"Segoe UI Emoji"',
          '"Segoe UI Symbol"',
          '"Noto Color Emoji"',
        ],
        mono: [
          '"Fira Code"',
          '"Cascadia Code"',
          '"JetBrains Mono"',
          'ui-monospace',
          'SFMono-Regular',
          'Menlo',
          'Consolas',
          'monospace',
        ],
      },
      colors: {
        surface: {
          DEFAULT: 'var(--color-surface)',
          hover: 'var(--color-surface-hover)',
          raised: 'var(--color-surface-raised)',
        },
        border: {
          DEFAULT: 'var(--color-border)',
          hover: 'var(--color-border-hover)',
        },
        accent: {
          DEFAULT: 'var(--color-accent)',
          hover: 'var(--color-accent-hover)',
          subtle: 'var(--color-accent-subtle)',
          2: 'var(--color-accent-2)',
          3: 'var(--color-accent-3)',
        },
        muted: 'var(--color-text-muted)',
      },
      borderRadius: {
        sm: '0.5rem',
        md: '0.75rem',
        lg: '1rem',
        xl: '1.25rem',
      },
      spacing: {
        /* Consistent layout spacing scale (aligned with CSS custom props) */
        '4.5': '1.125rem',  /*  18px */
        '13':  '3.25rem',   /*  52px */
        '15':  '3.75rem',   /*  60px */
        '18':  '4.5rem',    /*  72px */
        '22':  '5.5rem',    /*  88px */
        '26':  '6.5rem',    /* 104px */
        '30':  '7.5rem',    /* 120px */
      },
      maxWidth: {
        '8xl': '88rem',     /* 1408px – extra-wide container */
      },
    },
  },
  plugins: [],
};
