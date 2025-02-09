import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import App from './App';
import StripeTest from './components/StripeTest';
import PricingPage from './components/pricing/PricingPage';
import KindeAuth from './components/KindeAuth';

const Router = () => {
  return (
    <BrowserRouter>
      <KindeAuth>
        <Routes>
          <Route path="/" element={<App />} />
          <Route path="/stripe-test" element={<StripeTest />} />
          <Route path="/pricing" element={<PricingPage />} />
          <Route path="/api/auth/kinde/callback" element={null} />
        </Routes>
      </KindeAuth>
    </BrowserRouter>
  );
};

export default Router;
