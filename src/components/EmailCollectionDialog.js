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
  const [successMessage, setSuccessMessage] = useState('');
  const { login } = useKindeAuth();
  
  // Check for MailChimp success parameter in URL
  React.useEffect(() => {
    // Check if we're returning from a successful MailChimp submission
    if (typeof window !== 'undefined' && 
        (window.location.search.includes('mailchimp_success=true') || 
         window.location.search.includes('result=success'))) {
      console.log('[DEBUG] Email Capture - Detected successful MailChimp submission');
      
      // Try to get the email from localStorage
      let storedEmail = '';
      try {
        const storedData = localStorage.getItem('hextra_email_backup');
        if (storedData) {
          const parsedData = JSON.parse(storedData);
          storedEmail = parsedData.email || '';
          console.log('[DEBUG] Email Capture - Retrieved email from localStorage:', storedEmail);
        }
      } catch (error) {
        console.error('[DEBUG] Email Capture - Failed to retrieve email from localStorage:', error);
      }
      
      // Clean up the URL
      const cleanUrl = window.location.href.split('?')[0];
      window.history.replaceState({}, document.title, cleanUrl);
      
      // Close the dialog with success
      if (onSubmit && (email || storedEmail)) {
        onSubmit(email || storedEmail);
      }
      onClose();
    }
  }, [onClose, onSubmit, email]);

  // Email validation
  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  // Subscribe user to MailChimp using direct form submission
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
      
      // Set success message for user feedback
      setSuccessMessage('Success!\nYour download is ready.');
      
      // MailChimp direct form submission configuration
      const MAILCHIMP_URL = 'https://hextra.us21.list-manage.com/subscribe/post';
      const MAILCHIMP_U = '9f57a2f6a75ea109e2c1c4c27'; // MailChimp user ID
      const MAILCHIMP_ID = '5b2a2cb0b7'; // MailChimp audience ID
      
      console.log('[DEBUG] Email Capture - Using direct form submission to MailChimp');
      console.log(`[DEBUG] Email Capture - MailChimp URL: ${MAILCHIMP_URL}?u=${MAILCHIMP_U}&id=${MAILCHIMP_ID}`);
      
      // Create a form element
      const form = document.createElement('form');
      form.method = 'POST';
      form.action = `${MAILCHIMP_URL}?u=${MAILCHIMP_U}&id=${MAILCHIMP_ID}`;
      // Add success redirect URL
      const successRedirect = `${window.location.href.split('?')[0]}?mailchimp_success=true`;
      form.action = `${MAILCHIMP_URL}?u=${MAILCHIMP_U}&id=${MAILCHIMP_ID}&success=${encodeURIComponent(successRedirect)}`;
      form.target = '_self'; // Stay in the same tab for redirect handling
      form.style.display = 'none'; // Hide the form
      
      // Add email field
      const emailField = document.createElement('input');
      emailField.type = 'email';
      emailField.name = 'EMAIL';
      emailField.value = email;
      form.appendChild(emailField);
      
      // Add source tracking field
      const sourceField = document.createElement('input');
      sourceField.type = 'hidden';
      sourceField.name = 'SOURCE';
      sourceField.value = 'HEXTRA-EmailDialog-v2.2.5';
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
      tagsField.value = 'HEXTRA,WebApp';
      form.appendChild(tagsField);
      
      // Add submit button (required by MailChimp)
      const submitButton = document.createElement('input');
      submitButton.type = 'submit';
      submitButton.name = 'subscribe';
      submitButton.value = 'Subscribe';
      form.appendChild(submitButton);
      
      // Add the form to the document
      document.body.appendChild(form);
      
      // Submit the form
      console.log('[DEBUG] Email Capture - Submitting form to MailChimp');
      form.submit();
      
      // Remove the form after submission
      setTimeout(() => {
        document.body.removeChild(form);
        console.log('[DEBUG] Email Capture - Form submitted and removed');
      }, 1000);
      
      // Mark as successful in local storage
      try {
        console.log('[DEBUG] Email Capture - Direct form submission initiated');
        
        // Update local storage to mark as successful
        localStorage.setItem('hextra_email_backup', JSON.stringify({
          email,
          timestamp: new Date().toISOString(),
          pending: false,
          success: true
        }));
        
        console.log('[DEBUG] Email Capture - Local storage updated with success status');
      } catch (storageError) {
        console.error('[DEBUG] Email Capture - Failed to update local storage:', storageError);
      }
      
      // Add success URL redirect parameter
      console.log('[DEBUG] Email Capture - Form submitted successfully');
      
      // Add a success tracking pixel as a backup
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
    // Clear any previous error
    setError('');

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
    
    // Set success message for user feedback - simple and clear on two lines
    setSuccessMessage('Success!\nYour download is ready.');
    
    if (!subscribeResult) {
      console.log('[DEBUG] Dialog - MailChimp subscription failed, but continuing');
      // Still show success message even if MailChimp fails
      setSuccessMessage('Thank you! Your download is ready.');
    }

    // Call the onSubmit callback with the email
    console.log('[DEBUG] Dialog - Calling onSubmit callback');
    onSubmit(email);
    
    // Don't close dialog immediately to show success message
    console.log('[DEBUG] Dialog - Showing success message');
    
    // Close dialog after showing success message for 5 seconds
    setTimeout(() => {
      console.log('[DEBUG] Dialog - Closing dialog after success message');
      setEmail('');
      setError('');
      setSuccessMessage('');
      setIsSubmitting(false);
      onClose();
    }, 5000);
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
        
        {successMessage ? (
          <Box
            sx={{
              color: 'green',
              fontWeight: 'bold',
              textAlign: 'center',
              my: 4,
              p: 3,
              bgcolor: 'rgba(0, 255, 0, 0.1)',
              borderRadius: 1,
            }}
          >
            <Typography 
              variant="h5" 
              sx={{ 
                fontWeight: 'bold',
                fontSize: '1.8rem',
                mb: 1
              }}
            >
              Success!
            </Typography>
            <Typography 
              variant="body1" 
              sx={{ 
                fontSize: '1.2rem' 
              }}
            >
              Your download is ready.
            </Typography>
          </Box>
        ) : (
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
            disabled={isSubmitting}
          />
        )}
        
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
