/**
 * MailChimp Unified Handler (v2.2.5)
 * 
 * A simplified, unified handler for MailChimp integration
 * - Handles both direct HTTP and SDK approaches in a single file
 * - Designed for maximum Vercel compatibility
 * - Early CORS header setting to prevent preflight issues
 * - Extensive logging for production diagnosis
 * 
 * @version 2.2.5
 * @lastUpdated 2025-03-12
 */

// Import the SDK for reliable functionality
import mailchimp from '@mailchimp/mailchimp_marketing';
import crypto from 'crypto';

/**
 * Unified handler that works reliably on Vercel
 */
export default async function handler(req, res) {
  // CRITICAL: Set CORS headers immediately before any processing
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Origin, Authorization');
  
  // Handle OPTIONS requests immediately with 200 status
  if (req.method === 'OPTIONS') {
    console.log('[UNIFIED] Handling OPTIONS preflight request');
    return res.status(200).end();
  }
  
  // Log request for diagnostics
  console.log(`[UNIFIED] ${req.method} Request received:`, JSON.stringify({
    origin: req.headers.origin,
    host: req.headers.host,
    'content-type': req.headers['content-type']
  }));

  // Log all requests for diagnostics
  console.log(`[UNIFIED] ${req.method} Request to mailchimp-unified, headers:`, 
    JSON.stringify({
      origin: req.headers.origin,
      host: req.headers.host,
      'content-type': req.headers['content-type']
    })
  );
  
  // Handle OPTIONS method for CORS preflight
  if (req.method === 'OPTIONS') {
    console.log('[UNIFIED] Handling OPTIONS preflight request');
    return res.status(200).end();
  }

  // For GET requests, return a simple status check
  if (req.method === 'GET') {
    console.log('[UNIFIED] Handling GET status check');
    return res.status(200).json({
      status: 'success',
      message: 'MailChimp API endpoint is operational',
      version: '2.2.5',
      timestamp: new Date().toISOString()
    });
  }
  
  // Only allow POST for actual subscriptions
  if (req.method !== 'POST') {
    console.log(`[UNIFIED] Method ${req.method} not allowed`);
    return res.status(200).json({
      status: 'error',
      error: 'Method not allowed',
      message: 'Only POST requests are accepted for subscriptions'
    });
  }

  // Process the subscription asynchronously
  handleSubscription(req, res).catch(error => {
    console.error('[UNIFIED] Unhandled error:', error);
    res.status(500).json({
      status: 'error',
      message: 'An unexpected error occurred'
    });
  });
}

/**
 * Handles MailChimp subscription using the SDK
 */
async function handleSubscription(req, res) {
  try {
    // Extract and validate email
    if (!req.body || !req.body.email) {
      console.log('[UNIFIED] Missing email in request');
      return res.status(400).json({
        error: 'Bad request',
        message: 'Email address is required'
      });
    }

    const email = req.body.email.trim().toLowerCase();
    console.log(`[UNIFIED] Processing subscription for email: ${email}`);

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      console.log('[UNIFIED] Invalid email format');
      return res.status(400).json({
        error: 'Bad request',
        message: 'Invalid email format'
      });
    }

    // Get MailChimp configuration from production environment variables
    const apiKey = process.env.MAILCHIMP_API_KEY;
    const listId = process.env.MAILCHIMP_AUDIENCE_ID;
    const serverPrefix = process.env.MAILCHIMP_SERVER_PREFIX;

    if (!apiKey || !listId || !serverPrefix) {
      console.log('[UNIFIED] Missing MailChimp configuration');
      return res.status(500).json({
        error: 'Configuration error',
        message: 'MailChimp API not properly configured'
      });
    }

    // Configure the SDK
    mailchimp.setConfig({
      apiKey: apiKey,
      server: serverPrefix
    });

    // Hash the email for checking membership
    const subscriberHash = crypto
      .createHash('md5')
      .update(email.toLowerCase())
      .digest('hex');

    try {
      // First check if member exists
      await mailchimp.lists.getListMember(listId, subscriberHash);
      
      // Member exists
      console.log('[UNIFIED] Member already subscribed');
      return res.status(200).json({
        status: 'success',
        message: 'Email is already subscribed'
      });
    } catch (checkError) {
      // If 404, member doesn't exist
      if (checkError.status === 404) {
        // Add the member
        const memberData = {
          email_address: email,
          status: 'subscribed',
          merge_fields: {
            SOURCE: 'HEXTRA Web App v2.2.5 (HEXTRA-2025-03-12-MC2250)',
            SIGNUP_DATE: new Date().toISOString().split('T')[0]
          }
        };

        const response = await mailchimp.lists.addListMember(listId, memberData);
        
        console.log('[UNIFIED] Successfully subscribed new member');
        return res.status(200).json({
          status: 'success',
          message: 'Successfully subscribed',
          id: response.id
        });
      } else {
        // Other error
        console.error('[UNIFIED] Error checking membership:', checkError);
        throw checkError;
      }
    }
  } catch (error) {
    console.error('[UNIFIED] Error processing subscription:', error);
    
    // Always return 200 for user experience in production
    return res.status(200).json({
      status: 'error',
      message: 'We couldn\'t process your subscription at this time. Please try again later.'
    });
  }
}
