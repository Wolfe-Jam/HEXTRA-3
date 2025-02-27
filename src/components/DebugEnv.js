import React, { useEffect } from 'react';

export default function DebugEnv() {
  useEffect(() => {
    console.log("Environment variables (client-side):");
    Object.keys(process.env).forEach(key => {
      if (key.includes('KINDE')) {
        console.log(`${key}: ${process.env[key] || 'Not set'}`);
      }
    });
    
    // Log specific variables we're looking for
    console.log("Specific Kinde variables:");
    console.log("KINDE_CLIENT_ID:", process.env.KINDE_CLIENT_ID || 'Not set');
    console.log("KINDE_ISSUER_URL:", process.env.KINDE_ISSUER_URL || 'Not set');
    console.log("KINDE_POST_LOGIN_REDIRECT_URL:", process.env.KINDE_POST_LOGIN_REDIRECT_URL || 'Not set');
    console.log("KINDE_POST_LOGOUT_REDIRECT_URL:", process.env.KINDE_POST_LOGOUT_REDIRECT_URL || 'Not set');
    
    // Also check for REACT_APP prefixed versions
    console.log("REACT_APP_KINDE_CLIENT_ID:", process.env.REACT_APP_KINDE_CLIENT_ID || 'Not set');
    console.log("REACT_APP_KINDE_DOMAIN:", process.env.REACT_APP_KINDE_DOMAIN || 'Not set');
    console.log("REACT_APP_KINDE_REDIRECT_URI:", process.env.REACT_APP_KINDE_REDIRECT_URI || 'Not set');
    console.log("REACT_APP_KINDE_LOGOUT_URI:", process.env.REACT_APP_KINDE_LOGOUT_URI || 'Not set');
  }, []);

  return null; // This component doesn't render anything
}
