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
          DEFAULT: '#708d81',
          50: '#f0f4f2',
          100: '#dce6e1',
          200: '#b9cdc3',
          300: '#96b4a5',
          400: '#739b87',
          500: '#708d81',
          600: '#5a7268',
          700: '#43564e',
          800: '#2d3b34',
          900: '#161f1a',
        },
        'grey-light': '#f5f5f5',
        'grey-medium': '#e5e5e5',
        'grey-dark': '#525252',
        'olive-green': '#708d81',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'box-sm': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        'box': '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        'box-md': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        'box-lg': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        'box-xl': '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        'box-2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
      },
    },
  },
  plugins: [],
} 