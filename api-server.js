/**
 * HEXTRA API Server (v2.2.4)
 * 
 * Simple Express server to handle API requests for MailChimp integration
 * - Serves /api/mailchimp-subscribe endpoint
 * - Supports MailChimp subscription functionality
 * - Uses the same pattern as the existing API handlers
 * 
 * @version 2.2.4
 * @lastUpdated 2025-03-11
 */

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const https = require('https');
const dotenv = require('dotenv');
const app = express();
const PORT = process.env.API_PORT || 3001;

// Load environment variables
dotenv.config();

// Middleware
app.use(bodyParser.json());
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001'],
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Log middleware
app.use((req, res, next) => {
  console.log(`[API] ${req.method} ${req.path}`);
  next();
});

// Import route handlers
const configCheckHandler = require('./src/api/mailchimp-config-check').handler;

// API Routes
app.get('/api/mailchimp-config-check', (req, res) => {
  configCheckHandler(req, res);
});

app.post('/api/mailchimp-subscribe', async (req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*'); 
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  // Handle OPTIONS request (CORS preflight)
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const { email } = req.body;
    console.log('[API] Email received:', email);
    
    // Validate email
    if (!email || !email.includes('@')) {
      console.log('[API] Invalid email format');
      return res.status(400).json({ error: 'Valid email is required' });
    }
    
    // Check environment variables
    if (!process.env.MAILCHIMP_API_KEY || !process.env.MAILCHIMP_SERVER_PREFIX || !process.env.MAILCHIMP_AUDIENCE_ID) {
      console.error('[API] Missing required environment variables');
      return res.status(500).json({ error: 'Server configuration error' });
    }
    
    // Log environment check (without revealing sensitive info)
    console.log('[API] Environment check:', { 
      hasApiKey: !!process.env.MAILCHIMP_API_KEY, 
      hasServerPrefix: !!process.env.MAILCHIMP_SERVER_PREFIX,
      hasAudienceId: !!process.env.MAILCHIMP_AUDIENCE_ID
    });

    // Prepare subscriber data
    const subscriberData = {
      email_address: email,
      status: 'subscribed',  // Use 'pending' for double opt-in
      merge_fields: {
        SOURCE: 'HEXTRA App Download',
        APP_VERSION: '2.2.4'
      },
      tags: ['app-user', 'download-dialog']
    };

    // Add member to list using direct API call
    console.log('[API] Attempting to add to MailChimp list');
    const result = await addToMailchimpList(email, subscriberData);
    
    // Member already exists
    if (result.title === 'Member Exists') {
      console.log('[API] Member already exists, returning success');
      return res.status(200).json({ 
        success: true, 
        message: 'You are already subscribed to our updates' 
      });
    }
    
    // Success response
    if (result.id) {
      console.log('[API] MailChimp API success:', result.id);
      return res.status(200).json({ 
        success: true, 
        id: result.id,
        message: 'Successfully subscribed to HEXTRA updates'
      });
    }
    
    // Handle unexpected response
    console.error('[API] Unexpected MailChimp response:', result);
    return res.status(500).json({ 
      error: 'Unexpected response from mail service',
      details: 'Please try again later'
    });
  } catch (error) {
    // Log the error details
    console.error('[API] Error:', error.message);
    
    // Return error response
    return res.status(500).json({ 
      error: 'Error subscribing to newsletter',
      details: 'Please try again later'
    });
  }
});

// Add a simple test endpoint
app.get('/api/ping', (req, res) => {
  return res.status(200).json({ 
    status: 'ok', 
    message: 'HEXTRA API Server is running', 
    version: '2.2.4',
    timestamp: new Date().toISOString()
  });
});

// Helper function: Add subscriber to MailChimp list using direct HTTPS request
async function addToMailchimpList(email, data) {
  return new Promise((resolve, reject) => {
    try {
      // Get MailChimp configuration from environment
      const server = process.env.MAILCHIMP_SERVER_PREFIX;
      const listId = process.env.MAILCHIMP_AUDIENCE_ID;
      const apiKey = process.env.MAILCHIMP_API_KEY;
      
      // Create authentication string
      const auth = Buffer.from(`anystring:${apiKey}`).toString('base64');
      
      // Prepare data for request
      const postData = JSON.stringify(data);
      
      // Configure request options
      const options = {
        hostname: `${server}.api.mailchimp.com`,
        path: `/3.0/lists/${listId}/members`,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${auth}`,
          'Content-Length': postData.length
        }
      };
      
      // Make the request
      const req = https.request(options, (res) => {
        let data = '';
        
        // Collect data chunks
        res.on('data', (chunk) => {
          data += chunk;
        });
        
        // Process complete response
        res.on('end', () => {
          try {
            // Parse JSON response
            const response = JSON.parse(data);
            
            // Check response status
            if (res.statusCode >= 400) {
              console.log('[API] MailChimp error response:', response);
            } else {
              console.log('[API] MailChimp success response received');
            }
            
            resolve(response);
          } catch (e) {
            console.error('[API] Error parsing response:', e.message);
            reject(new Error('Failed to parse MailChimp response'));
          }
        });
      });
      
      // Handle request errors
      req.on('error', (error) => {
        console.error('[API] Request error:', error.message);
        reject(error);
      });
      
      // Send the request
      req.write(postData);
      req.end();
    } catch (error) {
      console.error('[API] Setup error:', error.message);
      reject(error);
    }
  });
}

// Start the server
app.listen(PORT, () => {
  console.log(`[API] HEXTRA API Server v2.2.4 running on port ${PORT}`);
  console.log(`[API] Available endpoints:`);
  console.log(`[API] - POST /api/mailchimp-subscribe`);
  console.log(`[API] - GET /api/ping`);
});
