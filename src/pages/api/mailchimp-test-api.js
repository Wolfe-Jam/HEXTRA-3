/**
 * MailChimp Test API Endpoint
 * 
 * This API route tests the MailChimp integration with environment variables
 */

// Next.js API route format (critical for Vercel)
export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Origin, Authorization');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  // Handle GET requests
  if (req.method === 'GET') {
    try {
      // Get MailChimp API credentials from environment variables
      const API_KEY = process.env.MAILCHIMP_API_KEY;
      const LIST_ID = process.env.MAILCHIMP_LIST_ID || '5b2a2cb0b7';
      
      // Check if API key exists
      if (!API_KEY) {
        return res.status(500).json({
          status: 'error',
          message: 'MailChimp API key not configured',
          environment: {
            NODE_ENV: process.env.NODE_ENV,
            VERCEL_ENV: process.env.VERCEL_ENV,
            hasApiKey: !!process.env.MAILCHIMP_API_KEY,
            hasListId: !!process.env.MAILCHIMP_LIST_ID
          }
        });
      }
      
      // Extract server from API key
      const API_SERVER = API_KEY.split('-')[1] || 'us21';
      
      // Create a test email
      const testEmail = `test-${Date.now()}@example.com`;
      
      // Prepare the data for the MailChimp API
      const data = {
        email_address: testEmail,
        status: 'subscribed',
        tags: ['TEST', 'API Test'],
        merge_fields: {
          SOURCE: 'API Test',
          VERSION: '1.0.0'
        }
      };
      
      // Create the endpoint URL
      const endpoint = `https://${API_SERVER}.api.mailchimp.com/3.0/lists/${LIST_ID}/members`;
      
      // Create authorization header
      const auth = Buffer.from(`anystring:${API_KEY}`).toString('base64');
      
      // Make the API request
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${auth}`
        },
        body: JSON.stringify(data)
      });
      
      // Parse the response
      const responseData = await response.json();
      
      // Return the response
      return res.status(200).json({
        status: response.status === 200 || response.status === 201 ? 'success' : 'error',
        message: response.status === 200 || response.status === 201 ? 'Email was added to the audience list!' : 'Failed to add email to the audience list',
        testEmail,
        apiDetails: {
          endpoint,
          server: API_SERVER,
          listId: LIST_ID,
          keyLength: API_KEY ? API_KEY.length : 0,
          keyFormat: API_KEY ? (API_KEY.includes('-us') ? 'valid' : 'invalid') : 'missing'
        },
        response: {
          status: response.status,
          body: responseData
        }
      });
    } catch (error) {
      return res.status(500).json({
        status: 'error',
        message: 'An error occurred while testing the MailChimp API',
        error: error.message
      });
    }
  }
  
  // Only allow GET for this test endpoint
  return res.status(405).json({
    status: 'error',
    message: 'Method not allowed'
  });
}
