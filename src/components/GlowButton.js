import React from 'react';
import { IconButton } from '@mui/material';

const GlowButton = ({ 
  onClick, 
  disabled, 
  children, 
  size = { xs: '42px', sm: '42px' },
  sx = {} 
}) => {
  return (
    <IconButton
      onClick={onClick}
      disabled={disabled}
      sx={{
        width: size,
        height: size,
        bgcolor: 'var(--element-bg)',
        color: disabled ? 'var(--text-disabled)' : 'var(--text-primary)',
        border: '1px solid var(--border-color)',
        transition: 'all 0.2s ease-in-out',
        '&:hover': !disabled ? {
          bgcolor: 'var(--element-bg)',
          borderColor: 'var(--glow-color)',
          color: 'var(--glow-color)',
          boxShadow: '0 0 0 3px var(--glow-subtle)',
          transform: 'scale(1.05)'
        } : {},
        '& svg': {
          fontSize: typeof size === 'object' ? 
            { xs: '1.7rem', sm: '1.5rem' } : 
            '1.5rem'
        },
        ...sx
      }}
    >
      {children}
    </IconButton>
  );
};

export default GlowButton;
