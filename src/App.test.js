import React, { useState } from 'react';
import { Box, Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography, TextField, Snackbar } from '@mui/material';

function App() {
  const [showEmailDialog, setShowEmailDialog] = useState(false);
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [emailSubmitting, setEmailSubmitting] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  const handleEmailSubmit = async () => {
    // Validate email
    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      setEmailError('Please enter a valid email address');
      return;
    }
    
    setEmailSubmitting(true);
    
    try {
      // Store email in database or send to your backend
      const response = await fetch('/api/store-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });
      
      if (response.ok) {
        // Close dialog and proceed with download
        setShowEmailDialog(false);
        
        // Optional: Show a success message
        setSnackbarMessage('Thank you! Your email has been submitted.');
        setSnackbarOpen(true);
      } else {
        setEmailError('Failed to submit email. Please try again.');
      }
    } catch (error) {
      console.error('Error submitting email:', error);
      setEmailError('An error occurred. Please try again.');
    } finally {
      setEmailSubmitting(false);
    }
  };

  return (
    <Box>
      <Button onClick={() => setShowEmailDialog(true)}>
        Open Email Dialog
      </Button>

      {/* Email capture dialog */}
      <Dialog 
        open={showEmailDialog} 
        onClose={() => setShowEmailDialog(false)}
      >
        <DialogTitle>
          Enter your email to download
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 2 }}>
            Please provide your email address to download your image.
          </Typography>
          <TextField
            autoFocus
            margin="dense"
            label="Email Address"
            type="email"
            fullWidth
            variant="outlined"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setEmailError('');
            }}
            error={!!emailError}
            helperText={emailError}
          />
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setShowEmailDialog(false)}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleEmailSubmit}
            disabled={emailSubmitting}
          >
            {emailSubmitting ? 'Submitting...' : 'Download'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={() => setSnackbarOpen(false)}
        message={snackbarMessage}
      />
    </Box>
  );
}

export default App;
