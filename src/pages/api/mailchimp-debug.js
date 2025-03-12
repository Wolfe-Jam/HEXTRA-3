/**
 * MailChimp Debug Endpoint (v2.2.5)
 * 
 * Diagnostic endpoint for production troubleshooting
 * - Returns complete environment details (safely)
 * - Reports HTTP request details for debugging
 * - Tests connectivity to MailChimp API
 * 
 * @version 2.2.5
 * @lastUpdated 2025-03-11
 */

const https = require('https');
const crypto = require('crypto');
const { URL } = require('url');

/**
 * Handler function for MailChimp debugging
 */
export default async function handler(req, res) {
  // Set CORS headers - critical for hextra.io
  const allowedOrigins = ['https://hextra.io', 'https://www.hextra.io', 'http://localhost:3000', 'http://localhost:3001', 'http://localhost:3002'];
  const origin = req.headers.origin;
  
  if (origin && allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  } else {
    res.setHeader('Access-Control-Allow-Origin', '*');
  }
  
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  // Only allow GET for this endpoint
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed', message: 'Only GET requests are supported' });
  }
  
  try {
    console.log('[DEBUG] MailChimp debug request received');
    
    // Collect all relevant debug information
    const debugInfo = {
      timestamp: new Date().toISOString(),
      version: '2.2.5',
      
      // Request information
      request: {
        method: req.method,
        url: req.url,
        path: req.path,
        host: req.headers.host,
        origin: req.headers.origin || 'unknown',
        referer: req.headers.referer || 'unknown',
        userAgent: req.headers['user-agent'] || 'unknown'
      },
      
      // Environment information (safely without exposing secrets)
      environment: {
        nodeEnv: process.env.NODE_ENV || 'not set',
        isVercel: !!process.env.VERCEL,
        vercelEnv: process.env.VERCEL_ENV || 'not set',
        vercelRegion: process.env.VERCEL_REGION || 'not set',
        
        // MailChimp configuration
        mailchimp: {
          hasApiKey: !!process.env.MAILCHIMP_API_KEY,
          apiKeyLastChars: process.env.MAILCHIMP_API_KEY ? `...${process.env.MAILCHIMP_API_KEY.slice(-4)}` : null,
          hasServerPrefix: !!process.env.MAILCHIMP_SERVER_PREFIX,
          serverPrefix: process.env.MAILCHIMP_SERVER_PREFIX || null,
          hasAudienceId: !!process.env.MAILCHIMP_AUDIENCE_ID,
          audienceIdFirstChars: process.env.MAILCHIMP_AUDIENCE_ID ? `${process.env.MAILCHIMP_AUDIENCE_ID.slice(0, 4)}...` : null
        }
      },
      
      // API endpoints for testing
      endpoints: {
        subscribeEndpoint: `${req.headers.host}/api/mailchimp-subscribe`,
        diagnosticEndpoint: `${req.headers.host}/api/mailchimp-debug`
      }
    };
    
    // Add expected URLs for MailChimp API calls
    if (process.env.MAILCHIMP_SERVER_PREFIX && process.env.MAILCHIMP_AUDIENCE_ID) {
      debugInfo.mailchimpUrls = {
        apiBase: `https://${process.env.MAILCHIMP_SERVER_PREFIX}.api.mailchimp.com/3.0/`,
        audienceUrl: `https://${process.env.MAILCHIMP_SERVER_PREFIX}.api.mailchimp.com/3.0/lists/${process.env.MAILCHIMP_AUDIENCE_ID}`,
        memberExampleUrl: `https://${process.env.MAILCHIMP_SERVER_PREFIX}.api.mailchimp.com/3.0/lists/${process.env.MAILCHIMP_AUDIENCE_ID}/members/HASH`
      };
    }
    
    // Create instructions for fixing common problems
    debugInfo.troubleshooting = {
      missingEnvVars: !process.env.MAILCHIMP_API_KEY || !process.env.MAILCHIMP_SERVER_PREFIX || !process.env.MAILCHIMP_AUDIENCE_ID 
        ? 'Environment variables are missing. Check Vercel configuration.' 
        : 'All environment variables are set properly.',
      apiEndpoint: 'If subscription is failing, check that the frontend is calling /api/mailchimp-subscribe with a POST request',
      commonIssues: [
        'MailChimp variables must be set in Vercel project settings',
        'API calls must use POST method with Content-Type: application/json',
        'Email must be sent in the request body as {email: "user@example.com"}',
        'Frontend must handle CORS properly by using relative URLs (/api/mailchimp-subscribe)',
        'Network requests must include credentials: "same-origin"'
      ]
    };
    
    // Test connectivity to MailChimp API if all variables are available
    if (process.env.MAILCHIMP_API_KEY && process.env.MAILCHIMP_SERVER_PREFIX) {
      // Add a ping test to check API connectivity
      testMailchimpPing(
        process.env.MAILCHIMP_SERVER_PREFIX,
        process.env.MAILCHIMP_API_KEY
      ).then(pingResult => {
        debugInfo.mailchimpTest = pingResult;
        return res.json({
          message: 'MailChimp API Debug Information',
          debug: debugInfo
        });
      }).catch(error => {
        debugInfo.mailchimpTest = {
          success: false,
          error: error.message
        };
        return res.json({
          message: 'MailChimp API Debug Information (API test failed)',
          debug: debugInfo
        });
      });
    } else {
      // Can't test without API credentials
      debugInfo.mailchimpTest = {
        success: false,
        error: 'Missing required MailChimp credentials'
      };
      
      return res.json({
        message: 'MailChimp API Debug Information (missing credentials)',
        debug: debugInfo
      });
    }
  } catch (error) {
    console.error('[DEBUG] Error in mailchimp-debug:', error);
    return res.status(500).json({
      error: 'Error generating debug information',
      message: error.message
    });
  }
}

/**
 * Test connectivity to MailChimp API
 */
async function testMailchimpPing(server, apiKey) {
  try {
    const url = `https://${server}.api.mailchimp.com/3.0/ping`;
    
    // Make a simple ping request to test connectivity
    return await makeApiRequest('GET', url, null, apiKey);
  } catch (error) {
    console.error('[DEBUG] MailChimp ping test failed:', error);
    throw error;
  }
}

/**
 * Make a request to the MailChimp API
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
            resolve({
              success: true,
              statusCode: res.statusCode,
              data: response
            });
            
          } catch (parseError) {
            // Handle JSON parsing errors
            console.error('[DEBUG] Failed to parse MailChimp response:', parseError.message);
            
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

// Export handler for CommonJS compatibility
// Using export default above instead of module.exports
