import './polyfills';
import React from 'react';
import ReactDOM from 'react-dom/client';
import { KindeProvider } from '@kinde-oss/kinde-auth-react';
import Router from './Router';
import themeManager from './theme';

console.log('App: Starting initialization...');
const root = ReactDOM.createRoot(document.getElementById('root'));
themeManager.init();

root.render(
  <React.StrictMode>
    <KindeProvider
      clientId={process.env.REACT_APP_KINDE_CLIENT_ID}
      domain={process.env.REACT_APP_KINDE_ISSUER_URL}
      redirectUri={process.env.REACT_APP_KINDE_REDIRECT_URI}
      logoutUri={process.env.REACT_APP_KINDE_POST_LOGOUT_REDIRECT_URI}
    >
      <Router />
    </KindeProvider>
  </React.StrictMode>
);
