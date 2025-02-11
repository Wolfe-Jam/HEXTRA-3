import './polyfills';
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { KindeProvider } from '@kinde-oss/kinde-auth-react';
import App from './App';
import themeManager from './theme';
import KindeAuth from './components/KindeAuth';

const root = ReactDOM.createRoot(document.getElementById('root'));
themeManager.init();

root.render(
  <React.StrictMode>
    <BrowserRouter>
      <KindeProvider
        clientId={process.env.REACT_APP_KINDE_CLIENT_ID}
        domain={process.env.REACT_APP_KINDE_DOMAIN}
        redirectUri={process.env.REACT_APP_KINDE_REDIRECT_URI}
        logoutUri={process.env.REACT_APP_KINDE_LOGOUT_URI}
      >
        <KindeAuth>
          <App />
        </KindeAuth>
      </KindeProvider>
    </BrowserRouter>
  </React.StrictMode>
);
