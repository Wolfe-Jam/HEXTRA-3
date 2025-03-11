/**
 * MailChimp Environment Checker (v2.2.4)
 * 
 * Simplified utility to check MailChimp environment variables
 * - Checks for presence of required environment variables
 * - Does not expose sensitive values
 * - For development and diagnostic use only
 * 
 * @version 2.2.4
 * @lastUpdated 2023-03-11
 */

/**
 * Simple check of MailChimp environment variables
 * Intended for direct use, not as an API endpoint
 */
function checkMailchimpEnvironment() {
  console.log('\n🔍 MailChimp Environment Variable Check');
  console.log('=======================================');
  
  // Check each required environment variable
  const variables = {
    MAILCHIMP_API_KEY: process.env.MAILCHIMP_API_KEY,
    MAILCHIMP_SERVER_PREFIX: process.env.MAILCHIMP_SERVER_PREFIX,
    MAILCHIMP_AUDIENCE_ID: process.env.MAILCHIMP_AUDIENCE_ID
  };
  
  // Check and log status of each variable (without revealing values)
  for (const [name, value] of Object.entries(variables)) {
    const status = value ? '✅ SET' : '❌ MISSING';
    let displayValue = 'Not Set';
    
    if (value) {
      if (name === 'MAILCHIMP_API_KEY') {
        // Show last 4 characters only
        displayValue = `...${value.slice(-4)}`;
      } else if (name === 'MAILCHIMP_SERVER_PREFIX') {
        // Show full prefix as it's not sensitive
        displayValue = value;
      } else if (name === 'MAILCHIMP_AUDIENCE_ID') {
        // Show first 4 characters
        displayValue = `${value.slice(0, 4)}...`;
      }
    }
    
    console.log(`${name}: ${status} (${displayValue})`);
  }
  
  // Check if all required variables are present
  const allSet = Object.values(variables).every(Boolean);
  console.log('\nOverall Status: ' + (allSet ? '✅ Ready to use' : '❌ Configuration incomplete'));
  
  if (!allSet) {
    console.log('\n📝 How to Fix:');
    console.log('1. Create a .env file in the project root');
    console.log('2. Add the following variables to your .env file:');
    console.log(`
# MailChimp API Configuration
MAILCHIMP_API_KEY=your_api_key_here
MAILCHIMP_SERVER_PREFIX=your_server_prefix_here
MAILCHIMP_AUDIENCE_ID=your_audience_id_here
    `);
    console.log('3. Restart your server after updating the .env file');
    console.log('\n📌 Where to find these values:');
    console.log('- API Key: Log in to MailChimp → Account → Extras → API Keys');
    console.log('- Server Prefix: The "usX" part from your MailChimp API endpoint URL');
    console.log('- Audience ID: Log in to MailChimp → Audience → Settings → Audience name and defaults');
  }
  
  console.log('\n=======================================\n');
  
  return {
    ready: allSet,
    variables: {
      hasApiKey: !!variables.MAILCHIMP_API_KEY,
      hasServerPrefix: !!variables.MAILCHIMP_SERVER_PREFIX,
      hasAudienceId: !!variables.MAILCHIMP_AUDIENCE_ID
    }
  };
}

// Export the function
module.exports = { checkMailchimpEnvironment };
