// KindeAuth Provider - Updated 2025-02-05
import React from 'react';
import { KindeProvider } from '@kinde-oss/kinde-auth-react';

export default function KindeAuth({ children }) {
  // Debug: Log all process.env
  console.log('All process.env:', process.env);
  
  // Log specific environment variables
  console.log('Environment:', {
    nodeEnv: process.env.REACT_APP_NODE_ENV,
    baseUrl: process.env.REACT_APP_BASE_URL,
    clientId: process.env.REACT_APP_KINDE_CLIENT_ID,
    domain: process.env.REACT_APP_KINDE_DOMAIN,
    redirectUri: process.env.REACT_APP_KINDE_REDIRECT_URI,
    logoutUri: process.env.REACT_APP_KINDE_LOGOUT_URI
  });

  const config = {
    clientId: process.env.REACT_APP_KINDE_CLIENT_ID,
    domain: process.env.REACT_APP_KINDE_DOMAIN,
    redirectUri: process.env.REACT_APP_KINDE_REDIRECT_URI,
    logoutUri: process.env.REACT_APP_KINDE_LOGOUT_URI,
    scope: 'openid profile email offline'
  };

  // Debug: Log final config
  console.log('Kinde config:', config);

  // Add auth flow debugging
  React.useEffect(() => {
    const currentUrl = window.location.href;
    console.log('Current URL:', currentUrl);
    console.log('Authentication flow started');
    
    // Check for error parameters in URL
    const urlParams = new URLSearchParams(window.location.search);
    const error = urlParams.get('error');
    const errorDescription = urlParams.get('error_description');
    
    if (error) {
      console.error('Auth Error:', error, errorDescription);
    }
  }, []);

  return (
    <KindeProvider
      {...config}
      onRedirectCallback={(appState, user) => {
        console.log('Redirect callback:', { appState, user });
        // Check if we have a valid return URL
        if (appState?.returnTo) {
          console.log('Redirecting to:', appState.returnTo);
          window.location.href = appState.returnTo;
        } else {
          console.log('No return URL found in appState');
          // Fallback to batch section
          window.location.href = 'https://www.hextra.io/#batch-section';
        }
      }}
      onError={(error) => {
        console.error('Kinde Auth Error:', error);
      }}
    >
      {children}
    </KindeProvider>
  );
}
