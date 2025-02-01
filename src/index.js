import './polyfills';
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import themeManager from './theme';
import KindeAuth from './components/KindeAuth';

const root = ReactDOM.createRoot(document.getElementById('root'));
themeManager.init();

root.render(
  <React.StrictMode>
    <BrowserRouter>
      <KindeAuth>
        <App />
      </KindeAuth>
    </BrowserRouter>
  </React.StrictMode>
);
