import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import App from './App';
import StripeTest from './components/StripeTest';
import PricingPage from './components/pricing/PricingPage';
import { useKindeAuth } from '@kinde-oss/kinde-auth-react';

// Callback handler component that actively processes the auth
const CallbackHandler = () => {
  const { isLoading, isAuthenticated } = useKindeAuth();

  useEffect(() => {
    if (!isLoading) {
      // We're already on hextra.io, just need to ensure we're on the right path
      const path = isAuthenticated ? '/#batch-section' : '/';
      window.location.pathname = path;
    }
  }, [isLoading, isAuthenticated]);

  return null;
};

const Router = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/api/auth/kinde/callback" element={<CallbackHandler />} />
        <Route path="/" element={<App />} />
        <Route path="/stripe-test" element={<StripeTest />} />
        <Route path="/pricing" element={<PricingPage />} />
      </Routes>
    </BrowserRouter>
  );
};

export default Router;
