/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: {
          primary: '#080a16',
          secondary: '#0d1020',
          card: '#111428',
        },
        primary: {
          DEFAULT: '#6366f1',
          hover: '#4f46e5',
        },
        secondary: {
          DEFAULT: '#8b5cf6',
          hover: '#a855f7',
        },
        tertiary: {
          DEFAULT: '#06b6d4',
          hover: '#38bdf8',
        },
        status: {
          success: '#22c55e',
          warning: '#f59e0b',
          error: '#ef4444',
        },
        text: {
          primary: '#ffffff',
          secondary: '#94a3b8',
        }
      },
      fontFamily: {
        body: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Outfit', 'Inter', 'sans-serif'],
      },
      spacing: {
        base: '8px',
        half: '4px',
      },
      borderRadius: {
        card: '12px',
        button: '8px',
        pill: '9999px',
      },
    },
  },
  plugins: [],
};
