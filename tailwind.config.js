export default {
  content: [
    './index.html',
    './App.jsx',
    './src/**/*.{js,jsx}',
  ],
  theme: {
    extend: {
      keyframes: {
        orbit: {
          '0%':   { transform: 'rotate(0deg) translateX(18px) rotate(0deg)' },
          '100%': { transform: 'rotate(360deg) translateX(18px) rotate(-360deg)' },
        },
      },
      animation: {
        'orbit-fast': 'orbit 1.2s linear infinite',
        'orbit-slow': 'orbit 2.4s linear infinite',
      },
    },
  },
  plugins: [],
}
