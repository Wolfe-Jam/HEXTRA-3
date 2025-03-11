/**
 * MailChimp Subscription API (v2.2.4)
 * 
 * Handles email subscription to MailChimp list
 * - Validates email format
 * - Adds users to specified MailChimp audience
 * - Provides success/error response
 * - Follows Vercel serverless best practices
 * 
 * @version 2.2.4
 * @lastUpdated 2025-03-11
 */

// Using native https for better serverless compatibility
import https from 'https';

/**
 * API endpoint handler for Vercel serverless
 */
export default async function handler(req, res) {
  // DEBUGGING: Log all API requests for troubleshooting
  console.log(`[DEBUG] MailChimp API Request: ${req.method} ${req.url}`);
  console.log(`[DEBUG] Request headers:`, JSON.stringify(req.headers));
  try {
    console.log(`[DEBUG] Environment check:`, {
      hasApiKey: !!process.env.MAILCHIMP_API_KEY,
      hasServerPrefix: !!process.env.MAILCHIMP_SERVER_PREFIX,
      hasAudienceId: !!process.env.MAILCHIMP_AUDIENCE_ID,
      environment: process.env.NODE_ENV || 'not set'
    });
  } catch (e) {
    console.error(`[DEBUG] Error checking environment:`, e.message);
  }
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*'); 
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  // Handle OPTIONS request (CORS preflight)
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email } = req.body;
    console.log('[DEBUG] API - Email received:', email);
    
    // Validate email
    if (!email || !email.includes('@')) {
      console.log('[DEBUG] API - Invalid email format');
      return res.status(400).json({ error: 'Valid email is required' });
    }
    
    // Check environment variables
    if (!process.env.MAILCHIMP_API_KEY || !process.env.MAILCHIMP_SERVER_PREFIX || !process.env.MAILCHIMP_AUDIENCE_ID) {
      console.error('[DEBUG] API - Missing required environment variables');
      return res.status(500).json({ error: 'Server configuration error' });
    }
    
    // Log environment check (without revealing sensitive info)
    console.log('[DEBUG] API - Environment check:', { 
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
    console.log('[DEBUG] API - Attempting to add to MailChimp list');
    const result = await addToMailchimpList(email, subscriberData);
    
    // Member already exists
    if (result.title === 'Member Exists') {
      console.log('[DEBUG] API - Member already exists, returning success');
      return res.status(200).json({ 
        success: true, 
        message: 'You are already subscribed to our updates' 
      });
    }
    
    // Success response
    if (result.id) {
      console.log('[DEBUG] API - MailChimp API success:', result.id);
      return res.status(200).json({ 
        success: true, 
        id: result.id,
        message: 'Successfully subscribed to HEXTRA updates'
      });
    }
    
    // Handle unexpected response
    console.error('[DEBUG] API - Unexpected MailChimp response:', result);
    return res.status(500).json({ 
      error: 'Unexpected response from mail service',
      details: 'Please try again later'
    });
  } catch (error) {
    // Log the error details
    console.error('[DEBUG] API - Error:', error.message);
    
    // Return error response
    return res.status(500).json({ 
      error: 'Error subscribing to newsletter',
      details: 'Please try again later'
    });
  }
}

/**
 * Add a subscriber to MailChimp list using direct HTTPS request
 * More reliable in serverless environments than the MailChimp SDK
 */
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
              console.log('[DEBUG] API - MailChimp error response:', response);
            } else {
              console.log('[DEBUG] API - MailChimp success response received');
            }
            
            resolve(response);
          } catch (e) {
            console.error('[DEBUG] API - Error parsing response:', e.message);
            reject(new Error('Failed to parse MailChimp response'));
          }
        });
      });
      
      // Handle request errors
      req.on('error', (error) => {
        console.error('[DEBUG] API - Request error:', error.message);
        reject(error);
      });
      
      // Send the request
      req.write(postData);
      req.end();
    } catch (error) {
      console.error('[DEBUG] API - Setup error:', error.message);
      reject(error);
    }
  });
}
