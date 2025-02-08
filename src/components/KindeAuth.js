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

  // Temporarily hardcode production values for testing
  const config = {
    clientId: "29b231bd96ab409c89f5c5575c3892c3", // Production ID hardcoded
    domain: "https://hextra.kinde.com",
    redirectUri: "https://hextra.io/api/auth/kinde/callback",
    logoutUri: "https://hextra.io"
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
