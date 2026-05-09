import React from 'react';
import { motion } from 'framer-motion';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log the error to console for debugging
    console.error('Error caught by ErrorBoundary:', error);
    console.error('Error info:', errorInfo);
    
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center h-screen bg-editor-bg">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-2xl mx-auto p-8"
          >
            <div className="mb-8">
              <h1 className="text-4xl font-bold text-red-400 mb-4">
                Something went wrong
              </h1>
              <p className="text-editor-text-dim mb-6">
                The application encountered an error and couldn't render properly.
              </p>
            </div>

            <div className="bg-editor-sidebar border border-editor-border rounded-lg p-6 mb-6">
              <h2 className="text-lg font-semibold text-editor-text mb-4">Error Details</h2>
              <details className="text-left">
                <summary className="cursor-pointer text-sm text-editor-text-dim hover:text-editor-text mb-2">
                  Click to view error details
                </summary>
                <div className="mt-4 space-y-4">
                  <div>
                    <h3 className="text-sm font-semibold text-red-400 mb-2">Error:</h3>
                    <pre className="bg-editor-bg p-3 rounded text-xs text-red-300 overflow-auto">
                      {this.state.error?.toString()}
                    </pre>
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-red-400 mb-2">Stack Trace:</h3>
                    <pre className="bg-editor-bg p-3 rounded text-xs text-red-300 overflow-auto max-h-40">
                      {this.state.errorInfo?.componentStack}
                    </pre>
                  </div>
                </div>
              </details>
            </div>

            <div className="space-y-4">
              <button
                onClick={() => window.location.reload()}
                className="btn-primary block w-full"
              >
                Reload Application
              </button>
              <button
                onClick={() => this.setState({ hasError: false, error: null, errorInfo: null })}
                className="btn-secondary block w-full"
              >
                Try Again
              </button>
            </div>

            <div className="mt-8 text-sm text-editor-text-dim">
              <p>If this problem persists, please check the browser console for more details.</p>
            </div>
          </motion.div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
