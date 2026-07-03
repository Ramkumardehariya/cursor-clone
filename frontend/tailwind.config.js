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
          'bg': 'var(--editor-bg)',
          'sidebar': 'var(--editor-sidebar)',
          'toolbar': 'var(--editor-toolbar)',
          'border': 'var(--editor-border)',
          'text': 'var(--editor-text)',
          'text-dim': 'var(--editor-text-dim)',
          'selection': 'var(--editor-selection)',
          'hover': 'var(--editor-hover)',
          'active': 'var(--editor-active)',
          'accent': 'var(--editor-accent)',
          'success': 'var(--editor-success)',
          'warning': 'var(--editor-warning)',
          'error': 'var(--editor-error)',
          'info': 'var(--editor-info)'
        },
        'monaco': {
          'background': 'var(--monaco-background)',
          'foreground': 'var(--monaco-foreground)',
          'lineHighlight': 'var(--monaco-lineHighlight)',
          'selection': 'var(--monaco-selection)',
          'selectionHighlight': 'var(--monaco-selectionHighlight)',
          'inactiveSelection': 'var(--monaco-inactiveSelection)',
          'wordHighlight': 'var(--monaco-wordHighlight)',
          'wordHighlightStrong': 'var(--monaco-wordHighlightStrong)',
          'findMatch': 'var(--monaco-findMatch)',
          'findMatchHighlight': 'var(--monaco-findMatchHighlight)',
          'hoverHighlight': 'var(--monaco-hoverHighlight)',
          'lineNumber': 'var(--monaco-lineNumber)',
          'activeLineNumber': 'var(--monaco-activeLineNumber)'
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
