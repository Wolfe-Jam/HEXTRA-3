import React from 'react';
import { Button, Typography, Box, Paper } from '@mui/material';
import EmailCapture from '../components/EmailCapture';
import useEmailCapture from '../hooks/useEmailCapture';

/**
 * Demo page showing how to use the EmailCapture component
 */
const EmailCaptureDemo = () => {
  const { 
    dialogOpen, 
    setDialogOpen, 
    promptForEmail, 
    handleEmailSubmitted,
    hasSubmittedEmail
  } = useEmailCapture();

  const handleDownloadClick = () => {
    // If promptForEmail returns false, it means we should proceed with download
    // (user is authenticated or has already submitted email)
    if (!promptForEmail()) {
      // Proceed with download
      simulateDownload();
    }
    // Otherwise, the dialog will open and download will happen after email submission
  };

  const simulateDownload = () => {
    alert('Download started!');
    // Actual download code would go here
  };

  return (
    <Box sx={{ p: 4 }}>
      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Email Capture Demo
        </Typography>
        
        <Typography paragraph>
          This page demonstrates how to use the EmailCapture component to collect emails
          before allowing downloads.
        </Typography>
        
        <Typography paragraph>
          {hasSubmittedEmail() 
            ? 'You have already submitted your email. Downloads will proceed without prompting.' 
            : 'You will be prompted for your email before downloading.'}
        </Typography>

        <Box sx={{ mt: 3 }}>
          <Button 
            variant="contained" 
            color="primary"
            onClick={handleDownloadClick}
          >
            Download File
          </Button>
          
          <Button 
            variant="outlined" 
            color="secondary"
            onClick={() => setDialogOpen(true)}
            sx={{ ml: 2 }}
          >
            Open Email Dialog Manually
          </Button>
        </Box>
      </Paper>

      <Paper sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>
          Integration Instructions
        </Typography>
        
        <Typography component="div">
          <ol>
            <li>Import the EmailCapture component and useEmailCapture hook</li>
            <li>Use the hook to manage dialog state</li>
            <li>Call promptForEmail() before starting a download</li>
            <li>If promptForEmail() returns false, proceed with download</li>
            <li>If it returns true, the dialog will handle the rest</li>
          </ol>
        </Typography>
      </Paper>

      {/* Email Capture Dialog */}
      <EmailCapture 
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onSubmit={handleEmailSubmitted}
      />
    </Box>
  );
};

export default EmailCaptureDemo;
