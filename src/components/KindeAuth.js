import React from 'react';
import { KindeProvider } from '@kinde-oss/kinde-auth-react';

// Debug: Log all environment variables
console.log('All env vars:', {
  NODE_ENV: process.env.NODE_ENV,
  // Current vars we're trying
  REACT_APP_KINDE_CLIENT_ID: process.env.REACT_APP_KINDE_CLIENT_ID,
  REACT_APP_KINDE_DOMAIN: process.env.REACT_APP_KINDE_DOMAIN,
  REACT_APP_KINDE_POST_LOGIN_REDIRECT_URL: process.env.REACT_APP_KINDE_POST_LOGIN_REDIRECT_URL,
  REACT_APP_KINDE_POST_LOGOUT_REDIRECT_URL: process.env.REACT_APP_KINDE_POST_LOGOUT_REDIRECT_URL,
  // Old vars for comparison
  KINDE_CLIENT_ID: process.env.KINDE_CLIENT_ID,
  KINDE_ISSUER_URL: process.env.KINDE_ISSUER_URL,
  KINDE_POST_LOGIN_REDIRECT_URL: process.env.KINDE_POST_LOGIN_REDIRECT_URL,
  KINDE_POST_LOGOUT_REDIRECT_URL: process.env.KINDE_POST_LOGOUT_REDIRECT_URL
});

export default function KindeAuth({ children }) {
  // Log all environment variables
  console.log('Environment:', {
    nodeEnv: process.env.NODE_ENV,
    // Old variables
    // clientId: process.env.KINDE_CLIENT_ID,
    // domain: process.env.KINDE_ISSUER_URL,
    // redirectUri: process.env.KINDE_POST_LOGIN_REDIRECT_URL,
    // logoutUri: process.env.KINDE_POST_LOGOUT_REDIRECT_URL
    // New variables matching vercel.json
    clientId: process.env.REACT_APP_KINDE_CLIENT_ID,
    domain: process.env.REACT_APP_KINDE_DOMAIN,
    redirectUri: process.env.REACT_APP_KINDE_POST_LOGIN_REDIRECT_URL,
    logoutUri: process.env.REACT_APP_KINDE_POST_LOGOUT_REDIRECT_URL
  });

  const config = {
    // Old config
    // clientId: process.env.KINDE_CLIENT_ID,
    // domain: process.env.KINDE_ISSUER_URL,
    // redirectUri: process.env.KINDE_POST_LOGIN_REDIRECT_URL,
    // logoutUri: process.env.KINDE_POST_LOGOUT_REDIRECT_URL
    // New config matching vercel.json
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
