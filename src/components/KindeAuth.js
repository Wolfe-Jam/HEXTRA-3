import { useKindeAuth } from '@kinde-oss/kinde-auth-react';

export default function KindeAuth({ children }) {
  const { isAuthenticated, isLoading } = useKindeAuth();

  console.log('KindeAuth state:', { isAuthenticated, isLoading });

  // Show nothing while loading
  if (isLoading) {
    console.log('KindeAuth: Loading...');
    return null;
  }

  // Only render children when authenticated
  console.log('KindeAuth: Auth check complete, isAuthenticated:', isAuthenticated);
  return isAuthenticated ? children : null;
}
