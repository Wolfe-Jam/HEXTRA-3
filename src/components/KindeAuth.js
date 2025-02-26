/**
 * KindeAuth Component (v2.2.2)
 * 
 * Provides authentication wrapper for the application using Kinde Auth.
 * Handles the OAuth2 PKCE flow and redirects.
 * 
 * Flow:
 * 1. User clicks sign in
 * 2. Kinde handles authentication
 * 3. Redirects back to callback URL
 * 4. Processes tokens and redirects to /app
 * 
 * @version 2.2.2
 * @lastUpdated 2025-02-26
 */

import React from 'react';
import { KindeProvider } from '@kinde-oss/kinde-auth-react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import CallbackPage from './CallbackPage';
import SubscriptionPage from './SubscriptionPage';
import App from '../App';
import Banner from './Banner';
import { VERSION } from '../version';
import { Box } from '@mui/material';

// Layout component for consistent UI across routes
const Layout = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = React.useState(true);
  const [isBatchMode, setIsBatchMode] = React.useState(false);
  const [showSubscriptionTest, setShowSubscriptionTest] = React.useState(false);

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

export default function KindeAuth({ children }) {
  const config = {
    // Required Kinde configuration
    clientId: process.env.REACT_APP_KINDE_CLIENT_ID,
    domain: process.env.REACT_APP_KINDE_DOMAIN,
    redirectUri: process.env.REACT_APP_KINDE_REDIRECT_URI,
    logoutUri: process.env.REACT_APP_KINDE_LOGOUT_URI,

    // Auth configuration
    responseType: 'code',  // Use authorization code flow
    scope: 'openid profile email',  // Required scopes

    // Redirect handler - keeps it simple and reliable
    onRedirectCallback: () => {
      window.location.href = '/app';
    }
  };

  return (
    <KindeProvider {...config}>
      <Router>
        <Routes>
          {/* Make Subscription Page the home page */}
          <Route path="/" element={<Layout><SubscriptionPage /></Layout>} />
          
          {/* App is now at /app path */}
          <Route path="/app" element={<Layout><App /></Layout>} />
          
          {/* Auth callback route */}
          <Route path="/api/auth/kinde/callback" element={<CallbackPage />} />
          
          {/* Keep subscription route for backward compatibility */}
          <Route path="/subscription" element={<Layout><SubscriptionPage /></Layout>} />
        </Routes>
      </Router>
    </KindeProvider>
  );
}
