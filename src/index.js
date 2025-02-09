import './polyfills';
import React from 'react';
import ReactDOM from 'react-dom/client';
import Router from './Router';
import themeManager from './theme';
import { KindeProvider } from '@kinde-oss/kinde-auth-react';

console.log('App: Starting initialization...');
const root = ReactDOM.createRoot(document.getElementById('root'));
themeManager.init();

root.render(
  <React.StrictMode>
    <KindeProvider
      clientId={process.env.REACT_APP_KINDE_CLIENT_ID}
      domain={process.env.REACT_APP_KINDE_DOMAIN}
      redirectUri="https://hextra.io/api/auth/kinde/callback"
      logoutUri="https://hextra.io"
    >
      <Router />
    </KindeProvider>
  </React.StrictMode>
);
