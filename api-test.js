/**
 * HEXTRA API Test Helper (v2.2.4)
 * 
 * Simple script to test API endpoints without needing full environment setup
 * - Uses mock data for testing
 * - Doesn't require actual MailChimp credentials
 * 
 * @version 2.2.4
 * @lastUpdated 2025-03-11
 */

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();
const PORT = 3001;

// Middleware
app.use(bodyParser.json());
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001'],
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Mock successful response
app.post('/api/mailchimp-subscribe', (req, res) => {
  const { email } = req.body;
  
  // Log the request
  console.log(`[TEST] Received subscription request for: ${email}`);
  
  // Return a successful response
  return res.status(200).json({
    success: true,
    id: "test-id-" + Date.now(),
    message: "Successfully subscribed to HEXTRA updates (TEST MODE)",
    testMode: true
  });
});

// Status endpoint
app.get('/api/ping', (req, res) => {
  return res.status(200).json({
    status: 'ok',
    message: 'HEXTRA API Test Server is running',
    version: '2.2.4',
    testMode: true,
    timestamp: new Date().toISOString()
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`[TEST] HEXTRA API Test Server v2.2.4 running on port ${PORT}`);
  console.log(`[TEST] This is a TEST server that returns mock responses`);
  console.log(`[TEST] Test the email dialog without needing MailChimp credentials`);
  console.log(`[TEST] Available endpoints:`);
  console.log(`[TEST] - POST /api/mailchimp-subscribe (returns mock success)`);
  console.log(`[TEST] - GET /api/ping (server status)`);
});
