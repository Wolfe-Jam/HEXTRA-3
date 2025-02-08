import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useKindeAuth } from '@kinde-oss/kinde-auth-react';
import App from './App';
import StripeTest from './components/StripeTest';
import PricingPage from './components/pricing/PricingPage';

// Protected route wrapper
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useKindeAuth();
  
  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/" />;
  }

  return children;
};

const Router = () => {
  const { isAuthenticated } = useKindeAuth();

  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/api/auth/kinde/callback" element={<Navigate to="/batch" replace />} />
        
        {/* Protected routes */}
        <Route path="/batch" element={
          <ProtectedRoute>
            <App />
          </ProtectedRoute>
        } />
        <Route path="/stripe-test" element={<StripeTest />} />
        <Route path="/pricing" element={<PricingPage />} />
        
        {/* Root route - redirect based on auth */}
        <Route path="/" element={
          isAuthenticated ? <Navigate to="/batch" replace /> : <App />
        } />
      </Routes>
    </BrowserRouter>
  );
};

export default Router;
