import React, { useState, useMemo } from 'react';
import styled from 'styled-components';
import { Box, Typography, Select, MenuItem, FormControl } from '@mui/material';
import useColorStore from '../../../state/ColorState.js';
import { CatalogSwatch, SwatchLabel } from '../styles/SwatchStyles.js';
import { sortByName, sortByFamily, sortByPopularity } from '../../../data/catalogs/sortMethods.js';

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

const HeaderContainer = styled(Box)`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 16px 8px;
`;

const Title = styled(Typography)`
  font-family: 'Inter', sans-serif;
  font-size: 16px;
  font-weight: 700;
  color: #333;
  text-transform: uppercase;
`;

const SortSelect = styled(Select)`
  min-width: 150px;
  height: 32px;
  margin-left: 16px;
  
  .MuiSelect-select {
    padding: 6px 12px;
    font-size: 14px;
  }
`;

const CatalogGrid = ({ colors, showHex = true }) => {
  const { currentColor, updateColorState } = useColorStore();
  const [sortMethod, setSortMethod] = useState('default');

  const sortedColors = useMemo(() => {
    switch (sortMethod) {
      case 'alphabetical':
        return sortByName(colors);
      case 'family':
        return sortByFamily(colors);
      case 'popularity':
        return sortByPopularity(colors);
      default:
        return colors;
    }
  }, [colors, sortMethod]);

  const handleColorSelect = (color) => {
    const hexValue = color.hex.startsWith('#') ? color.hex : `#${color.hex}`;
    updateColorState(hexValue);
  };

  return (
    <>
      <HeaderContainer>
        <Title>COLOR CATALOG</Title>
        <FormControl size="small">
          <SortSelect
            value={sortMethod}
            onChange={(e) => setSortMethod(e.target.value)}
            variant="outlined"
          >
            <MenuItem value="default">Printify Order (1-63)</MenuItem>
            <MenuItem value="alphabetical">A-Z by Name</MenuItem>
            <MenuItem value="family">Color Families</MenuItem>
            <MenuItem value="popularity">Most Popular</MenuItem>
          </SortSelect>
        </FormControl>
      </HeaderContainer>
      <GridContainer>
        {sortedColors.map((color) => (
          <Box key={color.hex} sx={{ position: 'relative' }}>
            <CatalogSwatch 
              color={color.hex}
              onClick={() => handleColorSelect(color)}
              className={color.hex.toUpperCase() === currentColor.toUpperCase() ? 'selected' : ''}
            >
              {showHex && <SwatchLabel>{color.hex}</SwatchLabel>}
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
