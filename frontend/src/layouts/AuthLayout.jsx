import React from 'react';
import { Outlet } from 'react-router-dom';
import { motion } from 'framer-motion';

const AuthLayout = () => {
  return (
    <div className="min-h-screen bg-editor-bg dark:bg-editor-bg flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-4xl flex items-center justify-center"
      >
        <div className="hidden lg:block lg:w-1/2 lg:pr-16">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="text-center lg:text-left"
          >
            <h1 className="text-4xl lg:text-6xl font-bold text-gradient mb-6">
              Cursor Clone
            </h1>
            <p className="text-xl lg:text-2xl text-editor-text-dim dark:text-editor-text-dim mb-8">
              AI-powered code editor that understands your intent
            </p>
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-editor-accent dark:bg-editor-accent rounded-full"></div>
                <span className="text-editor-text dark:text-editor-text">Intelligent code completion</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-editor-accent dark:bg-editor-accent rounded-full"></div>
                <span className="text-editor-text dark:text-editor-text">AI-powered debugging</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-editor-accent dark:bg-editor-accent rounded-full"></div>
                <span className="text-editor-text dark:text-editor-text">Real-time collaboration</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-editor-accent dark:bg-editor-accent rounded-full"></div>
                <span className="text-editor-text dark:text-editor-text">Multi-language support</span>
              </div>
            </div>
          </motion.div>
        </div>
        
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, delay: 0.4 }}
          className="w-full lg:w-1/2 lg:pl-16"
        >
          <Outlet />
        </motion.div>
      </motion.div>
    </div>
  );
};

export default AuthLayout;
