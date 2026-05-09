import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { PanelGroup, Panel, PanelResizeHandle } from 'react-resizable-panels';
import { FiTerminal, FiMessageSquare, FiSettings, FiMaximize2, FiMinimize2 } from 'react-icons/fi';
import MonacoEditor from '../components/MonacoEditor';
import FileExplorer from '../components/FileExplorer';
import Tabs from '../components/Tabs';
import AIChatPanel from '../components/AIChatPanel';
import TerminalPanel from '../components/TerminalPanel';
import useWorkspaceStore from '../store/workspaceStore';
import useFileStore from '../store/fileStore';
import useAuthStore from '../store/authStore';
import LoadingSpinner from '../components/LoadingSpinner';

const WorkspacePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  
  const { 
    currentWorkspace, 
    fetchWorkspace, 
    updateWorkspace,
    isLoading: workspaceLoading 
  } = useWorkspaceStore();
  
  const { 
    openFiles, 
    activeFile, 
    fetchFiles, 
    updateFileContent,
    openFile: openFileInStore,
    closeFile: closeFileInStore,
    setActiveFile,
    isLoading: filesLoading 
  } = useFileStore();

  const [showAIChat, setShowAIChat] = useState(false);
  const [showTerminal, setShowTerminal] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [editorSettings, setEditorSettings] = useState({
    theme: 'vs-dark',
    fontSize: 14,
    tabSize: 4,
    wordWrap: 'on',
    minimap: true,
    lineNumbers: 'on'
  });

  useEffect(() => {
    if (id) {
      fetchWorkspace(id);
      fetchFiles(id);
    }
  }, [id, fetchWorkspace, fetchFiles]);

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
    }
  }, [activeFile, updateFileContent]);

  const handleSaveFile = useCallback(async (content) => {
    if (activeFile) {
      await updateFile(activeFile._id, { content });
    }
  }, [activeFile, updateFile]);

  const handleWorkspaceUpdate = useCallback(async (updates) => {
    if (currentWorkspace) {
      await updateWorkspace(currentWorkspace._id, updates);
    }
  }, [currentWorkspace, updateWorkspace]);

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  // Calculate dynamic sizes to ensure they always add up to 100%
  const getLayoutSizes = () => {
    const fileExplorerSize = 20;
    let editorSize, aiChatSize, terminalSize;
    
    if (showAIChat && showTerminal) {
      editorSize = 20;
      aiChatSize = 30;
      terminalSize = 30;
    } else if (showAIChat) {
      editorSize = 50;
      aiChatSize = 30;
      terminalSize = 0;
    } else if (showTerminal) {
      editorSize = 50;
      aiChatSize = 0;
      terminalSize = 30;
    } else {
      editorSize = 80;
      aiChatSize = 0;
      terminalSize = 0;
    }
    
    return { fileExplorerSize, editorSize, aiChatSize, terminalSize };
  };

  if (workspaceLoading || filesLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  if (!currentWorkspace) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-editor-text mb-2">Workspace not found</h2>
          <p className="text-editor-text-dim mb-4">The workspace you're looking for doesn't exist.</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="btn-primary"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const { fileExplorerSize, editorSize, aiChatSize, terminalSize } = getLayoutSizes();

  return (
    <div className="h-full flex flex-col bg-editor-bg">
      {/* Workspace Header */}
      <div className="bg-editor-toolbar border-b border-editor-border px-4 py-2 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h1 className="text-lg font-semibold text-editor-text">
            {currentWorkspace.name}
          </h1>
          {activeFile && (
            <span className="text-sm text-editor-text-dim">
              {activeFile.path}
            </span>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowAIChat(!showAIChat)}
            className={`p-2 rounded transition-colors ${
              showAIChat 
                ? 'bg-editor-accent text-white' 
                : 'hover:bg-editor-hover text-editor-text'
            }`}
            title="Toggle AI Chat"
          >
            <FiMessageSquare size={16} />
          </button>
          
          <button
            onClick={() => setShowTerminal(!showTerminal)}
            className={`p-2 rounded transition-colors ${
              showTerminal 
                ? 'bg-editor-accent text-white' 
                : 'hover:bg-editor-hover text-editor-text'
            }`}
            title="Toggle Terminal"
          >
            <FiTerminal size={16} />
          </button>
          
          <button
            onClick={toggleFullscreen}
            className="p-2 rounded hover:bg-editor-hover text-editor-text"
            title="Toggle Fullscreen"
          >
            {isFullscreen ? <FiMinimize2 size={16} /> : <FiMaximize2 size={16} />}
          </button>
          
          <button
            onClick={() => navigate('/dashboard')}
            className="p-2 rounded hover:bg-editor-hover text-editor-text"
            title="Back to Dashboard"
          >
            <FiSettings size={16} />
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        <PanelGroup direction="horizontal">
          {/* File Explorer */}
          <Panel defaultSize={fileExplorerSize} minSize={15} maxSize={30}>
            <FileExplorer
              workspaceId={currentWorkspace._id}
              onFileSelect={handleFileSelect}
              activeFile={activeFile}
            />
          </Panel>

          {/* Editor and Panels */}
          <PanelGroup direction="horizontal">
            {/* Editor Area */}
            <Panel defaultSize={editorSize} minSize={30}>
              <div className="flex flex-col h-full">
                {/* Tabs */}
                {openFiles.length > 0 && (
                  <Tabs
                    openFiles={openFiles}
                    activeFile={activeFile}
                    onTabClose={handleTabClose}
                    onTabSelect={handleTabSelect}
                  />
                )}
                
                {/* Editor */}
                <div className="flex-1">
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
                      }}
                      onSave={handleSaveFile}
                      height="100%"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full text-editor-text-dim">
                      <div className="text-center">
                        <h3 className="text-lg font-medium mb-2">No file selected</h3>
                        <p className="text-sm">Select a file from the explorer to start editing</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </Panel>

            {/* AI Chat Panel */}
            {showAIChat && (
              <Panel defaultSize={aiChatSize} minSize={15} maxSize={40}>
                <AIChatPanel
                  workspaceId={currentWorkspace._id}
                  onClose={() => setShowAIChat(false)}
                />
              </Panel>
            )}

            {/* Terminal Panel */}
            {showTerminal && (
              <Panel defaultSize={terminalSize} minSize={15} maxSize={40}>
                <TerminalPanel
                  workspaceId={currentWorkspace._id}
                  onClose={() => setShowTerminal(false)}
                />
              </Panel>
            )}
          </PanelGroup>
        </PanelGroup>
      </div>
    </div>
  );
};

export default WorkspacePage;
