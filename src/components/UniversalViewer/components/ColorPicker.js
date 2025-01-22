import React, { useCallback, useMemo, useState, useRef, useEffect } from 'react';
import { Box, Typography, TextField } from '@mui/material';
import styled from 'styled-components';
import { Wheel } from '@uiw/react-color';
import debounce from 'lodash/debounce';
import useColorStore from '../../../state/ColorState';
import { RoundSwatch } from '../styles/SwatchStyles';
import CatalogGrid from './CatalogGrid';
import NearestMatches from './NearestMatches';

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
  gap: 0;
  height: 100%;
  background: #fff;
`;

const LeftPanel = styled(Box)`
  min-width: 232px;
  height: 100%;
  background: #fff;
  display: flex;
  flex-direction: column;
`;

const RightPanel = styled(Box)`
  flex: 1;
  height: 100%;
  background: #fff;
  margin-left: 0;
  padding-left: 0;
`;

const ColorPanel = styled(Box)`
  width: 260px;
  padding: 16px;
  background: #f5f5f5;
  border-radius: 4px;
  margin: 0 auto 8px;
  @media (max-width: 532px) {
    width: calc(100% - 32px);
    max-width: 260px;
  }
`;

const ColorInfo = styled(Box)`
  display: flex;
  gap: 12px;
  align-items: center;
  margin-top: 16px;
  background: #f5f5f5;
`;

const ColorValues = styled(Box)`
  position: relative;
  margin-top: 12px;
  padding-bottom: 34px;
  font-family: 'Inter', monospace;
  font-size: 8px;
  background: #f5f5f5;
`;

const ValueGroup = styled(Box)`
  position: absolute;
  display: flex;
  flex-direction: column;
  padding: 0;
  margin: 0;
  
  &.rgb {
    left: 0;
  }
  
  &.hsl {
    left: 108px;
  }
`;

const ValueLabel = styled(Typography)`
  color: #666;
  font-size: 8px;
  margin-bottom: 2px;
  padding: 0;
  line-height: 1;
  background-color: #f5f5f5;
`;

const ValueDisplay = styled(Typography)`
  font-family: 'Inter', monospace;
  font-size: 8px;
  white-space: nowrap;
  padding: 0;
  line-height: 1;
  background-color: #f5f5f5;
`;

const ValueText = styled(Typography)`
  font-family: 'Inter', monospace;
  font-size: 13px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const PanelTitle = styled(Typography)`
  font-family: 'Inter', sans-serif;
  font-size: 16px;
  font-weight: 700;
  color: #333;
  padding-left: 16px;
  margin: 16px 0 8px;
  text-transform: uppercase;
`;

const LeftPanelContent = styled(Box)`
  padding: 0;
`;

const HexLabel = styled(Typography)`
  font-family: 'Inter', sans-serif;
  font-size: 14px;
  color: #666;
`;

const ColorPicker = ({ catalog = [], onColorSelect }) => {
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
    <Container>
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
                width={200}
                height={200}
              />
            </div>
            
            <ColorInfo>
              <RoundSwatch color={localColor} />
              <HexLabel>HEX</HexLabel>
              <TextField 
                value={localColor}
                size="small"
                sx={{ 
                  width: 100,
                  '& input': {
                    fontFamily: 'Inter, monospace',
                    fontSize: '14px'
                  }
                }}
                onChange={handleHexInput}
              />
            </ColorInfo>
            
            <ColorValues>
              <ValueGroup className="rgb">
                <ValueLabel sx={{ backgroundColor: '#f5f5f5' }}>RGB</ValueLabel>
                <ValueDisplay sx={{ backgroundColor: '#f5f5f5' }}>
                  {rgbValues.r},{rgbValues.g},{rgbValues.b}
                </ValueDisplay>
              </ValueGroup>
              <ValueGroup className="hsl">
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
        <CatalogGrid colors={catalog} showHex={false} onColorSelect={updateColor} />
      </RightPanel>
    </Container>
  );
};

export default ColorPicker;
