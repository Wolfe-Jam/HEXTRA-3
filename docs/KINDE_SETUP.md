# Kinde Authentication Setup

## Kinde App Details
- App Name: HEXTRA
- Client ID: 0bd4c1c6f92d46f7b72290073d1806c7
- Domain: https://hextra.kinde.com

## Allowed Callback URLs
```
http://localhost:3000/api/auth/kinde/callback
https://hextra.io/api/auth/kinde/callback
https://www.hextra.io/api/auth/kinde/callback
https://hextra-3-fd08w50wz-wofejams-projects.vercel.app/api/auth/kinde/callback
```

## Allowed Logout Redirect URLs
```
http://localhost:3000
https://hextra.io
https://www.hextra.io
https://hextra-3-fd08w50wz-wofejams-projects.vercel.app
```

## Environment Variables

### Production Only
```
KINDE_POST_LOGIN_REDIRECT_URL=https://hextra.io/batch
```

### Preview Only
```
REACT_APP_KINDE_REDIRECT_URI=https://hextra.io/api/auth/kinde/callback
```

### All Environments
```
KINDE_CLIENT_ID=0bd4c1c6f92d46f7b72290073d1806c7
KINDE_ISSUER_URL=https://hextra.kinde.com
REACT_APP_STRIPE_PUBLISHABLE_KEY=[secured]
STRIPE_SECRET_KEY=[secured]
```

## Testing Steps
1. Clear browser cache/cookies
2. Test Preview: https://hextra-3-fd08w50wz-wofejams-projects.vercel.app
3. Verify auth flow and callback
4. Check console for any URL mismatches
