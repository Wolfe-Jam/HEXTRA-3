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
    redirectUri: 'https://www.hextra.io/api/auth/kinde/callback',
    logoutUri: 'https://www.hextra.io',
    audience: 'https://www.hextra.io',
    scope: 'openid profile email offline'
  };

  // Debug: Log final config
  console.log('Kinde config:', config);

  // Add auth flow debugging
  React.useEffect(() => {
    console.log('Current URL:', window.location.href);
    console.log('Authentication flow started');
  }, []);

  return (
    <KindeProvider
      {...config}
      onRedirectCallback={(appState) => {
        console.log('Redirect callback:', appState);
        if (appState?.returnTo) {
          window.location.href = appState.returnTo;
        }
      }}
    >
      {children}
    </KindeProvider>
  );
}
