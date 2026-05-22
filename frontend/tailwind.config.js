/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cyber: {
          bg: '#030712',       // Pure futuristic deep dark grid background
          card: 'rgba(17, 24, 39, 0.45)', // Glassmorphism backdrop
          border: 'rgba(59, 130, 246, 0.2)', // Sleek cyan/neon-blue borders
          glow: '#06B6D4',     // Cyan highlighter
          blue: '#3B82F6',     // Primary Neon Blue
          purple: '#8B5CF6',   // Neon Purple Accent
          red: '#EF4444',      // Red Alert Neon
          emerald: '#10B981',  // Secure Safe Emerald
        }
      },
      fontFamily: {
        cyber: ['Orbitron', 'Inter', 'Roboto', 'sans-serif'],
        mono: ['Fira Code', 'Courier New', 'monospace']
      },
      boxShadow: {
        'cyber-neon': '0 0 15px rgba(6, 182, 212, 0.35)',
        'cyber-neon-blue': '0 0 20px rgba(59, 130, 246, 0.4)',
        'cyber-neon-purple': '0 0 20px rgba(139, 92, 246, 0.4)',
        'cyber-neon-red': '0 0 25px rgba(239, 68, 68, 0.55)',
      },
      animation: {
        'pulse-fast': 'pulse 1.2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'scan': 'scanLine 8s linear infinite',
      },
      keyframes: {
        scanLine: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100vh)' }
        }
      }
    },
  },
  plugins: [],
}
