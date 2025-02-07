// KindeAuth Provider - Stable Version 2.1.6 - Updated 2025-02-06
import React from 'react';
import { KindeProvider } from '@kinde-oss/kinde-auth-react';
import { useNavigate } from 'react-router-dom';

export default function KindeAuth({ children }) {
  const navigate = useNavigate();
  
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
    scope: 'openid profile email offline',
    isDangerouslyUseLocalStorage: true // Enable local storage for state
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
    const code = urlParams.get('code');
    const state = urlParams.get('state');
    
    console.log('URL params:', { error, errorDescription, code, state });
    console.log('Local storage state:', localStorage.getItem('kinde_auth_state'));
    
    if (error) {
      console.error('Auth Error:', error, errorDescription);
    }
    if (code) {
      console.log('Auth code present, should redirect soon');
    }
  }, []);

  return (
    <KindeProvider
      {...config}
      onRedirectCallback={(appState, user) => {
        console.log('Redirect callback triggered:', { appState, user });
        // Always redirect to batch after auth
        console.log('Redirecting to /batch');
        navigate('/batch', { replace: true });
      }}
      onError={(error) => {
        console.error('Kinde Auth Error:', error);
        // On error, redirect back to root
        console.log('Error occurred, redirecting to /');
        navigate('/', { replace: true });
      }}
    >
      {children}
    </KindeProvider>
  );
}
