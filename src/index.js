import './polyfills';
import React from 'react';
import ReactDOM from 'react-dom/client';
import themeManager from './theme';
import KindeAuth from './components/KindeAuth';

console.log('App: Starting initialization...');
const root = ReactDOM.createRoot(document.getElementById('root'));
themeManager.init();

root.render(
  <React.StrictMode>
    <KindeAuth />
  </React.StrictMode>
);
