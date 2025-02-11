import './polyfills';
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { KindeProvider } from '@kinde-oss/kinde-auth-react';
import App from './App';
import themeManager from './theme';
import KindeAuth from './components/KindeAuth';
import CallbackPage from './components/CallbackPage';

const root = ReactDOM.createRoot(document.getElementById('root'));
themeManager.init();

// Debug logging for environment variables
console.log('🔧 Environment:', {
  redirectUri: process.env.REACT_APP_KINDE_REDIRECT_URI,
  postLoginRedirect: process.env.REACT_APP_KINDE_POST_LOGIN_REDIRECT_URL,
  publicUrl: process.env.REACT_APP_PUBLIC_URL
});

root.render(
  <React.StrictMode>
    <BrowserRouter>
      <KindeProvider
        clientId={process.env.REACT_APP_KINDE_CLIENT_ID}
        domain={process.env.REACT_APP_KINDE_DOMAIN}
        redirectUri={process.env.REACT_APP_KINDE_REDIRECT_URI}
        logoutUri={process.env.REACT_APP_KINDE_LOGOUT_URI}
        postLoginRedirectURL={process.env.REACT_APP_KINDE_POST_LOGIN_REDIRECT_URL}
      >
        <Routes>
          <Route path="/callback" element={<CallbackPage />} />
          <Route path="*" element={
            <KindeAuth>
              <App />
            </KindeAuth>
          } />
        </Routes>
      </KindeProvider>
    </BrowserRouter>
  </React.StrictMode>
);
