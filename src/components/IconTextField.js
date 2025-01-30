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
    '&:hover': {
      backgroundColor: 'transparent',
    },
    '&.Mui-focused': {
      backgroundColor: 'transparent',
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
  ...rest
}) {
  const handleReset = () => {
    if (onReset) {
      onReset();
    }
  };

  const endAdornment = hasReset ? (
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
  ) : InputProps.endAdornment;

  const startAdornment = startIcon ? (
    <InputAdornment position="start">
      {React.cloneElement(startIcon, {
        sx: {
          color: 'text.secondary',
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
      autoSelect
      options={options}
      renderOption={renderOption}
      getOptionLabel={getOptionLabel}
      isOptionEqualToValue={isOptionEqualToValue}
      renderInput={(params) => (
        <StyledTextField
          {...params}
          placeholder={placeholder}
          onKeyDown={onKeyDown}
          InputProps={{
            ...params.InputProps,
            ...InputProps,
            startAdornment: startAdornment || params.InputProps.startAdornment,
            endAdornment: endAdornment || params.InputProps.endAdornment,
          }}
          sx={{
            ...sx,
          }}
          {...rest}
        />
      )}
    />
  );
}

export default IconTextField;
