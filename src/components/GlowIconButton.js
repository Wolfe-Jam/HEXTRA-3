/**
 * GlowIconButton Component (v2.2.2)
 * 
 * A styled IconButton component with glow effects.
 * Used in the Banner for theme toggle, t-shirt status, and user actions.
 * 
 * @version 2.2.2
 */

import { IconButton } from '@mui/material';
import { styled } from '@mui/material/styles';

const GlowIconButton = styled(IconButton)(({ theme }) => ({
  backgroundColor: 'var(--bg-secondary)',
  color: 'var(--text-primary)',
  width: '40px', // Consistent size
  height: '40px',
  padding: '8px',
  borderRadius: '50%',
  border: '1px solid var(--border-color)',
  transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
  
  '&:hover': {
    backgroundColor: 'var(--bg-secondary)',
    borderColor: 'var(--glow-color)',
    color: 'var(--glow-color)',
    boxShadow: '0 0 0 3px var(--glow-subtle)',
    transform: 'scale(1.05) translateY(-1px)',
  },

  '&:active': {
    transform: 'scale(0.98)',
    boxShadow: '0 0 0 2px var(--glow-subtle)',
  },

  '&.Mui-disabled': {
    backgroundColor: 'var(--disabled-bg)',
    color: 'var(--text-disabled)',
    border: '1px solid var(--border-disabled)',
  },

  // For buttons with background colors (like the red user button)
  '&[data-colored="true"]': {
    border: 'none',
    '&:hover': {
      transform: 'scale(1.05) translateY(-1px)',
      boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
    }
  }
}));

export default GlowIconButton;
