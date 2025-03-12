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
    console.log(`[DEBUG] MailChimp - Subscribing email to MailChimp: ${email}`);
    
    try {
      // Use a relative URL to ensure same-origin request
      // This will always use the current domain, whether hextra.io or elsewhere
      // Using the unified MailChimp endpoint for maximum Vercel compatibility
      const apiUrl = '/api/mailchimp-unified';
      
      console.log(`[DEBUG] MailChimp - Current origin:`, window.location.origin);
      console.log(`[DEBUG] MailChimp - Making API request to ${apiUrl}`);
      
      // First check if the API is available with a GET request
      const checkResponse = await fetch(`${apiUrl}?check=true`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Origin': window.location.origin
        },
        credentials: 'same-origin'
      });
      
      console.log('[DEBUG] MailChimp - API check status:', checkResponse.status);
      
      // Now make the actual subscription request
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Origin': window.location.origin
        },
        body: JSON.stringify({
          email: email
        }),
        credentials: 'same-origin'
      });
      
      console.log('[DEBUG] MailChimp - Response status:', response.status);
    
      // Handle non-JSON responses
      let data;
      try {
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          data = await response.json();
        } else {
          const textData = await response.text();
          console.log('[DEBUG] MailChimp - Response text:', textData);
          data = { message: textData };
        }
      } catch (parseError) {
        console.error('[DEBUG] MailChimp - Error parsing response:', parseError);
        data = { error: 'Could not parse response' };
      }
      
      console.log('[DEBUG] MailChimp - Response data:', data);
      
      // Even if response is not OK, we'll still try to process it
      // This is because our API now returns 200 for most errors for better UX
      if (!response.ok && response.status !== 200) {
        console.error('[DEBUG] MailChimp - Subscription error:', data.error || 'Unknown error');
        console.error('[DEBUG] MailChimp - Status code:', response.status);
        console.error('[DEBUG] MailChimp - Status text:', response.statusText);
        
        if (response.status === 405) {
          console.error('[DEBUG] MailChimp - CORS issue detected. Check API route configuration.');
        }
        
        setError('Failed to subscribe. Please try again later.');
        return false;
      }
      
      // Check the status field in the response
      if (data.status === 'error') {
        console.error('[DEBUG] MailChimp - API reported error:', data.message);
        setError(data.message || 'Failed to subscribe. Please try again later.');
        return false;
      }
      
      console.log('[DEBUG] MailChimp - Subscription successful:', data.message);
      return true;
    } catch (error) {
      console.error('[DEBUG] MailChimp - Failed to subscribe:', error);
      // Don't block the user experience if subscription fails
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
