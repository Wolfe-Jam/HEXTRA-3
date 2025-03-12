/**
 * MailChimp Configuration Diagnostic (v2.2.5)
 * 
 * API endpoint to verify MailChimp environment variables
 * - Checks the presence of required environment variables
 * - Returns only boolean flags (not actual values) for security
 * - Helps troubleshoot MailChimp integration issues
 * 
 * @version 2.2.5
 * @lastUpdated 2025-03-11
 */

/**
 * Handles request to check MailChimp configuration
 */
const handler = (req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*'); 
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  console.log('[DEBUG] Configuration check request received');

  try {
    // Collect environment variable status (presence only, not values)
    const configStatus = {
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'not set',
      mailchimp: {
        hasApiKey: !!process.env.MAILCHIMP_API_KEY,
        hasServerPrefix: !!process.env.MAILCHIMP_SERVER_PREFIX,
        hasAudienceId: !!process.env.MAILCHIMP_AUDIENCE_ID,
      },
      // Include path info to help debug routing issues
      request: {
        path: req.url,
        method: req.method,
      },
      // Include a sample of other environment variables (non-sensitive)
      // to check if environment variables are loading at all
      otherEnvVars: {
        hasNodeEnv: !!process.env.NODE_ENV,
        hasPort: !!process.env.PORT,
      }
    };
    
    // Log the status (without sensitive values)
    console.log('[DEBUG] Environment status:', JSON.stringify(configStatus));
    
    // Return diagnostic information
    return res.json(configStatus);
  } catch (error) {
    // Log the error
    console.error('[DEBUG] Configuration check error:', error.message);
    
    // Return error response
    return res.status(500).json({ 
      error: 'Error checking configuration',
      message: error.message
    });
  }
};

module.exports = { handler };
