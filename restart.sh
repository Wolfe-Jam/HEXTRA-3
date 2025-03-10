#!/bin/bash
# Kill any existing node processes running on port 3000
lsof -i :3000 -t | xargs kill -9 2>/dev/null

# Start the app
npm start
