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
    
    // MailChimp API credentials
    const API_KEY = process.env.MAILCHIMP_API_KEY;
    const LIST_ID = process.env.MAILCHIMP_LIST_ID;
    const API_SERVER = process.env.MAILCHIMP_API_SERVER || 'us1';
    
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
      merge_fields: {
        SOURCE: 'HEXTRA App',
        VERSION: '2.2.5'
      }
    };
    
    // Make direct request to MailChimp API
    const response = await fetch(
      `https://${API_SERVER}.api.mailchimp.com/3.0/lists/${LIST_ID}/members`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${Buffer.from(`anystring:${API_KEY}`).toString('base64')}`
        },
        body: JSON.stringify(data)
      }
    );
    
    const responseData = await response.json();
    
    // Handle different response scenarios
    if (response.status === 200 || response.status === 201) {
      return res.status(200).json({
        status: 'success',
        message: 'Successfully subscribed to the newsletter',
        email: email
      });
    } else if (responseData.title === 'Member Exists') {
      return res.status(200).json({
        status: 'success',
        message: 'You are already subscribed to our newsletter',
        email: email
      });
    } else {
      console.error('MailChimp API error:', responseData);
      return res.status(200).json({
        status: 'error',
        message: 'Failed to subscribe to the newsletter',
        debug: responseData.detail || 'Unknown error'
      });
    }
  } catch (error) {
    console.error('Exception in MailChimp API:', error);
    return res.status(200).json({
      status: 'error',
      message: 'An unexpected error occurred',
      debug: error.message
    });
  }
}
