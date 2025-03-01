import React, { useState, useRef, useEffect, forwardRef } from 'react';
import PropTypes from 'prop-types';
import { Box, TextField, InputAdornment, Autocomplete, IconButton, Typography, Divider, Tooltip } from '@mui/material';
import { ColorLensRounded as ColorIcon } from '@mui/icons-material';
import { RefreshRounded as ResetIcon } from '@mui/icons-material';
import { ClearRounded as ClearIcon } from '@mui/icons-material';
import { styled } from '@mui/material/styles';

// Custom styled TextField component
const StyledTextField = styled(TextField)(({ theme }) => ({
  '& .MuiInputBase-root': {
    borderRadius: '4px',
    backgroundColor: theme.palette.mode === 'dark' ? '#1A1A1A' : '#FFFFFF',
    fontSize: 14.5, 
    width: '100%',
    '& input': {
      paddingLeft: '2px !important', 
      textTransform: 'uppercase',
      fontFamily: '"Roboto Mono", monospace',
      letterSpacing: '0px',
      paddingRight: '0 !important'
    }
  },
}));

// Color swatch component - fixed dimensions to ensure circular shape
const ColorSwatch = styled(Box)(({ color }) => ({
  width: '19px', 
  height: '19px', 
  minWidth: '19px', 
  minHeight: '19px',
  maxWidth: '19px',
  maxHeight: '19px',
  borderRadius: '50%',
  backgroundColor: color || '#000000',
  border: '1px solid rgba(0, 0, 0, 0.2)',
  marginRight: '4px',
  display: 'inline-block',
  flexShrink: 0
}));

// Dropdown color swatch - matching the main swatch
const DropdownColorSwatch = styled(Box)(({ color }) => ({
  width: '19px', 
  height: '19px', 
  minWidth: '19px',
  minHeight: '19px',
  maxWidth: '19px',
  maxHeight: '19px',
  borderRadius: '50%',
  backgroundColor: color || '#000000',
  border: '1px solid rgba(0, 0, 0, 0.2)',
  marginRight: '4px',
  display: 'inline-block',
  flexShrink: 0
}));

// Group header component
const GroupHeader = styled('div')(({ theme }) => ({
  position: 'sticky',
  top: '-8px',
  padding: '4px 10px',
  backgroundColor: theme.palette.mode === 'dark' ? '#2A2A2A' : '#F5F5F5',
  color: theme.palette.text.secondary,
  fontSize: '13px',
  fontWeight: 500,
}));

// Group items container
const GroupItems = styled('ul')({
  padding: 0,
});

const SwatchDropdownField = forwardRef(({ 
  label,
  value = '', 
  onChange,
  onEnterPress,
  onDropdownSelect,
  options = [],
  onClick,
  onReset,
  onClear,
  sx
}, ref) => {
  const [inputValue, setInputValue] = useState('');
  const isGrouped = Array.isArray(options) && options.length > 0 && options[0] && 'name' in options[0];
  
  // Flatten options for Autocomplete if they're grouped
  const flattenOptions = () => {
    if (isGrouped) {
      const allOptions = [];
      options.forEach(group => {
        if (group.colors && group.colors.length > 0) {
          group.colors.forEach(color => {
            allOptions.push(color.value);
          });
        }
      });
      return allOptions;
    }
    return options;
  };
  
  const flatOptions = flattenOptions();
  
  // Update the input value when the value prop changes
  useEffect(() => {
    if (typeof value === 'string') {
      // Remove # prefix for display if present
      const displayValue = value.startsWith('#') ? value.substring(1) : value;
      let finalValue = displayValue.toUpperCase();
      // Only add asterisk if it's actually the default value
      const isDefault = value === '#FED141';
      if (isDefault) {
        finalValue += '*';
      }
      setInputValue(finalValue);
    }
  }, [value]);
  
  // Handle input change
  const handleInputChange = (event, newValue) => {
    if (event) {
      // Remove asterisk if present
      const cleanValue = newValue.replace(/\*$/, '');
      const hexValue = cleanValue.startsWith('#') ? cleanValue : `#${cleanValue}`;
      setInputValue(newValue);
      onChange && onChange({ target: { value: hexValue } });
    }
  };
  
  // Handle key down events
  const handleKeyDown = (event) => {
    if (event.key === 'Enter' && onEnterPress) {
      event.preventDefault();
      onEnterPress('keyboard');
    }
  };
  
  // Handle option selection from dropdown
  const handleOptionSelect = (event, option) => {
    if (!option) return;
    
    // For grouped options, we receive the hex value directly
    const hexValue = option.startsWith('#') ? option : `#${option}`;
    
    setInputValue(hexValue.substring(1).toUpperCase());
    
    if (onDropdownSelect) {
      onDropdownSelect(hexValue);
    } else if (onChange) {
      onChange({ target: { value: hexValue } });
    }
  };
  
  // Handle reset
  const handleReset = () => {
    if (onReset) {
      onReset();
    }
  };
  
  // Handle clear
  const handleClear = () => {
    if (onClear) {
      onClear();
    } else if (onChange) {
      onChange({ target: { value: '' } });
    }
  };

  const hasReset = !!onReset;
  const hasClear = !!onClear;

  return (
    <Autocomplete
      freeSolo
      disableClearable
      options={flatOptions}
      value={value}
      inputValue={inputValue}
      onInputChange={handleInputChange}
      onChange={handleOptionSelect}
      sx={sx}
      groupBy={isGrouped ? () => null : undefined} // Disabled default grouping
      renderOption={(props, option) => {
        // Find the color object if we're using grouped colors
        let colorObj = null;
        if (isGrouped) {
          for (const group of options) {
            if (group.colors) {
              const found = group.colors.find(c => c.value === option);
              if (found) {
                colorObj = found;
                break;
              }
            }
          }
        }
        
        return (
          <li {...props}>
            <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
              <DropdownColorSwatch color={option} />
              <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Typography variant="body2" color="text.secondary" sx={{ mr: 0.5, fontSize: '13.5px' }}>#</Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ 
                    fontFamily: '"Roboto Mono", monospace', 
                    fontSize: '13.5px',
                    letterSpacing: '0px'
                  }}>
                    {option.replace(/^#/, '').toUpperCase()}
                    {colorObj && colorObj.isDefault && "*"}
                  </Typography>
                </Box>
              </Box>
            </Box>
          </li>
        );
      }}
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
            // Layout: O_#_ABC456_X_@
            startAdornment: (
              <InputAdornment position="start" sx={{ mr: 0, ml: 0 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mr: 0 }}>
                  <ColorSwatch color={value} />
                  <span style={{ color: 'var(--text-secondary)' }}>#</span>
                </Box>
              </InputAdornment>
            ),
            endAdornment: (
              <InputAdornment position="end" sx={{ 
                ml: 0, 
                display: 'flex', 
                alignItems: 'center', 
                width: 'auto',
                position: 'absolute',
                right: '6px', // Slight adjustment for positioning
                gap: '1px' // Add small gap between buttons
              }}>
                {hasClear && (
                  <Tooltip title="Clear">
                    <IconButton
                      onClick={handleClear}
                      edge="end"
                      size="medium"
                      sx={{ padding: '2px', margin: 0 }}
                    >
                      <ClearIcon sx={{ fontSize: '16px' }} />
                    </IconButton>
                  </Tooltip>
                )}
                {hasReset && (
                  <Tooltip title="Reset to default">
                    <IconButton
                      onClick={handleReset}
                      edge="end"
                      size="medium"
                      sx={{ 
                        padding: '2px',
                        margin: 0
                      }}
                    >
                      <ResetIcon sx={{ fontSize: '16px' }} />
                    </IconButton>
                  </Tooltip>
                )}
                {/* Removed the asterisk from here */}
              </InputAdornment>
            )
          }}
        />
      )}
      ListboxProps={{
        sx: {
          maxHeight: '300px',
          '& .MuiAutocomplete-option': {
            padding: '6px 10px', // More compact dropdown items
          }
        }
      }}
      renderGroup={(params) => {
        if (!isGrouped) return params.children;
        
        return (
          <li key={params.key}>
            <GroupHeader>{params.group}</GroupHeader>
            <GroupItems>{params.children}</GroupItems>
            {params.group !== options[options.length - 1].name && <Divider />}
          </li>
        );
      }}
    />
  );
});

SwatchDropdownField.propTypes = {
  label: PropTypes.string,
  value: PropTypes.string,
  onChange: PropTypes.func,
  onEnterPress: PropTypes.func,
  onDropdownSelect: PropTypes.func,
  options: PropTypes.oneOfType([
    PropTypes.array,
    PropTypes.arrayOf(PropTypes.shape({
      name: PropTypes.string.isRequired,
      colors: PropTypes.arrayOf(PropTypes.shape({
        value: PropTypes.string.isRequired,
        label: PropTypes.string.isRequired,
        isDefault: PropTypes.bool
      })).isRequired
    }))
  ]),
  onClick: PropTypes.func,
  onReset: PropTypes.func,
  onClear: PropTypes.func,
  sx: PropTypes.object
};

export default SwatchDropdownField;
