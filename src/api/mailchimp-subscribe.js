/**
 * MailChimp Subscription API (v2.2.4)
 * 
 * Alternative implementation that works with current Vercel config
 * 
 * @version 2.2.4
 * @lastUpdated 2025-03-11
 */

import mailchimp from '@mailchimp/mailchimp_marketing';

// Initialize MailChimp with API key and server prefix
mailchimp.setConfig({
  apiKey: process.env.MAILCHIMP_API_KEY,
  server: process.env.MAILCHIMP_SERVER_PREFIX // e.g., "us1"
});

// Main handler function
export default async function mailchimpSubscribe(req, res) {
  console.log('[DEBUG] API - MailChimp subscribe request received', { method: req.method });
  
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');
  
  // Handle OPTIONS request for CORS preflight
  if (req.method === 'OPTIONS') {
    console.log('[DEBUG] API - Handling OPTIONS request (CORS preflight)');
    return res.status(200).end();
  }
  
  // Only allow POST requests
  if (req.method !== 'POST') {
    console.log('[DEBUG] API - Method not allowed:', req.method);
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  let email;
  
  try {
    // Parse email from request body
    if (typeof req.body === 'string') {
      const body = JSON.parse(req.body);
      email = body.email;
    } else {
      email = req.body.email;
    }
    
    console.log('[DEBUG] API - Received subscription request for email:', email);
    
    // Validate email
    if (!email || !email.includes('@')) {
      console.log('[DEBUG] API - Invalid email format:', email);
      return res.status(400).json({ error: 'Invalid email format' });
    }
    
    try {
      console.log('[DEBUG] API - Calling MailChimp API to add list member');
      // Add subscriber to list
      const response = await mailchimp.lists.addListMember(
        process.env.MAILCHIMP_AUDIENCE_ID,
        {
          email_address: email,
          status: 'subscribed',
          merge_fields: {
            SOURCE: 'HEXTRA App Download',
            APP_VERSION: '2.2.4'
          },
          tags: ['app-user', 'download-dialog']
        }
      );
      
      console.log('[DEBUG] API - MailChimp API response:', response.id ? 'Success' : 'Failed');
      
      return res.status(200).json({
        success: true,
        message: 'Subscription successful',
        id: response.id
      });
    } catch (error) {
      console.error('[DEBUG] API - MailChimp API Error:', error.status, error.message);
      
      // Check if it's an existing member
      if (error.status === 400 && error.response && 
          error.response.body && error.response.body.title === 'Member Exists') {
        console.log('[DEBUG] API - Member already exists');
        return res.status(200).json({
          success: true,
          message: 'Member already subscribed',
          existing: true
        });
      }
      
      return res.status(500).json({
        error: 'Error subscribing to MailChimp',
        details: error.message || 'Unknown error'
      });
    }
  } catch (error) {
    console.error('[DEBUG] API - Error processing request:', error);
    return res.status(400).json({ error: 'Invalid request' });
  }
}
