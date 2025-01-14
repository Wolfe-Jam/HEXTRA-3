import React from 'react';
import { SvgIcon } from '@mui/material';

const ThemeToggleIcon = ({ isDark }) => {
  return (
    <SvgIcon viewBox="0 0 24 24" sx={{ transform: isDark ? 'rotate(180deg)' : 'none' }}>
      <circle 
        cx="12" 
        cy="12" 
        r="10" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="2"
      />
      <path
        d="M12 2 L12 22 L2 12 Z"
        fill="currentColor"
      />
    </SvgIcon>
  );
};

export default ThemeToggleIcon;
