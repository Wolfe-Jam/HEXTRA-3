/**
 * GlowIconButton Component (v2.2.2)
 * 
 * A styled IconButton component with glow effects.
 * Used in the Banner for theme toggle and user actions.
 * 
 * @version 2.2.2
 */

import { IconButton } from '@mui/material';
import { styled } from '@mui/material/styles';

const GlowIconButton = styled(IconButton)(({ theme }) => ({
  backgroundColor: 'var(--bg-secondary)',
  color: 'var(--text-primary)',
  '&:hover': {
    backgroundColor: 'var(--bg-secondary)',
    borderColor: 'var(--glow-color)',
    color: 'var(--glow-color)',
    boxShadow: '0 0 0 3px var(--glow-subtle)',
    transform: 'scale(1.05)',
  },
  '&.Mui-disabled': {
    backgroundColor: 'var(--disabled-bg)',
    color: 'var(--text-disabled)',
  },
  fontFamily: "'Inter', sans-serif",
  minWidth: '32px',
  minHeight: '32px',
  padding: '6px',
  boxShadow: 'none',
  border: '1px solid var(--border-color)',
  transition: 'all 0.2s ease-in-out'
}));

export default GlowIconButton;
