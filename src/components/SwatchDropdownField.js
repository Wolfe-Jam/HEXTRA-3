import React, { useState, useRef, useEffect, forwardRef } from 'react';
import PropTypes from 'prop-types';
import { Box, TextField, InputAdornment, Autocomplete, IconButton } from '@mui/material';
import { ColorLensRounded as ColorIcon } from '@mui/icons-material';
import { RefreshRounded as ResetIcon } from '@mui/icons-material';
import { styled } from '@mui/material/styles';

// Custom styled TextField component
const StyledTextField = styled(TextField)(({ theme }) => ({
  '& .MuiInputBase-root': {
    borderRadius: '4px',
    backgroundColor: theme.palette.mode === 'dark' ? '#1A1A1A' : '#FFFFFF',
    fontSize: 16,
    width: '100%',
    '& input': {
      paddingLeft: '4px !important' // Ensure input text appears right after #
    }
  },
}));

// Color swatch component
const ColorSwatch = styled(Box)(({ color }) => ({
  width: '20px',
  height: '20px',
  borderRadius: '50%',
  backgroundColor: color || '#000000',
  border: '1px solid rgba(0, 0, 0, 0.2)',
  marginRight: '8px'
}));

const SwatchDropdownField = forwardRef(({ 
  label,
  value = '', 
  onChange,
  onEnterPress,
  onDropdownSelect,
  options = [],
  onClick,
  onReset,
  sx
}, ref) => {
  const [inputValue, setInputValue] = useState('');
  
  // Update the input value when the value prop changes
  useEffect(() => {
    if (typeof value === 'string') {
      // Remove # prefix for display if present
      const displayValue = value.startsWith('#') ? value.substring(1) : value;
      setInputValue(displayValue.toUpperCase());
    }
  }, [value]);

  // Handle input change
  const handleInputChange = (event, newValue) => {
    if (event && event.type === 'change') {
      console.log('Color input changed to:', newValue);
      setInputValue(newValue);
      onChange(event);
    }
  };

  // Handle key down events
  const handleKeyDown = (event) => {
    if (event.key === 'Enter' && onEnterPress) {
      console.log('ENTER pressed in color input - applying color');
      onEnterPress('enter');
      event.preventDefault();
    }
  };

  // Handle option selection from dropdown
  const handleOptionSelect = (event, option) => {
    if (!option) return;
    
    const color = typeof option === 'string' ? option : option;
    console.log('Color selected from dropdown:', color);
    if (onDropdownSelect) {
      onDropdownSelect(color);
    }
  };

  // Handle reset
  const handleReset = () => {
    console.log('Color reset requested');
    if (onReset) {
      onReset();
    }
  };

  const hasReset = !!onReset;

  return (
    <Autocomplete
      freeSolo
      disableClearable
      options={options}
      value={value}
      inputValue={inputValue}
      onInputChange={handleInputChange}
      onChange={handleOptionSelect}
      sx={sx}
      renderOption={(props, option) => (
        <li {...props}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <ColorSwatch color={option} />
            <span style={{ color: 'var(--text-secondary)' }}>{option.replace(/^#/, '').toUpperCase()}</span>
          </Box>
        </li>
      )}
      renderInput={(params) => (
        <StyledTextField
          {...params}
          label={label}
          variant="outlined"
          size="small"
          onClick={onClick}
          onKeyDown={handleKeyDown}
          inputRef={ref}
          InputLabelProps={{
            style: { color: 'var(--text-secondary)' }  // Use light grey instead of primary text color
          }}
          InputProps={{
            ...params.InputProps,
            startAdornment: (
              <InputAdornment position="start" sx={{ mr: 0 }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <ColorSwatch color={value} />
                  <span style={{ color: 'var(--text-secondary)', marginRight: '4px' }}>#</span>
                </Box>
              </InputAdornment>
            ),
            endAdornment: hasReset ? (
              <InputAdornment position="end">
                <IconButton
                  onClick={handleReset}
                  edge="end"
                  size="small"
                  sx={{ visibility: value !== '#FED141' ? 'visible' : 'hidden' }}
                >
                  <ResetIcon fontSize="small" />
                </IconButton>
              </InputAdornment>
            ) : undefined
          }}
        />
      )}
    />
  );
});

SwatchDropdownField.propTypes = {
  label: PropTypes.string,
  value: PropTypes.string,
  onChange: PropTypes.func,
  onEnterPress: PropTypes.func,
  onDropdownSelect: PropTypes.func,
  options: PropTypes.array,
  onClick: PropTypes.func,
  onReset: PropTypes.func,
  sx: PropTypes.object
};

export default SwatchDropdownField;
