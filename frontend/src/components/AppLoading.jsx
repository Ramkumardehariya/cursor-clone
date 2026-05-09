import React from 'react';
import { motion } from 'framer-motion';

const AppLoading = () => {
  return (
    <div className="flex items-center justify-center h-screen bg-editor-bg">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="text-center"
      >
        <div className="mb-8">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 border-4 border-editor-accent border-t-transparent rounded-full mx-auto"
          />
        </div>
        
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-2xl font-bold text-editor-text mb-2"
        >
          Cursor Clone
        </motion.h1>
        
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-editor-text-dim"
        >
          Loading your AI-powered code editor...
        </motion.p>
        
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-4 space-y-2"
        >
          <div className="flex items-center justify-center space-x-2">
            <div className="w-2 h-2 bg-editor-accent rounded-full animate-pulse" />
            <div className="w-2 h-2 bg-editor-accent rounded-full animate-pulse delay-100" />
            <div className="w-2 h-2 bg-editor-accent rounded-full animate-pulse delay-200" />
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default AppLoading;
