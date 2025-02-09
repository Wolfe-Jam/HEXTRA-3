import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import App from './App';
import StripeTest from './components/StripeTest';
import PricingPage from './components/pricing/PricingPage';

const Router = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/api/auth/kinde/callback" element={<Navigate to="/#batch-section" replace />} />
        <Route path="/" element={<App />} />
        <Route path="/stripe-test" element={<StripeTest />} />
        <Route path="/pricing" element={<PricingPage />} />
      </Routes>
    </BrowserRouter>
  );
};

export default Router;
