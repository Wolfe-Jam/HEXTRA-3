import React from 'react';
import { styled } from '@mui/material/styles';
import Switch from '@mui/material/Switch';

const StyledSwitch = styled(Switch)(({ theme }) => ({
  width: 42,
  height: 24,
  padding: 0,
  '& .MuiSwitch-switchBase': {
    padding: 0,
    margin: 2,
    transitionDuration: '300ms',
    '&.Mui-checked': {
      transform: 'translateX(18px)',
      color: 'var(--text-primary)', 
      '& + .MuiSwitch-track': {
        backgroundColor: 'var(--text-secondary)', 
        opacity: 0.3,
        border: 0,
      },
      '&.Mui-disabled + .MuiSwitch-track': {
        opacity: 0.15,
      },
    },
    '&.Mui-focusVisible .MuiSwitch-thumb': {
      border: '6px solid var(--glow-color)',
    },
    '&.Mui-disabled .MuiSwitch-thumb': {
      color: theme.palette.mode === 'light' ? 'grey.100' : 'grey.600',
    },
    '&.Mui-disabled + .MuiSwitch-track': {
      opacity: 0.15,
    },
  },
  '& .MuiSwitch-thumb': {
    boxSizing: 'border-box',
    width: 20,
    height: 20,
    color: 'var(--text-primary)', 
  },
  '& .MuiSwitch-track': {
    borderRadius: 26 / 2,
    backgroundColor: 'var(--text-secondary)',
    opacity: 0.15, 
    transition: theme.transitions.create(['background-color'], {
      duration: 500,
    }),
  },
}));

/**
 * GlowSwitch - A theme-aware toggle switch with glow effect on focus
 * 
 * @param {Object} props
 * @param {boolean} props.checked - Current state of the switch
 * @param {function} props.onChange - Callback when switch is toggled
 * @param {string} props.label - Label text (optional)
 * @param {Object} props.sx - Additional styles
 */
const GlowSwitch = ({ checked, onChange, label, sx = {} }) => {
  return (
    <label style={{ 
      display: 'flex', 
      alignItems: 'center', 
      gap: '8px',
      cursor: 'pointer',
      fontFamily: "'Inter', sans-serif",
      color: 'var(--text-primary)',
      ...sx
    }}>
      <StyledSwitch
        checked={checked}
        onChange={onChange}
        focusVisibleClassName="Mui-focusVisible"
      />
      {label}
    </label>
  );
};

export default GlowSwitch;
