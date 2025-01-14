import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import themeManager from './theme';

const root = ReactDOM.createRoot(document.getElementById('root'));
themeManager.init();

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
