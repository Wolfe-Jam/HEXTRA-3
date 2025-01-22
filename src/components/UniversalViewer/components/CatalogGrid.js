import React from 'react';
import styled from 'styled-components';
import { Box, Typography } from '@mui/material';
import useColorStore from '../../../state/ColorState';
import { CatalogSwatch, SwatchLabel } from '../styles/SwatchStyles';

const GridContainer = styled(Box)`
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  gap: 6px;
  padding: 16px;
  width: calc(832px - 232px - 64px);
  height: auto;
  
  @media (max-width: 768px) {
    width: 232px;
    grid-template-columns: repeat(4, 1fr);
    justify-content: center;
    margin: 0 auto;
  }
`;

const Title = styled(Typography)`
  font-family: 'Inter', sans-serif;
  font-size: 16px;
  font-weight: 700;
  color: #333;
  padding-left: 16px;
  margin: 16px 0 8px;
  text-transform: uppercase;
`;

const CatalogGrid = ({ colors, showHex = true }) => {
  const { currentColor, updateColorState } = useColorStore();

  const handleColorSelect = (color) => {
    const hexValue = color.hex.startsWith('#') ? color.hex : `#${color.hex}`;
    updateColorState(hexValue);
  };

  return (
    <>
      <Title>COLOR CATALOG</Title>
      <GridContainer>
        {colors.map((color) => (
          <Box key={color.hex} sx={{ position: 'relative' }}>
            <CatalogSwatch 
              color={color.hex}
              onClick={() => handleColorSelect(color)}
              className={color.hex.toUpperCase() === currentColor.toUpperCase() ? 'selected' : ''}
            >
              <SwatchLabel>
                {color.name}
              </SwatchLabel>
            </CatalogSwatch>
          </Box>
        ))}
      </GridContainer>
    </>
  );
};

export default CatalogGrid;
