import { useState, useEffect } from 'react';
import { useKindeAuth } from '@kinde-oss/kinde-auth-react';

/**
 * Custom hook to manage email capture dialog state
 * 
 * @param {Object} options
 * @param {boolean} options.showOnlyForAnonymous - Only show for non-authenticated users
 * @param {string} options.storageKey - Local storage key to track if user has submitted email
 * @returns {Object} - Dialog state and control functions
 */
const useEmailCapture = ({ 
  showOnlyForAnonymous = true,
  storageKey = 'hextra_email_submitted'
} = {}) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const { isAuthenticated } = useKindeAuth();
  
  // Check if user has already submitted email
  const hasSubmittedEmail = () => {
    return localStorage.getItem(storageKey) === 'true';
  };
  
  // Mark email as submitted
  const markEmailAsSubmitted = () => {
    localStorage.setItem(storageKey, 'true');
  };
  
  // Open dialog if conditions are met
  const promptForEmail = () => {
    // Don't show dialog if user is authenticated (if showOnlyForAnonymous is true)
    if (showOnlyForAnonymous && isAuthenticated) {
      return false;
    }
    
    // Don't show dialog if user has already submitted email
    if (hasSubmittedEmail()) {
      return false;
    }
    
    setDialogOpen(true);
    return true;
  };
  
  // Handle successful email submission
  const handleEmailSubmitted = (email) => {
    markEmailAsSubmitted();
    setDialogOpen(false);
  };
  
  return {
    dialogOpen,
    setDialogOpen,
    promptForEmail,
    handleEmailSubmitted,
    hasSubmittedEmail
  };
};

export default useEmailCapture;
