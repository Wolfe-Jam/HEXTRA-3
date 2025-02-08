import React from 'react';
import { KindeProvider } from '@kinde-oss/kinde-auth-react';

export default function KindeAuth({ children }) {
  // Debug: Log with clear markers
  console.log('🔑 HEXTRA AUTH DEBUG 🔑');
  console.log('----------------------------------------');
  console.log('CLIENT_ID:', process.env.REACT_APP_KINDE_CLIENT_ID);
  console.log('DOMAIN:', process.env.REACT_APP_KINDE_DOMAIN);
  console.log('REDIRECT:', process.env.REACT_APP_KINDE_REDIRECT_URI);
  console.log('LOGOUT:', process.env.REACT_APP_KINDE_POST_LOGOUT_REDIRECT_URI);
  console.log('----------------------------------------');

  const config = {
    clientId: process.env.REACT_APP_KINDE_CLIENT_ID,
    domain: process.env.REACT_APP_KINDE_DOMAIN,
    redirectUri: process.env.REACT_APP_KINDE_REDIRECT_URI,
    logoutUri: process.env.REACT_APP_KINDE_POST_LOGOUT_REDIRECT_URI
  };

  // Debug: Log final config
  console.log('🔧 FINAL KINDE CONFIG:', config);
  console.log('----------------------------------------');

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
