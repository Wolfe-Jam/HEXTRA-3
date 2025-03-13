import React, { useState, useEffect } from 'react';
import { IconButton, styled, keyframes } from '@mui/material';

// Define a pulsing glow animation
const pulseGlow = keyframes`
  0% {
    box-shadow: 0 0 0px var(--glow-color);
    border-color: var(--border-color);
  }
  50% {
    box-shadow: 0 0 12px var(--glow-color);
    border-color: var(--glow-color);
  }
  100% {
    box-shadow: 0 0 0px var(--glow-color);
    border-color: var(--border-color);
  }
`;

// Create a styled IconButton with enhanced glow effects
const StyledPulsingButton = styled(IconButton)(({ theme, isPulsing, isDownloadButton }) => ({
  color: 'var(--text-primary)',
  backgroundColor: theme.palette.mode === 'dark' ? 'rgba(50, 50, 50, 0.8)' : 'rgba(255, 255, 255, 0.7)',
  border: '1px solid var(--border-color)',
  transition: 'all 0.2s ease-in-out',
  position: 'relative',
  
  // Enhanced hover effect
  '&:hover': {
    backgroundColor: theme.palette.mode === 'dark' ? 'rgba(60, 60, 60, 0.9)' : 'rgba(255, 255, 255, 0.9)',
    borderColor: 'var(--glow-color)',
    boxShadow: '0 0 12px var(--glow-color)',
    transform: 'scale(1.05)',
  },
  
  // Active state
  '&:active': {
    backgroundColor: theme.palette.mode === 'dark' ? 'rgba(70, 70, 70, 0.9)' : 'rgba(240, 240, 240, 0.9)',
    transform: 'scale(0.98)',
  },
  
  // Apply pulsing animation when isPulsing is true
  ...(isPulsing && {
    animation: `${pulseGlow} 2s ease-in-out infinite`,
  }),
  
  // Special styling for the download button even when disabled
  ...(isDownloadButton && {
    opacity: 1,
    '& svg': {
      color: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.85)' : theme.palette.primary.main,
    },
    // Disabled state for download button - still visible but with indication
    '&.Mui-disabled': {
      opacity: 0.7,
      backgroundColor: theme.palette.mode === 'dark' ? 'rgba(40, 40, 40, 0.6)' : 'rgba(240, 240, 240, 0.7)',
      '& svg': {
        color: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.6)' : theme.palette.grey[500],
      }
    }
  }),
  
  // Default disabled state for non-download buttons
  '&.Mui-disabled': {
    opacity: 0.5,
    backgroundColor: 'transparent',
  }
}));

const PulsingGlowButton = React.forwardRef((props, ref) => {
  const { children, isDownloadButton = false, autoPulse = false, pulseInterval = 8000, ...other } = props;
  const [isPulsing, setIsPulsing] = useState(false);
  
  // Set up automatic pulsing if autoPulse is true
  useEffect(() => {
    if (!autoPulse) return;
    
    // Initial delay before first pulse
    const initialDelay = setTimeout(() => {
      setIsPulsing(true);
      
      // Set up interval for pulsing
      const interval = setInterval(() => {
        setIsPulsing(true);
        
        // Turn off pulsing after 2 seconds (duration of animation)
        setTimeout(() => {
          setIsPulsing(false);
        }, 2000);
      }, pulseInterval);
      
      return () => clearInterval(interval);
    }, 2000); // Start after 2 seconds
    
    return () => clearTimeout(initialDelay);
  }, [autoPulse, pulseInterval]);
  
  return (
    <StyledPulsingButton 
      ref={ref} 
      isPulsing={isPulsing} 
      isDownloadButton={isDownloadButton}
      {...other}
    >
      {children}
    </StyledPulsingButton>
  );
});

PulsingGlowButton.displayName = 'PulsingGlowButton';

export default PulsingGlowButton;
