import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom/future';
import { Toaster } from 'react-hot-toast';
import { motion } from 'framer-motion';

// Layouts
import MainLayout from './layouts/MainLayout';
import AuthLayout from './layouts/AuthLayout';

// Pages
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import WorkspacePage from './pages/WorkspacePage';
import SettingsPage from './pages/SettingsPage';

// Components
import ProtectedRoute from './components/ProtectedRoute';
import LoadingSpinner from './components/LoadingSpinner';

// Styles
import './styles/globals.css';

function App() {
  return (
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <div className="App h-screen overflow-hidden">
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#2d2d30',
              color: '#cccccc',
              border: '1px solid #3e3e42',
            },
            success: {
              duration: 3000,
              iconTheme: {
                primary: '#4ec9b0',
                secondary: '#cccccc',
              },
            },
            error: {
              duration: 5000,
              iconTheme: {
                primary: '#f48771',
                secondary: '#cccccc',
              },
            },
          }}
        />
        
        <Routes>
          {/* Direct IDE Route - Bypass auth for development */}
          <Route path="/" element={<MainLayout />}>
            <Route index element={<WorkspacePage />} />
            <Route path="workspace/:id" element={<WorkspacePage />} />
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>

          {/* Auth Routes - Keep for later use */}
          <Route path="/auth" element={<AuthLayout />}>
            <Route path="login" element={<LoginPage />} />
            <Route path="register" element={<RegisterPage />} />
          </Route>

          {/* Fallback */}
          <Route
            path="*"
            element={
              <div className="flex items-center justify-center h-screen bg-editor-bg">
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center"
                >
                  <h1 className="text-4xl font-bold text-editor-text mb-4">
                    404
                  </h1>
                  <p className="text-editor-text-dim mb-8">
                    Page not found
                  </p>
                  <a
                    href="/dashboard"
                    className="btn-primary"
                  >
                    Go to Dashboard
                  </a>
                </motion.div>
              </div>
            }
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
