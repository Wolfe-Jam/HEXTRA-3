import React from 'react';
import { TextField, InputAdornment, IconButton, Autocomplete } from '@mui/material';
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
  },
  '& .MuiAutocomplete-input': {
    height: '20px',
    padding: '0 !important'
  }
}));

/**
 * SwatchDropdownField - A specialized dropdown component with color swatches and auto-apply behavior
 * 
 * Features:
 * 1. Shows color swatches in dropdown menu
 * 2. Auto-applies selection (Google Search style)
 * 3. Handles asynchronous state updates
 * 4. Supports keyboard navigation
 * 
 * @param {Object} props
 * @param {string} props.value - Current input value
 * @param {function} props.onChange - Called when input changes manually
 * @param {function} props.onKeyDown - Keyboard handler
 * @param {string} props.placeholder - Input placeholder
 * @param {Object} props.sx - Additional MUI styles
 * @param {React.Component} props.startIcon - Icon shown at input start
 * @param {boolean} props.hasReset - Show reset button
 * @param {function} props.onReset - Reset handler
 * @param {Array} props.options - Array of color options
 * @param {function} props.onSelectionChange - Called when dropdown selection changes
 * @param {function} props.onAutoApply - Called after states update (auto-apply)
 */
const SwatchDropdownField = ({
  value,
  onChange,
  onKeyDown,
  placeholder,
  sx = {},
  startIcon,
  hasReset = false,
  onReset,
  options = [],
  onSelectionChange,
  onAutoApply,
  InputProps = {},
  ...rest
}) => {
  // Track if selection came from dropdown
  const [isDropdownSelection, setIsDropdownSelection] = React.useState(false);

  // Auto-apply after state updates from dropdown selection
  React.useEffect(() => {
    if (isDropdownSelection && onAutoApply) {
      onAutoApply();
      setIsDropdownSelection(false);
    }
  }, [value, isDropdownSelection, onAutoApply]);

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
    <Autocomplete
      freeSolo
      value={value}
      onChange={(event, newValue) => {
        if (newValue) {
          onSelectionChange?.(newValue);
          setIsDropdownSelection(true);
        }
      }}
      onInputChange={(event, newValue, reason) => {
        if (reason === 'reset' || reason === 'clear') {
          return;
        }
        onChange?.({ target: { value: newValue } });
      }}
      selectOnFocus
      handleHomeEndKeys
      autoSelect
      options={options}
      renderOption={(props, option) => (
        <li {...props} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ 
            width: '20px', 
            height: '20px', 
            borderRadius: '4px',
            backgroundColor: option,
            border: '1px solid var(--border-color)'
          }} />
          <span style={{ fontFamily: 'monospace' }}>{option}</span>
        </li>
      )}
      getOptionLabel={(option) => option}
      isOptionEqualToValue={(option, value) => option === value}
      renderInput={(params) => (
        <StyledTextField
          {...params}
          placeholder={placeholder}
          onKeyDown={onKeyDown}
          sx={{ ...sx }}
          InputProps={{
            ...params.InputProps,
            ...InputProps,
            startAdornment,
            endAdornment
          }}
          {...rest}
        />
      )}
      ListboxProps={{
        sx: {
          backgroundColor: 'var(--bg-secondary)',
          border: '1px solid var(--border-color)',
          '& .MuiAutocomplete-option': {
            fontFamily: "'Inter', sans-serif",
            fontSize: '0.875rem',
            color: 'var(--text-primary)',
            '&:hover': {
              backgroundColor: 'var(--hover-bg)',
            },
            '&.Mui-focused': {
              backgroundColor: 'var(--hover-bg)',
            }
          }
        }
      }}
    />
  );
};

export default SwatchDropdownField;
