import React from 'react';
import { KindeProvider } from '@kinde-oss/kinde-auth-react';

export default function KindeAuth({ children }) {
  // Log all environment variables
  console.log('Environment:', {
    nodeEnv: process.env.NODE_ENV,
    clientId: process.env.REACT_APP_KINDE_CLIENT_ID,
    domain: process.env.NEXT_PUBLIC_KINDE_DOMAIN,
    redirectUri: process.env.NEXT_PUBLIC_KINDE_REDIRECT_URI,
    logoutUri: process.env.NEXT_PUBLIC_KINDE_LOGOUT_URI,
    baseUrl: process.env.NEXT_PUBLIC_BASE_URL
  });

  const config = {
    clientId: process.env.REACT_APP_KINDE_CLIENT_ID || '0bd4c1c6f92d46f7b72290073d1806c7',
    domain: process.env.NEXT_PUBLIC_KINDE_DOMAIN || 'https://hextra.kinde.com',
    redirectUri: process.env.NEXT_PUBLIC_KINDE_REDIRECT_URI,
    logoutUri: process.env.NEXT_PUBLIC_KINDE_LOGOUT_URI
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
