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
      onRedirectCallback={(user, appState) => {
        console.log('Kinde redirect callback', { user, appState });
        // First let Kinde finish processing
        setTimeout(() => {
          // Then redirect to the app
          window.location.replace('/');
        }, 100);
      }}
    >
      <Router />
    </KindeProvider>
  </React.StrictMode>
);
