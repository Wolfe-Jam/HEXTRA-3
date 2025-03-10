# HEXTRA Authentication Setup Guide

## Overview

HEXTRA uses Kinde for authentication. This guide will help you set up authentication for both development and production environments.

## Environment Variables

There are two supported naming patterns for environment variables:

### Standard Pattern (Kinde SDK v4+)
```
KINDE_CLIENT_ID
KINDE_ISSUER_URL
KINDE_POST_LOGIN_REDIRECT_URL
KINDE_POST_LOGOUT_REDIRECT_URL
```

### Create React App Pattern
```
REACT_APP_KINDE_CLIENT_ID
REACT_APP_KINDE_DOMAIN
REACT_APP_KINDE_REDIRECT_URI
REACT_APP_KINDE_LOGOUT_URI
```

The application now supports both naming patterns, so either set can be used.

## Setup Steps

1. **Create a Kinde Account**
   - Go to [kinde.com](https://kinde.com/) and sign up
   - Create a new application

2. **Configure Redirect URLs in Kinde**
   - Login Redirect URL: `http://localhost:3000/callback` (for development)
   - Logout Redirect URL: `http://localhost:3000` (for development)
   
   For production, use your actual domain:
   - Login Redirect URL: `https://yourdomain.com/callback`
   - Logout Redirect URL: `https://yourdomain.com`

3. **Get API Keys**
   - From the Kinde dashboard, get your Client ID and Domain

4. **Set Up Environment Variables**
   - Copy `.env.local.example` to `.env.local`
   - Fill in your Client ID and Domain
   - Update redirect URLs as needed

## Testing Authentication

For testing authentication, HEXTRA provides:

1. **Test Login Page**: Access at `/test-login` to see detailed status
2. **Debug Auth Button**: Located at the bottom right of the app
3. **Direct Login Link**: For troubleshooting SDK issues

## Troubleshooting

If sign-in isn't working:

1. **Check Environment Variables**:
   - Look at the Test Login Page to verify all variables are set

2. **Check Console Logs**:
   - The app will log authentication configuration details
   - Look for any errors during login attempts

3. **Try the Direct Login Link**:
   - If this works but the regular sign-in doesn't, there's an issue with how the SDK is configured

4. **Verify Redirect URLs**:
   - Double-check that the redirect URLs match exactly between your environment variables and Kinde settings

5. **CORS Issues**:
   - If you're seeing CORS errors, make sure your domain is allowed in Kinde's CORS settings

## Verifying Successful Authentication

When a user is authenticated, you should see:
1. The green badge in the header showing "Full Access"
2. In the Test Login Page, you'll see all user details
3. Batch processing will be enabled
