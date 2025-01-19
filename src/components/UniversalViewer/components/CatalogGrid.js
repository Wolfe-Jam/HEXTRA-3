import React from 'react';
import styled from 'styled-components';
import { Box, Typography } from '@mui/material';

const Grid = styled(Box)`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(60px, 1fr));
  gap: 8px;
  padding: 16px;
  background: #f5f5f5;
  border-radius: 4px;
`;

const Swatch = styled.div`
  position: relative;
  width: 100%;
  padding-bottom: 100%; // Square aspect ratio
  background-color: ${props => props.color};
  box-shadow: inset 0 0 0 1px rgba(0,0,0,0.1);
  cursor: pointer;
  transition: transform 0.2s;

  ${props => props.isSelected && `
    outline: 2px solid #000;
    outline-offset: 2px;
  `}

  &:hover {
    transform: scale(1.05);
    z-index: 1;
  }
`;

const SwatchLabel = styled(Typography)`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: rgba(255,255,255,0.9);
  padding: 4px;
  font-size: 10px;
  text-align: center;
  font-family: 'Inter', sans-serif;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  opacity: 0;
  transition: opacity 0.2s;

  ${Swatch}:hover & {
    opacity: 1;
  }
`;

const CatalogGrid = ({ 
  colors, 
  selectedColor, 
  onColorSelect, 
  showHex = false 
}) => {
  return (
    <Grid>
      {colors.map((color, index) => (
        <Box key={color.hex + index} sx={{ position: 'relative' }}>
          <Swatch 
            color={color.hex}
            isSelected={selectedColor?.hex === color.hex}
            onClick={() => onColorSelect(color)}
          >
            <SwatchLabel>
              {showHex ? color.hex.toUpperCase() : color.name}
            </SwatchLabel>
          </Swatch>
        </Box>
      ))}
    </Grid>
  );
};

export default CatalogGrid;
