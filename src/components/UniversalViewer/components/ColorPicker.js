import React, { useCallback, useMemo, useState, useRef, useEffect } from 'react';
import { Box, Typography, TextField, useTheme } from '@mui/material';
import styled from 'styled-components';
import { Wheel } from '@uiw/react-color';
import debounce from 'lodash/debounce';
import useColorStore from '../../../state/ColorState.js';
import { RoundSwatch } from '../styles/SwatchStyles.js';
import CatalogGrid from './CatalogGrid';
import NearestMatches from './NearestMatches.js';

// Fast color conversion
const hexToRgb = hex => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : { r: 0, g: 0, b: 0 };
};

const rgbToHsl = ({ r, g, b }) => {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0, s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100)
  };
};

const Container = styled(Box)`
  display: flex;
  flex-direction: row;
  gap: 16px;
`;

const LeftPanel = styled(Box)`
  width: 200px;
  min-width: 200px;
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const PanelTitle = styled(Typography)`
  font-family: 'Inter', sans-serif;
  font-size: 14px;
  font-weight: 700;
  color: #333;
  text-transform: uppercase;
  margin-bottom: -8px;
`;

const LeftPanelContent = styled(Box)`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const ColorPanel = styled(Box)`
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 16px;
  background: #f5f5f5;
  border-radius: 4px;

  .uiw-color-wheel {
    width: 168px !important;
    height: 168px !important;
  }
`;

const ColorInfo = styled(Box)`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const HexLabel = styled(Typography)`
  font-family: 'Inter', sans-serif;
  font-size: 14px;
  font-weight: 500;
  color: #666;
  margin-left: 4px;
`;

const ColorValues = styled(Box)`
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 100%;
`;

const ValueGroup = styled(Box)`
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
`;

const ValueLabel = styled(Box)`
  font-family: 'Inter', sans-serif;
  font-size: 14px;
  font-weight: 500;
  color: #666;
  padding: 4px 8px;
  border-radius: 4px;
  width: 40px;
  text-align: center;
`;

const ValueDisplay = styled(Box)`
  font-family: 'Inter', monospace;
  font-size: 14px;
  color: #333;
  padding: 4px 8px;
  border-radius: 4px;
  flex: 1;
  white-space: nowrap;
  letter-spacing: -0.2px;
`;

const RightPanel = styled(Box)`
  flex: 1;
  min-width: 0;
`;

const ColorPicker = ({ catalog = [], onColorSelect }) => {
  const theme = useTheme();
  const { currentColor, updateColorState } = useColorStore();
  const [localColor, setLocalColor] = useState(currentColor);
  const isDraggingRef = useRef(false);
  const wheelRef = useRef(null);

  // Keep local color in sync with store
  useEffect(() => {
    setLocalColor(currentColor);
  }, [currentColor]);

  // Calculate RGB and HSL values only when color changes
  const { rgbValues, hslValues } = useMemo(() => {
    const rgb = hexToRgb(localColor);
    return {
      rgbValues: rgb,
      hslValues: rgbToHsl(rgb)
    };
  }, [localColor]);

  // Update state and trigger callbacks
  const updateColor = useCallback((color) => {
    const hex = typeof color === 'string' ? color : color.hex;
    setLocalColor(hex);
    updateColorState(hex);
    onColorSelect?.({ hex });
  }, [updateColorState, onColorSelect]);

  // Super light debounce for smooth updates during drag
  const debouncedUpdateState = useCallback(
    debounce((color) => {
      const hex = typeof color === 'string' ? color : color.hex;
      updateColorState(hex);
      onColorSelect?.({ hex });
    }, 16), // ~1 frame at 60fps
    [updateColorState, onColorSelect]
  );

  // Handle wheel interactions
  const handleColorChange = useCallback((color) => {
    const hex = color.hex.toUpperCase();
    setLocalColor(hex); // Update local immediately for smooth UI

    if (isDraggingRef.current) {
      debouncedUpdateState(hex); // Light debounce during drag
    } else {
      updateColor(hex); // Immediate update for clicks
    }
  }, [updateColor, debouncedUpdateState]);

  // Track drag state
  const handleMouseDown = useCallback(() => {
    isDraggingRef.current = true;
  }, []);

  const handleMouseUp = useCallback(() => {
    isDraggingRef.current = false;
    // Ensure final color is synced
    updateColor(localColor);
  }, [localColor, updateColor]);

  // Cleanup
  useEffect(() => {
    const wheelElement = wheelRef.current;
    if (!wheelElement) return;

    wheelElement.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      wheelElement.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [handleMouseDown, handleMouseUp]);

  // Handle direct hex input
  const handleHexInput = useCallback((e) => {
    const hex = e.target.value.toUpperCase();
    if (/^#[0-9A-F]{6}$/i.test(hex)) {
      updateColor(hex);
    }
  }, [updateColor]);

  return (
    <Container $mode={theme.palette.mode}>
      <LeftPanel>
        <PanelTitle>
          COLOR PANEL
        </PanelTitle>
        
        <LeftPanelContent>
          <ColorPanel>
            <div ref={wheelRef}>
              <Wheel 
                color={localColor}
                onChange={handleColorChange}
                width={168}
                height={168}
              />
            </div>
            
            <ColorInfo>
              <RoundSwatch color={localColor} />
              <HexLabel>HEX</HexLabel>
              <TextField 
                value={localColor}
                size="small"
                sx={{ 
                  width: 120,
                  '& input': {
                    fontFamily: 'Inter, monospace',
                    fontSize: '14px',
                    padding: '4px 8px'
                  },
                  '& .MuiOutlinedInput-root': {
                    padding: 0
                  }
                }}
                onChange={handleHexInput}
              />
            </ColorInfo>
            
            <ColorValues>
              <ValueGroup>
                <ValueLabel sx={{ backgroundColor: '#f5f5f5' }}>RGB</ValueLabel>
                <ValueDisplay sx={{ backgroundColor: '#f5f5f5' }}>
                  {rgbValues.r},{rgbValues.g},{rgbValues.b}
                </ValueDisplay>
              </ValueGroup>
              <ValueGroup>
                <ValueLabel sx={{ backgroundColor: '#f5f5f5' }}>HSL</ValueLabel>
                <ValueDisplay sx={{ backgroundColor: '#f5f5f5' }}>
                  {hslValues.h}°,{hslValues.s}%,{hslValues.l}%
                </ValueDisplay>
              </ValueGroup>
            </ColorValues>
          </ColorPanel>
          
          <NearestMatches />
        </LeftPanelContent>
      </LeftPanel>
      
      <RightPanel>
        <CatalogGrid colors={catalog} showHex={false} />
      </RightPanel>
    </Container>
  );
};

export default ColorPicker;
