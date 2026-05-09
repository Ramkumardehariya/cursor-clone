import React, { useState, useEffect, useCallback, useMemo } from 'react';
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

  // Create default workspace data when no ID is provided
  const defaultWorkspace = {
    _id: id || 'default',
    name: 'Default Workspace',
    description: 'Your AI-powered coding environment',
    lastAccessed: new Date().toISOString()
  };

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
    console.log('🚀 WorkspacePage useEffect triggered, id:', id);
    const workspaceId = id || 'default';
    
    // Initialize workspace data
    if (id) {
      fetchWorkspace(id);
    }
    
    // Create mock files for demo if no real files exist
    if (!openFiles || openFiles.length === 0) {
      console.log('📁 Creating mock files...');
      createMockFiles();
    }
    
    // Fetch files (this will use mock data)
    fetchFiles(workspaceId);
  }, [id]); // Remove fetchWorkspace and fetchFiles from dependencies to prevent infinite loops

  // Create mock files for demonstration
  const createMockFiles = () => {
    const mockFiles = [
      {
        _id: '1',
        name: 'App.jsx',
        path: '/src/App.jsx',
        language: 'javascript',
        content: `import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>Welcome to Cursor Clone</h1>
        <p>Your AI-powered code editor</p>
      </header>
    </div>
  );
}

export default App;`,
        isFolder: false
      },
      {
        _id: '2',
        name: 'index.js',
        path: '/src/index.js',
        language: 'javascript',
        content: `import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);`,
        isFolder: false
      },
      {
        _id: '3',
        name: 'styles.css',
        path: '/src/styles.css',
        language: 'css',
        content: `.App {
  text-align: center;
}

.App-header {
  background-color: #282c34;
  padding: 20px;
  color: white;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  font-size: calc(10px + 2vmin);
}

.App-header h1 {
  margin-bottom: 16px;
}

.App-header p {
  font-size: 16px;
  opacity: 0.8;
}`,
        isFolder: false
      }
    ];

    // Add mock files to store
    mockFiles.forEach(file => {
      openFileInStore(file);
    });
    
    // Set first file as active
    if (mockFiles.length > 0) {
      setActiveFile(mockFiles[0]);
    }
  };

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
  }, [activeFile]);

  const handleWorkspaceUpdate = useCallback(async (updates) => {
    if (currentWorkspace) {
      await updateWorkspace(currentWorkspace._id, updates);
    }
  }, [currentWorkspace, updateWorkspace]);

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  // Calculate dynamic sizes to ensure they always add up to 100%
  const layoutSizes = useMemo(() => {
    const fileExplorerSize = 20;
    let editorSize, aiChatSize, terminalSize;
    
    // Calculate sizes based on visible panels only
    if (showAIChat && showTerminal) {
      // All 3 panels visible: File Explorer + Editor + AI Chat + Terminal = 100%
      editorSize = 40; // 40%
      aiChatSize = 25; // 25%
      terminalSize = 15; // 15%
      // Total: 20 + 40 + 25 + 15 = 100%
    } else if (showAIChat) {
      // File Explorer + Editor + AI Chat = 100%
      editorSize = 60; // 60%
      aiChatSize = 20; // 20%
      terminalSize = 0; // Not rendered
      // Total: 20 + 60 + 20 = 100%
    } else if (showTerminal) {
      // File Explorer + Editor + Terminal = 100%
      editorSize = 60; // 60%
      aiChatSize = 0; // Not rendered
      terminalSize = 20; // 20%
      // Total: 20 + 60 + 20 = 100%
    } else {
      // File Explorer + Editor = 100%
      editorSize = 80; // 80%
      aiChatSize = 0; // Not rendered
      terminalSize = 0; // Not rendered
      // Total: 20 + 80 = 100%
    }
    
    return { fileExplorerSize, editorSize, aiChatSize, terminalSize };
  }, [showAIChat, showTerminal]);

  // Add timeout to prevent infinite loading
const [loadingTimeout, setLoadingTimeout] = useState(false);

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

  // Use default workspace if no current workspace exists
  const workspace = currentWorkspace || {
    _id: 'default',
    name: 'Default Workspace',
    description: 'A default workspace for development',
    createdAt: new Date().toISOString(),
    lastAccessed: new Date().toISOString(),
    settings: {
      theme: 'dark',
      fontSize: 14,
      tabSize: 4
    }
  };
  const { fileExplorerSize, editorSize, aiChatSize, terminalSize } = layoutSizes;

  return (
    <div className="h-full flex flex-col bg-editor-bg">
      {/* Workspace Header */}
      <div className="bg-editor-toolbar border-b border-editor-border px-4 py-2 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h1 className="text-lg font-semibold text-editor-text">
            {workspace.name}
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
              workspaceId={workspace._id}
              onFileSelect={handleFileSelect}
              activeFile={activeFile}
            />
          </Panel>

          {/* Editor Area */}
          <Panel 
            defaultSize={editorSize} 
            minSize={30}
          >
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
          <Panel 
            defaultSize={aiChatSize} 
            minSize={0} 
            maxSize={40}
            style={{ display: showAIChat && aiChatSize > 0 ? 'block' : 'none' }}
          >
            {showAIChat && aiChatSize > 0 && (
              <AIChatPanel
                workspaceId={workspace._id}
                onClose={() => setShowAIChat(false)}
              />
            )}
          </Panel>

          {/* Terminal Panel */}
          <Panel 
            defaultSize={terminalSize} 
            minSize={0} 
            maxSize={40}
            style={{ display: showTerminal && terminalSize > 0 ? 'block' : 'none' }}
          >
            {showTerminal && terminalSize > 0 && (
              <TerminalPanel
                workspaceId={workspace._id}
                onClose={() => setShowTerminal(false)}
              />
            )}
          </Panel>
        </PanelGroup>
      </div>
    </div>
  );
};

export default WorkspacePage;
