import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { PanelGroup, Panel, PanelResizeHandle } from 'react-resizable-panels';
import {
  FiCheck,
  FiCode,
  FiMessageSquare,
  FiMinimize2,
  FiMaximize2,
  FiSettings,
  FiTerminal,
  FiX
} from 'react-icons/fi';
import MonacoEditor from '../components/MonacoEditor';
import FileExplorer from '../components/FileExplorer';
import Tabs from '../components/Tabs';
import AIChatPanel from '../components/AIChatPanel';
import TerminalPanel from '../components/TerminalPanel';
import useWorkspaceStore from '../store/workspaceStore';
import useFileStore from '../store/fileStore';
import LoadingSpinner from '../components/LoadingSpinner';

const normalizeEditorSettings = (settings = {}) => ({
  theme: settings.theme === 'light' || settings.theme === 'vs-light' ? 'vs-light' : 'vs-dark',
  fontSize: settings.fontSize ?? 14,
  tabSize: settings.tabSize ?? 4,
  wordWrap: settings.wordWrap ?? 'on',
  minimap: settings.minimap ?? true,
  lineNumbers: settings.lineNumbers ?? 'on',
  autoSave: settings.autoSave ?? true,
  autoSaveDelay: settings.autoSaveDelay ?? 1000,
  formatOnSave: settings.formatOnSave ?? true
});

const ToolbarButton = ({ icon: Icon, label, active = false, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    aria-label={label}
    aria-pressed={active}
    title={label}
    className={`h-8 w-8 shrink-0 rounded flex items-center justify-center transition-colors ${
      active
        ? 'bg-editor-accent text-white shadow-sm'
        : 'text-editor-text-dim hover:bg-editor-hover hover:text-editor-text'
    }`}
  >
    <Icon size={16} />
  </button>
);

const FieldLabel = ({ children }) => (
  <label className="text-xs font-medium uppercase tracking-wide text-editor-text-dim">
    {children}
  </label>
);

const WorkspaceSettingsPanel = ({
  settings,
  onChange,
  onSave,
  onClose,
  isSaving
}) => {
  const setSetting = (key, value) => {
    onChange((current) => ({ ...current, [key]: value }));
  };

  return (
    <motion.aside
      initial={{ opacity: 0, x: 24 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 24 }}
      transition={{ duration: 0.18 }}
      className="bg-editor-sidebar border-l border-editor-border flex h-full flex-col"
    >
      <div className="panel-header flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <FiSettings className="text-editor-accent" />
          <h3 className="font-semibold text-editor-text">Workspace Settings</h3>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="p-1 rounded text-editor-text-dim hover:bg-editor-hover hover:text-editor-text"
          title="Close settings"
          aria-label="Close settings"
        >
          <FiX size={14} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-5">
        <div className="space-y-2">
          <FieldLabel>Theme</FieldLabel>
          <div className="grid grid-cols-2 gap-2">
            {[
              ['vs-dark', 'Dark'],
              ['vs-light', 'Light']
            ].map(([value, label]) => (
              <button
                key={value}
                type="button"
                onClick={() => setSetting('theme', value)}
                className={`rounded border px-3 py-2 text-left text-sm transition-colors ${
                  settings.theme === value
                    ? 'border-editor-accent bg-editor-accent/20 text-editor-text'
                    : 'border-editor-border bg-editor-toolbar text-editor-text-dim hover:text-editor-text'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <FieldLabel>Font Size</FieldLabel>
            <input
              type="number"
              min="10"
              max="32"
              value={settings.fontSize}
              onChange={(event) => setSetting('fontSize', Number(event.target.value))}
              className="input-field w-full"
            />
          </div>
          <div className="space-y-2">
            <FieldLabel>Tab Size</FieldLabel>
            <input
              type="number"
              min="2"
              max="8"
              value={settings.tabSize}
              onChange={(event) => setSetting('tabSize', Number(event.target.value))}
              className="input-field w-full"
            />
          </div>
        </div>

        <div className="space-y-2">
          <FieldLabel>Word Wrap</FieldLabel>
          <select
            value={settings.wordWrap}
            onChange={(event) => setSetting('wordWrap', event.target.value)}
            className="input-field w-full"
          >
            <option value="on">On</option>
            <option value="off">Off</option>
            <option value="bounded">Bounded</option>
            <option value="wordWrapColumn">Word wrap column</option>
          </select>
        </div>

        <div className="space-y-3">
          {[
            ['autoSave', 'Auto-save'],
            ['minimap', 'Minimap'],
            ['formatOnSave', 'Format on save']
          ].map(([key, label]) => (
            <label
              key={key}
              className="flex items-center justify-between rounded border border-editor-border bg-editor-toolbar px-3 py-2 text-sm text-editor-text"
            >
              <span>{label}</span>
              <input
                type="checkbox"
                checked={Boolean(settings[key])}
                onChange={(event) => setSetting(key, event.target.checked)}
                className="h-4 w-4 accent-[var(--editor-accent)]"
              />
            </label>
          ))}
        </div>

        <div className="space-y-2">
          <FieldLabel>Auto-save Delay</FieldLabel>
          <input
            type="range"
            min="500"
            max="5000"
            step="250"
            value={settings.autoSaveDelay}
            onChange={(event) => setSetting('autoSaveDelay', Number(event.target.value))}
            className="w-full accent-[var(--editor-accent)]"
          />
          <div className="text-xs text-editor-text-dim">{settings.autoSaveDelay}ms</div>
        </div>
      </div>

      <div className="border-t border-editor-border p-3">
        <button
          type="button"
          onClick={onSave}
          disabled={isSaving}
          className="btn-primary flex w-full items-center justify-center space-x-2 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <FiCheck size={15} />
          <span>{isSaving ? 'Saving...' : 'Save Settings'}</span>
        </button>
      </div>
    </motion.aside>
  );
};

const WorkspacePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  // Redirect to dashboard if no id provided
  useEffect(() => {
    if (!id) {
      navigate('/dashboard');
    }
  }, [id, navigate]);
  
  const { 
    currentWorkspace, 
    fetchWorkspace, 
    updateWorkspace,
    isLoading: workspaceLoading 
  } = useWorkspaceStore();
  
  const { 
    openFiles, 
    activeFile, 
    updateFile,
    updateFileContent,
    openFile: openFileInStore,
    closeFile: closeFileInStore,
    setActiveFile,
    isLoading: filesLoading 
  } = useFileStore();

  const [showAIChat, setShowAIChat] = useState(false);
  const [showTerminal, setShowTerminal] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [editorSettings, setEditorSettings] = useState(() => normalizeEditorSettings());
  const lastFetchedWorkspaceId = useRef(null);
  const autoSaveTimerRef = useRef(null);
  const [loadingTimeout, setLoadingTimeout] = useState(false);

  useEffect(() => {
    console.log('🚀 WorkspacePage useEffect triggered, id:', id);
    
    // Initialize workspace data
    if (id && id !== lastFetchedWorkspaceId.current) {
      console.log('✅ Calling fetchWorkspace for:', id);
      lastFetchedWorkspaceId.current = id;
      fetchWorkspace(id);
    }
  }, [id, fetchWorkspace]);

  useEffect(() => {
    if (currentWorkspace?.settings) {
      setEditorSettings(normalizeEditorSettings(currentWorkspace.settings));
    }
  }, [currentWorkspace?._id]);

  useEffect(() => () => {
    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
    }
  }, []);

  const handleFileSelect = useCallback((file) => {
    if (!file.isFolder) {
      openFileInStore(file);
      setActiveFile(file);
    }
  }, [openFileInStore, setActiveFile]);

  const handleTabClose = useCallback((fileId) => {
    closeFileInStore(fileId);
  }, [closeFileInStore]);

  const handleTabSelect = useCallback((file) => {
    setActiveFile(file);
  }, [setActiveFile]);

  const handleEditorChange = useCallback((content) => {
    if (activeFile) {
      updateFileContent(activeFile._id, content);

      if (editorSettings.autoSave) {
        if (autoSaveTimerRef.current) {
          clearTimeout(autoSaveTimerRef.current);
        }

        autoSaveTimerRef.current = setTimeout(() => {
          updateFile(activeFile._id, { content });
        }, editorSettings.autoSaveDelay);
      }
    }
  }, [activeFile, editorSettings.autoSave, editorSettings.autoSaveDelay, updateFile, updateFileContent]);

  const handleSaveFile = useCallback(async (content) => {
    if (activeFile) {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }
      await updateFile(activeFile._id, { content });
    }
  }, [activeFile, updateFile]);

  const toggleFullscreen = () => {
    setIsFullscreen((value) => !value);
  };

  const handleSettingsSave = useCallback(async () => {
    if (!currentWorkspace) return;

    setIsSavingSettings(true);
    try {
      await updateWorkspace(currentWorkspace._id, {
        settings: {
          ...currentWorkspace.settings,
          ...editorSettings,
          theme: editorSettings.theme
        }
      });
    } finally {
      setIsSavingSettings(false);
    }
  }, [currentWorkspace, editorSettings, updateWorkspace]);

  const openCollaboration = () => {
    setShowAIChat((value) => !value);
    setShowSettings(false);
  };

  const openSettings = () => {
    setShowSettings((value) => !value);
    setShowAIChat(false);
  };

  const layoutSizes = useMemo(() => {
    const fileExplorerSize = 20;
    const sidePanelSize = showAIChat || showSettings ? 26 : 0;
    const editorSize = 100 - fileExplorerSize - sidePanelSize;

    return { fileExplorerSize, editorSize, sidePanelSize };
  }, [showAIChat, showSettings]);

  // Add timeout to prevent infinite loading
  useEffect(() => {
    const timer = setTimeout(() => {
      if (workspaceLoading || filesLoading) {
        console.log('⏰ Loading timeout reached, forcing render');
        setLoadingTimeout(true);
      }
    }, 3000); // 3 second timeout

    return () => clearTimeout(timer);
  }, [workspaceLoading, filesLoading]);

  if ((workspaceLoading || filesLoading) && !loadingTimeout) {
    return (
      <div className="flex items-center justify-center h-full">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  // Use current workspace from store, or null if not loaded
  const workspace = currentWorkspace;
  
  // Don't render if no workspace is loaded
  if (!workspace && id) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <p className="text-editor-text-dim mb-4">Loading workspace...</p>
        </div>
      </div>
    );
  }
  
  const { fileExplorerSize, editorSize, sidePanelSize } = layoutSizes;

  return (
    <div className={`${isFullscreen ? 'fixed inset-0 z-50' : 'h-full'} flex flex-col bg-editor-bg`}>
      {/* Workspace Header */}
      <div className="sticky top-0 z-30 bg-editor-toolbar border-b border-editor-border px-3 sm:px-4 py-2 flex items-center justify-between">
        <div className="min-w-0 flex items-center space-x-3">
          <FiCode className="hidden sm:block text-editor-accent" size={16} />
          <h1 className="truncate text-sm sm:text-base font-semibold text-editor-text">
            {workspace.name}
          </h1>
          {activeFile && (
            <span className="hidden md:block truncate text-sm text-editor-text-dim">
              {activeFile.path}
            </span>
          )}
        </div>
        
        <div className="fixed right-3 top-2 z-40 flex items-center gap-1 rounded bg-editor-toolbar/95 p-0.5 shadow-lg shadow-black/10 backdrop-blur sm:right-4">
          <ToolbarButton
            icon={FiMessageSquare}
            label="Comments, discussions, and AI chat"
            active={showAIChat}
            onClick={openCollaboration}
          />
          <ToolbarButton
            icon={FiTerminal}
            label="Toggle integrated terminal"
            active={showTerminal}
            onClick={() => setShowTerminal((value) => !value)}
          />
          <ToolbarButton
            icon={isFullscreen ? FiMinimize2 : FiMaximize2}
            label={isFullscreen ? 'Exit full screen' : 'Enter full screen'}
            active={isFullscreen}
            onClick={toggleFullscreen}
          />
          <ToolbarButton
            icon={FiSettings}
            label="Workspace settings"
            active={showSettings}
            onClick={openSettings}
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="min-h-0 flex-1 overflow-hidden">
        <PanelGroup direction="vertical">
          <Panel defaultSize={showTerminal ? 72 : 100} minSize={35}>
            <PanelGroup direction="horizontal">
              <Panel defaultSize={fileExplorerSize} minSize={14} maxSize={34}>
                <FileExplorer
                  workspaceId={workspace._id}
                  onFileSelect={handleFileSelect}
                  activeFile={activeFile}
                />
              </Panel>

              <PanelResizeHandle className="panel-resize-handle panel-resize-handle-vertical" />

              <Panel defaultSize={editorSize} minSize={32}>
                <div className="flex h-full flex-col">
                  {openFiles.length > 0 && (
                    <Tabs
                      openFiles={openFiles}
                      activeFile={activeFile}
                      onTabClose={handleTabClose}
                      onTabSelect={handleTabSelect}
                    />
                  )}
                  
                  <div className="min-h-0 flex-1">
                    {activeFile ? (
                      <MonacoEditor
                        value={activeFile.content || ''}
                        onChange={handleEditorChange}
                        language={activeFile.language}
                        theme={editorSettings.theme}
                        options={{
                          fontSize: editorSettings.fontSize,
                          tabSize: editorSettings.tabSize,
                          wordWrap: editorSettings.wordWrap,
                          minimap: { enabled: editorSettings.minimap },
                          lineNumbers: editorSettings.lineNumbers,
                          formatOnPaste: editorSettings.formatOnSave,
                          formatOnType: editorSettings.formatOnSave,
                        }}
                        onSave={handleSaveFile}
                        height="100%"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-editor-text-dim">
                        <div className="text-center">
                          <h3 className="mb-2 text-lg font-medium">No file selected</h3>
                          <p className="text-sm">Select a file from the explorer to start editing</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </Panel>

              {(showAIChat || showSettings) && (
                <>
                  <PanelResizeHandle className="panel-resize-handle panel-resize-handle-vertical" />
                  <Panel defaultSize={sidePanelSize} minSize={20} maxSize={42}>
                    <AnimatePresence mode="wait">
                      {showAIChat && (
                        <AIChatPanel
                          key="collaboration"
                          workspaceId={workspace._id}
                          onClose={() => setShowAIChat(false)}
                        />
                      )}
                      {showSettings && (
                        <WorkspaceSettingsPanel
                          key="settings"
                          settings={editorSettings}
                          onChange={setEditorSettings}
                          onSave={handleSettingsSave}
                          onClose={() => setShowSettings(false)}
                          isSaving={isSavingSettings}
                        />
                      )}
                    </AnimatePresence>
                  </Panel>
                </>
              )}
            </PanelGroup>
          </Panel>

          {showTerminal && (
            <>
              <PanelResizeHandle className="panel-resize-handle panel-resize-handle-horizontal" />
              <Panel defaultSize={28} minSize={16} maxSize={55}>
                <TerminalPanel
                  workspaceId={workspace._id}
                  onClose={() => setShowTerminal(false)}
                />
              </Panel>
            </>
          )}
        </PanelGroup>
      </div>
    </div>
  );
};

export default WorkspacePage;
