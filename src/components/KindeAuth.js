import React from 'react';
import { KindeProvider } from '@kinde-oss/kinde-auth-react';
import { useNavigate } from 'react-router-dom';

export default function KindeAuth({ children }) {
  const navigate = useNavigate();

  const config = {
    clientId: process.env.REACT_APP_KINDE_CLIENT_ID,
    domain: process.env.REACT_APP_KINDE_DOMAIN,
    redirectUri: process.env.REACT_APP_KINDE_REDIRECT_URI,
    logoutUri: process.env.REACT_APP_KINDE_LOGOUT_URI,
    onRedirectCallback: (appState) => {
      // Clear the URL parameters
      window.history.replaceState(
        {},
        document.title,
        window.location.pathname
      );
      
      // Navigate to the batch page or home
      navigate(appState?.returnTo || '/batch');
    }
  };

  return (
    <KindeProvider
      clientId={config.clientId}
      domain={config.domain}
      redirectUri={config.redirectUri}
      logoutUri={config.logoutUri}
      loginButtonPosition="none"
      onRedirectCallback={config.onRedirectCallback}
    >
      {children}
    </KindeProvider>
  );
}
