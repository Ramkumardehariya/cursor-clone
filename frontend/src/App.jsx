import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { motion } from 'framer-motion';
import debug from './utils/debug';

// Layouts
import MainLayout from './layouts/MainLayout';
import AuthLayout from './layouts/AuthLayout';

// Pages - Lazy loaded for better performance
import { lazy, Suspense } from 'react';
import ErrorBoundary from './components/ErrorBoundary';
import AppLoading from './components/AppLoading';

const LoginPage = lazy(() => import('./pages/LoginPage').catch(() => ({ default: () => <FallbackComponent componentName="LoginPage" /> })));
const RegisterPage = lazy(() => import('./pages/RegisterPage').catch(() => ({ default: () => <FallbackComponent componentName="RegisterPage" /> })));
const DashboardPage = lazy(() => import('./pages/DashboardPage').catch(() => ({ default: () => <FallbackComponent componentName="DashboardPage" /> })));
const WorkspacesPage = lazy(() => import('./pages/WorkspacesPage').catch(() => ({ default: () => <FallbackComponent componentName="WorkspacesPage" /> })));
const WorkspacePage = lazy(() => import('./pages/WorkspacePage').catch(() => ({ default: () => <FallbackComponent componentName="WorkspacePage" /> })));
const SettingsPage = lazy(() => import('./pages/SettingsPage').catch(() => ({ default: () => <FallbackComponent componentName="SettingsPage" /> })));

// Components
import ProtectedRoute from './components/ProtectedRoute';
import LoadingSpinner from './components/LoadingSpinner';
import FallbackComponent from './components/FallbackComponent';

// Styles
import './styles/globals.css';

function App() {
  debug.component('App', 'rendered');
  
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
          {/* Protected Routes */}
          <Route path="/" element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          }>
            <Route index element={
              <ErrorBoundary>
                <Suspense fallback={<AppLoading />}>
                  <DashboardPage />
                </Suspense>
              </ErrorBoundary>
            } />
            <Route path="workspace/:id" element={
              <ErrorBoundary>
                <Suspense fallback={<AppLoading />}>
                  <WorkspacePage />
                </Suspense>
              </ErrorBoundary>
            } />
            <Route path="dashboard" element={
              <ErrorBoundary>
                <Suspense fallback={<AppLoading />}>
                  <DashboardPage />
                </Suspense>
              </ErrorBoundary>
            } />
            <Route path="workspaces" element={
              <ErrorBoundary>
                <Suspense fallback={<AppLoading />}>
                  <WorkspacesPage />
                </Suspense>
              </ErrorBoundary>
            } />
            <Route path="settings" element={
              <ErrorBoundary>
                <Suspense fallback={<AppLoading />}>
                  <SettingsPage />
                </Suspense>
              </ErrorBoundary>
            } />
          </Route>

          {/* Auth Routes - Keep for later use */}
          <Route path="/auth" element={<AuthLayout />}>
            <Route path="login" element={
              <ErrorBoundary>
                <Suspense fallback={<AppLoading />}>
                  <LoginPage />
                </Suspense>
              </ErrorBoundary>
            } />
            <Route path="register" element={
              <ErrorBoundary>
                <Suspense fallback={<AppLoading />}>
                  <RegisterPage />
                </Suspense>
              </ErrorBoundary>
            } />
          </Route>

          {/* Fallback */}
          <Route
            path="*"
            element={
              <div className="flex items-center justify-center h-screen bg-editor-bg dark:bg-editor-bg">
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center"
                >
                  <h1 className="text-4xl font-bold text-editor-text dark:text-editor-text mb-4">
                    404
                  </h1>
                  <p className="text-editor-text-dim dark:text-editor-text-dim mb-8">
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
