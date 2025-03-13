/**
 * MailChimp Test API (v2.2.5)
 * 
 * Simple test endpoint to verify API routing and CORS configuration
 * - Responds to all HTTP methods
 * - Includes comprehensive CORS headers
 * - Logs request details for diagnostics
 * 
 * @version 2.2.5
 * @lastUpdated 2025-03-12
 */

export default function handler(req, res) {
  // Log request details
  console.log(`[TEST API] Request received: ${req.method} ${req.url}`);
  console.log(`[TEST API] Headers:`, JSON.stringify(req.headers));
  
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*'); 
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');
  
  // Handle OPTIONS request
  if (req.method === 'OPTIONS') {
    console.log('[TEST API] Responding to OPTIONS request');
    return res.status(200).end();
  }
  
  // Handle all other methods
  return res.status(200).json({ 
    success: true, 
    method: req.method,
    message: 'API endpoint is working correctly',
    timestamp: new Date().toISOString(),
    headers: req.headers,
    environment: {
      hasMailchimpApiKey: !!process.env.MAILCHIMP_API_KEY,
      hasMailchimpServerPrefix: !!process.env.MAILCHIMP_SERVER_PREFIX,
      hasMailchimpAudienceId: !!process.env.MAILCHIMP_AUDIENCE_ID
    }
  });
}