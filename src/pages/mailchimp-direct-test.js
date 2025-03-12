import React, { useState, useEffect } from 'react';
import Head from 'next/head';

export default function MailchimpDirectTest() {
  const [testEmail, setTestEmail] = useState('');
  const [results, setResults] = useState('Results will appear here...');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // Check for success parameter in URL
    if (typeof window !== 'undefined' && window.location.search.includes('mailchimp_success=true')) {
      const storedEmail = localStorage.getItem('mailchimp_test_email') || 'unknown email';
      
      setResults(`SUCCESS! Redirected back from MailChimp.\n\n
The email "${storedEmail}" was successfully submitted to MailChimp.\n
This confirms that the direct form submission approach works correctly.\n\n
You can check your MailChimp audience to verify the email was added.\n`);
      
      // Clean up the URL
      const cleanUrl = window.location.href.split('?')[0];
      window.history.replaceState({}, document.title, cleanUrl);
    }
  }, []);

  const runDirectFormTest = () => {
    setIsSubmitting(true);
    setResults('Testing direct form submission to MailChimp...\n');
    
    try {
      // Get the test email or generate a random one
      let emailToTest = testEmail.trim();
      if (!emailToTest) {
        emailToTest = `test-${Date.now()}@example.com`;
      }
      
      setResults(prev => prev + `Using test email: ${emailToTest}\n\n`);
      
      // MailChimp direct form submission configuration
      const MAILCHIMP_URL = 'https://us8.list-manage.com/subscribe/post';
      const MAILCHIMP_U = '90eafdc7bf8faf272c6e45caf'; // MailChimp user ID
      const MAILCHIMP_ID = '5b2a2cb0b7'; // MailChimp audience ID
      
      setResults(prev => prev + `Using MailChimp URL: ${MAILCHIMP_URL}\n`);
      setResults(prev => prev + `Using MailChimp user ID: ${MAILCHIMP_U}\n`);
      setResults(prev => prev + `Using MailChimp audience ID: ${MAILCHIMP_ID}\n\n`);
      
      // Success redirect URL (back to this page with a success parameter)
      const successRedirect = `${window.location.href.split('?')[0]}?mailchimp_success=true`;
      setResults(prev => prev + `Success redirect URL: ${successRedirect}\n\n`);
      
      // Create a form element
      const form = document.createElement('form');
      form.method = 'POST';
      form.action = `${MAILCHIMP_URL}?u=${MAILCHIMP_U}&id=${MAILCHIMP_ID}&success=${encodeURIComponent(successRedirect)}`;
      form.target = '_self'; // Stay in same window for redirect
      
      // Add email field
      const emailField = document.createElement('input');
      emailField.type = 'email';
      emailField.name = 'EMAIL';
      emailField.value = emailToTest;
      form.appendChild(emailField);
      
      // Add source tracking field
      const sourceField = document.createElement('input');
      sourceField.type = 'hidden';
      sourceField.name = 'SOURCE';
      sourceField.value = 'Direct Form Test Page';
      form.appendChild(sourceField);
      
      // Add anti-spam honeypot field (required by MailChimp)
      const honeypotField = document.createElement('input');
      honeypotField.type = 'text';
      honeypotField.name = `b_${MAILCHIMP_U}_${MAILCHIMP_ID}`;
      honeypotField.value = '';
      honeypotField.style.display = 'none';
      form.appendChild(honeypotField);
      
      // Add tags field
      const tagsField = document.createElement('input');
      tagsField.type = 'hidden';
      tagsField.name = 'tags';
      tagsField.value = 'TEST,DirectFormTest';
      form.appendChild(tagsField);
      
      // Add submit button (required by MailChimp)
      const submitButton = document.createElement('input');
      submitButton.type = 'submit';
      submitButton.name = 'subscribe';
      submitButton.value = 'Subscribe';
      form.appendChild(submitButton);
      
      // Add the form to the document
      document.body.appendChild(form);
      
      setResults(prev => prev + 'Form created and ready to submit. You will be redirected to MailChimp.\n');
      setResults(prev => prev + 'After submission, you should be redirected back to this page with a success parameter.\n\n');
      
      // Store the email in localStorage for verification after redirect
      localStorage.setItem('mailchimp_test_email', emailToTest);
      
      // Submit the form
      setTimeout(() => {
        setResults(prev => prev + 'Submitting form now...\n');
        form.submit();
      }, 1000);
    } catch (error) {
      setResults(prev => prev + `ERROR: ${error.message}\n`);
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ 
      fontFamily: 'Arial, sans-serif',
      maxWidth: '800px',
      margin: '0 auto',
      padding: '20px'
    }}>
      <Head>
        <title>MailChimp Direct Form Test</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <h1 style={{ color: '#333' }}>MailChimp Direct Form Test</h1>
      
      <div style={{ 
        marginBottom: '30px',
        padding: '20px',
        border: '1px solid #ddd',
        borderRadius: '5px'
      }}>
        <h2>Test Direct Form Submission</h2>
        <p>This test will submit a form directly to MailChimp's endpoint with your audience ID (5b2a2cb0b7).</p>
        
        <div>
          <label htmlFor="test-email">Email to test:</label>
          <input 
            type="email" 
            id="test-email" 
            value={testEmail}
            onChange={(e) => setTestEmail(e.target.value)}
            placeholder="Enter email or leave empty for random test email"
            style={{
              padding: '10px',
              width: '100%',
              maxWidth: '300px',
              fontSize: '16px',
              marginBottom: '15px',
              border: '1px solid #ddd',
              borderRadius: '5px'
            }}
          />
        </div>
        
        <button 
          onClick={runDirectFormTest}
          disabled={isSubmitting}
          style={{
            backgroundColor: '#0078ff',
            color: 'white',
            border: 'none',
            padding: '10px 15px',
            borderRadius: '5px',
            cursor: isSubmitting ? 'not-allowed' : 'pointer',
            fontSize: '16px',
            opacity: isSubmitting ? 0.7 : 1
          }}
        >
          {isSubmitting ? 'Testing...' : 'Run Direct Form Test'}
        </button>
        
        <div style={{
          marginTop: '20px',
          padding: '15px',
          backgroundColor: '#f5f5f5',
          borderRadius: '5px',
          whiteSpace: 'pre-wrap'
        }}>
          {results}
        </div>
      </div>
    </div>
  );
}
