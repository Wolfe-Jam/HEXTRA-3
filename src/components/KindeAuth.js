import React from 'react';
import { useKindeAuth } from '@kinde-oss/kinde-auth-react';

export default function KindeAuth({ children }) {
  const { isAuthenticated, isLoading } = useKindeAuth();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return isAuthenticated ? children : null;
}
