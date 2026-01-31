/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Premium Dark Navy with Electric Cyan - Vibrant Blue Accents
        primary: {
          DEFAULT: '#8B5CF6',
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          900: '#0c4a6e',
        },
        accent: {
          DEFAULT: '#06d9ff',
          500: '#06d9ff',
          600: '#00c9ff',
          700: '#00b4ff',
        },
        violet: {
          DEFAULT: '#0ea5e9',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
        },
        muted: {
          DEFAULT: '#8b92a0',
          100: '#f3f4f6',
          200: '#e5e7eb',
          300: '#d1d5db',
        },
        card: {
          DEFAULT: '#ffffff',
          dark: '#0f1628',
        },
        border: {
          DEFAULT: '#e6eef8',
          dark: '#1e2a3f',
        },
      },
    },
  },
  plugins: [],
};
