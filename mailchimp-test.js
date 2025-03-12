/**
 * MailChimp API Test Script
 * 
 * This script tests the MailChimp API integration with the correct audience ID
 * It attempts to add a test email to the specified audience list
 */

// Import required modules
const fetch = require('node-fetch');
const crypto = require('crypto');

// MailChimp API credentials
// Note: This should be your actual API key, not the user ID
const API_KEY = process.env.MAILCHIMP_API_KEY || 'your-api-key-here';
const LIST_ID = '5b2a2cb0b7'; // This is correct
const API_SERVER = 'us8'; // Updated to correct server

// Test email
const testEmail = `test-${Date.now()}@example.com`;

// Function to add a member to the audience
async function addMemberToAudience() {
  console.log(`Testing MailChimp API integration with audience ID: ${LIST_ID}`);
  console.log(`Adding test email: ${testEmail}`);
  
  try {
    // Prepare the data for the MailChimp API
    const data = {
      email_address: testEmail,
      status: 'subscribed',
      tags: ['TEST', 'API Test'],
      merge_fields: {
        SOURCE: 'API Test Script',
        VERSION: '1.0.0'
      }
    };
    
    // Create the endpoint URL
    const endpoint = `https://${API_SERVER}.api.mailchimp.com/3.0/lists/${LIST_ID}/members`;
    console.log(`API Endpoint: ${endpoint}`);
    
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
    
    // Log the response
    console.log(`Response Status: ${response.status}`);
    console.log('Response Body:', JSON.stringify(responseData, null, 2));
    
    if (response.status === 200 || response.status === 201) {
      console.log('SUCCESS: Email was added to the audience list!');
    } else {
      console.error('ERROR: Failed to add email to the audience list');
      
      // Check for specific error conditions
      if (response.status === 400 && responseData.title === 'Member Exists') {
        console.log('Member already exists, trying to update...');
        
        // Create MD5 hash of the lowercase email address for the member ID
        const emailHash = crypto.createHash('md5').update(testEmail.toLowerCase()).digest('hex');
        console.log(`Email hash for update: ${emailHash}`);
        
        // Update existing member
        const updateEndpoint = `https://${API_SERVER}.api.mailchimp.com/3.0/lists/${LIST_ID}/members/${emailHash}`;
        console.log(`Update endpoint: ${updateEndpoint}`);
        
        const updateResponse = await fetch(updateEndpoint, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Basic ${auth}`
          },
          body: JSON.stringify({
            status: 'subscribed',
            tags: ['TEST', 'API Test'],
            merge_fields: {
              SOURCE: 'API Test Script',
              VERSION: '1.0.0'
            }
          })
        });
        
        const updateResult = await updateResponse.json();
        console.log(`Update Response Status: ${updateResponse.status}`);
        console.log('Update Response Body:', JSON.stringify(updateResult, null, 2));
        
        if (updateResponse.status === 200) {
          console.log('SUCCESS: Existing member was updated!');
        } else {
          console.error('ERROR: Failed to update existing member');
        }
      }
    }
  } catch (error) {
    console.error('Exception in MailChimp API test:', error);
  }
}

// Run the test
addMemberToAudience();
