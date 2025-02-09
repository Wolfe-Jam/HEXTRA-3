import './polyfills';
import React from 'react';
import ReactDOM from 'react-dom/client';
import Router from './Router';
import themeManager from './theme';
import { KindeProvider } from '@kinde-oss/kinde-auth-react';

const root = ReactDOM.createRoot(document.getElementById('root'));
themeManager.init();

root.render(
  <React.StrictMode>
    <KindeProvider
      clientId={process.env.REACT_APP_KINDE_CLIENT_ID}
      domain={process.env.REACT_APP_KINDE_DOMAIN}
      redirectUri={process.env.REACT_APP_KINDE_REDIRECT_URI}
      logoutUri={process.env.REACT_APP_KINDE_POST_LOGOUT_REDIRECT_URI}
      onRedirectCallback={(appState) => {
        console.log('Redirect callback with state:', appState);
        // Use the saved hash or default to batch section
        window.location.hash = appState?.returnTo || '#batch-section';
      }}
    >
      <Router />
    </KindeProvider>
  </React.StrictMode>
);
