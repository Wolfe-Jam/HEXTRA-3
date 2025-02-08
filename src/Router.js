import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import App from './App';
import StripeTest from './components/StripeTest';
import PricingPage from './components/pricing/PricingPage';

const Router = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/stripe-test" element={<StripeTest />} />
        <Route path="/pricing" element={<PricingPage />} />
        {/* Handle Kinde callback and redirect to main app */}
        <Route path="/api/auth/kinde/callback" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default Router;
