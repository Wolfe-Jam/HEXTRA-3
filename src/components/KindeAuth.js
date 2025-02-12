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
 * 4. Processes tokens and redirects to /batch
 * 
 * @version 2.2.2
 * @lastUpdated 2025-02-10
 */

import React from 'react';
import { KindeProvider } from '@kinde-oss/kinde-auth-react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import CallbackPage from './CallbackPage';

export default function KindeAuth({ children }) {
  // Debug logging
  console.log('🔧 KindeAuth Config:', {
    redirectUri: process.env.REACT_APP_KINDE_REDIRECT_URI,
    postLoginRedirect: process.env.REACT_APP_PUBLIC_URL,
    publicUrl: process.env.REACT_APP_PUBLIC_URL
  });

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
      window.location.href = `${process.env.REACT_APP_PUBLIC_URL}/batch`;
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
