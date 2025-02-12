/**
 * KindeAuth Component (v2.2.2)
 * 
 * Provides authentication wrapper for the application using Kinde Auth.
 * Does not block access - allows free features without login.
 * 
 * @version 2.2.2
 * @lastUpdated 2025-02-10
 */

import React from 'react';
import { KindeProvider } from '@kinde-oss/kinde-auth-react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import CallbackPage from './CallbackPage';

export default function KindeAuth({ children }) {
  const config = {
    clientId: process.env.REACT_APP_KINDE_CLIENT_ID,
    domain: process.env.REACT_APP_KINDE_DOMAIN,
    redirectUri: process.env.REACT_APP_KINDE_REDIRECT_URI,
    logoutUri: process.env.REACT_APP_KINDE_LOGOUT_URI,
    responseType: 'code',
    scope: 'openid profile email',
    onRedirectCallback: () => {
      window.location.href = process.env.REACT_APP_PUBLIC_URL || window.location.origin;
    }
  };

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
