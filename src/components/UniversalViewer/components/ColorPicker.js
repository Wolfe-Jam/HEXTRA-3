import React, { useState } from 'react';
import { Box, Typography, Grid, TextField } from '@mui/material';
import styled from 'styled-components';
import { Wheel } from '@uiw/react-color';
import { ColorTheory } from '../../../utils/colorTheory';
import SwatchInfoCard from './SwatchInfoCard';

const Container = styled(Box)`
  display: flex;
  gap: 24px;
  align-items: flex-start;
`;

const LeftPanel = styled(Box)`
  flex: 1;
  display: flex;
  flex-direction: column;
`;

const RightPanel = styled(Box)`
  flex: 1;
`;

const ColorPanel = styled(Box)`
  padding: 16px;
  background: #f5f5f5;
  border-radius: 4px;
  margin-bottom: 16px;
`;

const RoundSwatch = styled.div`
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background-color: ${props => props.color};
  box-shadow: inset 0 0 0 1px rgba(0,0,0,0.1);
`;

const ColorInfo = styled(Box)`
  display: flex;
  gap: 16px;
  align-items: center;
  margin-top: 16px;
`;

const HexLabel = styled(Typography)`
  font-family: 'Inter', sans-serif;
  font-size: 14px;
  font-weight: 500;
  color: #666;
`;

const ColorValues = styled(Box)`
  display: flex;
  justify-content: space-between;
  margin-top: 12px;
  font-family: 'Inter', monospace;
  font-size: 13px;
`;

const ValueGroup = styled(Box)`
  width: 80px;
  text-align: center;
`;

const PanelTitle = styled(Typography)`
  font-family: 'Inter', sans-serif;
  font-size: 16px;
  font-weight: 700;
  color: #333;
  margin-bottom: 16px;
`;

const CatalogTitle = styled(Typography)`
  font-family: 'Inter', sans-serif;
  font-size: 16px;
  font-weight: 700;
  color: #333;
  margin-bottom: 16px;
`;

const SubTitle = styled(Typography)`
  font-family: 'Inter', sans-serif;
  font-size: 14px;
  font-style: italic;
  color: #666;
  margin-bottom: 12px;
`;

const NearestMatches = styled(Box)`
  padding: 16px;
  background: #f5f5f5;
  border-radius: 4px;
`;

const ColorPicker = ({ onColorSelect, catalog }) => {
  const [hex, setHex] = useState('#4169E1'); // Royal Blue
  const [nearestColors, setNearestColors] = useState([]);
  const [rgb, setRgb] = useState(ColorTheory.hexToRgb('#4169E1'));
  const [hsl, setHsl] = useState(ColorTheory.rgbToHsl(ColorTheory.hexToRgb('#4169E1')));
  
  const handleColorChange = (color) => {
    const newHex = color.hex;
    setHex(newHex);
    updateColorInfo(newHex);
  };
  
  const updateColorInfo = (newHex) => {
    const newRgb = ColorTheory.hexToRgb(newHex);
    const newHsl = ColorTheory.rgbToHsl(newRgb);
    setRgb(newRgb);
    setHsl(newHsl);
    
    // Find nearest colors (limit to 3)
    const results = ColorTheory.findNearest(newRgb, catalog.slice(0, 64).map(c => ({
      rgb: ColorTheory.hexToRgb(c.hex),
      name: c.name,
      hex: c.hex,
      family: c.family,
      tags: c.tags
    }))).slice(0, 3);
    
    setNearestColors(results);
  };
  
  const handleColorSelect = (color) => {
    setHex(color.hex);
    updateColorInfo(color.hex);
    onColorSelect?.(color);
  };

  return (
    <Container>
      {/* Left Panel - Control Panel */}
      <LeftPanel>
        <PanelTitle>
          COLOR PANEL
        </PanelTitle>
        
        <ColorPanel>
          <Wheel 
            color={hex}
            onChange={handleColorChange}
            width={200}
            height={200}
          />
          
          <ColorInfo>
            <RoundSwatch color={hex} />
            <HexLabel>HEX</HexLabel>
            <TextField 
              value={hex.toUpperCase()}
              size="small"
              sx={{ 
                width: 120,
                '& input': {
                  fontFamily: 'Inter, monospace',
                  fontSize: '14px'
                }
              }}
              onChange={(e) => handleColorChange({ hex: e.target.value })}
            />
          </ColorInfo>
          
          <ColorValues>
            <ValueGroup>
              <Typography variant="caption" color="textSecondary" sx={{ fontSize: '12px', mb: 0.5 }}>
                RGB
              </Typography>
              <Typography sx={{ fontSize: '13px', fontFamily: 'Inter, monospace' }}>
                {rgb.r}, {rgb.g}, {rgb.b}
              </Typography>
            </ValueGroup>
            <ValueGroup>
              <Typography variant="caption" color="textSecondary" sx={{ fontSize: '12px', mb: 0.5 }}>
                HSL
              </Typography>
              <Typography sx={{ fontSize: '13px', fontFamily: 'Inter, monospace' }}>
                {hsl.h}°, {hsl.s}%, {hsl.l}%
              </Typography>
            </ValueGroup>
          </ColorValues>
        </ColorPanel>

        <NearestMatches>
          <SubTitle>
            Nearest Matches
          </SubTitle>
          
          <Box>
            {nearestColors.map((match, index) => (
              <SwatchInfoCard 
                key={match.hex + index}
                color={match}
                name={match.name}
                hex={match.hex}
                confidence={match.confidence}
                rgb={match.rgb}
                onClick={() => handleColorSelect(match)}
              />
            ))}
          </Box>
        </NearestMatches>
      </LeftPanel>

      {/* Right Panel - Color Catalog */}
      <RightPanel>
        <CatalogTitle>
          Color Catalog
        </CatalogTitle>
        
        <Box sx={{ 
          display: 'grid',
          gridTemplateColumns: 'repeat(8, 1fr)',
          gridTemplateRows: 'repeat(8, 1fr)',
          gap: 1,
          padding: 2,
          background: '#f5f5f5',
          borderRadius: '4px',
          aspectRatio: '1'
        }}>
          {catalog.slice(0, 64).map((color, index) => (
            <Box 
              key={color.hex + index}
              sx={{
                aspectRatio: '1',
                backgroundColor: color.hex,
                cursor: 'pointer',
                boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.1)',
                transition: 'transform 0.2s',
                '&:hover': {
                  transform: 'scale(1.05)',
                  zIndex: 1
                }
              }}
              onClick={() => handleColorSelect(color)}
            />
          ))}
        </Box>
      </RightPanel>
    </Container>
  );
};

export default ColorPicker;
