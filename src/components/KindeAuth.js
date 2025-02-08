import React from 'react';
import { useKindeAuth } from '@kinde-oss/kinde-auth-react';

export default function KindeAuth({ children }) {
  const { isAuthenticated, isLoading } = useKindeAuth();

  // Debug: Log auth state
  console.log('🔑 HEXTRA AUTH STATE 🔑');
  console.log('----------------------------------------');
  console.log('isAuthenticated:', isAuthenticated);
  console.log('isLoading:', isLoading);
  console.log('----------------------------------------');

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return isAuthenticated ? children : null;
}
