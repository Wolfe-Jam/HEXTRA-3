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
  
  // Check for MailChimp success parameter in URL
  React.useEffect(() => {
    // Check if we're returning from a successful MailChimp submission
    if (typeof window !== 'undefined' && window.location.search.includes('mailchimp_success=true')) {
      console.log('[DEBUG] Email Capture - Detected successful MailChimp submission');
      
      // Clean up the URL
      const cleanUrl = window.location.href.split('?')[0];
      window.history.replaceState({}, document.title, cleanUrl);
      
      // Close the dialog with success
      if (onSubmit && email) {
        onSubmit(email);
      }
      onClose();
    }
  }, [onClose, onSubmit, email]);

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
      
      // Use direct MailChimp integration instead of API routes
      // This bypasses all API routes and avoids 405 errors
      console.log('[DEBUG] Email Capture - Using direct MailChimp integration');
      
      // MailChimp configuration
      const MAILCHIMP_URL = 'https://hextra.us21.list-manage.com/subscribe/post';
      const MAILCHIMP_U = '9f57a2f6a75ea109e2c1c4c27'; // Your MailChimp user ID
      const MAILCHIMP_ID = '15a9e53a0a'; // Your MailChimp list ID
      const MAILCHIMP_FORM_ID = '00a6b0e6f0'; // Form ID for proper submission
      
      let apiSuccess = false;
      
      try {
        // Create a form element for direct submission
        const form = document.createElement('form');
        form.method = 'POST';
        form.action = `${MAILCHIMP_URL}?u=${MAILCHIMP_U}&id=${MAILCHIMP_ID}&f_id=${MAILCHIMP_FORM_ID}`;
        form.target = '_blank';
        form.style.display = 'none';
        
        // Add email field
        const emailInput = document.createElement('input');
        emailInput.type = 'email';
        emailInput.name = 'EMAIL';
        emailInput.value = email;
        form.appendChild(emailInput);
        
        // Add source tracking field
        const sourceInput = document.createElement('input');
        sourceInput.type = 'hidden';
        sourceInput.name = 'SOURCE';
        sourceInput.value = 'HEXTRA-EmailDialog-v2.2.5';
        form.appendChild(sourceInput);
        
        // Add honeypot field (anti-spam)
        const honeypotInput = document.createElement('input');
        honeypotInput.type = 'text';
        honeypotInput.name = `b_${MAILCHIMP_U}_${MAILCHIMP_ID}`;
        honeypotInput.value = '';
        honeypotInput.style.display = 'none';
        form.appendChild(honeypotInput);
        
        // Add success redirect URL
        const redirectInput = document.createElement('input');
        redirectInput.type = 'hidden';
        redirectInput.name = 'success_url';
        redirectInput.value = window.location.href + '?mailchimp_success=true';
        form.appendChild(redirectInput);
        
        // Add form to document and submit
        document.body.appendChild(form);
        form.submit();
        
        console.log('[DEBUG] Email Capture - Direct MailChimp form submitted');
        apiSuccess = true;
        
        // Clean up form
        setTimeout(() => {
          document.body.removeChild(form);
        }, 1000);
      } catch (error) {
        console.error('[DEBUG] Email Capture - Direct MailChimp integration error:', error);
      }
      
      if (apiSuccess) {
        console.log('[DEBUG] Email Capture - Direct MailChimp submission successful');
        return true;
      }
      
      console.error('[DEBUG] Email Capture - Direct MailChimp integration failed');
      
      
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
