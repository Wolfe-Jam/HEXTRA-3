import React from 'react';
import { useKindeAuth } from '@kinde-oss/kinde-auth-react';

export default function KindeAuth({ children }) {
  const { isAuthenticated } = useKindeAuth();
  return isAuthenticated ? children : null;
}
