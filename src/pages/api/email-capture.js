/**
 * Email Capture API (v2.2.5)
 * 
 * A simple, dedicated endpoint for capturing emails
 * - Minimal code to reduce potential issues
 * - No dependencies on MailChimp SDK
 * - Designed to work reliably on Vercel
 * 
 * @version 2.2.5
 * @lastUpdated 2025-03-12
 */

export default async function handler(req, res) {
  // Set CORS headers first
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // Handle OPTIONS request for CORS preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(200).json({
      success: false,
      message: 'Only POST requests are allowed'
    });
  }
  
  try {
    // Get email from request body
    const { email } = req.body;
    
    if (!email) {
      return res.status(200).json({
        success: false,
        message: 'Email is required'
      });
    }
    
    // Log the email for now (we'll implement actual storage later)
    console.log(`[EMAIL-CAPTURE] Received email: ${email}`);
    
    // For now, just return success
    // In production, you would store this email or send it to MailChimp
    return res.status(200).json({
      success: true,
      message: 'Email captured successfully',
      email: email
    });
  } catch (error) {
    console.error('[EMAIL-CAPTURE] Error:', error);
    
    return res.status(200).json({
      success: false,
      message: 'An error occurred while processing your request'
    });
  }
}
