/**
 * MailChimp Environment Test Utility (v2.2.4)
 * 
 * A simple utility to check MailChimp environment configuration
 * Run with: node scripts/test-mailchimp-env.js
 * 
 * @version 2.2.4
 * @lastUpdated 2023-03-11
 */

// Load environment variables from .env file
require('dotenv').config();

// Import the environment checker
const { checkMailchimpEnvironment } = require('../src/api/mailchimp-env-check');

// Run the environment check
const result = checkMailchimpEnvironment();

// Exit with appropriate code
process.exit(result.ready ? 0 : 1);
