/**
 * KindeAuth Component (v2.2.4)
 * 
 * Provides authentication wrapper for the application using Kinde Auth.
 * Handles the OAuth2 PKCE flow and redirects.
 * 
 * This version includes support for both:
 * - KINDE_* variables (standard pattern)
 * - REACT_APP_KINDE_* variables (CRA pattern)
 * 
 * Environment variables:
 * KINDE_CLIENT_ID or REACT_APP_KINDE_CLIENT_ID
 * KINDE_ISSUER_URL or REACT_APP_KINDE_DOMAIN
 * KINDE_POST_LOGIN_REDIRECT_URL or REACT_APP_KINDE_REDIRECT_URI
 * KINDE_POST_LOGOUT_REDIRECT_URL or REACT_APP_KINDE_LOGOUT_URI
 */

import React from 'react';
import { KindeProvider } from '@kinde-oss/kinde-auth-react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// App Component Import
import App from '../App';

// Auth-related Components
import CallbackPage from './CallbackPage';

// Lazy load the SubscriptionPage to improve performance
const SubscriptionPage = React.lazy(() => import('./SubscriptionPage'));
// Import test component
const TestSubscription = React.lazy(() => import('../testSubscription'));
// Import ProfilePage component
const ProfilePage = React.lazy(() => import('./ProfilePage'));
// Import TestLoginPage component
const TestLoginPage = React.lazy(() => import('./TestLoginPage'));

export default function KindeAuth({ children }) {
  // Get the environment variables with fallbacks
  const isDevelopment = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
  
  // For local development, use dummy values to prevent errors
  const clientId = isDevelopment ? 'local_dev_client_id' : (process.env.KINDE_CLIENT_ID || process.env.REACT_APP_KINDE_CLIENT_ID);
  const domain = isDevelopment ? 'https://example.kinde.com' : (process.env.KINDE_ISSUER_URL || process.env.REACT_APP_KINDE_DOMAIN);
  const redirectUri = isDevelopment ? 'http://localhost:3001/callback' : (process.env.KINDE_POST_LOGIN_REDIRECT_URL || process.env.REACT_APP_KINDE_REDIRECT_URI);
  const logoutUri = isDevelopment ? 'http://localhost:3001' : (process.env.KINDE_POST_LOGOUT_REDIRECT_URL || process.env.REACT_APP_KINDE_LOGOUT_URI);

  // Debug output to help troubleshoot
  console.log("Kinde Auth Configuration (Dev Mode Enabled):");
  console.log("- Client ID:", clientId ? "Set" : "Not set");
  console.log("- Domain:", domain ? "Set" : "Not set");
  console.log("- Redirect URI:", redirectUri ? "Set" : "Not set");
  console.log("- Logout URI:", logoutUri ? "Set" : "Not set");

  const config = {
    // Required Kinde configuration
    clientId,
    domain,
    redirectUri,
    logoutUri,

    // Auth configuration
    responseType: 'code',  // Use authorization code flow
    scope: 'openid profile email',  // Required scopes
    
    // Development mode handling
    isDevelopmentMode: isDevelopment,

    // Redirect handler - keeps it simple and reliable
    onRedirectCallback: (appState) => {
      console.log("onRedirectCallback called with:", appState);
      // Default redirect to batch page
      window.location.href = '/batch';
    }
  };

  return (
    <KindeProvider {...config}>
      {isDevelopment && (
        <div style={{
          position: 'fixed',
          bottom: '10px',
          right: '10px',
          backgroundColor: 'rgba(255, 165, 0, 0.8)',
          color: 'black',
          padding: '5px 10px',
          borderRadius: '5px',
          fontSize: '12px',
          zIndex: 9999
        }}>
          Dev Mode: Auth Bypassed
        </div>
      )}
      <Router>
        <Routes>
          {/* Main App */}
          <Route path="/" element={<App />} />
          <Route path="/batch" element={<App />} />
          
          {/* Auth Routes */}
          <Route path="/callback" element={<CallbackPage />} />
          <Route path="/api/auth/kinde/callback" element={<CallbackPage />} />
          
          {/* Profile Pages */}
          <Route 
            path="/profile" 
            element={
              <React.Suspense fallback={<div>Loading...</div>}>
                <ProfilePage />
              </React.Suspense>
            } 
          />
          
          {/* Subscription Pages */}
          <Route 
            path="/subscription" 
            element={
              <React.Suspense fallback={<div>Loading...</div>}>
                <SubscriptionPage />
              </React.Suspense>
            } 
          />
          
          {/* Test Pages */}
          <Route 
            path="/test-subscription" 
            element={
              <React.Suspense fallback={<div>Loading...</div>}>
                <TestSubscription />
              </React.Suspense>
            } 
          />
          <Route 
            path="/test-login" 
            element={
              <React.Suspense fallback={<div>Loading...</div>}>
                <TestLoginPage />
              </React.Suspense>
            } 
          />
        </Routes>
      </Router>
    </KindeProvider>
  );
}
