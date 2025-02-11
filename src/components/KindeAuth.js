import React from 'react';
import { useKindeAuth } from '@kinde-oss/kinde-auth-react';
import KindeAuthButtons from './KindeAuthButtons';

export default function KindeAuth({ children }) {
  const { isAuthenticated, isLoading } = useKindeAuth();

  // Debug logging
  console.log(' Auth State:', { isAuthenticated, isLoading });

  if (isLoading) {
    return (
      <div style={{ 
        height: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        backgroundColor: 'var(--background-default)',
        color: 'var(--text-primary)'
      }}>
        Loading...
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div style={{ 
        height: '100vh', 
        display: 'flex', 
        flexDirection: 'column',
        alignItems: 'center', 
        justifyContent: 'center',
        backgroundColor: 'var(--background-default)',
        color: 'var(--text-primary)',
        gap: '1rem'
      }}>
        <h1>Welcome to HEXTRA</h1>
        <p>Please sign in to continue</p>
        <KindeAuthButtons />
      </div>
    );
  }

  return children;
}
