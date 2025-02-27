# HEXTRA Kinde Authentication Integration

## Overview

This document serves as a comprehensive guide to the Kinde authentication implementation in HEXTRA. The authentication system has been implemented following the core design principles of the application, ensuring that it integrates seamlessly while preserving all existing functionality.

## Integration Strategy

The Kinde authentication has been integrated with the following approach:

1. **Core Features Protection**:
   - Single-image processing remains accessible to all users
   - Batch processing requires authentication
   - Color management and UI components remain unchanged

2. **Authentication Components**:
   - KindeAuth provider wraps the entire app
   - KindeAuthButtons component in header
   - Protected routes implemented without modifying core functionality

3. **User Experience**:
   - Sign in/out buttons in header
   - Clear indication of protected features
   - Smooth transition between authenticated/unauthenticated states

4. **Implementation Details**:
   - Uses @kinde-oss/kinde-auth-react
   - Maintains existing UI patterns
   - Preserves all core feature functionality
   - Clean separation between auth and core features

## Configuration

### Environment Variables

The following environment variables are required for Kinde authentication:

```
REACT_APP_KINDE_CLIENT_ID=your_client_id
REACT_APP_KINDE_DOMAIN=https://your-domain.kinde.com
REACT_APP_KINDE_REDIRECT_URI=https://your-app-url.com/api/auth/kinde/callback
REACT_APP_KINDE_LOGOUT_URI=https://your-app-url.com
```

### Kinde Setup

1. Make sure your Kinde application is configured correctly
2. Verify that the redirect URI is set to: `https://your-app-url.com/api/auth/kinde/callback`
3. Ensure the logout URI is set to your base URL

## Implementation Details

### KindeAuth Component

The `KindeAuth` component serves as the main wrapper for the authentication system. It provides the authentication context to the entire application.

Key features:
- Handles the OAuth2 PKCE flow
- Manages user sessions
- Handles login and logout processes
- Provides authentication state via React context

### Protected Routes

Protected routes are implemented using the `ProtectedRoute` component, which checks if the user is authenticated before rendering the protected content.

```jsx
const ProtectedRoute = ({ children }) => {
  const { isLoading, isAuthenticated } = useKindeAuth();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return isAuthenticated ? children : <PricingPage />;
};
```

### Authentication Hooks

The `useKindeAuth` hook provides access to the authentication state throughout the application:

```jsx
const { isAuthenticated, user, login, logout } = useKindeAuth();
```

## Authentication Flow

1. User clicks the "Sign In" button in the Banner component
2. Kinde Auth handles the authentication process
3. User is redirected to the specified callback URL
4. KindeAuth processes the authentication response
5. User is redirected to the batch processing page
6. Authentication state is available throughout the application

## Troubleshooting

### Common Issues

1. **Redirect URI Mismatch**: Ensure that the redirect URI in your Kinde dashboard matches exactly with the one in your environment variables.

2. **Authentication State Not Available**: Check if the KindeAuth provider is properly wrapping your application and if you're using the useKindeAuth hook correctly.

3. **Login Button Not Working**: Verify that the login function from useKindeAuth is being called correctly and that your Kinde credentials are valid.

## Testing

For testing authentication:

1. Use the development environment to test the authentication flow
2. Verify that protected routes require authentication
3. Check that the user information is correctly displayed after authentication
4. Test the logout process and ensure the user is properly signed out

## Notes

This implementation follows the v2.2.0 integration strategy, ensuring core features remain functional while adding authentication capabilities. It preserves the separation of concerns and maintains the existing UI patterns.

---

*Note: This is a replacement document for a potentially missing original document and was created based on existing code and documentation.*
