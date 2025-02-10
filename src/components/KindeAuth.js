import React from 'react';
import { KindeProvider } from '@kinde-oss/kinde-auth-react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import CallbackPage from './CallbackPage';

export default function KindeAuth({ children }) {
  // Basic config with redirect
  const config = {
    clientId: process.env.REACT_APP_KINDE_CLIENT_ID,
    domain: process.env.REACT_APP_KINDE_DOMAIN,
    redirectUri: process.env.REACT_APP_KINDE_REDIRECT_URI,
    logoutUri: process.env.REACT_APP_KINDE_LOGOUT_URI,
    // Essential auth config
    responseType: 'code',
    scope: 'openid profile email',
    // Simple redirect handler
    onRedirectCallback: () => {
      console.log('Auth complete, redirecting to /batch');
      window.location.href = '/batch';
    }
  };

  // Debug: Log config
  console.log('KindeAuth - Config:', config);

  return (
    <KindeProvider {...config}>
      <Router>
        <Routes>
          <Route path="/api/auth/kinde/callback" element={<CallbackPage />} />
          <Route path="*" element={children} />
        </Routes>
      </Router>
    </KindeProvider>
  );
}
