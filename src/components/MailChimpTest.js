/**
 * MailChimp Test Component (v2.2.4)
 * 
 * Simple test interface for MailChimp connectivity
 * - Tests API key and server configuration
 * - Verifies audience list access
 * - Tests ping response
 * - Tests subscription with provided email
 * 
 * @version 2.2.4
 * @lastUpdated 2025-03-11
 */

import React, { useState } from 'react';
import { 
  Box, 
  Button, 
  TextField, 
  Typography, 
  Paper, 
  CircularProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Alert,
  Divider,
  Container
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import InfoIcon from '@mui/icons-material/Info';
import HelpIcon from '@mui/icons-material/Help';
import { styled } from '@mui/system';

// Styled components for test results
const TestResultItem = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(2),
  padding: theme.spacing(1, 2),
  borderRadius: theme.shape.borderRadius,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between'
}));

const ResultIcon = ({ status }) => {
  switch (status) {
    case 'passed':
      return <CheckCircleIcon color="success" />;
    case 'failed':
      return <ErrorIcon color="error" />;
    case 'skipped':
      return <InfoIcon color="disabled" />;
    default: 
      return <HelpIcon color="disabled" />;
  }
};

/**
 * MailChimp Test Component
 */
export default function MailChimpTest() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);
  
  // Basic email validation
  const isValidEmail = (email) => {
    return email && email.includes('@') && email.includes('.');
  };
  
  // Format duration for display
  const formatDuration = (ms) => {
    return `${ms}ms`;
  };
  
  // Run basic connectivity test (no email required)
  const runBasicTest = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/test-mailchimp', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      const data = await response.json();
      setResults(data);
    } catch (err) {
      setError(err.message || 'An error occurred during the test');
    } finally {
      setLoading(false);
    }
  };
  
  // Run complete test with subscription
  const runFullTest = async () => {
    if (!isValidEmail(email)) {
      setError('Please enter a valid email address');
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
      setError(err.message || 'An error occurred during the test');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Container>
      <Box sx={{ width: '100%', py: 4 }}>
        <Typography variant="h4" gutterBottom sx={{ mb: 3, color: 'primary.main' }}>
          MailChimp Diagnostic Tools
        </Typography>
        
        <Typography variant="body1" sx={{ mb: 4, opacity: 0.8 }}>
          Use this page to test MailChimp connectivity and diagnose API issues.
        </Typography>
        
        <Paper 
          elevation={3} 
          sx={{ 
            p: 4, 
            mb: 4,
            borderRadius: 2,
            backgroundColor: theme => theme.palette.mode === 'dark' ? '#2d2d2d' : '#f8f9fa'
          }}
        >
          <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
            Test MailChimp Connection
          </Typography>
          
          <Box sx={{ mb: 3 }}>
            <TextField
              label="Email for Test Subscription"
              variant="outlined"
              fullWidth
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              helperText="Optional for basic test, required for subscription test"
              disabled={loading}
              sx={{ mb: 2 }}
            />
            
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button
                variant="outlined"
                color="primary"
                onClick={runBasicTest}
                disabled={loading}
                startIcon={loading ? <CircularProgress size={20} /> : null}
                size="large"
              >
                Run Basic Test
              </Button>
              
              <Button
                variant="contained"
                color="primary"
                onClick={runFullTest}
                disabled={loading || !isValidEmail(email)}
                startIcon={loading ? <CircularProgress size={20} /> : null}
                size="large"
              >
                Test with Subscription
              </Button>
            </Box>
          </Box>
          
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}
          
          {results && (
            <Box sx={{ mt: 4 }}>
              <Alert 
                severity={
                  results.overallStatus === 'passed' ? 'success' : 
                  results.overallStatus === 'partial' ? 'warning' : 'error'
                }
                sx={{ mb: 3 }}
              >
                <Typography variant="subtitle1">
                  {results.overallStatus === 'passed' ? 'All tests passed successfully!' : 
                  results.overallStatus === 'partial' ? 'Some tests were skipped or failed' : 
                  'Test failed - see details below'}
                </Typography>
              </Alert>
              
              <Typography variant="h6" gutterBottom>
                Test Results
              </Typography>
              
              <Box sx={{ mb: 4 }}>
                {Object.entries(results.tests).map(([testName, testResult]) => (
                  <Accordion key={testName} defaultExpanded={testResult.status === 'failed'}>
                    <AccordionSummary
                      expandIcon={<ExpandMoreIcon />}
                      aria-controls={`${testName}-content`}
                      id={`${testName}-header`}
                      sx={{
                        backgroundColor: theme => 
                          testResult.status === 'passed' ? 
                            (theme.palette.mode === 'dark' ? 'rgba(46, 125, 50, 0.2)' : 'rgba(76, 175, 80, 0.1)') : 
                          testResult.status === 'failed' ? 
                            (theme.palette.mode === 'dark' ? 'rgba(183, 28, 28, 0.2)' : 'rgba(244, 67, 54, 0.1)') : 
                            (theme.palette.mode === 'dark' ? 'rgba(66, 66, 66, 0.2)' : 'rgba(238, 238, 238, 0.5)')
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', justifyContent: 'space-between' }}>
                        <Typography>
                          {testName.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Typography variant="body2" color="text.secondary" sx={{ mr: 1 }}>
                            {testResult.status.toUpperCase()}
                          </Typography>
                          <ResultIcon status={testResult.status} />
                        </Box>
                      </Box>
                    </AccordionSummary>
                    <AccordionDetails>
                      <pre style={{ 
                        backgroundColor: 'rgba(0, 0, 0, 0.04)', 
                        padding: '16px',
                        borderRadius: '4px',
                        overflow: 'auto',
                        maxHeight: '200px' 
                      }}>
                        {JSON.stringify(testResult.details, null, 2)}
                      </pre>
                      
                      {testResult.details.duration && (
                        <Typography variant="body2" color="text.secondary" align="right">
                          Duration: {formatDuration(testResult.details.duration)}
                        </Typography>
                      )}
                    </AccordionDetails>
                  </Accordion>
                ))}
              </Box>
              
              {results.testSubscription && (
                <>
                  <Divider sx={{ mb: 3 }} />
                  <Typography variant="h6" gutterBottom>
                    Subscription Test Results
                  </Typography>
                  
                  <Accordion defaultExpanded>
                    <AccordionSummary
                      expandIcon={<ExpandMoreIcon />}
                      aria-controls="subscription-content"
                      id="subscription-header"
                      sx={{
                        backgroundColor: theme => 
                          results.testSubscription.status === 'completed' ? 
                            (results.testSubscription.details.success ? 
                              (theme.palette.mode === 'dark' ? 'rgba(46, 125, 50, 0.2)' : 'rgba(76, 175, 80, 0.1)') : 
                              (theme.palette.mode === 'dark' ? 'rgba(183, 28, 28, 0.2)' : 'rgba(244, 67, 54, 0.1)')) : 
                            (theme.palette.mode === 'dark' ? 'rgba(66, 66, 66, 0.2)' : 'rgba(238, 238, 238, 0.5)')
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', justifyContent: 'space-between' }}>
                        <Typography>
                          Email Subscription Test
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Typography variant="body2" color="text.secondary" sx={{ mr: 1 }}>
                            {results.testSubscription.status === 'completed' ? 
                              (results.testSubscription.details.success ? 'SUCCESS' : 'FAILED') : 
                              results.testSubscription.status.toUpperCase()}
                          </Typography>
                          {results.testSubscription.status === 'completed' ? 
                            (results.testSubscription.details.success ? 
                              <CheckCircleIcon color="success" /> : <ErrorIcon color="error" />) : 
                            <InfoIcon color="disabled" />}
                        </Box>
                      </Box>
                    </AccordionSummary>
                    <AccordionDetails>
                      <pre style={{ 
                        backgroundColor: 'rgba(0, 0, 0, 0.04)', 
                        padding: '16px',
                        borderRadius: '4px',
                        overflow: 'auto',
                        maxHeight: '200px' 
                      }}>
                        {JSON.stringify(results.testSubscription.details, null, 2)}
                      </pre>
                      
                      {results.testSubscription.details.alreadySubscribed && (
                        <Alert severity="info" sx={{ mt: 2 }}>
                          This email is already subscribed to the list.
                        </Alert>
                      )}
                      
                      {results.testSubscription.details.duration && (
                        <Typography variant="body2" color="text.secondary" align="right">
                          Duration: {formatDuration(results.testSubscription.details.duration)}
                        </Typography>
                      )}
                    </AccordionDetails>
                  </Accordion>
                </>
              )}
              
              <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="caption" color="text.secondary">
                  Test executed at: {new Date(results.timestamp).toLocaleString()}
                </Typography>
                <Button size="small" onClick={() => setResults(null)}>
                  Clear Results
                </Button>
              </Box>
            </Box>
          )}
        </Paper>
      </Box>
    </Container>
  );
}
