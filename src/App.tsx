import React, { useEffect, Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Navbar from './components/Navbar';
import { useAuthStore } from './store/authStore';

// Lazy load components for better performance
const LandingPage = lazy(() => import('./pages/LandingPage'));
const Auth = lazy(() => import('./pages/Auth'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const FlowchartCreator = lazy(() => import('./pages/FlowchartCreator'));
const CodeGenerator = lazy(() => import('./pages/CodeGenerator'));
const Communities = lazy(() => import('./pages/Communities'));
const Profile = lazy(() => import('./pages/Profile'));

// Simple loading component
const LoadingSpinner = () => (
  <div className="min-h-screen bg-dark-950 flex items-center justify-center">
    <div className="text-center">
      <div className="w-8 h-8 border-2 border-primary-400/30 border-t-primary-400 rounded-full animate-spin mx-auto mb-4"></div>
      <p className="text-white">Loading...</p>
    </div>
  </div>
);

function App() {
  const { isAuthenticated, loading, initialize } = useAuthStore();

  useEffect(() => {
    initialize();
  }, [initialize]);

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <Router>
      <div className="min-h-screen bg-dark-950">
        <Navbar />
        <Suspense fallback={<LoadingSpinner />}>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/flowchart" element={<FlowchartCreator />} />
            <Route path="/code-generator" element={<CodeGenerator />} />
            <Route path="/communities" element={<Communities />} />
            <Route path="/profile" element={<Profile />} />
            
            {/* Fallback route */}
            <Route path="*" element={<LandingPage />} />
          </Routes>
        </Suspense>
        <Toaster 
          position="top-right"
          toastOptions={{
            style: {
              background: '#1e293b',
              color: '#f8fafc',
              border: '1px solid #22c55e',
            },
          }}
        />
      </div>
    </Router>
  );
}

export default App;