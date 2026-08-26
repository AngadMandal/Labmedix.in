/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          // Primary Clinical Sapphire & Navy
          blue: '#1e3a8a',
          'blue-deep': '#172554',
          'blue-mid': '#2563eb',
          'blue-light': '#3b82f6',
          'blue-glow': '#60a5fa',
          'blue-soft': '#dbeafe',
          // Healthcare Forest & Emerald Green
          green: '#15803d',
          'green-deep': '#14532d',
          'green-mid': '#16a34a',
          'green-light': '#22c55e',
          'green-glow': '#4ade80',
          'green-soft': '#dcfce7',
          // Medical Ruby & Emergency Red
          red: '#991b1b',
          'red-mid': '#dc2626',
          'red-light': '#ef4444',
          'red-soft': '#fee2e2',
          // Premium Gold / Bronze
          gold: '#b45309',
          'gold-mid': '#d97706',
          'gold-light': '#f59e0b',
          'gold-soft': '#fef3c7',
          // Deep Slate / Navy Dark Backgrounds
          navy: '#070d1e',
          'navy-mid': '#0c162e',
          'navy-surface': '#111d3d',
          'navy-dark': '#040814',
          platinum: '#64748b'
        }
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        display: ['Outfit', 'Poppins', '"Plus Jakarta Sans"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'Menlo', 'Monaco', 'Courier New', 'monospace']
      },
      boxShadow: {
        'xs': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        'subtle': '0 2px 8px -2px rgba(15, 23, 42, 0.06), 0 1px 4px -1px rgba(15, 23, 42, 0.04)',
        'card': '0 4px 20px -2px rgba(15, 23, 42, 0.08)',
        'card-hover': '0 12px 32px -4px rgba(15, 23, 42, 0.14)',
        'cr80': '0 20px 40px -8px rgba(0, 0, 0, 0.4), 0 8px 16px -4px rgba(0, 0, 0, 0.2)',
        'green-glow': '0 0 35px -5px rgba(22, 163, 74, 0.35)',
        'blue-glow': '0 0 35px -5px rgba(37, 99, 235, 0.35)',
        'red-glow': '0 0 25px -5px rgba(220, 38, 38, 0.3)',
      },
      backgroundImage: {
        'labmedix': 'linear-gradient(135deg, #070d1e 0%, #0c162e 50%, #111d3d 100%)',
        'labmedix-green': 'linear-gradient(135deg, #052e16 0%, #14532d 60%, #15803d 100%)',
        'labmedix-blue': 'linear-gradient(135deg, #081126 0%, #0f1f45 50%, #1e3a8a 100%)',
        'labmedix-card': 'linear-gradient(135deg, #1e3a8a 0%, #1d4ed8 50%, #15803d 100%)',
      }
    },
  },
  plugins: [],
}