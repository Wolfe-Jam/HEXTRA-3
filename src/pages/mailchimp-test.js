/**
 * Simple MailChimp Test Page (v2.2.5)
 * 
 * Basic page to test MailChimp connectivity
 * 
 * @version 2.2.5
 * @lastUpdated 2025-03-11
 */

import React, { useState } from 'react';

/**
 * Simple MailChimp Test Page
 */
export default function MailChimpTestPage() {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);
  const [email, setEmail] = useState('');
  
  // Run basic test
  const runBasicTest = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/test-mailchimp');
      const data = await response.json();
      setResults(data);
    } catch (err) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };
  
  // Run test with email
  const runEmailTest = async () => {
    if (!email || !email.includes('@')) {
      setError('Please enter a valid email');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/test-mailchimp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email })
      });
      const data = await response.json();
      setResults(data);
    } catch (err) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h1>MailChimp Test Page</h1>
      <p>HEXTRA version 2.2.5</p>
      
      <div style={{ marginBottom: '20px' }}>
        <input 
          type="email" 
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email for testing"
          style={{ padding: '8px', marginRight: '10px', width: '250px' }}
        />
      </div>
      
      <div style={{ marginBottom: '20px' }}>
        <button 
          onClick={runBasicTest} 
          disabled={loading}
          style={{ padding: '8px 16px', marginRight: '10px', cursor: loading ? 'not-allowed' : 'pointer' }}
        >
          {loading ? 'Running...' : 'Run Basic Test'}
        </button>
        
        <button 
          onClick={runEmailTest} 
          disabled={loading || !email || !email.includes('@')}
          style={{ padding: '8px 16px', cursor: loading ? 'not-allowed' : 'pointer' }}
        >
          {loading ? 'Running...' : 'Test with Email'}
        </button>
      </div>
      
      {error && (
        <div style={{ padding: '10px', backgroundColor: '#ffebee', color: '#d32f2f', borderRadius: '4px', marginBottom: '20px' }}>
          {error}
        </div>
      )}
      
      {results && (
        <div style={{ marginTop: '20px' }}>
          <h2>Test Results</h2>
          <div style={{ 
            padding: '10px', 
            backgroundColor: results.overallStatus === 'passed' ? '#e8f5e9' : 
                           results.overallStatus === 'partial' ? '#fff8e1' : '#ffebee', 
            borderRadius: '4px',
            marginBottom: '10px'
          }}>
            Overall Status: {results.overallStatus.toUpperCase()}
          </div>
          
          <div style={{ marginTop: '10px', marginBottom: '20px' }}>
            <h3>Environment Variables</h3>
            <pre style={{ backgroundColor: '#f5f5f5', padding: '10px', overflowX: 'auto' }}>
              {JSON.stringify(results.tests.environmentVariables, null, 2)}
            </pre>
          </div>
          
          <div style={{ marginTop: '10px', marginBottom: '20px' }}>
            <h3>API Key Check</h3>
            <pre style={{ backgroundColor: '#f5f5f5', padding: '10px', overflowX: 'auto' }}>
              {JSON.stringify(results.tests.apiKeyCheck, null, 2)}
            </pre>
          </div>
          
          <div style={{ marginTop: '10px', marginBottom: '20px' }}>
            <h3>Audience Check</h3>
            <pre style={{ backgroundColor: '#f5f5f5', padding: '10px', overflowX: 'auto' }}>
              {JSON.stringify(results.tests.audienceCheck, null, 2)}
            </pre>
          </div>
          
          <div style={{ marginTop: '10px', marginBottom: '20px' }}>
            <h3>Ping Test</h3>
            <pre style={{ backgroundColor: '#f5f5f5', padding: '10px', overflowX: 'auto' }}>
              {JSON.stringify(results.tests.pingTest, null, 2)}
            </pre>
          </div>
          
          {results.testSubscription && (
            <div style={{ marginTop: '10px', marginBottom: '20px' }}>
              <h3>Subscription Test</h3>
              <pre style={{ backgroundColor: '#f5f5f5', padding: '10px', overflowX: 'auto' }}>
                {JSON.stringify(results.testSubscription, null, 2)}
              </pre>
            </div>
          )}
          
          <p style={{ fontSize: '12px', color: '#757575', marginTop: '20px' }}>
            Test run at: {new Date(results.timestamp).toLocaleString()}
          </p>
          
          <button 
            onClick={() => setResults(null)}
            style={{ padding: '6px 12px', marginTop: '10px' }}
          >
            Clear Results
          </button>
        </div>
      )}
      
      <div style={{ marginTop: '40px', borderTop: '1px solid #eee', paddingTop: '20px' }}>
        <a href="/" style={{ color: '#2196f3', textDecoration: 'none' }}>← Back to Home</a>
      </div>
    </div>
  );
}
