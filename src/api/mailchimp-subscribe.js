/**
 * MailChimp Subscription API (v2.2.5)
 * 
 * Simplified, production-ready handler for MailChimp integration
 * - Optimized for serverless functions
 * - Handles CORS properly for production domains
 * - Provides detailed logging for troubleshooting
 * - Minimal dependencies for maximum reliability
 * - Fixed 405 Method Not Allowed error
 * 
 * @version 2.2.5
 * @lastUpdated 2025-03-11
 */

// Import only the essential modules
const https = require('https');
const crypto = require('crypto');
const { URL } = require('url');

// Diagnostic settings
const DIAGNOSTIC_MODE = true;

/**
 * Handles request for MailChimp subscription
 */
const handler = async (req, res) => {
  // Critical: Set CORS headers first, before any processing
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*'); 
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  // Log every request for debugging
  console.log(`[DEBUG] MailChimp API Request:`, {
    method: req.method,
    url: req.url,
    headers: req.headers,
    origin: req.headers.origin || 'unknown'
  });

  // 1. Handle OPTIONS (CORS preflight) requests immediately
  if (req.method === 'OPTIONS') {
    console.log('[DEBUG] Responding to OPTIONS request');
    return res.status(200).end();
  }

  // 2. Only allow POST for regular operation
  if (req.method !== 'POST') {
    console.log(`[DEBUG] Rejected ${req.method} request - only POST allowed`);
    return res.status(405).json({ error: 'Method Not Allowed', message: 'Only POST method is supported for this endpoint' });
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
        APP_VERSION: '2.2.5'
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
};

/**
 * Add a subscriber to MailChimp list using direct HTTPS request
 * Simplified implementation optimized for serverless functions
 * @param {string} email - Subscriber's email address
 * @param {object} data - Subscription data for MailChimp
 * @returns {Promise<object>} MailChimp API response
 */
async function addToMailchimpList(email, data) {
  console.log('[DEBUG] Starting MailChimp subscription for:', email);

  try {
    // Calculate MD5 hash of lowercase email (MailChimp's standard for member IDs)
    const emailHash = crypto
      .createHash('md5')
      .update(email.toLowerCase())
      .digest('hex');

    // Get MailChimp configuration
    const server = process.env.MAILCHIMP_SERVER_PREFIX;
    const listId = process.env.MAILCHIMP_AUDIENCE_ID;
    const apiKey = process.env.MAILCHIMP_API_KEY;
    
    // Check if member already exists
    console.log('[DEBUG] Checking if member exists in MailChimp');
    
    try {
      // Build API URL for member check
      const memberUrl = `https://${server}.api.mailchimp.com/3.0/lists/${listId}/members/${emailHash}`;
      
      // Make GET request to check member
      const checkResult = await makeApiRequest('GET', memberUrl, null, apiKey);
      
      // Member exists
      console.log('[DEBUG] Member exists in MailChimp with status:', checkResult.status);
      return { title: 'Member Exists', status: checkResult.status };
      
    } catch (checkError) {
      // 404 means member doesn't exist (expected) - proceed with creation
      if (checkError.statusCode && checkError.statusCode === 404) {
        // Add new member
        console.log('[DEBUG] Member not found, adding to MailChimp');
        const addUrl = `https://${server}.api.mailchimp.com/3.0/lists/${listId}/members`;
        return await makeApiRequest('POST', addUrl, data, apiKey);
      } else {
        // Unexpected error
        console.error('[DEBUG] Unexpected error checking member:', checkError);
        throw checkError;
      }
    }
  } catch (error) {
    console.error('[DEBUG] MailChimp subscription error:', error);
    throw error;
  }
}

/**
 * Make a request to the MailChimp API
 * @param {string} method - HTTP method (GET, POST, PUT)
 * @param {string} url - Complete API URL
 * @param {object|null} data - Request body for POST/PUT requests
 * @param {string} apiKey - MailChimp API key
 * @returns {Promise<object>} - Parsed JSON response
 */
async function makeApiRequest(method, url, data, apiKey) {
  return new Promise((resolve, reject) => {
    try {
      console.log(`[DEBUG] Making ${method} request to:`, url);
      
      // Parse URL to get hostname and path
      const parsedUrl = new URL(url);
      
      // Basic auth using API key
      const auth = Buffer.from(`anystring:${apiKey}`).toString('base64');
      
      // Prepare request options
      const options = {
        hostname: parsedUrl.hostname,
        path: parsedUrl.pathname + parsedUrl.search,
        method: method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${auth}`,
          'User-Agent': 'HEXTRA-App/2.2.5'
        }
      };
      
      // Add content length for POST/PUT requests
      const postData = data ? JSON.stringify(data) : null;
      if (postData && (method === 'POST' || method === 'PUT')) {
        options.headers['Content-Length'] = Buffer.byteLength(postData);
      }
      
      // Log sanitized request details
      if (DIAGNOSTIC_MODE) {
        console.log('[DIAGNOSTIC] Request details:', {
          method,
          url,
          headers: { ...options.headers, 'Authorization': 'Basic **REDACTED**' },
          hasData: !!data
        });
      }
      
      // Make the HTTP request
      const req = https.request(options, (res) => {
        let responseData = '';
        
        // Log response status immediately
        console.log(`[DEBUG] MailChimp API response status: ${res.statusCode}`);
        
        // Collect response data chunks
        res.on('data', (chunk) => {
          responseData += chunk;
        });
        
        // Process complete response
        res.on('end', () => {
          try {
            // Log raw response if in diagnostic mode
            if (DIAGNOSTIC_MODE) {
              console.log('[DIAGNOSTIC] MailChimp response headers:', res.headers);
              console.log('[DIAGNOSTIC] MailChimp raw response:', responseData);
            }
            
            // Parse JSON response if present
            const response = responseData ? JSON.parse(responseData) : {};
            
            // Handle error responses
            if (res.statusCode >= 400) {
              console.error('[DEBUG] MailChimp API error:', {
                statusCode: res.statusCode,
                title: response.title || 'Unknown error',
                detail: response.detail || 'No details provided'
              });
              
              // Create error object with API details
              const error = new Error(response.detail || response.title || 'MailChimp API error');
              error.statusCode = res.statusCode;
              error.response = response;
              
              reject(error);
              return;
            }
            
            // Success response
            console.log('[DEBUG] MailChimp API success:', response.id || 'No ID provided');
            resolve(response);
            
          } catch (parseError) {
            // Handle JSON parsing errors
            console.error('[DEBUG] Failed to parse MailChimp response:', parseError.message);
            
            if (DIAGNOSTIC_MODE) {
              console.log('[DIAGNOSTIC] Failed to parse. Raw data:', responseData);
            }
            
            const error = new Error('Failed to parse MailChimp response');
            error.originalError = parseError;
            error.rawResponse = responseData;
            
            reject(error);
          }
        });
      });
      
      // Handle request network errors
      req.on('error', (networkError) => {
        console.error('[DEBUG] MailChimp API network error:', networkError.message);
        reject(networkError);
      });
      
      // Send request data for POST/PUT
      if (postData && (method === 'POST' || method === 'PUT')) {
        req.write(postData);
      }
      
      // Complete the request
      req.end();
      
    } catch (setupError) {
      // Handle errors during request setup
      console.error('[DEBUG] Error setting up MailChimp request:', setupError.message);
      reject(setupError);
    }
  });
}

// Export the handler directly for compatibility with Next.js API routes
module.exports = handler;
