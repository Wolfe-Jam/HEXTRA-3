import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import App from './App';
import StripeTest from './components/StripeTest';
import PricingPage from './components/pricing/PricingPage';

// Callback handler component that lets Kinde process the auth
const CallbackHandler = () => {
  return <div style={{ display: 'none' }} />;  // Empty div while Kinde processes
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
