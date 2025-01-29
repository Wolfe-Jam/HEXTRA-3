import React from 'react';
import { KindeProvider } from '@kinde-oss/kinde-auth-react';

export default function KindeAuth({ children }) {
  // Log all environment variables
  console.log('Environment:', {
    nodeEnv: process.env.NODE_ENV,
    clientId: process.env.REACT_APP_KINDE_CLIENT_ID,
    domain: process.env.REACT_APP_KINDE_DOMAIN,
    redirectUri: process.env.REACT_APP_KINDE_POST_LOGIN_REDIRECT_URL,
    logoutUri: process.env.REACT_APP_KINDE_POST_LOGOUT_REDIRECT_URL
  });

  const config = {
    clientId: process.env.REACT_APP_KINDE_CLIENT_ID,
    domain: process.env.REACT_APP_KINDE_DOMAIN,
    redirectUri: process.env.REACT_APP_KINDE_POST_LOGIN_REDIRECT_URL,
    logoutUri: process.env.REACT_APP_KINDE_POST_LOGOUT_REDIRECT_URL
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
