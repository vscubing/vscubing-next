import { type Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
        'spinner-rotation': {
          from: { transform: 'rotate(0deg)' },
          to: { transform: 'rotate(360deg)' },
        },
        'spinning-border': {
          '0%': {
            transform:
              'translate(-50%, -50%) scale(1, var(--spinning-border-ratio)) rotate(56deg)',
          },
          '50%,100%': {
            transform:
              'translate(-50%, -50%) scale(1, var(--spinning-border-ratio)) rotate(-304deg)',
          },
          '60%,95%': {
            opacity: '0',
          },
        },
        glow: {
          '0%, 100%': {
            boxShadow: '0 0 4px rgba(143, 143, 254, 0)',
          },
          '50%': {
            boxShadow: `
              0 0 4px rgba(143, 143, 254, 0.9),
              0 0 8px rgba(143, 143, 254, 0.8),
              0 0 12px rgba(143, 143, 254, 0.7)
            `,
          },
        },
        'landing-alternating-text': {
          '0%,20%': { transform: 'translateY(85%)' },
          '33.3%,53.3%': { transform: 'translateY(0)' },
          '66.6%,100%': { transform: 'translateY(-85%)' },
        },
        'landing-blobs': {
          '0%,100%': {
            left: 'var(--from-left)',
            top: 'var(--from-top)',
          },
          '50%': {
            left: 'var(--to-left)',
            top: 'var(--to-top)',
          },
        },
        'landing-features-results': {
          '0%': {
            left: 'var(--from-left)',
            top: 'var(--from-top)',
            transform: 'rotate(var(--from-rotation))',
          },
          '66.6%': {
            left: 'var(--transition-left)',
            top: 'var(--transition-top)',
            transform: 'rotate(var(--transition-rotation))',
          },
          '100%': {
            left: 'var(--to-left)',
            top: 'var(--to-top)',
            transform: 'rotate(var(--to-rotation))',
          },
        },
        'landing-features-scrambles': {
          from: { clipPath: 'inset(0 100% 0 0)' },
          to: { clipPath: 'inset(0)' },
        },
        'landing-features-leaderboards': {
          from: { clipPath: 'inset(0 0 100%)' },
          to: { clipPath: 'inset(0)' },
        },
        'landing-features-sharing-cursor': {
          '0%': {
            transform: 'translateY(300%)',
            opacity: '0',
          },
          '31%,75%': {
            transform: 'translateY(0)',
            opacity: '100%',
          },
          '100%': {
            transform: 'translateY(200%)',
            opacity: '0',
          },
        },
        'landing-features-sharing-button': {
          '0%,99%': {
            backgroundColor: '#565698',
            border: '1px solid #565698',
          },
          '100%': {
            backgroundColor: '#393966',
            border: '1px solid #393966',
          },
        },
        'landing-features-sharing-img': {
          from: { clipPath: 'inset(0 100% 0 0)' },
          to: { clipPath: 'inset(0)' },
        },
        'landing-footer-cubes': {
          '50%': {
            transform: 'translateY(var(--toTranslateY))',
          },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'spinning-border':
          'spinning-border 6s linear(0, 0.32 40%, 0.48 50%, 0.83 90%, 1) infinite',
        glow: 'glow 2s ease-in-out',
        'landing-alternating-text':
          'landing-alternating-text 6s linear infinite',
        'landing-blobs': 'landing-blobs 20s linear infinite',
        'landing-features-results':
          'landing-features-results linear 3s forwards',
        'landing-features-scrambles':
          'landing-features-scrambles linear 2.7s forwards',
        'landing-features-leaderboards':
          'landing-features-leaderboards ease-in-out 1s forwards var(--delay)',
        'landing-features-sharing-cursor':
          'landing-features-sharing-cursor ease-out 3.2s forwards',
        'landing-features-sharing-button':
          'landing-features-sharing-button ease-out 0.8s forwards 1s',
        'landing-features-sharing-img':
          'landing-features-sharing-img linear 1s forwards 3.3s',
        'landing-footer-cubes': 'landing-footer-cubes linear 10s infinite',
      },
    },
  },
  plugins: [],
} satisfies Config
