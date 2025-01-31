import React from 'react';
import { useKindeAuth } from '@kinde-oss/kinde-auth-react';
import GlowButton from './GlowButton';

export default function KindeAuthButtons() {
  const { isAuthenticated, user, login, logout } = useKindeAuth();

  if (isAuthenticated) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <span style={{ color: 'var(--text-primary)' }}>
          Welcome, {user?.given_name || user?.email}
        </span>
        <GlowButton 
          onClick={logout} 
          variant="outlined"
          sx={{ minWidth: '100px' }}
        >
          Sign Out
        </GlowButton>
      </div>
    );
  }

  return (
    <GlowButton 
      onClick={login} 
      variant="contained"
      sx={{ minWidth: '100px' }}
    >
      Sign In
    </GlowButton>
  );
}
