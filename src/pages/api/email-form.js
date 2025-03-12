/**
 * Email Form API (v2.2.5)
 * 
 * A simple form-based email capture endpoint
 * - Uses HTML form submission approach for maximum compatibility
 * - Minimal dependencies and code for reliability
 * - Designed to work reliably on Vercel
 * 
 * @version 2.2.5
 * @lastUpdated 2025-03-12
 */

// This is a Next.js API route handler
export default async function handler(req, res) {
  console.log(`[EMAIL-FORM] Received ${req.method} request`);
  
  // Set CORS headers immediately
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    console.log('[EMAIL-FORM] Handling OPTIONS request');
    return res.status(200).end();
  }
  
  // Handle GET requests (render form)
  if (req.method === 'GET') {
    console.log('[EMAIL-FORM] Handling GET request (form)');
    
    // Return a simple HTML form
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Email Subscription</title>
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <style>
            body { font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; }
            .form-group { margin-bottom: 15px; }
            label { display: block; margin-bottom: 5px; }
            input[type="email"] { width: 100%; padding: 8px; box-sizing: border-box; }
            button { background: #4CAF50; color: white; border: none; padding: 10px 15px; cursor: pointer; }
            .success { color: green; }
            .error { color: red; }
          </style>
        </head>
        <body>
          <h1>Subscribe to our Newsletter</h1>
          <form id="email-form" method="POST">
            <div class="form-group">
              <label for="email">Email Address:</label>
              <input type="email" id="email" name="email" required>
            </div>
            <button type="submit">Subscribe</button>
          </form>
          <div id="message"></div>
          
          <script>
            document.getElementById('email-form').addEventListener('submit', function(e) {
              e.preventDefault();
              
              const email = document.getElementById('email').value;
              const messageDiv = document.getElementById('message');
              
              fetch('/api/email-form', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email })
              })
              .then(response => response.json())
              .then(data => {
                if (data.success) {
                  messageDiv.className = 'success';
                  messageDiv.textContent = data.message;
                  document.getElementById('email').value = '';
                } else {
                  messageDiv.className = 'error';
                  messageDiv.textContent = data.message || 'An error occurred';
                }
              })
              .catch(error => {
                messageDiv.className = 'error';
                messageDiv.textContent = 'Network error. Please try again.';
                console.error('Error:', error);
              });
            });
          </script>
        </body>
      </html>
    `;
    
    res.setHeader('Content-Type', 'text/html');
    return res.status(200).send(html);
  }
  
  // Handle POST requests (form submission)
  if (req.method === 'POST') {
    console.log('[EMAIL-FORM] Handling POST request');
    
    try {
      // Extract email from request body
      const { email } = req.body;
      
      if (!email) {
        console.log('[EMAIL-FORM] Missing email in request');
        return res.status(200).json({
          success: false,
          message: 'Email is required'
        });
      }
      
      console.log(`[EMAIL-FORM] Processing email: ${email}`);
      
      // In a real implementation, you would store this email
      // For now, we'll just log it and return success
      
      return res.status(200).json({
        success: true,
        message: 'Thank you for subscribing!',
        email: email
      });
    } catch (error) {
      console.error('[EMAIL-FORM] Error processing request:', error);
      return res.status(200).json({
        success: false,
        message: 'An error occurred while processing your request'
      });
    }
  }
  
  // If we get here, it's a method we don't support
  console.log(`[EMAIL-FORM] Unsupported method: ${req.method}`);
  return res.status(200).json({
    success: false,
    message: 'Method not supported'
  });
}
