import React from 'react';
import { KindeProvider } from '@kinde-oss/kinde-auth-react';

export default function KindeAuth({ children }) {
  // Log all environment variables
  console.log('Environment:', {
    nodeEnv: process.env.NODE_ENV,
    clientId: process.env.REACT_APP_KINDE_CLIENT_ID,
    domain: process.env.REACT_APP_KINDE_DOMAIN,
    redirectUri: process.env.REACT_APP_KINDE_REDIRECT_URI,
    logoutUri: process.env.REACT_APP_KINDE_LOGOUT_URI,
    baseUrl: process.env.REACT_APP_BASE_URL
  });

  // Use environment variables if available, fallback to hardcoded values
  const config = {
    clientId: process.env.REACT_APP_KINDE_CLIENT_ID || '0bd4c1c6f92d46f7b72290073d1806c7',
    domain: process.env.REACT_APP_KINDE_DOMAIN || 'https://hextra.kinde.com',
    redirectUri: process.env.REACT_APP_KINDE_REDIRECT_URI || 'http://localhost:3000',
    logoutUri: process.env.REACT_APP_KINDE_LOGOUT_URI || 'http://localhost:3000'
  };

  return (
    <KindeProvider
      clientId={config.clientId}
      domain={config.domain}
      redirectUri={config.redirectUri}
      logoutUri={config.logoutUri}
    >
      {children}
    </KindeProvider>
  );
}
