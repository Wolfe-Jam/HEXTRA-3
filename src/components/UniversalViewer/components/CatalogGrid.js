import React from 'react';
import styled from 'styled-components';
import { Box, Typography } from '@mui/material';
import useColorStore from '../../../state/ColorState';
import { CatalogSwatch, SwatchLabel } from '../styles/SwatchStyles';

const GridContainer = styled(Box)`
  display: grid;
  grid-template-columns: repeat(8, minmax(60px, 1fr));
  gap: 8px;
  width: 100%;
  padding: 16px;
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
              {showHex && (
                <SwatchLabel>
                  {color.hex.toUpperCase()}
                </SwatchLabel>
              )}
            </CatalogSwatch>
          </Box>
        ))}
      </GridContainer>
    </>
  );
};

export default CatalogGrid;
