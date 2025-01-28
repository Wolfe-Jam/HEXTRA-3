import React from 'react';
import { KindeProvider } from '@kinde-oss/kinde-auth-react';

export default function KindeAuth({ children }) {
  // Log all environment variables
  console.log('Environment:', {
    nodeEnv: process.env.NODE_ENV,
    clientId: process.env.KINDE_CLIENT_ID,
    issuerUrl: process.env.KINDE_ISSUER_URL,
    siteUrl: process.env.KINDE_SITE_URL,
    postLoginRedirectUrl: process.env.KINDE_POST_LOGIN_REDIRECT_URL,
    postLogoutRedirectUrl: process.env.KINDE_POST_LOGOUT_REDIRECT_URL
  });

  const config = {
    clientId: process.env.KINDE_CLIENT_ID,
    domain: process.env.KINDE_ISSUER_URL,
    redirectUri: process.env.KINDE_POST_LOGIN_REDIRECT_URL,
    logoutUri: process.env.KINDE_POST_LOGOUT_REDIRECT_URL
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
