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
    logoutUri: process.env.REACT_APP_KINDE_LOGOUT_URI
  };

  // Debug: Log final config
  console.log('Kinde config:', config);

  return (
    <KindeProvider
      clientId={config.clientId}
      domain={config.domain}
      redirectUri={config.redirectUri}
      logoutUri={config.logoutUri}
      loginButtonPosition="none"
    >
      {children}
    </KindeProvider>
  );
}
