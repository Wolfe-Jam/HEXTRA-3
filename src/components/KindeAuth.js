import React from 'react';
import { KindeProvider } from '@kinde-oss/kinde-auth-react';

export default function KindeAuth({ children }) {
  // Debug: Log all process.env
  console.log('All process.env:', process.env);
  
  // Log specific environment variables
  console.log('Environment:', {
    nodeEnv: process.env.NODE_ENV,
    clientId: process.env.KINDE_CLIENT_ID,
    issuerUrl: process.env.KINDE_ISSUER_URL,
    redirectUri: process.env.KINDE_REDIRECT_URI,
    logoutUri: process.env.KINDE_POST_LOGOUT_REDIRECT_URI
  });

  const config = {
    clientId: process.env.KINDE_CLIENT_ID,
    domain: process.env.KINDE_ISSUER_URL,
    redirectUri: process.env.KINDE_REDIRECT_URI,
    logoutUri: process.env.KINDE_POST_LOGOUT_REDIRECT_URI
  };

  // Debug: Log final config
  console.log('Kinde config:', config);

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
