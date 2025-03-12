/**
 * MailChimp Subscription API using Official SDK (v2.2.5)
 * 
 * Next.js API route that imports and wraps the SDK handler
 * 
 * @version 2.2.5
 * @lastUpdated 2025-03-12
 */

// Import the handler from the shared SDK implementation
const handler = require('../../api/mailchimp-sdk');

// Export the handler for Next.js API routes
module.exports = handler;
