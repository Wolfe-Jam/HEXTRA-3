/**
 * MailChimp Debug Component (v2.2.4)
 * 
 * Diagnostic interface for troubleshooting MailChimp integration
 * - Tests API connectivity
 * - Verifies environment variables
 * - Provides detailed error reporting
 * 
 * @version 2.2.4
 * @lastUpdated 2025-03-11
 */

import React, { useState, useEffect, Component } from 'react';
import { Box, Typography, Button, TextField, Paper, Alert, CircularProgress, Divider, Chip } from '@mui/material';

// Error boundary component to catch rendering errors
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log the error to console
    console.error('MailChimpDebug Error:', error, errorInfo);
    this.setState({ error, errorInfo });
  }

  render() {
    if (this.state.hasError) {
      // Render fallback UI
      return (
        <Box sx={{ padding: 3, margin: 3, border: '1px solid #f44336', borderRadius: 1 }}>
          <Typography variant="h5" color="error" gutterBottom>
            Something went wrong
          </Typography>
          <Alert severity="error" sx={{ marginBottom: 2 }}>
            {this.state.error?.toString() || 'An unexpected error occurred'}
          </Alert>
          <Paper 
            variant="outlined" 
            sx={{ 
              padding: 2, 
              backgroundColor: '#f5f5f5', 
              maxHeight: 300, 
              overflow: 'auto', 
              marginBottom: 2 
            }}
          >
            <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>
              {this.state.errorInfo?.componentStack || 'No component stack available'}
            </pre>
          </Paper>
          <Button 
            variant="contained" 
            color="primary" 
            onClick={() => window.location.reload()}
          >
            Reload Page
          </Button>
        </Box>
      );
    }

    return this.props.children;
  }
}

// Wrap the component with error handling
const MailChimpDebugContent = () => {
  const [email, setEmail] = useState('');
  const [configStatus, setConfigStatus] = useState(null);
  const [configLoading, setConfigLoading] = useState(false);
  const [subscribeStatus, setSubscribeStatus] = useState(null);
  const [subscribeLoading, setSubscribeLoading] = useState(false);
  const [errorDetails, setErrorDetails] = useState(null);
  const [requestLogs, setRequestLogs] = useState([]);

  // Function to check environment configuration
  const checkConfig = async () => {
    console.log('Initiating config check...');
    setConfigLoading(true);
    setConfigStatus(null);
    setErrorDetails(null);
    
    try {
      // Add timestamp to avoid caching
      const timestamp = new Date().getTime();
      const response = await fetch(`/api/mailchimp-config-check?t=${timestamp}`);
      const data = await response.json();
      setConfigStatus(data);
      addLog('Config check', data);
    } catch (error) {
      console.error('Config check error:', error);
      setErrorDetails(error.toString());
      addLog('Config check error', error.toString());
    } finally {
      setConfigLoading(false);
    }
  };

  // Function to test direct API call to MailChimp
  const testDirectAPI = async () => {
    if (!email || !email.includes('@')) {
      setErrorDetails('Please enter a valid email address');
      return;
    }

    setSubscribeLoading(true);
    setSubscribeStatus(null);
    setErrorDetails(null);
    
    try {
      // Add timestamp to avoid caching
      const timestamp = new Date().getTime();
      const response = await fetch(`/api/mailchimp-test?email=${encodeURIComponent(email)}&t=${timestamp}`);
      const data = await response.json();
      setSubscribeStatus(data);
      addLog('Direct API test', data);
    } catch (error) {
      setErrorDetails(error.toString());
      addLog('Direct API error', error.toString());
    } finally {
      setSubscribeLoading(false);
    }
  };

  // Function to test subscription
  const testSubscribe = async () => {
    if (!email || !email.includes('@')) {
      setErrorDetails('Please enter a valid email address');
      return;
    }

    setSubscribeLoading(true);
    setSubscribeStatus(null);
    setErrorDetails(null);
    
    try {
      const response = await fetch('/api/mailchimp-subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });
      
      const data = await response.json();
      setSubscribeStatus(data);
      addLog('Subscribe test', data);
    } catch (error) {
      setErrorDetails(error.toString());
      addLog('Subscribe error', error.toString());
    } finally {
      setSubscribeLoading(false);
    }
  };

  // Helper function to add log entry
  const addLog = (action, data) => {
    const entry = {
      timestamp: new Date().toISOString(),
      action,
      data: typeof data === 'object' ? JSON.stringify(data, null, 2) : data
    };
    setRequestLogs(prev => [entry, ...prev].slice(0, 10)); // Keep only the most recent 10 logs
  };

  // Load config status on mount
  useEffect(() => {
    checkConfig();
  }, []);

  // Add initial render notification
  useEffect(() => {
    console.log('MailChimpDebug component mounted');
    // Add a fallback if the automatic check fails
    setTimeout(() => {
      if (!configStatus && !configLoading && !errorDetails) {
        console.log('Fallback: No config status after timeout');
        setErrorDetails('Initial configuration check timed out. Please try checking manually.');
      }
    }, 5000);
  }, []);

  return (
    <Box sx={{ maxWidth: 900, margin: '0 auto', padding: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        MailChimp Integration Debug
      </Typography>
      
      <Typography variant="body1" paragraph>
        This page helps diagnose issues with the MailChimp integration. It tests API endpoints
        and verifies environment variables are correctly configured.
      </Typography>

      <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
        <Box sx={{ flex: '1 1 400px' }}>
          <Paper sx={{ padding: 3, marginBottom: 4 }}>
            <Typography variant="h6" gutterBottom>
              Environment Configuration
            </Typography>
            
            <Box sx={{ marginBottom: 2 }}>
              <Button 
                variant="outlined" 
                onClick={checkConfig} 
                disabled={configLoading}
                sx={{ marginRight: 2 }}
              >
                {configLoading ? <CircularProgress size={24} /> : 'Check Config'}
              </Button>
              
              {configStatus && (
                <Box sx={{ marginTop: 2 }}>
                  <Typography variant="body2" sx={{ fontWeight: 'bold', marginBottom: 1 }}>
                    MailChimp Configuration:
                  </Typography>
                  
                  {configStatus.mailchimp?.hasApiKey ? (
                    <Alert severity="success" sx={{ marginBottom: 1 }}>API Key is configured</Alert>
                  ) : (
                    <Alert severity="error" sx={{ marginBottom: 1 }}>API Key is missing</Alert>
                  )}
                  
                  {configStatus.mailchimp?.hasServerPrefix ? (
                    <Alert severity="success" sx={{ marginBottom: 1 }}>Server Prefix is configured</Alert>
                  ) : (
                    <Alert severity="error" sx={{ marginBottom: 1 }}>Server Prefix is missing</Alert>
                  )}
                  
                  {configStatus.mailchimp?.hasAudienceId ? (
                    <Alert severity="success" sx={{ marginBottom: 1 }}>Audience ID is configured</Alert>
                  ) : (
                    <Alert severity="error" sx={{ marginBottom: 1 }}>Audience ID is missing</Alert>
                  )}
                  
                  <Typography variant="body2" sx={{ marginTop: 2 }}>
                    Environment: {configStatus.environment || 'Unknown'}
                  </Typography>
                  
                  <Typography variant="body2">
                    Request Path: {configStatus.request?.path || 'Unknown'}
                  </Typography>
                </Box>
              )}
            </Box>
          </Paper>
          
          <Paper sx={{ padding: 3 }}>
            <Typography variant="h6" gutterBottom>
              Test Subscription
            </Typography>
            
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField
                label="Email Address"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                fullWidth
                placeholder="Enter a test email address"
              />
              
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Button
                  variant="contained"
                  onClick={testSubscribe}
                  disabled={subscribeLoading || !email}
                  sx={{ flex: 1 }}
                >
                  {subscribeLoading ? <CircularProgress size={24} /> : 'Test Regular Subscribe'}
                </Button>
                
                <Button
                  variant="outlined"
                  onClick={testDirectAPI}
                  disabled={subscribeLoading || !email}
                  sx={{ flex: 1 }}
                >
                  {subscribeLoading ? <CircularProgress size={24} /> : 'Test Direct API'}
                </Button>
              </Box>
              
              {subscribeStatus && (
                <Box sx={{ marginTop: 2 }}>
                  {subscribeStatus.success ? (
                    <Alert severity="success">
                      Subscription successful! {subscribeStatus.id ? `ID: ${subscribeStatus.id}` : ''}
                    </Alert>
                  ) : (
                    <Alert severity="error">
                      Subscription failed: {subscribeStatus.error || 'Unknown error'}
                    </Alert>
                  )}
                  
                  <Typography variant="body2" sx={{ marginTop: 1 }}>
                    {subscribeStatus.message || 'No message provided'}
                  </Typography>
                </Box>
              )}
              
              {errorDetails && (
                <Alert severity="error" sx={{ marginTop: 2 }}>
                  Error: {errorDetails}
                </Alert>
              )}
            </Box>
          </Paper>
        </Box>
        
        <Box sx={{ flex: '1 1 400px' }}>
          <Paper sx={{ padding: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Request Logs
            </Typography>
            
            <Box sx={{ overflowY: 'auto', maxHeight: '500px' }}>
              {requestLogs.length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                  No logs yet. Use the tools on the left to generate log entries.
                </Typography>
              ) : (
                requestLogs.map((log, index) => (
                  <Box key={index} sx={{ marginBottom: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 1 }}>
                      <Chip 
                        label={log.action} 
                        size="small" 
                        color={log.action.includes('error') ? 'error' : 'primary'} 
                      />
                      <Typography variant="caption" color="text.secondary">
                        {new Date(log.timestamp).toLocaleTimeString()}
                      </Typography>
                    </Box>
                    <Paper 
                      variant="outlined" 
                      sx={{ 
                        padding: 1.5, 
                        backgroundColor: '#f5f5f5', 
                        overflowX: 'auto', 
                        fontFamily: 'monospace',
                        fontSize: '0.85rem'
                      }}
                    >
                      <pre style={{ margin: 0 }}>{log.data}</pre>
                    </Paper>
                    {index < requestLogs.length - 1 && <Divider sx={{ marginTop: 2 }} />}
                  </Box>
                ))
              )}
            </Box>
          </Paper>
        </Box>
      </Box>
      
      <Box sx={{ marginTop: 4 }}>
        <Typography variant="caption" display="block" color="text.secondary">
          HEXTRA v2.2.4 • MailChimp Integration Debug • {new Date().toISOString().split('T')[0]}
        </Typography>
      </Box>
    </Box>
  );
};

// Wrapped component with error boundary
const MailChimpDebug = () => {
  return (
    <ErrorBoundary>
      <MailChimpDebugContent />
    </ErrorBoundary>
  );
};

export default MailChimpDebug;
