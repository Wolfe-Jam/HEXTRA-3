import './polyfills';
import React from 'react';
import ReactDOM from 'react-dom/client';
import KindeAuth from './components/KindeAuth';
import { ThemeProvider } from './context/ThemeContext';

console.log('App: Starting initialization...');
const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <React.StrictMode>
    <ThemeProvider>
      <KindeAuth />
    </ThemeProvider>
  </React.StrictMode>
);
