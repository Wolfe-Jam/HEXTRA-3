import React from 'react';
import { TextField, InputAdornment, IconButton } from '@mui/material';
import { styled } from '@mui/material/styles';
import { RefreshRounded as ResetIcon } from '@mui/icons-material';

const StyledTextField = styled(TextField)(() => ({
  '& .MuiOutlinedInput-root': {
    height: '48px',
    fontFamily: "'Inter', sans-serif",
    fontSize: '0.875rem',
    backgroundColor: 'var(--input-bg)',
    color: 'var(--text-primary)',
    borderColor: 'var(--border-color)',
    '&:hover .MuiOutlinedInput-notchedOutline': {
      borderColor: 'var(--border-hover)'
    },
    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
      borderColor: 'var(--glow-color)',
      boxShadow: '0 0 0 3px var(--glow-subtle)'
    }
  }
}));

/**
 * IconTextField - A styled text input component with optional start and end icons
 * 
 * @param {Object} props
 * @param {string} props.value - Input value
 * @param {function} props.onChange - Change handler
 * @param {function} props.onKeyDown - Key down handler
 * @param {string} props.placeholder - Input placeholder
 * @param {Object} props.sx - Additional styles
 * @param {React.Component} props.startIcon - Icon to show at start of input
 * @param {boolean} props.hasReset - Whether to show reset button at end
 * @param {function} props.onReset - Reset handler
 * @param {Object} props.InputProps - Additional MUI InputProps
 * @param {Object} props.rest - Additional props passed to TextField
 */
const IconTextField = ({
  value,
  onChange,
  onKeyDown,
  placeholder,
  sx = {},
  startIcon,
  hasReset = false,
  onReset,
  InputProps = {},
  ...rest
}) => {
  // Combine any provided endAdornment with reset button if needed
  const endAdornment = hasReset ? (
    <InputAdornment position="end">
      <IconButton
        onClick={onReset}
        edge="end"
        sx={{
          color: 'var(--text-secondary)',
          padding: '4px',
          '&:hover': {
            color: 'var(--glow-color)',
            backgroundColor: 'transparent',
            '& svg': {
              filter: 'drop-shadow(0 0 2px var(--glow-color))'
            }
          }
        }}
      >
        <ResetIcon sx={{ fontSize: '22px' }} />
      </IconButton>
    </InputAdornment>
  ) : InputProps.endAdornment;

  // Combine start icon if provided
  const startAdornment = startIcon ? (
    <InputAdornment position="start">
      {React.cloneElement(startIcon, {
        sx: { 
          color: 'var(--text-secondary)',
          fontSize: '20px',
          ...startIcon.props.sx
        }
      })}
    </InputAdornment>
  ) : InputProps.startAdornment;

  return (
    <StyledTextField
      value={value}
      onChange={onChange}
      onKeyDown={onKeyDown}
      placeholder={placeholder}
      sx={{
        ...sx
      }}
      InputProps={{
        ...InputProps,
        startAdornment,
        endAdornment
      }}
      {...rest}
    />
  );
};

export default IconTextField;
