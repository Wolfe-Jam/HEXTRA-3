import React from 'react';
import { IconButton, styled } from '@mui/material';

const StyledIconButton = styled(IconButton)(({ theme }) => ({
  color: 'var(--text-primary)',
  backgroundColor: 'transparent',
  border: '1px solid var(--border-color)',
  transition: 'all 0.2s ease-in-out',
  '&:hover': {
    backgroundColor: 'var(--bg-hover)',
    borderColor: 'var(--glow-color)',
    boxShadow: '0 0 8px var(--glow-color)',
  },
  '&:active': {
    backgroundColor: 'var(--bg-active)',
  },
  '&.Mui-disabled': {
    opacity: 0.5,
    backgroundColor: 'transparent',
  }
}));

const GlowIconButton = React.forwardRef((props, ref) => {
  const { children, ...other } = props;
  return (
    <StyledIconButton ref={ref} {...other}>
      {children}
    </StyledIconButton>
  );
});

GlowIconButton.displayName = 'GlowIconButton';

export default GlowIconButton;
