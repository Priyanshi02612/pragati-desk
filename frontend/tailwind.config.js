/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: '#16A34A',
          secondary: '#1D4ED8',
          background: '#F9FAFB',
          text: '#111827',
          accent: '#F59E0B',
          danger: '#DC2626',
          muted: '#6B7280',
          border: '#D1D5DB',
        },
      },
      boxShadow: {
        soft: '0 10px 30px rgba(15, 23, 42, 0.08)',
        card: '0 8px 24px rgba(15, 23, 42, 0.06)',
      },
      borderRadius: {
        '4xl': '2rem',
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'ui-sans-serif', 'system-ui'],
      },
      backgroundImage: {
        glow: 'radial-gradient(circle at top left, rgba(22, 163, 74, 0.18), transparent 36%), radial-gradient(circle at top right, rgba(29, 78, 216, 0.14), transparent 28%)',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-6px)' },
        },
      },
      animation: {
        float: 'float 6s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
