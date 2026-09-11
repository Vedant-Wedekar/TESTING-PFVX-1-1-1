/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        paper: {
          DEFAULT: '#FAFAF8',
          dim: '#F2F1EE',
        },
        ink: {
          DEFAULT: '#15161A',
          soft: '#4A4B52',
          faint: '#8A8C94',
        },
        line: {
          DEFAULT: '#E6E4DF',
          dark: '#2A2B30',
        },
        surface: {
          dark: '#0B0B0D',
          darkRaised: '#18191D',
        },
        pulse: {
          DEFAULT: '#5B4FE8',
          soft: '#8B7FFF',
          bg: '#EEECFE',
        },
        signal: {
          green: '#1FAE6E',
          amber: '#E8A23D',
          red: '#E8543D',
        },
      },
      fontFamily: {
        sans: ['"Inter"', 'system-ui', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'ui-monospace', 'monospace'],
      },
      borderRadius: {
        xl2: '1.25rem',
      },
      boxShadow: {
        soft: '0 1px 2px rgba(21,22,26,0.04), 0 8px 24px -12px rgba(21,22,26,0.10)',
        softDark: '0 1px 2px rgba(0,0,0,0.3), 0 8px 24px -12px rgba(0,0,0,0.5)',
        card: '0 1px 1px rgba(21,22,26,0.03), 0 2px 8px -2px rgba(21,22,26,0.08)',
      },
      keyframes: {
        pulseDot: {
          '0%, 100%': { transform: 'scale(1)', opacity: '1' },
          '50%': { transform: 'scale(1.6)', opacity: '0.4' },
        },
        riseIn: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-400px 0' },
          '100%': { backgroundPosition: '400px 0' },
        },
      },
      animation: {
        pulseDot: 'pulseDot 1.8s ease-in-out infinite',
        riseIn: 'riseIn 0.35s cubic-bezier(0.16,1,0.3,1) both',
        shimmer: 'shimmer 1.6s linear infinite',
      },
    },
  },
  plugins: [],
}
