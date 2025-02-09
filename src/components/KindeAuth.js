import { useKindeAuth } from '@kinde-oss/kinde-auth-react';

export default function KindeAuth({ children }) {
  const { isAuthenticated, isLoading } = useKindeAuth();

  // Show nothing while loading
  if (isLoading) {
    return null;
  }

  // Only render children when authenticated
  return isAuthenticated ? children : null;
}
