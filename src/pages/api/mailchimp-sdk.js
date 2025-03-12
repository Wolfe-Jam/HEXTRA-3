/**
 * MailChimp Subscription API using Official SDK (v2.2.5)
 * 
 * Direct API handler for Vercel serverless functions
 * - Handles CORS properly for production domains
 * - Properly handles OPTIONS preflight requests
 * - Uses official SDK for reliable subscription
 * 
 * @version 2.2.5
 * @lastUpdated 2025-03-12
 */

// Import the official MailChimp marketing SDK
const mailchimp = require('@mailchimp/mailchimp_marketing');
const crypto = require('crypto');

/**
 * Handles request for MailChimp subscription
 */
async function handler(req, res) {
  // Critical: Set CORS headers first, before any processing
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*'); 
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');
  
  // Handle OPTIONS method for CORS preflight
  if (req.method === 'OPTIONS') {
    console.log('[SDK-DIRECT] Handling OPTIONS preflight request');
    return res.status(200).end();
  }
  
  // Only allow POST requests for this endpoint
  if (req.method !== 'POST') {
    console.log(`[SDK-DIRECT] Error: Method ${req.method} not allowed`);
    return res.status(405).json({ 
      error: 'Method not allowed',
      message: 'Only POST requests are accepted for this endpoint'
    });
  }
  
  // Extract email from request body
  if (!req.body || !req.body.email) {
    console.log('[SDK-DIRECT] Error: Missing email in request');
    return res.status(400).json({ 
      error: 'Bad request',
      message: 'Email address is required'
    });
  }
  
  const email = req.body.email.trim().toLowerCase();
  
  // Basic email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    console.log('[SDK-DIRECT] Error: Invalid email format');
    return res.status(400).json({ 
      error: 'Bad request',
      message: 'Invalid email format'
    });
  }
  
  console.log(`[SDK-DIRECT] Processing subscription for: ${email}`);
  
  try {
    // Get MailChimp API settings from environment
    const apiKey = process.env.REACT_APP_MAILCHIMP_API_KEY;
    const listId = process.env.REACT_APP_MAILCHIMP_LIST_ID;
    const serverPrefix = apiKey ? apiKey.split('-')[1] : null;
    
    // Verify MailChimp configuration
    if (!apiKey || !listId || !serverPrefix) {
      console.log('[SDK-DIRECT] Error: Missing MailChimp configuration');
      return res.status(500).json({ 
        error: 'Configuration error',
        message: 'MailChimp API not properly configured'
      });
    }
    
    // Configure the MailChimp SDK client
    mailchimp.setConfig({
      apiKey: apiKey,
      server: serverPrefix
    });
    
    // Generate the MD5 hash of the lowercase email address
    const subscriberHash = crypto
      .createHash('md5')
      .update(email.toLowerCase())
      .digest('hex');
    
    try {
      // First try to check if member exists (more reliable than catching 400 errors)
      console.log('[SDK-DIRECT] Checking if member exists');
      await mailchimp.lists.getListMember(listId, subscriberHash);
      
      // If we get here, the member already exists
      console.log('[SDK-DIRECT] Member already exists, returning success');
      return res.status(200).json({
        status: 'success',
        message: 'Email is already subscribed'
      });
    } catch (checkError) {
      // If the error is 404, the member doesn't exist and we can add them
      if (checkError.status === 404) {
        console.log('[SDK-DIRECT] Member does not exist, adding to list');
        
        // Define member data
        const memberData = {
          email_address: email,
          status: 'subscribed',
          merge_fields: {
            SOURCE: 'HEXTRA Web App v2.2.5'
          }
        };
        
        // Add the member to the list
        const response = await mailchimp.lists.addListMember(listId, memberData);
        
        console.log('[SDK-DIRECT] Successfully added member to list');
        return res.status(200).json({
          status: 'success',
          message: 'Email successfully subscribed',
          id: response.id
        });
      } else {
        // Handle other errors from the check
        console.error('[SDK-DIRECT] Error checking member:', checkError.message);
        throw checkError;
      }
    }
  } catch (error) {
    console.error('[SDK-DIRECT] MailChimp API error:', error.message || 'Unknown error');
    
    // For Vercel production, we want to provide a user-friendly message
    // while still returning a 200 status to not disrupt the user experience
    return res.status(200).json({
      status: 'error',
      message: 'We couldn\'t subscribe you at this time. Please try again later.'
    });
  }
}

module.exports = handler;
