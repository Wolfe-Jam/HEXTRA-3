import React from 'react';
import { Autocomplete } from '@mui/material';
import IconTextField from './IconTextField';
import { ColorLensRounded as ColorIcon } from '@mui/icons-material';

function SwatchDropdownField({
  value,
  onChange,
  onKeyDown,
  placeholder = 'Select color...',
  sx = {},
  options = [],
  onSelectionChange,
  ...rest
}) {
  const [isDropdownSelection, setIsDropdownSelection] = React.useState(false);

  React.useEffect(() => {
    if (value && isDropdownSelection) {
      setIsDropdownSelection(false);
    }
  }, [value, isDropdownSelection]);

  const handleOptionSelect = (event, newValue) => {
    if (newValue && onSelectionChange) {
      onSelectionChange(newValue);
      setIsDropdownSelection(true);
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

  const renderOption = (props, option) => (
    <li {...props}>
      <div
        style={{
          width: '16px',
          height: '16px',
          borderRadius: '4px',
          backgroundColor: option,
          marginRight: '8px',
          border: '1px solid var(--border-color)',
        }}
      />
      {option}
    </li>
  );

  const getOptionLabel = (option) => {
    if (typeof option === 'string') {
      return option;
    }
    return option.label || '';
  };

  const isOptionEqualToValue = (option, val) => option === val;

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
        <IconTextField
          {...params}
          placeholder={placeholder}
          onKeyDown={onKeyDown}
          startIcon={<ColorIcon />}
          sx={sx}
          {...rest}
        />
      )}
    />
  );
}

export default SwatchDropdownField;
