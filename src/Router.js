import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import App from './App';
import StripeTest from './components/StripeTest';
import PricingPage from './components/pricing/PricingPage';
import { useKindeAuth } from '@kinde-oss/kinde-auth-react';

// Callback handler component that actively processes the auth
const CallbackHandler = () => {
  const { isLoading } = useKindeAuth();

  useEffect(() => {
    if (!isLoading) {
      window.location.replace('/');
    }
  }, [isLoading]);

  return <Navigate to="/" replace />;
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
