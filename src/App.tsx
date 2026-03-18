/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import { AlertTriangle } from 'lucide-react';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading, multipleDeviceError } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50 dark:bg-stone-900 bg-gradient-mesh">
        <div className="relative">
          <div className="absolute inset-0 bg-purple-500/20 blur-xl rounded-full"></div>
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-purple-600 dark:border-purple-400 relative z-10"></div>
        </div>
      </div>
    );
  }

  if (multipleDeviceError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50 dark:bg-stone-900 bg-gradient-mesh p-4">
        <div className="glass-card p-8 rounded-3xl shadow-2xl max-w-md w-full text-center relative overflow-hidden border border-red-200/50 dark:border-red-900/30">
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-red-500 to-orange-500"></div>
          <div className="absolute -top-20 -right-20 w-40 h-40 bg-red-500/10 rounded-full blur-3xl -z-10"></div>
          
          <div className="h-20 w-20 bg-gradient-to-br from-red-100 to-red-200 dark:from-red-900/40 dark:to-red-800/40 text-red-600 dark:text-red-400 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-inner shadow-red-500/20">
            <AlertTriangle className="h-10 w-10" />
          </div>
          <h2 className="text-2xl font-bold text-stone-900 dark:text-white mb-3 tracking-tight">Multiple Device Login Detected</h2>
          <p className="text-stone-600 dark:text-stone-400 mb-8 leading-relaxed">
            Please use only one device to access the training platform. You have been logged out from this device to ensure account security.
          </p>
          <button 
            onClick={() => window.location.reload()}
            className="w-full button-3d bg-gradient-to-r from-red-500 to-red-600 text-white py-3 rounded-xl font-semibold shadow-lg shadow-red-500/30 transition-all"
          >
            Return to Login
          </button>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route 
              path="/" 
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } 
            />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}
