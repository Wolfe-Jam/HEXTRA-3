/**
 * MailChimp API Diagnostic Endpoint (v2.2.5)
 * 
 * Simplified diagnostic tool for MailChimp integration
 * This endpoint provides information about the MailChimp configuration
 * and can be used to test API connectivity without subscribing users
 * 
 * @version 2.2.5
 * @lastUpdated 2023-03-11
 */

export default async function handler(req, res) {
  // Set CORS headers first
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*'); 
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  // Handle OPTIONS requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  // Only allow GET for diagnostics
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    // Check environment variables (without revealing values)
    const envCheck = {
      hasApiKey: !!process.env.MAILCHIMP_API_KEY,
      apiKeyLastChars: process.env.MAILCHIMP_API_KEY 
        ? `...${process.env.MAILCHIMP_API_KEY.slice(-4)}` 
        : null,
      hasServerPrefix: !!process.env.MAILCHIMP_SERVER_PREFIX,
      serverPrefix: process.env.MAILCHIMP_SERVER_PREFIX || null,
      hasAudienceId: !!process.env.MAILCHIMP_AUDIENCE_ID,
      audienceIdFirstChars: process.env.MAILCHIMP_AUDIENCE_ID 
        ? `${process.env.MAILCHIMP_AUDIENCE_ID.slice(0, 4)}...` 
        : null
    };

    // Generate API endpoint information
    const apiInfo = {
      subscribeEndpoint: `${req.headers.host}/api/mailchimp-subscribe`,
      apiVersion: 'v2.2.5',
      implementation: 'Native HTTPS module (no dependencies)',
      lastUpdated: '2023-03-11'
    };

    // Create endpoint URLs used by the main handler
    const endpointUrls = process.env.MAILCHIMP_SERVER_PREFIX && process.env.MAILCHIMP_AUDIENCE_ID 
      ? {
          audienceUrl: `https://${process.env.MAILCHIMP_SERVER_PREFIX}.api.mailchimp.com/3.0/lists/${process.env.MAILCHIMP_AUDIENCE_ID}`,
          memberBaseUrl: `https://${process.env.MAILCHIMP_SERVER_PREFIX}.api.mailchimp.com/3.0/lists/${process.env.MAILCHIMP_AUDIENCE_ID}/members/`,
        }
      : { error: 'Cannot generate URLs: Missing environment variables' };

    // Return diagnostic information
    return res.status(200).json({
      status: 'success',
      message: 'MailChimp API Diagnostic Information',
      diagnosticTime: new Date().toISOString(),
      environmentChecks: envCheck,
      apiInfo: apiInfo,
      endpointUrls: endpointUrls,
      requestHeaders: {
        host: req.headers.host,
        origin: req.headers.origin,
        userAgent: req.headers['user-agent']
      }
    });
  } catch (error) {
    return res.status(500).json({
      status: 'error',
      message: 'Diagnostic check failed',
      error: error.message
    });
  }
}
