# Kinde Authentication Setup

## Kinde App Details
- App Name: HEXTRA
- Client ID: 0bd4c1c6f92d46f7b72290073d1806c7
- Domain: https://hextra.kinde.com

## Environment Variables

### Production Environment
```
REACT_APP_KINDE_REDIRECT_URI=https://www.hextra.io/api/auth/kinde/callback
KINDE_POST_LOGIN_REDIRECT_URL=https://www.hextra.io/batch
KINDE_POST_LOGOUT_REDIRECT_URL=https://www.hextra.io
```

### Preview Environment
```
REACT_APP_KINDE_REDIRECT_URI=https://hextra-3-fd08w50wz-wofejams-projects.vercel.app/api/auth/kinde/callback
KINDE_POST_LOGIN_REDIRECT_URL=https://hextra-3-fd08w50wz-wofejams-projects.vercel.app/batch
KINDE_POST_LOGOUT_REDIRECT_URL=https://hextra-3-fd08w50wz-wofejams-projects.vercel.app
```

### All Environments
```
KINDE_CLIENT_ID=0bd4c1c6f92d46f7b72290073d1806c7
KINDE_ISSUER_URL=https://hextra.kinde.com
REACT_APP_KINDE_CLIENT_ID=0bd4c1c6f92d46f7b72290073d1806c7
REACT_APP_KINDE_DOMAIN=https://hextra.kinde.com
REACT_APP_STRIPE_PUBLISHABLE_KEY=[secured]
STRIPE_SECRET_KEY=[secured]
```

## Kinde Dashboard Configuration

### Allowed Callback URLs
```
http://localhost:3000/api/auth/kinde/callback
https://hextra.io/api/auth/kinde/callback
https://www.hextra.io/api/auth/kinde/callback
https://hextra-3-fd08w50wz-wofejams-projects.vercel.app/api/auth/kinde/callback
```

### Allowed Logout Redirect URLs
```
http://localhost:3000
https://hextra.io
https://www.hextra.io
https://hextra-3-fd08w50wz-wofejams-projects.vercel.app
```

## Important Notes
1. Production uses www.hextra.io consistently (primary domain)
2. Preview environment uses hextra-3-fd08w50wz-wofejams-projects.vercel.app
3. Both hextra.io and www.hextra.io are allowed in Kinde for flexibility
4. Environment variables use a mix of KINDE_ and REACT_APP_ prefixes by design
5. Some vars are duplicated with different prefixes to support different code patterns

## Testing Steps
1. Clear browser cache/cookies
2. Test Preview: https://hextra-3-fd08w50wz-wofejams-projects.vercel.app
3. Verify auth flow and callback
4. Check console for any URL mismatches
