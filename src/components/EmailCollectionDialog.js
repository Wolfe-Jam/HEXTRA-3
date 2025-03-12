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
import DirectEmailCapture from './DirectEmailCapture';

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

  // Subscribe user to MailChimp and send confirmation email using a direct approach
  const subscribeToMailChimp = async (email) => {
    console.log(`[DEBUG] Email Capture - Subscribing email: ${email}`);
    
    try {
      // Store the email locally first as a backup
      try {
        localStorage.setItem('hextra_email_backup', JSON.stringify({
          email,
          timestamp: new Date().toISOString(),
          pending: true
        }));
        console.log('[DEBUG] Email Capture - Stored email locally as backup');
      } catch (storageError) {
        console.error('[DEBUG] Email Capture - Failed to store email locally:', storageError);
      }
      
      // Try our cascade of MailChimp API endpoints
      // This approach tries multiple endpoints in sequence until one succeeds
      console.log('[DEBUG] Email Capture - Trying MailChimp API endpoints');
      
      // Use relative paths to avoid cross-origin issues
      const endpoints = [
        '/api/mailchimp-direct',
        '/api/mailchimp-unified',
        '/api/mailchimp-subscribe'
      ];
      
      let apiSuccess = false;
      
      for (const endpoint of endpoints) {
        if (apiSuccess) break;
        
        try {
          console.log(`[DEBUG] Email Capture - Trying endpoint: ${endpoint}`);
          
          // Use relative paths with same-origin credentials
          const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json',
              'Origin': window.location.origin
            },
            body: JSON.stringify({
              email: email,
              source: 'EmailCollectionDialog',
              version: '2.2.5',
              timestamp: new Date().toISOString()
            }),
            credentials: 'same-origin',
            mode: 'cors' // Explicitly set CORS mode
          });
          
          console.log(`[DEBUG] Email Capture - ${endpoint} response status:`, response.status);
          
          if (response.ok) {
            try {
              const data = await response.json();
              console.log(`[DEBUG] Email Capture - ${endpoint} success:`, data);
              apiSuccess = true;
              return true;
            } catch (jsonError) {
              console.error(`[DEBUG] Email Capture - ${endpoint} JSON parse error:`, jsonError);
            }
          }
        } catch (apiError) {
          console.error(`[DEBUG] Email Capture - ${endpoint} error:`, apiError);
        }
      }
      
      if (apiSuccess) {
        console.log('[DEBUG] Email Capture - API submission successful');
        return true;
      }
      
      console.error('[DEBUG] Email Capture - All API endpoints failed');
      
      
      // If Formspree fails, try a simple image pixel tracking as fallback
      // This is a very basic method but works in almost all environments
      console.log('[DEBUG] Email Capture - Trying pixel tracking fallback');
      
      try {
        const trackingPixel = new Image();
        trackingPixel.src = `https://www.hextra.io/pixel.gif?email=${encodeURIComponent(email)}&t=${Date.now()}`;
        console.log('[DEBUG] Email Capture - Tracking pixel sent');
      } catch (pixelError) {
        console.error('[DEBUG] Email Capture - Pixel tracking error:', pixelError);
      }
      
      // Even if all our approaches fail, we've stored the email locally
      // So we'll return true to allow the user to continue
      return true;
    } catch (error) {
      console.error('[DEBUG] Email Capture - Exception caught:', error);
      // Don't block the user experience if subscription fails
      return true;
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
