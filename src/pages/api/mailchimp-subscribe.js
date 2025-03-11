/**
 * MailChimp Subscription API (v2.2.4)
 * 
 * Handles email subscription to MailChimp list
 * - Validates email format
 * - Adds users to specified MailChimp audience
 * - Provides success/error response
 * - Follows Vercel serverless best practices
 * - Enhanced diagnostic logging (2025-03-11)
 * 
 * @version 2.2.4
 * @lastUpdated 2025-03-11
 */

// Using native https for better serverless compatibility
import https from 'https';
import url from 'url';

// Test mode flag - set to true to enable verbose diagnostics
const DIAGNOSTIC_MODE = true;

/**
 * API endpoint handler for Vercel serverless
 */
/**
 * Test the API directly by calling /api/mailchimp-subscribe?test=youremail@example.com
 * This allows direct testing without needing a UI component
 */
export default async function handler(req, res) {
  // DEBUGGING: Log all API requests for troubleshooting
  console.log(`[DEBUG] MailChimp API Request: ${req.method} ${req.url}`);
  
  // Check if this is a test request
  const parsedUrl = url.parse(req.url, true);
  const isTestRequest = parsedUrl.query && parsedUrl.query.test;
  const testEmail = isTestRequest ? parsedUrl.query.test : null;
  
  if (isTestRequest) {
    console.log(`[DIAGNOSTIC] TEST MODE ACTIVE - Using test email: ${testEmail}`);
  }
  
  // Log request details
  console.log(`[DEBUG] Request headers:`, JSON.stringify(req.headers));
  
  // DIAGNOSTIC: Detailed environment check
  try {
    // Check environment variables
    const envCheck = {
      hasApiKey: !!process.env.MAILCHIMP_API_KEY,
      hasServerPrefix: !!process.env.MAILCHIMP_SERVER_PREFIX,
      hasAudienceId: !!process.env.MAILCHIMP_AUDIENCE_ID,
      environment: process.env.NODE_ENV || 'not set'
    };
    
    console.log(`[DEBUG] Environment check:`, envCheck);
    
    if (DIAGNOSTIC_MODE) {
      // Add more detailed diagnostics about environment variables
      const apiKeyLastFour = process.env.MAILCHIMP_API_KEY ? 
        `...${process.env.MAILCHIMP_API_KEY.slice(-4)}` : 'MISSING';
      
      const serverPrefix = process.env.MAILCHIMP_SERVER_PREFIX || 'MISSING';
      const audienceId = process.env.MAILCHIMP_AUDIENCE_ID ? 
        `...${process.env.MAILCHIMP_AUDIENCE_ID.slice(-6)}` : 'MISSING';
      
      console.log('[DIAGNOSTIC] MailChimp configuration details:');
      console.log(`- API Key: ${apiKeyLastFour}`);
      console.log(`- Server Prefix: ${serverPrefix}`);
      console.log(`- Audience ID: ${audienceId}`);
      console.log(`- Complete URL would be: https://${serverPrefix}.api.mailchimp.com/3.0/lists/${audienceId}/members`);
    }
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

  // Handle test GET requests
  if (isTestRequest && req.method === 'GET') {
    console.log('[DIAGNOSTIC] Processing test request via GET');
    try {
      // Validate test email
      if (!testEmail || !testEmail.includes('@')) {
        return res.status(400).json({ 
          error: 'Invalid test email', 
          message: 'Please provide a valid email in the test parameter' 
        });
      }
      
      // Prepare subscriber data for test
      const testSubscriberData = {
        email_address: testEmail,
        status: 'subscribed',
        merge_fields: {
          SOURCE: 'API Test',
          APP_VERSION: '2.2.4'
        },
        tags: ['test-api']
      };
      
      // Add to MailChimp
      console.log('[DIAGNOSTIC] Running test subscription with email:', testEmail);
      const result = await addToMailchimpList(testEmail, testSubscriberData);
      
      // Return diagnostic response
      return res.status(200).json({
        test: true,
        testEmail: testEmail,
        success: !!result.id || result.title === 'Member Exists',
        mailchimpResponse: result,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('[DIAGNOSTIC] Test request failed:', error.message);
      return res.status(500).json({
        test: true,
        testEmail: testEmail,
        error: error.message,
        success: false,
        timestamp: new Date().toISOString()
      });
    }
  }
  
  // Only allow POST requests for normal operation
  if (req.method !== 'POST' && !isTestRequest) {
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
      const hostname = `${server}.api.mailchimp.com`;
      const path = `/3.0/lists/${listId}/members`;
      const fullUrl = `https://${hostname}${path}`;
      
      const options = {
        hostname: hostname,
        path: path,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${auth}`,
          'Content-Length': postData.length
        }
      };
      
      // DIAGNOSTIC: Log request details (with API key redacted)
      if (DIAGNOSTIC_MODE) {
        const sanitizedAuth = 'Basic **REDACTED**';
        console.log('[DIAGNOSTIC] MailChimp request URL:', fullUrl);
        console.log('[DIAGNOSTIC] MailChimp request headers:', {
          ...options.headers,
          'Authorization': sanitizedAuth
        });
        console.log('[DIAGNOSTIC] MailChimp request payload:', data);
      }
      
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
            // DIAGNOSTIC: Log raw response for troubleshooting
            if (DIAGNOSTIC_MODE) {
              console.log('[DIAGNOSTIC] MailChimp raw response status:', res.statusCode);
              console.log('[DIAGNOSTIC] MailChimp raw response headers:', res.headers);
              console.log('[DIAGNOSTIC] MailChimp raw response body:', data);
            }
            
            // Parse JSON response
            const response = JSON.parse(data);
            
            // Check response status
            if (res.statusCode >= 400) {
              console.log('[DEBUG] API - MailChimp error response:', response);
              
              // DIAGNOSTIC: Detailed error analysis
              if (DIAGNOSTIC_MODE) {
                console.log('[DIAGNOSTIC] MailChimp error details:');
                if (response.title) console.log('- Error Title:', response.title);
                if (response.status) console.log('- Status Code:', response.status);
                if (response.detail) console.log('- Error Detail:', response.detail);
                if (response.instance) console.log('- Error Instance:', response.instance);
                
                // Check for specific common errors
                if (response.title === 'Invalid Resource') {
                  console.log('[DIAGNOSTIC] Possible issues: Malformed request or invalid audience ID');
                } else if (response.title === 'Forgotten Email Not Subscribed') {
                  console.log('[DIAGNOSTIC] User was previously unsubscribed and cannot be re-added automatically');
                } else if (response.detail && response.detail.includes('API key')) {
                  console.log('[DIAGNOSTIC] API key issue detected');
                }
              }
            } else {
              console.log('[DEBUG] API - MailChimp success response received');
              // DIAGNOSTIC: Log subscriber details on success
              if (DIAGNOSTIC_MODE) {
                console.log('[DIAGNOSTIC] MailChimp subscriber ID:', response.id);
                console.log('[DIAGNOSTIC] MailChimp subscriber status:', response.status);
              }
            }
            
            resolve(response);
          } catch (e) {
            console.error('[DEBUG] API - Error parsing response:', e.message);
            // DIAGNOSTIC: Log raw data if parsing failed
            if (DIAGNOSTIC_MODE) {
              console.log('[DIAGNOSTIC] Failed to parse response. Raw data:', data);
            }
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
