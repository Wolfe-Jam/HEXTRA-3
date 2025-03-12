/**
 * Serverless Email Capture Function (v2.2.5)
 * 
 * A standalone serverless function for email capture
 * - Deployed directly to Vercel as a serverless function
 * - Bypasses Next.js API routing entirely
 * - Maximum compatibility with Vercel's serverless environment
 * 
 * @version 2.2.5
 * @lastUpdated 2025-03-12
 */

// Export a handler function for Vercel serverless functions
module.exports = async (req, res) => {
  // Set CORS headers immediately
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // Log the request for debugging
  console.log(`[SERVERLESS] Received ${req.method} request`);
  
  // Handle OPTIONS request for CORS preflight
  if (req.method === 'OPTIONS') {
    console.log('[SERVERLESS] Handling OPTIONS request');
    return res.status(200).end();
  }
  
  // Handle GET requests (health check)
  if (req.method === 'GET') {
    console.log('[SERVERLESS] Handling GET request (health check)');
    return res.status(200).json({
      success: true,
      message: 'Serverless email capture endpoint is working',
      version: '2.2.5'
    });
  }
  
  // Handle POST requests (actual email capture)
  if (req.method === 'POST') {
    console.log('[SERVERLESS] Handling POST request');
    
    try {
      // Extract email from request body
      const { email } = req.body;
      
      if (!email) {
        console.log('[SERVERLESS] Missing email in request');
        return res.status(200).json({
          success: false,
          message: 'Email is required'
        });
      }
      
      console.log(`[SERVERLESS] Processing email: ${email}`);
      
      // In a real implementation, you would store this email
      // For now, we'll just log it and return success
      
      return res.status(200).json({
        success: true,
        message: 'Email captured successfully',
        email: email
      });
    } catch (error) {
      console.error('[SERVERLESS] Error processing request:', error);
      return res.status(200).json({
        success: false,
        message: 'An error occurred while processing your request'
      });
    }
  }
  
  // If we get here, it's a method we don't support
  console.log(`[SERVERLESS] Unsupported method: ${req.method}`);
  return res.status(200).json({
    success: false,
    message: 'Method not supported'
  });
};
