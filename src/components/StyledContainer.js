import React from 'react';
import { Box } from '@mui/material';

const StyledContainer = ({ children, ...props }) => {
  return (
    <Box
      sx={{
        backgroundColor: 'var(--bg-secondary)',
        borderRadius: '8px',
        padding: '24px',
        margin: '16px 0',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        ...props.sx
      }}
      {...props}
    >
      {children}
    </Box>
  );
};

export default StyledContainer;
