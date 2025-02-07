#!/bin/bash

# Development environment variables for Kinde Auth
export REACT_APP_KINDE_CLIENT_ID="29b231bd96ab409c89f5c5575c3892c3"
export REACT_APP_KINDE_DOMAIN="https://hextra.kinde.com"
export REACT_APP_KINDE_REDIRECT_URI="http://localhost:3000/api/auth/kinde/callback"
export REACT_APP_KINDE_LOGOUT_URI="http://localhost:3000"

# Start the development server
npm start
