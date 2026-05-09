import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiFile } from 'react-icons/fi';
import { getFileIcon } from '../utils/helpers';

const Tabs = ({ 
  openFiles, 
  activeFile, 
  onTabClose, 
  onTabSelect, 
  onTabContextMenu 
}) => {
  const handleTabClose = (e, fileId) => {
    e.stopPropagation();
    onTabClose(fileId);
  };

  const handleTabContextMenu = (e, file) => {
    e.preventDefault();
    if (onTabContextMenu) {
      onTabContextMenu(e, file);
    }
  };

  const getTabWidth = () => {
    const maxWidth = 200;
    const minWidth = 120;
    const tabCount = openFiles.length;
    
    if (tabCount === 0) return 0;
    
    const availableWidth = window.innerWidth - 300; // Account for sidebar
    const calculatedWidth = availableWidth / tabCount;
    
    return Math.min(maxWidth, Math.max(minWidth, calculatedWidth));
  };

  return (
    <div className="bg-editor-toolbar border-b border-editor-border flex items-center overflow-x-auto">
      <div className="flex flex-1">
        <AnimatePresence>
          {openFiles.map((file) => (
            <motion.div
              key={file._id}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className={`tab flex items-center space-x-2 border-r border-editor-border relative group ${
                activeFile?._id === file._id ? 'tab-active' : ''
              }`}
              style={{ width: `${getTabWidth()}px` }}
              onClick={() => onTabSelect(file)}
              onContextMenu={(e) => handleTabContextMenu(e, file)}
            >
              <span className="text-sm">
                {getFileIcon(file.language, file.isFolder)}
              </span>
              
              <span className="text-sm truncate flex-1">
                {file.name}
              </span>
              
              {file.isDirty && (
                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
              )}
              
              <button
                onClick={(e) => handleTabClose(e, file._id)}
                className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-1 hover:bg-editor-hover rounded"
              >
                <FiX size={14} />
              </button>
              
              {/* Active indicator */}
              {activeFile?._id === file._id && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-editor-accent"></div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
      
      {/* New tab button */}
      <button
        onClick={() => {
          // Handle new tab creation
          if (onTabContextMenu) {
            const syntheticEvent = new MouseEvent('contextmenu', {
              clientX: window.innerWidth - 100,
              clientY: 100
            });
            onTabContextMenu(syntheticEvent, null);
          }
        }}
        className="p-2 hover:bg-editor-hover text-editor-text-dim hover:text-editor-text transition-colors"
        title="New File"
      >
        <FiFile size={16} />
      </button>
    </div>
  );
};

export default Tabs;
