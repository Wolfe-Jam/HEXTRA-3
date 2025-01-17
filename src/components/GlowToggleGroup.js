import React from 'react';
import { Box } from '@mui/material';
import GlowTextButton from './GlowTextButton';
import GlowTooltip from './GlowTooltip';

/**
 * GlowToggleGroup - A group of mutually exclusive options
 * Uses theme-aware black/white styling with glow interactions
 * 
 * @param {Object} props
 * @param {Array} props.options - Array of { value, label, tooltip } objects
 * @param {string} props.value - Currently selected value
 * @param {function} props.onChange - Callback when selection changes
 * @param {boolean} props.showTooltips - Whether to show tooltips
 */
const GlowToggleGroup = ({ options, value, onChange, showTooltips = true }) => {
  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        gap: 2
      }}
    >
      {options.map((option) => (
        <GlowTooltip
          key={option.value}
          title={option.tooltip}
          enterDelay={200}
          leaveDelay={0}
          disabled={!showTooltips}
        >
          <GlowTextButton
            onClick={() => onChange(option.value)}
            variant={value === option.value ? "contained" : "outlined"}
          >
            {option.label}
          </GlowTextButton>
        </GlowTooltip>
      ))}
    </Box>
  );
};

export default GlowToggleGroup;
