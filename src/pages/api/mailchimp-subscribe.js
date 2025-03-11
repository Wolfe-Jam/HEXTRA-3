/**
 * MailChimp Subscription API (v2.2.4)
 * 
 * Handles email subscription to MailChimp list
 * - Validates email format
 * - Adds users to specified MailChimp audience
 * - Provides success/error response
 * 
 * @version 2.2.4
 * @lastUpdated 2025-03-10
 */

import mailchimp from '@mailchimp/mailchimp_marketing';

// Initialize MailChimp with API key and server prefix
mailchimp.setConfig({
  apiKey: process.env.MAILCHIMP_API_KEY,
  server: process.env.MAILCHIMP_SERVER_PREFIX // e.g., "us1"
});

export default async function handler(req, res) {
  console.log('[DEBUG] API - MailChimp subscribe request received');
  
  // Only allow POST requests
  if (req.method !== 'POST') {
    console.log('[DEBUG] API - Method not allowed:', req.method);
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
    
    // Log environment variables (without revealing sensitive info)
    console.log('[DEBUG] API - Environment check:', { 
      hasApiKey: !!process.env.MAILCHIMP_API_KEY, 
      hasServerPrefix: !!process.env.MAILCHIMP_SERVER_PREFIX,
      hasAudienceId: !!process.env.MAILCHIMP_AUDIENCE_ID,
      serverPrefix: process.env.MAILCHIMP_SERVER_PREFIX
    });

    // Add member to list
    console.log('[DEBUG] API - Attempting to add to MailChimp list');
    const response = await mailchimp.lists.addListMember(
      process.env.MAILCHIMP_AUDIENCE_ID,
      {
        email_address: email,
        status: 'subscribed', // Use 'pending' if you want double opt-in
        merge_fields: {
          SOURCE: 'HEXTRA App Download',
          APP_VERSION: '2.2.4'
        },
        tags: ['app-user', 'download-dialog']
      }
    );
    
    console.log('[DEBUG] API - MailChimp API response received:', {
      id: response.id,
      status: response.status
    });

    // Return success with the ID
    return res.status(200).json({ 
      success: true, 
      id: response.id,
      message: 'Successfully subscribed to HEXTRA updates'
    });
  } catch (error) {
    console.error('[DEBUG] API - MailChimp API Error:', error);
    
    // Handle member already exists error
    if (error.status === 400 && error.response?.body?.title === 'Member Exists') {
      console.log('[DEBUG] API - Member already exists, returning success');
      return res.status(200).json({ 
        success: true, 
        message: 'You are already subscribed to our updates' 
      });
    }

    // Log details about the error
    console.error('[DEBUG] API - Error details:', {
      status: error.status,
      message: error.message,
      response: error.response?.body || 'No response body'
    });

    // Handle other errors
    return res.status(500).json({ 
      error: 'Error subscribing to newsletter',
      details: error.message || 'Unknown error'
    });
  }
}
