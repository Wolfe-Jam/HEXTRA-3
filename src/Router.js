import React, { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useKindeAuth } from '@kinde-oss/kinde-auth-react';
import { Box } from '@mui/material';
import App from './App';
import StripeTest from './components/StripeTest';
import PricingPage from './components/pricing/PricingPage';
import CallbackPage from './components/CallbackPage';
import Banner from './components/Banner';
import { VERSION } from './version';
import SubscriptionPage from './components/SubscriptionPage';
import MailChimpTest from './components/MailChimpTest';

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

const Layout = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isBatchMode, setIsBatchMode] = useState(false);
  const [showSubscriptionTest, setShowSubscriptionTest] = useState(false);

  return (
    <Box sx={{ 
      minHeight: '100vh', 
      display: 'flex', 
      flexDirection: 'column',
      bgcolor: isDarkMode ? '#1a1a1a' : '#ffffff',
      color: isDarkMode ? '#ffffff' : '#000000'
    }}>
      <Banner 
        version={VERSION}
        isDarkMode={isDarkMode}
        onThemeToggle={() => setIsDarkMode(!isDarkMode)}
        isBatchMode={isBatchMode}
        setIsBatchMode={setIsBatchMode}
        setShowSubscriptionTest={setShowSubscriptionTest}
      />
      <Box sx={{ flex: 1, mt: '62px' }}>
        {children}
      </Box>
    </Box>
  );
};

const Router = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Make Subscription Page the home page */}
        <Route path="/" element={<Layout><SubscriptionPage /></Layout>} />
        
        {/* App is now at /app path */}
        <Route path="/app" element={<Layout><App /></Layout>} />
        
        {/* Keep other routes as they were */}
        <Route path="/stripe-test" element={<Layout><ProtectedRoute><StripeTest /></ProtectedRoute></Layout>} />
        <Route path="/subscription" element={<Layout><SubscriptionPage /></Layout>} />
        <Route path="/pricing" element={<Layout><PricingPage /></Layout>} />
        <Route path="/mailchimp-test" element={<Layout><MailChimpTest /></Layout>} />
        <Route path="/api/auth/kinde/callback" element={<CallbackPage />} />
      </Routes>
    </BrowserRouter>
  );
};

export default Router;
