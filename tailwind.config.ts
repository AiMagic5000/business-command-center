import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        bcc: {
          bg: '#0a0e1a',
          surface: '#111827',
          elevated: '#1e293b',
          border: '#1e3a5f',
          primary: '#3b82f6',
          gold: '#d4a84b',
          success: '#10b981',
          warning: '#f59e0b',
          error: '#ef4444',
          text: '#f1f5f9',
          'text-secondary': '#94a3b8',
        },
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
      borderRadius: {
        xl: '0.75rem',
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
      animation: {
        'spin-slow': 'spin 2s linear infinite',
      },
    },
  },
  plugins: [],
}

export default config
