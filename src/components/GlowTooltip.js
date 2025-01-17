import React from 'react';
import { Tooltip, useMediaQuery, useTheme } from '@mui/material';
import { styled } from '@mui/material/styles';

const StyledTooltip = styled(({ className, ...props }) => (
  <Tooltip {...props} classes={{ popper: className }} />
))(({ theme }) => ({
  '& .MuiTooltip-tooltip': {
    backgroundColor: 'var(--bg-primary)',
    color: 'var(--text-primary)',
    border: '1px solid var(--text-secondary)',
    borderRadius: '4px',
    padding: '8px 12px',
    fontSize: '0.875rem',
    fontFamily: "'Inter', sans-serif",
    maxWidth: '300px',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    position: 'relative',
    '&::before': {
      content: '""',
      position: 'absolute',
      width: '100%',
      height: '100%',
      top: 0,
      left: 0,
      background: 'var(--glow-color)',
      opacity: 0.03,
      borderRadius: 'inherit',
      pointerEvents: 'none'
    }
  },
  '& .MuiTooltip-arrow': {
    color: 'var(--text-secondary)',
    '&::before': {
      backgroundColor: 'var(--bg-primary)',
      border: '1px solid var(--text-secondary)'
    }
  }
}));

/**
 * GlowTooltip - A consistent tooltip component with glow aesthetics
 * Automatically adjusts placement based on screen size
 * 
 * @param {Object} props
 * @param {React.ReactElement} props.children - The element to wrap with tooltip
 * @param {string} props.title - Tooltip content
 * @param {Object} props.sx - Additional styles for the tooltip
 * @param {string} props.placement - Override default placement ('top' or 'bottom')
 * @param {boolean} props.arrow - Show arrow pointer (default: true)
 * @param {number} props.enterDelay - Delay before showing tooltip (ms)
 * @param {number} props.leaveDelay - Delay before hiding tooltip (ms)
 * @param {boolean} props.disabled - Disable the tooltip
 */
const GlowTooltip = ({ 
  children, 
  title,
  sx = {},
  placement: userPlacement,
  arrow = true,
  enterDelay = 200,
  leaveDelay = 0,
  disabled = false,
  ...props 
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  // Default placement: bottom for mobile, top for desktop
  const defaultPlacement = isMobile ? 'bottom' : 'top';
  const placement = userPlacement || defaultPlacement;

  // If disabled, render children without tooltip
  if (disabled) {
    return children;
  }

  return (
    <StyledTooltip
      title={title}
      placement={placement}
      arrow={arrow}
      enterDelay={enterDelay}
      leaveDelay={leaveDelay}
      sx={sx}
      {...props}
    >
      {children}
    </StyledTooltip>
  );
};

export default GlowTooltip;
