/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{html,js,svelte,ts}'],

  theme: {
    extend: {
      colors: {
        bg: '#0B0D10',
        panel: '#111418',
        border: '#1F2226',
        text: '#EDEAE4',
        muted: '#5A5F66',
        muted2: '#8A8F96',
        exercise: '#3FE1D0',
        music: '#FF3EA5',
        content: '#F5A623',
        'seg-off': '#1A1D21',
      },

      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
        mono: ['SF Mono', 'ui-monospace', 'Courier New', 'monospace'],
      },

      borderRadius: {
        DEFAULT: '5px',
        sheet: '18px',
      },

      screens: {
        desktop: '900px',
      },

      width: {
        sidebar: '220px',
      },

      keyframes: {
        segFill: {
          from: { transform: 'scaleX(0)' },
          to: { transform: 'scaleX(1)' },
        },
        confirmPulse: {
          '0%': { transform: 'scale(1)' },
          '35%': { transform: 'scale(1.015)' },
          '100%': { transform: 'scale(1)' },
        },

        ledPulse: {
          '0%': { opacity: '0.2', transform: 'scale(0.75)' },
          '60%': { opacity: '1', transform: 'scale(1.25)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },

        screenIn: {
          from: { opacity: '0', transform: 'translateY(6px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
      },

      animation: {

        'seg-fill': 'segFill 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'led-pulse': 'ledPulse 0.6s ease-out forwards',
        'screen-in': 'screenIn 0.28s cubic-bezier(0.16, 1, 0.3, 1)',
      },
    },
  },

  plugins: [],
};
