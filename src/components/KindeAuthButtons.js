import React from 'react';
import { useKindeAuth } from '@kinde-oss/kinde-auth-react';
import GlowButton from './GlowButton';

export default function KindeAuthButtons() {
  const { isLoading, isAuthenticated, user, login, logout } = useKindeAuth();

  if (isLoading) {
    return null;
  }

  if (isAuthenticated) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <span>Welcome, {user?.given_name || user?.email}</span>
        <GlowButton onClick={logout} variant="outlined">
          Sign Out
        </GlowButton>
      </div>
    );
  }

  return (
    <GlowButton onClick={login} variant="contained">
      Sign In
    </GlowButton>
  );
}
