import React from 'react';
import { KindeProvider } from '@kinde-oss/kinde-auth-react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import CallbackPage from './CallbackPage';

export default function KindeAuth({ children }) {
  // Debug: Log all process.env
  console.log('KindeAuth Init - All process.env:', process.env);
  
  // Log specific environment variables
  const envVars = {
    nodeEnv: process.env.REACT_APP_NODE_ENV,
    baseUrl: process.env.REACT_APP_BASE_URL,
    clientId: process.env.REACT_APP_KINDE_CLIENT_ID,
    domain: process.env.REACT_APP_KINDE_DOMAIN,
    redirectUri: process.env.REACT_APP_KINDE_REDIRECT_URI,
    logoutUri: process.env.REACT_APP_KINDE_LOGOUT_URI
  };
  console.log('KindeAuth - Environment Variables:', envVars);

  // Validate required env vars
  const missingVars = Object.entries(envVars)
    .filter(([_, value]) => !value)
    .map(([key]) => key);
  
  if (missingVars.length > 0) {
    console.error('KindeAuth - Missing required environment variables:', missingVars);
  }

  const config = {
    clientId: process.env.REACT_APP_KINDE_CLIENT_ID,
    domain: process.env.REACT_APP_KINDE_DOMAIN,
    redirectUri: process.env.REACT_APP_KINDE_REDIRECT_URI,
    logoutUri: process.env.REACT_APP_KINDE_LOGOUT_URI
  };

  // Debug: Log final config and validate
  console.log('KindeAuth - Final Config:', config);
  console.log('KindeAuth - Current URL:', window.location.href);

  return (
    <KindeProvider {...config}>
      <Router>
        <Routes>
          <Route 
            path="/api/auth/kinde/callback" 
            element={<CallbackPage />} 
          />
          <Route path="*" element={children} />
        </Routes>
      </Router>
    </KindeProvider>
  );
}
