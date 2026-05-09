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
        'editor': {
          'bg': '#1e1e1e',
          'sidebar': '#252526',
          'toolbar': '#2d2d30',
          'border': '#3e3e42',
          'text': '#cccccc',
          'text-dim': '#969696',
          'selection': '#264f78',
          'hover': '#2a2d2e',
          'active': '#094771',
          'accent': '#007acc',
          'success': '#4ec9b0',
          'warning': '#ce9178',
          'error': '#f48771',
          'info': '#75beff'
        },
        'monaco': {
          'background': '#1e1e1e',
          'foreground': '#d4d4d4',
          'lineHighlight': '#2d2d30',
          'selection': '#264f78',
          'selectionHighlight': '#add6ff26',
          'inactiveSelection': '#3a3d41',
          'wordHighlight': '#575757b8',
          'wordHighlightStrong': '#004972b8',
          'findMatch': '#515c6a',
          'findMatchHighlight': '#ea5c0055',
          'hoverHighlight': '#264f7840',
          'lineNumber': '#858585',
          'activeLineNumber': '#c6c6c6'
        }
      },
      fontFamily: {
        'mono': ['Consolas', 'Monaco', 'Courier New', 'monospace'],
        'sans': ['Segoe UI', 'system-ui', 'sans-serif']
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-in': 'slideIn 0.3s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideIn: {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
      },
      maxWidth: {
        '8xl': '88rem',
        '9xl': '96rem',
      },
      scrollbar: {
        thin: 'thin',
        none: 'none',
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}
