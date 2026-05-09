import React, { useRef, useEffect, useState, useCallback } from 'react';
import Editor from '@monaco-editor/react';
import { debounce } from '../utils/helpers';

const MonacoEditor = ({ 
  value = '', 
  onChange, 
  language = 'javascript', 
  theme = 'vs-dark',
  options = {},
  height = '100%',
  readOnly = false,
  onSave,
  onMount 
}) => {
  const editorRef = useRef(null);
  const monacoRef = useRef(null);
  const [isEditorReady, setIsEditorReady] = useState(false);

  // Default editor options
  const defaultOptions = {
    selectOnLineNumbers: true,
    automaticLayout: true,
    minimap: { enabled: true },
    scrollBeyondLastLine: false,
    wordWrap: 'on',
    lineNumbers: 'on',
    renderLineHighlight: 'line',
    tabSize: 4,
    insertSpaces: true,
    fontSize: 14,
    fontFamily: 'Consolas, Monaco, "Courier New", monospace',
    smoothScrolling: true,
    cursorBlinking: 'blink',
    cursorSmoothCaretAnimation: true,
    renderWhitespace: 'selection',
    bracketPairColorization: { enabled: true },
    guides: {
      bracketPairs: true,
      indentation: true
    },
    suggest: {
      showKeywords: true,
      showSnippets: true,
    },
    quickSuggestions: {
      other: true,
      comments: false,
      strings: false
    },
    parameterHints: { enabled: true },
    hover: { enabled: true },
    definition: { enabled: true },
    typeDefinition: { enabled: true },
    references: { enabled: true },
    documentHighlight: { enabled: true },
    codeLens: { enabled: false },
    folding: true,
    lineNumbersMinChars: 3,
    showFoldingControls: 'always',
    smoothScroller: true,
    ...options
  };

  // Handle editor mount
  const handleEditorDidMount = useCallback((editor, monaco) => {
    editorRef.current = editor;
    monacoRef.current = monaco;
    setIsEditorReady(true);

    // Add keyboard shortcuts
    editor.addAction({
      id: 'save-file',
      label: 'Save File',
      keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS],
      run: () => {
        if (onSave) {
          onSave(editor.getValue());
        }
        return null;
      }
    });

    // Add custom commands
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyF, () => {
      editor.getAction('editor.action.find').run();
    });

    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyH, () => {
      editor.getAction('editor.action.startFindReplaceAction').run();
    });

    // Handle content changes with debouncing
    const debouncedChange = debounce((newValue) => {
      if (onChange) {
        onChange(newValue);
      }
    }, 300);

    editor.onDidChangeModelContent(() => {
      const newValue = editor.getValue();
      debouncedChange(newValue);
    });

    // Call onMount callback if provided
    if (onMount) {
      onMount(editor, monaco);
    }
  }, [onChange, onSave, onMount]);

  // Handle editor value change
  const handleEditorChange = useCallback((value) => {
    if (onChange && isEditorReady) {
      onChange(value);
    }
  }, [onChange, isEditorReady]);

  // Update editor options when they change
  useEffect(() => {
    if (editorRef.current && isEditorReady) {
      editorRef.current.updateOptions(defaultOptions);
    }
  }, [defaultOptions, isEditorReady]);

  // Update editor value when prop changes
  useEffect(() => {
    if (editorRef.current && isEditorReady) {
      const currentValue = editorRef.current.getValue();
      if (currentValue !== value) {
        editorRef.current.setValue(value);
      }
    }
  }, [value, isEditorReady]);

  // Update language when it changes
  useEffect(() => {
    if (monacoRef.current && isEditorReady) {
      const model = editorRef.current.getModel();
      if (model) {
        monacoRef.current.editor.setModelLanguage(model, language);
      }
    }
  }, [language, isEditorReady]);

  // Update theme when it changes
  useEffect(() => {
    if (monacoRef.current && isEditorReady) {
      monacoRef.current.editor.setTheme(theme);
    }
  }, [theme, isEditorReady]);

  // Custom theme configuration
  useEffect(() => {
    if (monacoRef.current) {
      const monaco = monacoRef.current;
      
      // Define custom theme
      monaco.editor.defineTheme('cursor-dark', {
        base: 'vs-dark',
        inherit: true,
        rules: [
          { token: 'comment', foreground: '6A9955' },
          { token: 'keyword', foreground: '569CD6' },
          { token: 'string', foreground: 'CE9178' },
          { token: 'number', foreground: 'B5CEA8' },
          { token: 'type', foreground: '4EC9B0' },
          { token: 'function', foreground: 'DCDCAA' },
          { token: 'variable', foreground: '9CDCFE' },
          { token: 'regexp', foreground: 'D16969' },
          { token: 'operator', foreground: 'D4D4D4' },
          { token: 'namespace', foreground: '4EC9B0' },
          { token: 'class', foreground: '4EC9B0' },
          { token: 'interface', foreground: 'B8D7A3' },
          { token: 'parameter', foreground: '9CDCFE' },
          { token: 'property', foreground: '9CDCFE' },
          { token: 'annotation', foreground: 'C586C0' },
          { token: 'tag', foreground: '569CD6' },
          { token: 'attribute.name', foreground: '9CDCFE' },
          { token: 'attribute.value', foreground: 'CE9178' },
        ],
        colors: {
          'editor.background': '#1E1E1E',
          'editor.foreground': '#D4D4D4',
          'editor.lineHighlightBackground': '#2D2D30',
          'editor.selectionBackground': '#264F78',
          'editor.inactiveSelectionBackground': '#3A3D41',
          'editorCursor.foreground': '#AEAFAD',
          'editorWhitespace.foreground': '#404040',
          'editorIndentGuide.background': '#404040',
          'editorIndentGuide.activeBackground': '#707070',
          'editorLineNumber.foreground': '#858585',
          'editorLineNumber.activeForeground': '#C6C6C6',
          'editor.selectionHighlightBackground': '#ADD6FF26',
          'editor.wordHighlightBackground': '#575757B8',
          'editor.wordHighlightStrongBackground': '#004972B8',
          'editor.findMatchHighlightBackground': '#EA5C0055',
          'editor.hoverHighlightBackground': '#264F7840',
          'editor.lineNumbersBorder': '#1E1E1E',
          'editorGutter.background': '#1E1E1E',
          'minimap.background': '#1E1E1E',
          'minimap.selectionHighlight': '#264F78',
          'minimap.errorHighlight': '#F48771',
          'minimap.warningHighlight': '#CE9178',
          'minimap.infoHighlight': '#75BEFF',
          'editorSuggestWidget.background': '#252526',
          'editorSuggestWidget.border': '#3E3E42',
          'editorSuggestWidget.foreground': '#D4D4D4',
          'editorSuggestWidget.highlightForeground': '#007ACC',
          'editorSuggestWidget.selectedBackground': '#094771',
          'editorWidget.background': '#252526',
          'editorWidget.border': '#3E3E42',
          'editorWidget.foreground': '#D4D4D4',
          'input.background': '#3C3C3C',
          'input.border': '#3E3E42',
          'input.foreground': '#D4D4D4',
          'input.placeholderForeground': '#858585',
          'dropdown.background': '#252526',
          'dropdown.border': '#3E3E42',
          'dropdown.foreground': '#D4D4D4',
          'button.background': '#0E639C',
          'button.foreground': '#FFFFFF',
          'button.hoverBackground': '#1177BB',
          'badge.background': '#4D4D4D',
          'badge.foreground': '#D4D4D4',
          'progressBar.background': '#0E70C0',
          'titleBar.activeBackground': '#1E1E1E',
          'titleBar.inactiveBackground': '#2D2D30',
          'titleBar.activeForeground': '#D4D4D4',
          'titleBar.inactiveForeground': '#969696',
          'activityBar.background': '#333333',
          'activityBar.foreground': '#FFFFFF',
          'activityBar.inactiveForeground': '#969696',
          'activityBarBadge.background': '#007ACC',
          'activityBarBadge.foreground': '#FFFFFF',
          'sideBar.background': '#252526',
          'sideBar.foreground': '#D4D4D4',
          'sideBarTitle.foreground': '#BBBBBB',
          'sideBarSectionHeader.foreground': '#BBBBBB',
          'tab.activeBackground': '#1E1E1E',
          'tab.inactiveBackground': '#2D2D30',
          'tab.activeForeground': '#FFFFFF',
          'tab.inactiveForeground': '#969696',
          'tab.activeBorder': '#007ACC',
          'tab.border': '#1E1E1E',
          'editorGroupHeader.tabsBackground': '#2D2D30',
          'editorGroupHeader.noTabsBackground': '#252526',
          'statusBar.background': '#007ACC',
          'statusBar.foreground': '#FFFFFF',
          'statusBar.noFolderBackground': '#68217A',
          'statusBar.debuggingBackground': '#CC6633',
          'statusBarItem.hoverBackground': '#1E497B',
          'statusBarItem.activeBackground': '#1E497B',
        }
      });
    }
  }, []);

  return (
    <div className="h-full w-full">
      <Editor
        height={height}
        language={language}
        value={value}
        theme={theme === 'cursor-dark' ? 'cursor-dark' : theme}
        options={defaultOptions}
        onChange={handleEditorChange}
        onMount={handleEditorDidMount}
        loading={
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="loading-spinner w-6 h-6 mx-auto mb-2"></div>
              <p className="text-editor-text-dim text-sm">Loading editor...</p>
            </div>
          </div>
        }
      />
    </div>
  );
};

export default MonacoEditor;
