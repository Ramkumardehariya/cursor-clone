import React from 'react';
import { motion } from 'framer-motion';

const FallbackComponent = ({ componentName, error }) => {
  return (
    <div className="flex items-center justify-center h-full bg-editor-bg">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center p-8"
      >
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-editor-text mb-2">
            Component Loading Issue
          </h2>
          <p className="text-editor-text-dim">
            {componentName} component is not available
          </p>
        </div>
        
        {error && (
          <div className="bg-editor-sidebar border border-editor-border rounded-lg p-4 mb-6">
            <p className="text-sm text-red-400">
              Error: {error.message}
            </p>
          </div>
        )}
        
        <div className="space-y-2">
          <button
            onClick={() => window.location.reload()}
            className="btn-primary"
          >
            Reload Page
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default FallbackComponent;
