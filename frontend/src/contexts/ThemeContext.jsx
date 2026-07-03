import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    // Check localStorage or system preference
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme !== null) {
      return savedTheme === 'dark';
    }
    // Default to dark mode
    return true;
  });

  useEffect(() => {
    // Apply theme to document
    const root = document.documentElement;
    
    if (isDarkMode) {
      root.classList.add('dark');
      localStorage.setItem('theme', 'dark');
      
      // Set CSS variables for dark mode
      root.style.setProperty('--editor-bg', '#1e1e1e');
      root.style.setProperty('--editor-sidebar', '#252526');
      root.style.setProperty('--editor-toolbar', '#2d2d30');
      root.style.setProperty('--editor-border', '#3e3e42');
      root.style.setProperty('--editor-text', '#cccccc');
      root.style.setProperty('--editor-text-dim', '#969696');
      root.style.setProperty('--editor-selection', '#264f78');
      root.style.setProperty('--editor-hover', '#2a2d2e');
      root.style.setProperty('--editor-active', '#094771');
      root.style.setProperty('--editor-accent', '#007acc');
      root.style.setProperty('--editor-success', '#4ec9b0');
      root.style.setProperty('--editor-warning', '#ce9178');
      root.style.setProperty('--editor-error', '#f48771');
      root.style.setProperty('--editor-info', '#75beff');
      
      root.style.setProperty('--monaco-background', '#1e1e1e');
      root.style.setProperty('--monaco-foreground', '#d4d4d4');
      root.style.setProperty('--monaco-lineHighlight', '#2d2d30');
      root.style.setProperty('--monaco-selection', '#264f78');
      root.style.setProperty('--monaco-selectionHighlight', '#add6ff26');
      root.style.setProperty('--monaco-inactiveSelection', '#3a3d41');
      root.style.setProperty('--monaco-wordHighlight', '#575757b8');
      root.style.setProperty('--monaco-wordHighlightStrong', '#004972b8');
      root.style.setProperty('--monaco-findMatch', '#515c6a');
      root.style.setProperty('--monaco-findMatchHighlight', '#ea5c0055');
      root.style.setProperty('--monaco-hoverHighlight', '#264f7840');
      root.style.setProperty('--monaco-lineNumber', '#858585');
      root.style.setProperty('--monaco-activeLineNumber', '#c6c6c6');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('theme', 'light');
      
      // Set CSS variables for light mode
      root.style.setProperty('--editor-bg', '#ffffff');
      root.style.setProperty('--editor-sidebar', '#f3f4f6');
      root.style.setProperty('--editor-toolbar', '#ffffff');
      root.style.setProperty('--editor-border', '#e5e7eb');
      root.style.setProperty('--editor-text', '#1f2937');
      root.style.setProperty('--editor-text-dim', '#6b7280');
      root.style.setProperty('--editor-selection', '#dbeafe');
      root.style.setProperty('--editor-hover', '#f9fafb');
      root.style.setProperty('--editor-active', '#3b82f6');
      root.style.setProperty('--editor-accent', '#3b82f6');
      root.style.setProperty('--editor-success', '#10b981');
      root.style.setProperty('--editor-warning', '#f59e0b');
      root.style.setProperty('--editor-error', '#ef4444');
      root.style.setProperty('--editor-info', '#3b82f6');
      
      root.style.setProperty('--monaco-background', '#ffffff');
      root.style.setProperty('--monaco-foreground', '#1f2937');
      root.style.setProperty('--monaco-lineHighlight', '#f3f4f6');
      root.style.setProperty('--monaco-selection', '#dbeafe');
      root.style.setProperty('--monaco-selectionHighlight', '#bfdbfe');
      root.style.setProperty('--monaco-inactiveSelection', '#e5e7eb');
      root.style.setProperty('--monaco-wordHighlight', '#fef3c7');
      root.style.setProperty('--monaco-wordHighlightStrong', '#fcd34d');
      root.style.setProperty('--monaco-findMatch', '#fef3c7');
      root.style.setProperty('--monaco-findMatchHighlight', '#fcd34d');
      root.style.setProperty('--monaco-hoverHighlight', '#dbeafe');
      root.style.setProperty('--monaco-lineNumber', '#9ca3af');
      root.style.setProperty('--monaco-activeLineNumber', '#1f2937');
    }
  }, [isDarkMode]);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  const value = {
    isDarkMode,
    toggleTheme,
    setIsDarkMode
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};
