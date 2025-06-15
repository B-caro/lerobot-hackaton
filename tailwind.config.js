/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {},
  },
  plugins: [],
  darkMode: 'class',

  safelist: [
    'text-green-700',
    'dark:text-green-400',
    'text-blue-700',
    'dark:text-blue-400',
    'text-yellow-600',
    'dark:text-yellow-400',
    'text-pink-600',
    'dark:text-pink-400',
    'text-purple-700',
    'dark:text-purple-400',
    'text-gray-500',
    'italic',
    'dark:text-gray-400',
  ],
};
