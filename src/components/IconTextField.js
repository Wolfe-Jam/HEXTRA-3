import React from 'react';
import { TextField, InputAdornment, IconButton, Autocomplete } from '@mui/material';
import { styled } from '@mui/material/styles';
import { RefreshRounded as ResetIcon } from '@mui/icons-material';

const StyledTextField = styled(TextField)(({ theme }) => ({
  '& .MuiInputBase-root': {
    borderRadius: '8px',
    backgroundColor: theme.palette.mode === 'dark' ? '#1A1A1A' : '#FFFFFF',
    border: `1px solid ${theme.palette.mode === 'dark' ? '#333333' : '#E0E0E0'}`,
    fontSize: 16,
    width: '100%',
    padding: '10px 14px',
    transition: theme.transitions.create([
      'border-color',
      'background-color',
      'box-shadow',
    ]),
    '& input': {
      color: theme.palette.mode === 'dark' ? '#FFFFFF' : 'rgba(0, 0, 0, 0.87)',
    },
    '&:hover': {
      backgroundColor: theme.palette.mode === 'dark' ? '#1A1A1A' : '#FFFFFF', // Keep background
      borderColor: theme.palette.mode === 'dark' ? '#555555' : '#C0C0C0',
    },
    '&.Mui-focused': {
      backgroundColor: theme.palette.mode === 'dark' ? '#1A1A1A' : '#FFFFFF',
      boxShadow: `0 0 0 2px ${theme.palette.primary.main}`,
      borderColor: theme.palette.primary.main,
    },
  },
}));

function IconTextField({
  value,
  onChange,
  onKeyDown,
  placeholder,
  sx = {},
  startIcon,
  hasReset = false,
  onReset,
  options = [],
  renderOption,
  getOptionLabel,
  isOptionEqualToValue,
  onOptionSelect,
  InputProps = {},
  inputRef,
  endAdornment,
  ...rest
}) {
  const handleReset = () => {
    if (onReset) {
      onReset();
    }
  };

  const resetButton = hasReset ? (
    <InputAdornment position="end">
      <IconButton
        onClick={handleReset}
        edge="end"
        sx={{
          visibility: value ? 'visible' : 'hidden',
        }}
      >
        <ResetIcon />
      </IconButton>
    </InputAdornment>
  ) : null;

  // If we have both a custom endAdornment and reset button, combine them
  const finalEndAdornment = InputProps.endAdornment && resetButton ? (
    <InputAdornment position="end">
      {InputProps.endAdornment}
      <IconButton
        onClick={handleReset}
        edge="end"
        sx={{
          visibility: value ? 'visible' : 'hidden',
          ml: 0.5
        }}
      >
        <ResetIcon />
      </IconButton>
    </InputAdornment>
  ) : (InputProps.endAdornment || resetButton || InputProps.endAdornment);

  const startAdornment = startIcon ? (
    <InputAdornment position="start">
      {React.cloneElement(startIcon, {
        sx: {
          color: theme => theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.7)' : 'text.secondary',
          marginRight: '8px',
        },
      })}
    </InputAdornment>
  ) : InputProps.startAdornment;

  const handleOptionSelect = (event, newValue) => {
    if (newValue && onOptionSelect) {
      onOptionSelect(newValue);
    }
  };

  const handleInputChange = (event, newValue, reason) => {
    if (reason === 'reset' || reason === 'clear') {
      return;
    }
    if (onChange) {
      onChange({ target: { value: newValue } });
    }
  };

  return (
    <Autocomplete
      freeSolo
      value={value}
      onChange={handleOptionSelect}
      onInputChange={handleInputChange}
      selectOnFocus
      handleHomeEndKeys
      clearOnBlur={false}
      options={options}
      renderOption={renderOption}
      getOptionLabel={getOptionLabel || (option => option)}
      isOptionEqualToValue={isOptionEqualToValue}
      renderInput={(params) => (
        <StyledTextField
          {...params}
          {...rest}
          placeholder={placeholder}
          inputRef={inputRef}
          onKeyDown={onKeyDown}
          InputProps={{
            ...params.InputProps,
            ...InputProps,
            startAdornment: startAdornment || params.InputProps.startAdornment,
            endAdornment: finalEndAdornment || params.InputProps.endAdornment,
          }}
          sx={{
            ...sx,
          }}
        />
      )}
    />
  );
}

export default IconTextField;
