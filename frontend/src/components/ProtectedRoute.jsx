import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import useAuthStore from '../store/authStore';
import LoadingSpinner from './LoadingSpinner';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, checkAuth, isLoading } = useAuthStore();
  const [isChecking, setIsChecking] = useState(true);
  const location = useLocation();

  useEffect(() => {
    const verifyAuth = async () => {
      const isValid = await checkAuth();
      setIsChecking(false);
      if (!isValid) {
        // Clear any invalid auth data
        useAuthStore.getState().clearAuth();
      }
    };

    verifyAuth();
  }, [checkAuth]);

  if (isChecking || isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-editor-bg">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <LoadingSpinner size="large" />
          <p className="mt-4 text-editor-text-dim">Verifying authentication...</p>
        </motion.div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth/login" state={{ from: location }} replace />;
  }

  return children;
};

export default ProtectedRoute;
