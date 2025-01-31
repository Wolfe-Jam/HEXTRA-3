import './polyfills';
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import themeManager from './theme';
import KindeAuth from './components/KindeAuth';

const root = ReactDOM.createRoot(document.getElementById('root'));
themeManager.init();

// Conditionally wrap with KindeAuth based on environment
const isDev = process.env.NODE_ENV === 'development';

root.render(
  <React.StrictMode>
    {isDev ? (
      <App />
    ) : (
      <KindeAuth>
        <App />
      </KindeAuth>
    )}
  </React.StrictMode>
);
