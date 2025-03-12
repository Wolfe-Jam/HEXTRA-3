/**
 * MailChimp Test API (v2.2.5)
 * 
 * Simple diagnostics endpoint to test MailChimp connectivity
 * - Tests API key validity
 * - Verifies audience list access
 * - Attempts a test ping
 * 
 * @version 2.2.5
 * @lastUpdated 2025-03-12
 */

const https = require('https');

/**
 * API endpoint handler for testing MailChimp connectivity
 */
export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*'); 
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  // Handle OPTIONS request (CORS preflight)
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Allow both GET and POST for easier testing
  if (req.method !== 'GET' && req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Initialize results object
  const results = {
    timestamp: new Date().toISOString(),
    tests: {
      environmentVariables: {
        status: 'pending',
        details: {}
      },
      apiKeyCheck: {
        status: 'pending',
        details: {}
      },
      audienceCheck: {
        status: 'pending',
        details: {}
      },
      pingTest: {
        status: 'pending',
        details: {}
      }
    },
    overallStatus: 'pending',
    email: req.method === 'POST' && req.body ? req.body.email : null
  };

  try {
    // Test 1: Check environment variables
    const startEnvCheck = Date.now();
    results.tests.environmentVariables.details.startTime = startEnvCheck;
    
    const apiKey = process.env.MAILCHIMP_API_KEY;
    const server = process.env.MAILCHIMP_SERVER_PREFIX;
    const audienceId = process.env.MAILCHIMP_AUDIENCE_ID;
    
    if (!apiKey) {
      results.tests.environmentVariables.status = 'failed';
      results.tests.environmentVariables.details.error = 'MAILCHIMP_API_KEY is missing';
    } else if (!server) {
      results.tests.environmentVariables.status = 'failed';
      results.tests.environmentVariables.details.error = 'MAILCHIMP_SERVER_PREFIX is missing';
    } else if (!audienceId) {
      results.tests.environmentVariables.status = 'failed';
      results.tests.environmentVariables.details.error = 'MAILCHIMP_AUDIENCE_ID is missing';
    } else {
      results.tests.environmentVariables.status = 'passed';
      results.tests.environmentVariables.details.hasApiKey = true;
      results.tests.environmentVariables.details.hasServerPrefix = true;
      results.tests.environmentVariables.details.hasAudienceId = true;
      results.tests.environmentVariables.details.serverPrefix = server;
    }
    
    results.tests.environmentVariables.details.duration = Date.now() - startEnvCheck;
    
    // Proceed only if environment variables are valid
    if (results.tests.environmentVariables.status === 'passed') {
      // Test 2: Check API key validity
      const startApiCheck = Date.now();
      results.tests.apiKeyCheck.details.startTime = startApiCheck;
      
      try {
        const apiKeyResult = await testMailchimpApiKey(server, apiKey);
        results.tests.apiKeyCheck.status = apiKeyResult.valid ? 'passed' : 'failed';
        results.tests.apiKeyCheck.details = {
          ...apiKeyResult,
          duration: Date.now() - startApiCheck
        };
      } catch (error) {
        results.tests.apiKeyCheck.status = 'failed';
        results.tests.apiKeyCheck.details = {
          error: error.message,
          duration: Date.now() - startApiCheck
        };
      }
      
      // Test 3: Check audience list
      const startAudienceCheck = Date.now();
      results.tests.audienceCheck.details.startTime = startAudienceCheck;
      
      if (results.tests.apiKeyCheck.status === 'passed') {
        try {
          const audienceResult = await testMailchimpAudience(server, apiKey, audienceId);
          results.tests.audienceCheck.status = audienceResult.valid ? 'passed' : 'failed';
          results.tests.audienceCheck.details = {
            ...audienceResult,
            duration: Date.now() - startAudienceCheck
          };
        } catch (error) {
          results.tests.audienceCheck.status = 'failed';
          results.tests.audienceCheck.details = {
            error: error.message,
            duration: Date.now() - startAudienceCheck
          };
        }
      } else {
        results.tests.audienceCheck.status = 'skipped';
        results.tests.audienceCheck.details = {
          reason: 'API key check failed',
          duration: 0
        };
      }
      
      // Test 4: Ping test
      const startPingTest = Date.now();
      results.tests.pingTest.details.startTime = startPingTest;
      
      if (results.tests.apiKeyCheck.status === 'passed') {
        try {
          const pingResult = await testMailchimpPing(server, apiKey);
          results.tests.pingTest.status = pingResult.success ? 'passed' : 'failed';
          results.tests.pingTest.details = {
            ...pingResult,
            duration: Date.now() - startPingTest
          };
        } catch (error) {
          results.tests.pingTest.status = 'failed';
          results.tests.pingTest.details = {
            error: error.message,
            duration: Date.now() - startPingTest
          };
        }
      } else {
        results.tests.pingTest.status = 'skipped';
        results.tests.pingTest.details = {
          reason: 'API key check failed',
          duration: 0
        };
      }
    } else {
      // Skip other tests if environment variables are not set
      results.tests.apiKeyCheck.status = 'skipped';
      results.tests.apiKeyCheck.details = {
        reason: 'Environment variables check failed'
      };
      
      results.tests.audienceCheck.status = 'skipped';
      results.tests.audienceCheck.details = {
        reason: 'Environment variables check failed'
      };
      
      results.tests.pingTest.status = 'skipped';
      results.tests.pingTest.details = {
        reason: 'Environment variables check failed'
      };
    }
    
    // Set overall status
    const testStatuses = Object.values(results.tests).map(test => test.status);
    if (testStatuses.includes('failed')) {
      results.overallStatus = 'failed';
    } else if (testStatuses.includes('skipped')) {
      results.overallStatus = 'partial';
    } else {
      results.overallStatus = 'passed';
    }
    
    // If email was provided in POST request, attempt a test subscription
    if (req.method === 'POST' && req.body && req.body.email && results.tests.audienceCheck.status === 'passed') {
      const email = req.body.email;
      results.testSubscription = {
        status: 'pending',
        details: {
          email,
          startTime: Date.now()
        }
      };
      
      try {
        const subscriptionResult = await testMailchimpSubscription(server, apiKey, audienceId, email);
        results.testSubscription.status = 'completed';
        results.testSubscription.details = {
          ...results.testSubscription.details,
          ...subscriptionResult,
          duration: Date.now() - results.testSubscription.details.startTime
        };
      } catch (error) {
        results.testSubscription.status = 'failed';
        results.testSubscription.details = {
          ...results.testSubscription.details,
          error: error.message,
          duration: Date.now() - results.testSubscription.details.startTime
        };
      }
    }

    return res.status(200).json(results);
  } catch (error) {
    return res.status(500).json({
      error: 'Test execution failed',
      message: error.message,
      results: results // Return partial results
    });
  }
}

/**
 * Test MailChimp API key validity
 */
async function testMailchimpApiKey(server, apiKey) {
  return new Promise((resolve, reject) => {
    try {
      // Create authentication string
      const auth = Buffer.from(`anystring:${apiKey}`).toString('base64');
      
      // Configure request options
      const options = {
        hostname: `${server}.api.mailchimp.com`,
        path: '/3.0/',
        method: 'GET',
        headers: {
          'Authorization': `Basic ${auth}`
        }
      };
      
      // Make the request
      const req = https.request(options, (res) => {
        let data = '';
        
        res.on('data', (chunk) => {
          data += chunk;
        });
        
        res.on('end', () => {
          try {
            const response = JSON.parse(data);
            
            if (res.statusCode === 200) {
              resolve({
                valid: true,
                accountName: response.account_name,
                accountId: response.account_id,
                statusCode: res.statusCode
              });
            } else {
              resolve({
                valid: false,
                error: response.detail || 'Unknown error',
                statusCode: res.statusCode
              });
            }
          } catch (e) {
            reject(new Error(`Failed to parse MailChimp response: ${e.message}`));
          }
        });
      });
      
      req.on('error', (error) => {
        reject(error);
      });
      
      req.end();
    } catch (error) {
      reject(error);
    }
  });
}

/**
 * Test MailChimp audience access
 */
async function testMailchimpAudience(server, apiKey, audienceId) {
  return new Promise((resolve, reject) => {
    try {
      // Create authentication string
      const auth = Buffer.from(`anystring:${apiKey}`).toString('base64');
      
      // Configure request options
      const options = {
        hostname: `${server}.api.mailchimp.com`,
        path: `/3.0/lists/${audienceId}`,
        method: 'GET',
        headers: {
          'Authorization': `Basic ${auth}`
        }
      };
      
      // Make the request
      const req = https.request(options, (res) => {
        let data = '';
        
        res.on('data', (chunk) => {
          data += chunk;
        });
        
        res.on('end', () => {
          try {
            const response = JSON.parse(data);
            
            if (res.statusCode === 200) {
              resolve({
                valid: true,
                name: response.name,
                memberCount: response.stats.member_count,
                statusCode: res.statusCode
              });
            } else {
              resolve({
                valid: false,
                error: response.detail || 'Unknown error',
                statusCode: res.statusCode
              });
            }
          } catch (e) {
            reject(new Error(`Failed to parse MailChimp response: ${e.message}`));
          }
        });
      });
      
      req.on('error', (error) => {
        reject(error);
      });
      
      req.end();
    } catch (error) {
      reject(error);
    }
  });
}

/**
 * Test MailChimp ping
 */
async function testMailchimpPing(server, apiKey) {
  return new Promise((resolve, reject) => {
    try {
      // Create authentication string
      const auth = Buffer.from(`anystring:${apiKey}`).toString('base64');
      
      // Configure request options
      const options = {
        hostname: `${server}.api.mailchimp.com`,
        path: '/3.0/ping',
        method: 'GET',
        headers: {
          'Authorization': `Basic ${auth}`
        }
      };
      
      // Make the request
      const req = https.request(options, (res) => {
        let data = '';
        
        res.on('data', (chunk) => {
          data += chunk;
        });
        
        res.on('end', () => {
          try {
            const response = JSON.parse(data);
            
            if (res.statusCode === 200) {
              resolve({
                success: true,
                health_status: response.health_status || 'healthy',
                statusCode: res.statusCode
              });
            } else {
              resolve({
                success: false,
                error: response.detail || 'Unknown error',
                statusCode: res.statusCode
              });
            }
          } catch (e) {
            reject(new Error(`Failed to parse MailChimp response: ${e.message}`));
          }
        });
      });
      
      req.on('error', (error) => {
        reject(error);
      });
      
      req.end();
    } catch (error) {
      reject(error);
    }
  });
}

/**
 * Test MailChimp subscription
 */
async function testMailchimpSubscription(server, apiKey, audienceId, email) {
  return new Promise((resolve, reject) => {
    try {
      // Create authentication string
      const auth = Buffer.from(`anystring:${apiKey}`).toString('base64');
      
      // Prepare subscriber data
      const data = {
        email_address: email,
        status: 'subscribed',
        merge_fields: {
          SOURCE: 'HEXTRA Test',
          APP_VERSION: '2.2.5'
        },
        tags: ['test', 'debug']
      };
      
      const postData = JSON.stringify(data);
      
      // Configure request options
      const options = {
        hostname: `${server}.api.mailchimp.com`,
        path: `/3.0/lists/${audienceId}/members`,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${auth}`,
          'Content-Length': postData.length
        }
      };
      
      // Make the request
      const req = https.request(options, (res) => {
        let data = '';
        
        res.on('data', (chunk) => {
          data += chunk;
        });
        
        res.on('end', () => {
          try {
            const response = JSON.parse(data);
            
            if (res.statusCode === 200 || res.statusCode === 201) {
              resolve({
                success: true,
                id: response.id,
                status: response.status,
                statusCode: res.statusCode
              });
            } else if (res.statusCode === 400 && response.title === 'Member Exists') {
              resolve({
                success: true,
                alreadySubscribed: true,
                id: response.id,
                status: response.status,
                statusCode: res.statusCode,
                message: 'Email already subscribed'
              });
            } else {
              resolve({
                success: false,
                error: response.detail || 'Unknown error',
                title: response.title,
                statusCode: res.statusCode
              });
            }
          } catch (e) {
            reject(new Error(`Failed to parse MailChimp response: ${e.message}`));
          }
        });
      });
      
      req.on('error', (error) => {
        reject(error);
      });
      
      // Send the request
      req.write(postData);
      req.end();
    } catch (error) {
      reject(error);
    }
  });
}

// Export handler for compatibility with Vercel API routes
// Using export default above instead of module.exports
