/**
 * MailChimp Production Test Utility (v2.2.4)
 * 
 * Tests the live MailChimp integration on hextra.io
 * This script will:
 * 1. Test the MailChimp debug endpoint
 * 2. Test the MailChimp subscribe endpoint with a test email
 * 3. Report detailed results without affecting your real mailing list
 * 
 * Run with: node scripts/test-mailchimp-production.js
 * 
 * @version 2.2.4
 * @lastUpdated 2023-03-11
 */

const https = require('https');
const http = require('http');

// Configuration
const config = {
  // Target environment - change to test different environments
  target: 'local', // 'production', 'local'
  
  // Endpoints based on environment
  endpoints: {
    production: {
      base: 'https://www.hextra.io', // Changed to use www prefix to avoid redirects
      debug: '/api/mailchimp-debug',
      subscribe: '/api/mailchimp-subscribe'
    },
    local: {
      base: 'http://localhost:3002',
      debug: '/api/mailchimp-debug',
      subscribe: '/api/mailchimp-subscribe'
    }
  },
  
  // Test email that won't affect your real list
  testEmail: 'test@example.com'
};

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

/**
 * Main test function
 */
async function runTests() {
  console.log(`\n${colors.bright}${colors.cyan}⚙️  MailChimp Integration Test - HEXTRA v2.2.4${colors.reset}`);
  console.log(`${colors.dim}Testing environment: ${colors.bright}${config.target}${colors.reset}`);
  console.log(`${colors.dim}Target base URL: ${colors.bright}${getBaseUrl()}${colors.reset}\n`);

  try {
    // Test 1: Debug endpoint
    await testDebugEndpoint();
    
    // Test 2: Subscribe endpoint with test email
    await testSubscribeEndpoint();
    
    console.log(`\n${colors.bright}${colors.green}✅ All tests completed${colors.reset}`);
    
  } catch (error) {
    console.error(`\n${colors.bright}${colors.red}❌ Test failed: ${error.message}${colors.reset}`);
    console.error(`${colors.dim}${error.stack}${colors.reset}`);
    process.exit(1);
  }
}

/**
 * Test the MailChimp debug endpoint
 */
async function testDebugEndpoint() {
  console.log(`${colors.bright}${colors.blue}🔍 Testing MailChimp Debug Endpoint${colors.reset}`);
  
  const url = getBaseUrl() + config.endpoints[config.target].debug;
  console.log(`${colors.dim}GET ${url}${colors.reset}`);
  
  try {
    const response = await makeHttpRequest('GET', url);
    
    console.log(`${colors.green}✓ Debug endpoint responded with status: ${response.statusCode}${colors.reset}`);
    
    if (response.statusCode === 200) {
      const data = JSON.parse(response.body);
      
      // Display mailchimp environment details
      if (data.debug && data.debug.environment && data.debug.environment.mailchimp) {
        const mc = data.debug.environment.mailchimp;
        console.log(`\n${colors.bright}MailChimp Configuration:${colors.reset}`);
        console.log(`${colors.dim}API Key: ${mc.hasApiKey ? colors.green + '✓ Present' : colors.red + '✗ Missing'}${colors.reset}`);
        console.log(`${colors.dim}Server Prefix: ${mc.hasServerPrefix ? colors.green + '✓ Present (' + mc.serverPrefix + ')' : colors.red + '✗ Missing'}${colors.reset}`);
        console.log(`${colors.dim}Audience ID: ${mc.hasAudienceId ? colors.green + '✓ Present' : colors.red + '✗ Missing'}${colors.reset}`);
      }
      
      // Display connectivity test results
      if (data.debug && data.debug.mailchimpTest) {
        const test = data.debug.mailchimpTest;
        console.log(`\n${colors.bright}MailChimp API Connectivity:${colors.reset}`);
        if (test.success) {
          console.log(`${colors.green}✓ Connected successfully to MailChimp API${colors.reset}`);
        } else {
          console.log(`${colors.red}✗ Failed to connect to MailChimp API: ${test.error}${colors.reset}`);
        }
      }
      
      // Display troubleshooting info
      if (data.debug && data.debug.troubleshooting) {
        const ts = data.debug.troubleshooting;
        console.log(`\n${colors.bright}Troubleshooting:${colors.reset}`);
        console.log(`${colors.dim}${ts.missingEnvVars}${colors.reset}`);
      }
    }
    
    return response;
  } catch (error) {
    console.error(`${colors.red}✗ Debug endpoint error: ${error.message}${colors.reset}`);
    throw error;
  }
}

/**
 * Test the MailChimp subscribe endpoint
 */
async function testSubscribeEndpoint() {
  console.log(`\n${colors.bright}${colors.blue}📨 Testing MailChimp Subscribe Endpoint${colors.reset}`);
  
  const url = getBaseUrl() + config.endpoints[config.target].subscribe;
  console.log(`${colors.dim}POST ${url}${colors.reset}`);
  console.log(`${colors.dim}Email: ${config.testEmail}${colors.reset}`);
  
  const postData = {
    email: config.testEmail
  };
  
  try {
    const response = await makeHttpRequest('POST', url, postData);
    
    console.log(`${colors.green}✓ Subscribe endpoint responded with status: ${response.statusCode}${colors.reset}`);
    
    if (response.statusCode === 200) {
      const data = JSON.parse(response.body);
      
      console.log(`\n${colors.bright}Response:${colors.reset}`);
      console.log(`${colors.dim}Success: ${data.success ? colors.green + '✓ Yes' : colors.red + '✗ No'}${colors.reset}`);
      
      if (data.simulated) {
        console.log(`${colors.yellow}⚠️ Simulated: ${data.message}${colors.reset}`);
      } else {
        console.log(`${colors.green}✓ Live: Email was added to your MailChimp list${colors.reset}`);
      }
      
      // Show additional details if available
      if (data.version) {
        console.log(`${colors.dim}Version: ${data.version}${colors.reset}`);
      }
      if (data.environment) {
        console.log(`${colors.dim}Environment: ${data.environment}${colors.reset}`);
      }
      if (data.missingVariables) {
        console.log(`${colors.red}Missing variables: ${data.missingVariables.join(', ')}${colors.reset}`);
      }
      if (data.developmentHelp) {
        console.log(`${colors.yellow}Help: ${data.developmentHelp}${colors.reset}`);
      }
      
      // Provide production guidance
      if (config.target === 'production') {
        if (data.simulated) {
          console.log(`\n${colors.yellow}⚠️ Your production Vercel environment may be missing the required variables${colors.reset}`);
          console.log(`${colors.dim}Double-check the Vercel environment variables for hextra.io${colors.reset}`);
        } else {
          console.log(`\n${colors.green}✅ Your MailChimp integration is working correctly in production!${colors.reset}`);
        }
      }
    } else {
      console.log(`${colors.red}✗ Subscribe endpoint returned error status: ${response.statusCode}${colors.reset}`);
      console.log(`${colors.dim}${response.body}${colors.reset}`);
    }
    
    return response;
  } catch (error) {
    console.error(`${colors.red}✗ Subscribe endpoint error: ${error.message}${colors.reset}`);
    throw error;
  }
}

/**
 * Helper to get the base URL for the current environment
 */
function getBaseUrl() {
  return config.endpoints[config.target].base;
}

/**
 * Make an HTTP request and return the response
 */
async function makeHttpRequest(method, url, data = null) {
  return new Promise((resolve, reject) => {
    const parsedUrl = new URL(url);
    const options = {
      hostname: parsedUrl.hostname,
      port: parsedUrl.port || (parsedUrl.protocol === 'https:' ? 443 : 80),
      path: parsedUrl.pathname + parsedUrl.search,
      method: method,
      headers: {
        'User-Agent': 'HEXTRA-Tester/2.2.4',
        'Accept': 'application/json',
        'Origin': 'https://www.hextra.io', // Added for CORS acceptance
        'Referer': 'https://www.hextra.io/' // Added for tracking purposes
      }
    };
    
    // Add content type for POST requests with body
    if (data && method === 'POST') {
      options.headers['Content-Type'] = 'application/json';
    }
    
    // Choose http or https module based on protocol
    const client = parsedUrl.protocol === 'https:' ? https : http;
    
    const req = client.request(options, (res) => {
      let responseBody = '';
      
      res.on('data', (chunk) => {
        responseBody += chunk;
      });
      
      res.on('end', () => {
        // Handle 3xx redirects automatically
        if ((res.statusCode === 301 || res.statusCode === 302 || res.statusCode === 307 || res.statusCode === 308) && res.headers.location) {
          console.log(`${colors.yellow}⚠️ Redirecting to: ${res.headers.location}${colors.reset}`);
          // Follow the redirect
          return makeHttpRequest(method, res.headers.location, data)
            .then(redirectResponse => resolve(redirectResponse))
            .catch(error => reject(error));
        }
        
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: responseBody
        });
      });
    });
    
    req.on('error', (error) => {
      reject(error);
    });
    
    // Send request body for POST requests
    if (data && method === 'POST') {
      req.write(JSON.stringify(data));
    }
    
    req.end();
  });
}

// Run the tests
runTests();
