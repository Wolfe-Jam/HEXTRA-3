import React from 'react';
import { useKindeAuth } from '@kinde-oss/kinde-auth-react';

export default function KindeAuth({ children }) {
  const { isAuthenticated, isLoading } = useKindeAuth();

  if (isLoading) {
    return (
      <div style={{ 
        height: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        background: '#1a1a1a',
        color: '#FFFFFF'
      }}>
        Loading...
      </div>
    );
  }

  return isAuthenticated ? children : null;
}
