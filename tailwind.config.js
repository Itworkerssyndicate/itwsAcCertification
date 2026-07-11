/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#e6f0ff',
          100: '#b3d1ff',
          200: '#80b3ff',
          300: '#4d94ff',
          400: '#1a75ff',
          500: '#0055e6',
          600: '#0044b8',
          700: '#00338a',
          800: '#00225c',
          900: '#00112e',
        },
        secondary: {
          50: '#f0e6ff',
          100: '#d1b3ff',
          200: '#b380ff',
          300: '#944dff',
          400: '#751aff',
          500: '#5c00e6',
          600: '#4a00b8',
          700: '#37008a',
          800: '#25005c',
          900: '#12002e',
        },
        dark: {
          100: '#1a1a2e',
          200: '#16162a',
          300: '#121226',
          400: '#0e0e22',
          500: '#0a0a1e',
          600: '#06061a',
          700: '#020216',
        },
        gold: {
          100: '#fdf0d5',
          200: '#fbe1ab',
          300: '#f9d281',
          400: '#f7c357',
          500: '#f5b42d',
          600: '#d4941a',
          700: '#a36e14',
          800: '#72480e',
          900: '#412208',
        },
      },
      fontFamily: {
        arabic: ['Cairo', 'Tahoma', 'Arial', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'gradient-gold': 'linear-gradient(135deg, #f5b42d, #d4941a, #f5b42d)',
        'gradient-tech': 'linear-gradient(135deg, #0a0e1a, #1a1a3e, #0d1b2a)',
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
        'shimmer': 'shimmer 3s ease-in-out infinite',
        'gradient-xy': 'gradientXY 15s ease-in-out infinite',
        'particle': 'particle 20s ease-in-out infinite',
        'spin-slow': 'spin 20s linear infinite',
        'bounce-slow': 'bounce 3s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(0, 85, 230, 0.1)' },
          '50%': { boxShadow: '0 0 40px rgba(0, 85, 230, 0.3)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        gradientXY: {
          '0%, 100%': { backgroundPosition: '0% 0%' },
          '50%': { backgroundPosition: '100% 100%' },
        },
        particle: {
          '0%': { transform: 'translate(0, 0) scale(1)', opacity: 0.3 },
          '50%': { transform: 'translate(30px, -50px) scale(1.5)', opacity: 0.8 },
          '100%': { transform: 'translate(-10px, 0) scale(1)', opacity: 0.3 },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
};
