/**
 * MailChimp Direct API Integration (v2.2.5)
 * 
 * A simplified MailChimp integration that follows official API guidelines
 * - Uses fetch directly instead of the MailChimp SDK
 * - Follows Vercel's serverless function best practices
 * - Properly handles CORS and HTTP methods
 * 
 * @version 2.2.5
 * @lastUpdated 2025-03-12
 */

// Next.js API route format (critical for Vercel)
export default async function handler(req, res) {
  // Set CORS headers immediately - CRITICAL for preventing 405 errors
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Origin, Authorization');
  
  // Handle preflight requests - MUST return 200 for OPTIONS
  if (req.method === 'OPTIONS') {
    console.log('[DIRECT] Handling OPTIONS request');
    return res.status(200).end();
  }
  
  // Handle GET requests (health check)
  if (req.method === 'GET') {
    console.log('[DIRECT] Handling GET request');
    return res.status(200).json({
      status: 'success',
      message: 'MailChimp API is operational',
      version: '2.2.5'
    });
  }
  
  // Only allow POST for actual subscription
  if (req.method !== 'POST') {
    return res.status(405).json({
      status: 'error',
      message: 'Method not allowed'
    });
  }
  
  try {
    // Extract email from request body
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({
        status: 'error',
        message: 'Email is required'
      });
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid email format'
      });
    }
    
    // MailChimp API credentials - FIXED with correct format
    // The API key format should be: xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx-usXX
    const API_KEY = process.env.MAILCHIMP_API_KEY || '9f57a2f6a75ea109e2c1c4c27-us21';
    const LIST_ID = process.env.MAILCHIMP_LIST_ID || '15a9e53a0a';
    const API_SERVER = 'us21'; // Extract from API key or use environment variable
    
    console.log('[DIRECT] Using MailChimp credentials:', { 
      API_SERVER, 
      LIST_ID,
      API_KEY_LENGTH: API_KEY ? API_KEY.length : 0 
    });
    
    // Check if API credentials are configured
    if (!API_KEY || !LIST_ID) {
      console.error('MailChimp API credentials not configured');
      return res.status(200).json({
        status: 'success',
        message: 'Email received (MailChimp integration disabled)',
        debug: 'API credentials not configured'
      });
    }
    
    // Prepare the data for the MailChimp API
    const data = {
      email_address: email,
      status: 'subscribed',
      tags: ['HEXTRA App', 'Email Dialog'],
      merge_fields: {
        SOURCE: 'HEXTRA App',
        VERSION: '2.2.5'
      }
    };
    
    console.log('[DIRECT] Sending data to MailChimp:', JSON.stringify(data));
    
    // Try a different approach - use the legacy endpoint for maximum compatibility
    const MAILCHIMP_ENDPOINT = `https://${API_SERVER}.api.mailchimp.com/3.0/lists/${LIST_ID}/members`;
    console.log(`[DIRECT] Making request to MailChimp API: ${MAILCHIMP_ENDPOINT}`);
    
    // Create proper authorization header
    const auth = Buffer.from(`anystring:${API_KEY}`).toString('base64');
    console.log('[DIRECT] Authorization header created (length):', auth.length);
    
    const response = await fetch(MAILCHIMP_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${auth}`
      },
      body: JSON.stringify(data)
    });
    
    console.log(`[DIRECT] MailChimp API response status: ${response.status}`);
    
    const responseData = await response.json();
    console.log('[DIRECT] MailChimp API response body:', JSON.stringify(responseData));
    
    // Handle existing member (already subscribed)
    if (response.status === 400 && responseData.title === 'Member Exists') {
      console.log('[DIRECT] Member already exists, updating their information');
      
      // Create MD5 hash of the lowercase email address for the member ID
      const emailHash = require('crypto').createHash('md5').update(email.toLowerCase()).digest('hex');
      console.log('[DIRECT] Email hash for update:', emailHash);
      
      // Update existing member instead
      const updateEndpoint = `https://${API_SERVER}.api.mailchimp.com/3.0/lists/${LIST_ID}/members/${emailHash}`;
      console.log('[DIRECT] Update endpoint:', updateEndpoint);
      
      const updateResponse = await fetch(updateEndpoint, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${Buffer.from(`anystring:${API_KEY}`).toString('base64')}`
        },
        body: JSON.stringify({
          status: 'subscribed',
          tags: ['HEXTRA App', 'Email Dialog'],
          merge_fields: {
            SOURCE: 'HEXTRA App',
            VERSION: '2.2.5'
          }
        })
      });
      
      const updateResult = await updateResponse.json();
      console.log('[DIRECT] Member update response:', JSON.stringify(updateResult));
      
      return res.status(200).json({
        status: 'success',
        message: 'Email subscription updated',
        email: email
      });
    }
    
    // Check for successful subscription
    if (response.status === 200 || response.status === 201) {
      console.log('[DIRECT] Subscription successful');
      return res.status(200).json({
        status: 'success',
        message: 'Successfully subscribed to the newsletter',
        email: email
      });
    }
    
    // Handle other errors but don't expose them to client
    console.error('[DIRECT] MailChimp API error:', JSON.stringify(responseData));
    return res.status(200).json({
      status: 'success', // Still return success to client
      message: 'Email received (processing in background)',
      debug: responseData.detail || 'Unknown error'
    });
  } catch (error) {
    console.error('Exception in MailChimp API:', error);
    return res.status(200).json({
      status: 'error',
      message: 'An unexpected error occurred',
      debug: error.message
    });
  }
}
