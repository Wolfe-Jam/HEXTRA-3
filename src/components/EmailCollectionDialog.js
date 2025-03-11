/**
 * EmailCollectionDialog Component (v2.2.4)
 * 
 * Collects email from users before allowing download.
 * - Shows for non-authenticated users when downloading single images
 * - Stores email in localStorage for persistence
 * - Provides option to proceed to full authentication
 * 
 * @version 2.2.4
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
      console.log('[DEBUG] MailChimp - Making API request to /api/mailchimp-subscribe');
      // Call our MailChimp API endpoint
      const response = await fetch('/api/mailchimp-subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email
        })
      });
      
      console.log('[DEBUG] MailChimp - Response status:', response.status);
      const data = await response.json();
      console.log('[DEBUG] MailChimp - Response data:', data);
      
      if (!response.ok) {
        console.error('[DEBUG] MailChimp - Subscription error:', data.error);
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
  const handleSubmit = () => {
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
    subscribeToMailChimp(email);

    // Call the onSubmit callback with the email
    console.log('[DEBUG] Dialog - Calling onSubmit callback');
    onSubmit(email);
    
    // Reset form and close dialog
    console.log('[DEBUG] Dialog - Resetting form and closing dialog');
    setEmail('');
    setError('');
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
          disabled={!email}
        >
          Download with Email
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
