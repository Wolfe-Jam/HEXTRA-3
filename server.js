/**
 * HEXTRA API Server (v2.2.4)
 * 
 * Express server to handle API routes in development and production
 * - Serves API endpoints from src/pages/api directory
 * - Handles CORS and request validation
 * - Supports both development and production environments
 * 
 * @version 2.2.4
 * @lastUpdated 2025-03-11
 */

const express = require('express');
const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');
const bodyParser = require('body-parser');
const cors = require('cors');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;
const isDev = process.env.NODE_ENV !== 'production';

// Middleware
app.use(bodyParser.json());
app.use(cors({
  origin: isDev ? ['http://localhost:3000', 'http://localhost:3001'] : true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Set up API routes dynamically from src/pages/api
const API_DIR = path.join(__dirname, 'src', 'pages', 'api');

// Function to recursively find API files
function findApiFiles(dir, baseRoute = '/api') {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    
    if (entry.isDirectory()) {
      // Recursively process subdirectories
      findApiFiles(fullPath, `${baseRoute}/${entry.name}`);
    } else if (entry.name.endsWith('.js')) {
      // Register API route for JavaScript files
      const routeName = entry.name.replace(/\.js$/, '');
      const routePath = `${baseRoute}/${routeName}`;
      
      try {
        // Dynamically import the API handler
        const handler = require(fullPath);
        
        console.log(`[SERVER] Registering API route: ${routePath}`);
        
        // Handle all HTTP methods for the route
        app.all(routePath, async (req, res) => {
          try {
            // Call the handler function from the imported module
            if (typeof handler === 'function') {
              await handler(req, res);
            } else if (typeof handler.default === 'function') {
              await handler.default(req, res);
            } else {
              throw new Error(`No valid handler found in ${fullPath}`);
            }
          } catch (error) {
            console.error(`[SERVER] Error in API route ${routePath}:`, error);
            res.status(500).json({ 
              error: 'Internal server error',
              message: isDev ? error.message : 'An unexpected error occurred'
            });
          }
        });
      } catch (error) {
        console.error(`[SERVER] Failed to load API route ${routePath}:`, error);
      }
    }
  }
}

// Register all API routes
if (fs.existsSync(API_DIR)) {
  findApiFiles(API_DIR);
} else {
  console.warn(`[SERVER] API directory not found: ${API_DIR}`);
}

// In production, serve static files from the build directory
if (!isDev) {
  const BUILD_DIR = path.join(__dirname, 'build');
  
  if (fs.existsSync(BUILD_DIR)) {
    app.use(express.static(BUILD_DIR));
    
    // Handle client-side routing by serving index.html for all non-API routes
    app.get('*', (req, res) => {
      if (!req.path.startsWith('/api/')) {
        res.sendFile(path.join(BUILD_DIR, 'index.html'));
      }
    });
  } else {
    console.warn(`[SERVER] Build directory not found: ${BUILD_DIR}`);
  }
}

// Global error handler
app.use((err, req, res, next) => {
  console.error('[SERVER] Unhandled error:', err);
  res.status(500).json({ 
    error: 'Server error',
    message: isDev ? err.message : 'An unexpected error occurred'
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`[SERVER] HEXTRA API server running on port ${PORT}`);
  console.log(`[SERVER] Environment: ${isDev ? 'Development' : 'Production'}`);
  if (isDev) {
    console.log(`[SERVER] API endpoint example: http://localhost:${PORT}/api/mailchimp-subscribe`);
  }
});
