/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./App.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}",
    "./packages/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  darkMode: 'class', // Enable dark mode via class
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#0066CC',
          50: '#E6F2FF',
          100: '#CCE5FF',
          500: '#0066CC',
          600: '#0052A3',
          700: '#003D7A',
        },
        // Dark mode colors
        dark: {
          background: '#111827',
          surface: '#1F2937',
          'surface-secondary': '#374151',
          text: '#F9FAFB',
          'text-secondary': '#D1D5DB',
          'text-tertiary': '#9CA3AF',
          border: '#374151',
          'border-light': '#4B5563',
        },
        // Light mode colors (default)
        light: {
          background: '#FFFFFF',
          surface: '#FFFFFF',
          'surface-secondary': '#F9FAFB',
          text: '#111827',
          'text-secondary': '#6B7280',
          'text-tertiary': '#9CA3AF',
          border: '#E5E7EB',
          'border-light': '#F3F4F6',
        },
      },
    },
  },
  plugins: [],
}

