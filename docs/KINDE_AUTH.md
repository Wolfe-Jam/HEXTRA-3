# Kinde Authentication in HEXTRA

## Overview
HEXTRA uses Kinde for authentication, implementing a three-tier access model:
1. Visitors (No Login) - Can view and test the app
2. Users (Logged In) - Can download single processed images
3. Members (Paid Subscription) - Full access including batch processing

## URL Configuration
All Kinde-related URLs must use `www.hextra.io` domain:

```javascript
// Production URLs
REACT_APP_KINDE_DOMAIN=https://hextra.kinde.com
REACT_APP_KINDE_REDIRECT_URI=https://www.hextra.io/api/auth/kinde/callback
REACT_APP_KINDE_POST_LOGIN_REDIRECT_URL=https://www.hextra.io
REACT_APP_KINDE_LOGOUT_URI=https://www.hextra.io
```

⚠️ Important: These URLs must match exactly in:
1. Kinde Dashboard configuration
2. Environment variables
3. Application code

## Authentication Flow

### 1. Initial App Load
- App is accessible without login
- Banner shows "Sign In" button
- Batch processing section shows subscription options

### 2. Sign In Process
```
User clicks "Sign In"
↓
Kinde Auth (https://hextra.kinde.com)
↓
Callback to https://www.hextra.io/api/auth/kinde/callback
↓
Redirect to https://www.hextra.io
```

### 3. Post-Authentication
- Banner updates to show user name
- Single image processing becomes available
- Batch processing shows subscription options if not subscribed

### 4. Logout Process
```
User clicks "Sign Out"
↓
Kinde logout
↓
Redirect to https://www.hextra.io
```

## Implementation Details

### 1. KindeAuth Component (v2.2.2)
```javascript
// KindeAuth.js
export default function KindeAuth({ children }) {
  const config = {
    clientId: process.env.REACT_APP_KINDE_CLIENT_ID,
    domain: process.env.REACT_APP_KINDE_DOMAIN,
    redirectUri: process.env.REACT_APP_KINDE_REDIRECT_URI,
    logoutUri: process.env.REACT_APP_KINDE_LOGOUT_URI
  };
  // ... component implementation
}
```

### 2. Callback Handling
```javascript
// CallbackPage.js
export default function CallbackPage() {
  const { isAuthenticated, isLoading } = useKindeAuth();

  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      window.location.href = 'https://www.hextra.io';
    }
  }, [isAuthenticated, isLoading]);
}
```

### 3. Feature Access Control
```javascript
// Example usage in components
const { isAuthenticated } = useKindeAuth();

// Single image download
if (isAuthenticated) {
  // Allow download
}

// Batch processing
if (isAuthenticated && hasSubscription) {
  // Allow batch processing
}
```

## Environment Setup

### Production
Copy these exact values to your .env file:
```
REACT_APP_KINDE_CLIENT_ID=0bd4c1c6f92d46f7b72290073d1806c7
REACT_APP_KINDE_DOMAIN=https://hextra.kinde.com
REACT_APP_KINDE_REDIRECT_URI=https://www.hextra.io/api/auth/kinde/callback
REACT_APP_KINDE_POST_LOGIN_REDIRECT_URL=https://www.hextra.io
REACT_APP_KINDE_LOGOUT_URI=https://www.hextra.io
```

### Preview/Development
For preview deployments, update URLs accordingly but maintain the same structure.

## Troubleshooting

Common issues and solutions:

1. **Redirect Loop**
   - Ensure all URLs use www.hextra.io consistently
   - Check Kinde Dashboard matches environment variables

2. **Callback Failures**
   - Verify exact callback URL in Kinde Dashboard
   - Check for any URL typos or missing www

3. **Session Issues**
   - Clear browser cache and cookies
   - Ensure all Kinde URLs are exact matches
