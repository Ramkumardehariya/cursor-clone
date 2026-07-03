import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiSend, FiX, FiMessageSquare, FiZap, FiCode, FiBook, FiSettings } from 'react-icons/fi';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import useChatStore from '../store/chatStore';
import LoadingSpinner from './LoadingSpinner';

const AIChatPanel = ({ workspaceId, onClose }) => {
  const [message, setMessage] = useState('');
  const [showPromptTemplates, setShowPromptTemplates] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [isMinimized, setIsMinimized] = useState(false);
  
  const { 
    chats, 
    currentChat, 
    messages, 
    sendMessage, 
    generateCode, 
    explainCode, 
    refactorCode, 
    fixBugs, 
    reviewCode,
    isLoading, 
    isStreaming,
    error 
  } = useChatStore();

  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = useCallback(async () => {
    if (!message.trim() || isStreaming) return;

    const messageContent = selectedTemplate 
      ? selectedTemplate.template.replace(/{(\w+)}/g, (match, key) => {
          if (key === 'description') return message;
          if (key === 'code') return message;
          return match;
        })
      : message;

    await sendMessage(workspaceId, messageContent, currentChat?._id);
    setMessage('');
    setSelectedTemplate(null);
  }, [message, selectedTemplate, isStreaming, sendMessage, workspaceId, currentChat]);

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleQuickAction = async (action, code = '') => {
    let result;
    
    switch (action) {
      case 'generate':
        result = await generateCode(message, 'javascript', code);
        break;
      case 'explain':
        result = await explainCode(code);
        break;
      case 'refactor':
        result = await refactorCode(code);
        break;
      case 'fix':
        result = await fixBugs(code);
        break;
      case 'review':
        result = await reviewCode(code);
        break;
      default:
        return;
    }

    if (result.success && result.data) {
      const response = action === 'explain' ? result.data.explanation :
                      action === 'generate' ? result.data.code :
                      action === 'refactor' ? result.data.refactoredCode :
                      action === 'fix' ? result.data.fix :
                      result.data.review;

      await sendMessage(workspaceId, response, currentChat?._id);
    }
  };

  const promptTemplates = [
    { name: 'Create React Component', template: 'Create a React component for {description}', category: 'React' },
    { name: 'Create API Endpoint', template: 'Create a REST API endpoint for {description}', category: 'Backend' },
    { name: 'Fix Bug', template: 'Fix the bug in this code: {code}. The issue is: {description}', category: 'Debugging' },
    { name: 'Explain Code', template: 'Explain what this code does: {code}', category: 'Learning' },
    { name: 'Refactor Code', template: 'Refactor this code to improve readability and performance: {code}', category: 'Refactoring' },
    { name: 'Add Tests', template: 'Write unit tests for this function: {code}', category: 'Testing' },
    { name: 'Optimize Performance', template: 'Optimize this code for better performance: {code}', category: 'Performance' },
    { name: 'Add Documentation', template: 'Add comprehensive documentation for this code: {code}', category: 'Documentation' },
  ];

  const MarkdownComponents = {
    code({ node, inline, className, children, ...props }) {
      const match = /language-(\w+)/.exec(className || '');
      return !inline && match ? (
        <SyntaxHighlighter
          style={vscDarkPlus}
          language={match[1]}
          PreTag="div"
          {...props}
        >
          {String(children).replace(/\n$/, '')}
        </SyntaxHighlighter>
      ) : (
        <code className={className} {...props}>
          {children}
        </code>
      );
    },
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-editor-sidebar border-l border-editor-border flex h-full w-full flex-col"
    >
      {/* Header */}
      <div className="panel-header flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <FiMessageSquare className="text-editor-accent" />
          <h3 className="font-semibold text-editor-text">AI Assistant</h3>
        </div>
        
        <div className="flex items-center space-x-1">
          {!isMinimized && (
            <>
              <button
                onClick={() => setShowPromptTemplates(!showPromptTemplates)}
                className="p-1 hover:bg-editor-hover rounded text-editor-text-dim"
                title="Prompt Templates"
              >
                <FiBook size={14} />
              </button>
              
              <button
                onClick={() => setIsMinimized(true)}
                className="p-1 hover:bg-editor-hover rounded text-editor-text-dim"
                title="Minimize"
              >
                <FiX size={14} className="transform rotate-45" />
              </button>
            </>
          )}
          
          <button
            onClick={onClose}
            className="p-1 hover:bg-editor-hover rounded text-editor-text-dim"
            title="Close"
          >
            <FiX size={14} />
          </button>
        </div>
      </div>

      {!isMinimized && (
        <>
          {/* Prompt Templates */}
          <AnimatePresence>
            {showPromptTemplates && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="border-b border-editor-border overflow-hidden"
              >
                <div className="p-3">
                  <h4 className="text-sm font-medium text-editor-text mb-2">Quick Templates</h4>
                  <div className="space-y-1 max-h-32 overflow-y-auto">
                    {promptTemplates.map((template) => (
                      <button
                        key={template.name}
                        onClick={() => {
                          setSelectedTemplate(template);
                          setShowPromptTemplates(false);
                        }}
                        className={`w-full text-left px-2 py-1 rounded text-xs ${
                          selectedTemplate?.name === template.name
                            ? 'bg-editor-accent text-white'
                            : 'hover:bg-editor-hover text-editor-text'
                        }`}
                      >
                        <span className="font-medium">{template.name}</span>
                        <span className="text-editor-text-dim ml-2">({template.category})</span>
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 ? (
              <div className="text-center py-8">
                <FiMessageSquare className="mx-auto text-editor-text-dim mb-4" size={32} />
                <h3 className="text-sm font-medium text-editor-text mb-2">Start a conversation</h3>
                <p className="text-xs text-editor-text-dim mb-4">
                  Ask me anything about your code or use quick templates
                </p>
                
                {/* Quick Actions */}
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => handleQuickAction('generate')}
                    className="p-2 bg-editor-hover rounded text-xs text-editor-text hover:bg-editor-active transition-colors"
                  >
                    <FiZap className="inline mr-1" />
                    Generate Code
                  </button>
                  <button
                    onClick={() => handleQuickAction('explain')}
                    className="p-2 bg-editor-hover rounded text-xs text-editor-text hover:bg-editor-active transition-colors"
                  >
                    <FiBook className="inline mr-1" />
                    Explain Code
                  </button>
                </div>
              </div>
            ) : (
              messages.map((msg, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`ai-message ${
                    msg.role === 'user' ? 'ai-message-user' : 'ai-message-assistant'
                  }`}
                >
                  <div className="text-sm">
                    <ReactMarkdown components={MarkdownComponents}>
                      {msg.content}
                    </ReactMarkdown>
                  </div>
                  <div className="text-xs opacity-70 mt-1">
                    {new Date(msg.timestamp).toLocaleTimeString()}
                  </div>
                </motion.div>
              ))
            )}
            
            {isStreaming && (
              <div className="ai-message ai-message-assistant">
                <div className="flex items-center space-x-2">
                  <LoadingSpinner size="small" />
                  <span className="text-sm">AI is thinking...</span>
                </div>
              </div>
            )}
            
            {error && (
              <div className="ai-message bg-red-900/20 border border-red-500/50 text-red-400">
                <div className="text-sm">{error}</div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="border-t border-editor-border p-3">
            {selectedTemplate && (
              <div className="mb-2 p-2 bg-editor-accent/20 rounded text-xs text-editor-accent">
                Using template: {selectedTemplate.name}
                <button
                  onClick={() => setSelectedTemplate(null)}
                  className="ml-2 text-editor-accent hover:text-white"
                >
                  ×
                </button>
              </div>
            )}
            
            <div className="flex items-end space-x-2">
              <textarea
                ref={textareaRef}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask me anything about your code..."
                className="flex-1 bg-editor-toolbar border border-editor-border rounded-lg px-3 py-2 text-sm text-editor-text placeholder-editor-text-dim resize-none focus:outline-none focus:border-editor-accent focus:ring-1 focus:ring-editor-accent"
                rows={3}
                disabled={isStreaming}
              />
              
              <button
                onClick={handleSendMessage}
                disabled={!message.trim() || isStreaming}
                className="p-2 bg-editor-accent text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isStreaming ? (
                  <LoadingSpinner size="small" />
                ) : (
                  <FiSend size={16} />
                )}
              </button>
            </div>
          </div>
        </>
      )}
      
      {/* Minimized State */}
      {isMinimized && (
        <div className="flex-1 flex items-center justify-center">
          <button
            onClick={() => setIsMinimized(false)}
            className="p-2 hover:bg-editor-hover rounded text-editor-text"
            title="Expand AI Chat"
          >
            <FiMessageSquare size={20} />
          </button>
        </div>
      )}
    </motion.div>
  );
};

export default AIChatPanel;
