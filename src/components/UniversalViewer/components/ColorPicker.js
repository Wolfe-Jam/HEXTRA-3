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
const hexToRgb = (hex) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
};

const rgbToHsl = ({ r, g, b }) => {
  r /= 255;
  g /= 255;
  b /= 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h, s, l = (max + min) / 2;

  if (max === min) {
    h = s = 0;
  } else {
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
  width: 832px;
  padding: 24px;
  background: ${({ $mode }) => $mode === 'dark' ? '#1a1a1a' : '#fff'};
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  border: 1px solid ${({ $mode }) => $mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'};
  
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: center;
    width: 100%;
    max-width: 232px;
    margin: 0 auto;
  }
`;

const LeftPanel = styled(Box)`
  width: 260px;
  min-width: 260px;
  height: 100%;
  background: #fff;
  display: flex;
  flex-direction: column;
  
  @media (max-width: 768px) {
    width: 100%;
    min-width: unset;
    height: auto;
    align-items: center;
  }
`;

const RightPanel = styled(Box)`
  flex: 1;
  height: 100%;
  background: #fff;
  margin-left: 0;
  padding-left: 0;
  overflow: hidden;
  
  @media (max-width: 768px) {
    width: 100%;
    height: auto;
    min-height: 300px;
    overflow: visible;
  }
`;

const ColorPanel = styled(Box)`
  width: 232px;
  min-width: 232px;
  max-width: 232px;
  padding: 16px;
  background: #f5f5f5;
  border-radius: 4px;
  margin: 16px 0;
  
  @media (max-width: 532px) {
    width: 232px;
    min-width: 232px;
    max-width: 232px;
    margin: 16px auto;
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

const getColorByHex = (hex) => {
  switch(hex.toUpperCase()) {
    case '#000000':
      return { name: 'Black', hex: '#000000' };
    case '#FFFFFF':
      return { name: 'White', hex: '#FFFFFF' };
    case '#FF0000':
      return { name: 'Red', hex: '#FF0000' };
    case '#00FF00':
      return { name: 'Green', hex: '#00FF00' };
    case '#0000FF':
      return { name: 'Blue', hex: '#0000FF' };
    default:
      return { name: 'Custom', hex: hex };
  }
};

const ColorPicker = ({ catalog = [], onColorSelect }) => {
  const theme = useTheme();
  const { currentColor, updateColorState } = useColorStore();
  const [localColor, setLocalColor] = useState(currentColor);
  const [hexInput, setHexInput] = useState(currentColor);
  const isDraggingRef = useRef(false);
  const debouncedUpdateStateRef = useRef(null);

  const updateColor = useCallback((color) => {
    const hex = typeof color === 'string' ? color : color.hex;
    setLocalColor(hex);
    updateColorState(hex);
    if (onColorSelect) {
      onColorSelect({ hex });
    }
  }, [updateColorState, onColorSelect]);

  const colorState = useMemo(() => {
    const rgb = hexToRgb(localColor);
    if (!rgb) return null;

    return {
      rgbValues: rgb,
      hslValues: rgbToHsl(rgb)
    };
  }, [localColor]);

  const handleColorUpdate = useCallback((color) => {
    const hex = typeof color === 'string' ? color : color.hex;
    updateColor(hex);
  }, [updateColor]);

  const debouncedUpdateState = useMemo(() => 
    debounce((color) => {
      const hex = typeof color === 'string' ? color : color.hex;
      updateColorState(hex);
      if (onColorSelect) {
        onColorSelect({ hex });
      }
    }, 16),
    [updateColorState, onColorSelect]
  );

  const handleColorChange = useCallback((color) => {
    const hex = color.hex.toUpperCase();
    setLocalColor(hex);

    if (isDraggingRef.current) {
      debouncedUpdateState(hex);
    } else {
      if (onColorSelect) {
        onColorSelect({ hex });
      }
      updateColorState(hex);
    }
  }, [debouncedUpdateState, onColorSelect, updateColorState]);

  useEffect(() => {
    const currentDebouncedUpdateState = debouncedUpdateStateRef.current;
    
    return () => {
      if (currentDebouncedUpdateState) {
        currentDebouncedUpdateState.cancel();
      }
    };
  }, []);

  useEffect(() => {
    setLocalColor(currentColor);
  }, [currentColor]);

  return (
    <Container $mode={theme.palette.mode}>
      <LeftPanel>
        <PanelTitle>
          COLOR PANEL
        </PanelTitle>
        
        <LeftPanelContent>
          <ColorPanel>
            <Wheel 
              color={localColor}
              onChange={handleColorChange}
              onMouseDown={() => { isDraggingRef.current = true; }}
              onMouseUp={() => { isDraggingRef.current = false; }}
              width={200}
              height={200}
            />
            
            <ColorInfo>
              <RoundSwatch color={localColor} />
              <HexLabel>HEX</HexLabel>
              <TextField 
                value={hexInput}
                size="small"
                sx={{ 
                  width: 100,
                  '& input': {
                    fontFamily: 'Inter, monospace',
                    fontSize: '14px'
                  }
                }}
                onChange={(e) => {
                  const value = e.target.value;
                  setHexInput(value);
                  if (/^#[0-9A-F]{6}$/i.test(value)) {
                    handleColorUpdate(value);
                  }
                }}
              />
            </ColorInfo>
            
            <ColorValues>
              <ValueGroup className="rgb">
                <ValueLabel sx={{ backgroundColor: '#f5f5f5' }}>RGB</ValueLabel>
                <ValueDisplay sx={{ backgroundColor: '#f5f5f5' }}>
                  {colorState?.rgbValues.r},{colorState?.rgbValues.g},{colorState?.rgbValues.b}
                </ValueDisplay>
              </ValueGroup>
              <ValueGroup className="hsl">
                <ValueLabel sx={{ backgroundColor: '#f5f5f5' }}>HSL</ValueLabel>
                <ValueDisplay sx={{ backgroundColor: '#f5f5f5' }}>
                  {colorState?.hslValues.h}°,{colorState?.hslValues.s}%,{colorState?.hslValues.l}%
                </ValueDisplay>
              </ValueGroup>
            </ColorValues>
          </ColorPanel>
          
          <NearestMatches />
        </LeftPanelContent>
      </LeftPanel>
      
      <RightPanel>
        <CatalogGrid colors={catalog} showHex={false} onColorSelect={handleColorUpdate} />
      </RightPanel>
    </Container>
  );
};

export default ColorPicker;
