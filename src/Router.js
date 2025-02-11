import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useKindeAuth } from '@kinde-oss/kinde-auth-react';
import { Box } from '@mui/material';
import App from './App';
import StripeTest from './components/StripeTest';
import PricingPage from './components/pricing/PricingPage';
import CallbackPage from './components/CallbackPage';
import Banner from './components/Banner';

const ProtectedRoute = ({ children }) => {
  const { isLoading, isAuthenticated } = useKindeAuth();

  if (isLoading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        background: 'linear-gradient(180deg, #1a1a1a 0%, #2d2d2d 100%)'
      }}>
        <img 
          src="/logo-white.png" 
          alt="HEXTRA" 
          style={{ 
            height: '90px',
            opacity: isLoading ? 0.7 : 1,
            transition: 'opacity 0.3s ease'
          }} 
        />
      </div>
    );
  }

  return isAuthenticated ? children : <PricingPage />;
};

const Layout = ({ children }) => (
  <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
    <Banner />
    <Box sx={{ flex: 1 }}>
      {children}
    </Box>
  </Box>
);

const Router = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout><ProtectedRoute><App /></ProtectedRoute></Layout>} />
        <Route path="/stripe-test" element={<Layout><ProtectedRoute><StripeTest /></ProtectedRoute></Layout>} />
        <Route path="/pricing" element={<Layout><PricingPage /></Layout>} />
        <Route path="/api/auth/kinde/callback" element={<CallbackPage />} />
      </Routes>
    </BrowserRouter>
  );
};

export default Router;
