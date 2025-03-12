/**
 * EmailCollectionDialog Component (v2.2.5)
 * 
 * Collects email from users before allowing download.
 * - Shows for non-authenticated users when downloading single images
 * - Stores email in localStorage for persistence
 * - Provides option to proceed to full authentication
 * 
 * @version 2.2.5
 * @lastUpdated 2025-03-10
 */

import React, { useState } from 'react';
import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions,
  TextField,
  Button,
  Typography,
  Box,
  Divider
} from '@mui/material';
import { useKindeAuth } from '@kinde-oss/kinde-auth-react';
import GlowButton from './GlowButton';
import GlowTextButton from './GlowTextButton';

const EmailCollectionDialog = ({ open, onClose, onSubmit }) => {
  console.log('[DEBUG] Dialog - Rendering with props:', { open });
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const { login } = useKindeAuth();

  // Email validation
  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  // Subscribe user to MailChimp and send confirmation email
  const subscribeToMailChimp = async (email) => {
    console.log(`[DEBUG] Email Capture - Subscribing email: ${email}`);
    
    try {
      // Try multiple endpoints in sequence until one works
      const endpoints = [
        '/api/email-form',     // Form-based approach (most reliable)
        '/api/email-capture',  // Simple API endpoint
        '/api/mailchimp-subscribe' // Original endpoint (least reliable)
      ];
      
      // Try each endpoint in sequence
      for (const apiUrl of endpoints) {
        console.log(`[DEBUG] Email Capture - Trying endpoint: ${apiUrl}`);
        
        try {
          // Make a simple POST request
          const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              email: email,
              source: 'EmailCollectionDialog',
              version: '2.2.5',
              timestamp: new Date().toISOString()
            })
          });
          
          console.log(`[DEBUG] Email Capture - Response status from ${apiUrl}:`, response.status);
          
          // If we get a 405 error, try the next endpoint
          if (response.status === 405) {
            console.log(`[DEBUG] Email Capture - 405 error from ${apiUrl}, trying next endpoint`);
            continue;
          }
          
          // Try to parse the response as JSON
          let data;
          try {
            data = await response.json();
          } catch (e) {
            console.error(`[DEBUG] Email Capture - Error parsing response from ${apiUrl}:`, e);
            data = { success: false, message: 'Could not parse response' };
          }
          
          console.log(`[DEBUG] Email Capture - Response data from ${apiUrl}:`, data);
          
          // If the request was successful, return true
          if (response.ok && (data.success === true || data.status === 'success')) {
            console.log(`[DEBUG] Email Capture - Subscription successful with ${apiUrl}`);
            return true;
          }
          
          // If we got a response but it wasn't successful, log the error and try the next endpoint
          console.error(`[DEBUG] Email Capture - Error from ${apiUrl}:`, data.message || 'Unknown error');
        } catch (endpointError) {
          console.error(`[DEBUG] Email Capture - Error with ${apiUrl}:`, endpointError);
          // Continue to the next endpoint
        }
      }
      
      // If we've tried all endpoints and none worked, use a fallback approach
      console.log('[DEBUG] Email Capture - All endpoints failed, using fallback');
      
      // Store the email locally even if API calls fail
      try {
        localStorage.setItem('hextra_email_backup', JSON.stringify({
          email,
          timestamp: new Date().toISOString(),
          pending: true
        }));
        console.log('[DEBUG] Email Capture - Stored email locally as fallback');
        return true; // Return true to allow the user to continue
      } catch (storageError) {
        console.error('[DEBUG] Email Capture - Failed to store email locally:', storageError);
      }
      
      // If we get here, all approaches failed
      setError('Unable to process your subscription. Please try again later.');
      return false;
    } catch (error) {
      console.error('[DEBUG] Email Capture - Exception caught:', error);
      setError('An unexpected error occurred. Please try again.');
      return false;
    }
  };

  // Handle dialog submission
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    console.log('[DEBUG] Dialog - Submit button clicked');
    // Validate email
    if (!email) {
      console.log('[DEBUG] Dialog - Email is empty');
      setError('Email is required');
      return;
    }
    
    if (!validateEmail(email)) {
      console.log('[DEBUG] Dialog - Email validation failed:', email);
      setError('Please enter a valid email address');
      return;
    }
    console.log('[DEBUG] Dialog - Email validation passed:', email);

    // Set submitting state
    setIsSubmitting(true);

    // Save email to localStorage
    try {
      localStorage.setItem('hextra_email_user', JSON.stringify({
        email,
        timestamp: Date.now()
      }));
      console.log('[DEBUG] Dialog - Saved email to localStorage');
    } catch (error) {
      console.error('[DEBUG] Dialog - Error saving to localStorage:', error);
    }

    // Subscribe to MailChimp and send confirmation email
    console.log('[DEBUG] Dialog - Calling MailChimp subscribe');
    const subscribeResult = await subscribeToMailChimp(email);
    console.log('[DEBUG] Dialog - MailChimp subscribe result:', subscribeResult);
    
    if (!subscribeResult) {
      console.log('[DEBUG] Dialog - MailChimp subscription failed, but continuing');
      // Show a message but don't block the download
      // Could add a toast notification here
    }

    // Call the onSubmit callback with the email
    console.log('[DEBUG] Dialog - Calling onSubmit callback');
    onSubmit(email);
    
    // Reset form and close dialog
    console.log('[DEBUG] Dialog - Resetting form and closing dialog');
    setEmail('');
    setError('');
    setIsSubmitting(false);
    onClose();
  };

  // Handle full authentication
  const handleAuthenticate = () => {
    console.log('[DEBUG] Dialog - Authentication requested');
    login();
    console.log('[DEBUG] Dialog - Closing dialog after auth request');
    onClose();
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      PaperProps={{
        sx: {
          maxWidth: '450px',
          borderRadius: '8px',
          bgcolor: (theme) => 
            theme.palette.mode === 'dark' ? '#1a1a1a' : '#ffffff',
          color: (theme) => 
            theme.palette.mode === 'dark' ? '#ffffff' : '#1a1a1a',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
          border: (theme) => 
            `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`
        }
      }}
    >
      <DialogTitle sx={{ 
        fontSize: '1.5rem', 
        fontWeight: 600,
        pb: 1 
      }}>
        Download Your Image
      </DialogTitle>
      
      <DialogContent>
        <Typography variant="body1" sx={{ mb: 2 }}>
          Please enter your email to download this image. We'll keep you updated with new features and improvements.
        </Typography>
        
        <TextField
          autoFocus
          margin="dense"
          label="Email Address"
          type="email"
          fullWidth
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (error) setError('');
          }}
          error={!!error}
          helperText={error}
          sx={{ mb: 2 }}
        />
        
        <Box sx={{ my: 2 }}>
          <Divider>
            <Typography variant="caption" sx={{ color: 'var(--text-secondary)' }}>
              OR
            </Typography>
          </Divider>
        </Box>
        
        <Typography variant="body2" sx={{ mb: 2, textAlign: 'center', color: 'var(--text-secondary)' }}>
          Create a free account for additional features
        </Typography>
      </DialogContent>
      
      <DialogActions sx={{ px: 3, pb: 3, display: 'flex', flexDirection: 'column', gap: 1 }}>
        <GlowTextButton 
          fullWidth 
          variant="contained" 
          onClick={handleSubmit}
          disabled={!email || isSubmitting}
        >
          {isSubmitting ? 'Submitting...' : 'Download with Email'}
        </GlowTextButton>
        
        <Button 
          fullWidth 
          variant="outlined" 
          onClick={handleAuthenticate}
          sx={{ mt: 1 }}
        >
          Sign in / Create Account
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EmailCollectionDialog;
