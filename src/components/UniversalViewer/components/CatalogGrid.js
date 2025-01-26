import React, { useState, useMemo } from 'react';
import styled from 'styled-components';
import { Box, Typography, Select, MenuItem, FormControl, Switch, FormControlLabel } from '@mui/material';
import useColorStore from '../../../state/ColorState.js';
import { CatalogSwatch, SwatchLabel } from '../styles/SwatchStyles.js';
import { 
  sortByName, 
  sortByFamily, 
  sortByPopularity,
  sortByLightest,
  sortByDarkest,
  sortByIndex
} from '../../../data/catalogs/sortMethods.js';

const GridContainer = styled(Box)`
  display: grid;
  gap: 8px;
  padding: 16px;
  width: 100%;
  
  &.size-4 {
    grid-template-columns: repeat(4, 1fr);
  }
  
  &.size-6 {
    grid-template-columns: repeat(6, 1fr);
  }
  
  &.size-8 {
    grid-template-columns: repeat(8, 1fr);
  }
`;

const HeaderContainer = styled(Box)`
  padding: 16px 16px 8px;
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const TitleRow = styled(Box)`
  display: flex;
  justify-content: center;
  align-items: center;
`;

const ControlsRow = styled(Box)`
  display: flex;
  gap: 8px;
  align-items: center;
`;

const Title = styled(Typography)`
  font-family: 'Inter', sans-serif;
  font-size: 14px;
  font-weight: 700;
  color: #333;
  text-transform: uppercase;
  text-align: center;
  width: 100%;
`;

const Controls = styled(Box)`
  display: flex;
  gap: 8px;
  align-items: center;
`;

const StyledSelect = styled(Select)`
  min-width: 150px;
  height: 32px;
  margin-left: 16px;
  
  .MuiSelect-select {
    padding: 6px 12px;
    font-size: 14px;
  }
`;

const CatalogGrid = ({ colors = [], showHex = true }) => {
  const [sortMethod, setSortMethod] = useState('default');
  const [gridSize, setGridSize] = useState(6);
  const [showLabels, setShowLabels] = useState(false);
  const { currentColor, updateColorState } = useColorStore();

  const sortedColors = useMemo(() => {
    switch (sortMethod) {
      case 'name':
        return sortByName(colors);
      case 'family':
        return sortByFamily(colors);
      case 'popularity':
        return sortByPopularity(colors);
      case 'lightest':
        return sortByLightest(colors);
      case 'darkest':
        return sortByDarkest(colors);
      case 'default':
      default:
        return sortByIndex(colors);
    }
  }, [colors, sortMethod]);

  return (
    <Box>
      <HeaderContainer>
        <TitleRow>
          <Title>COLOR CATALOG</Title>
        </TitleRow>
        <ControlsRow>
          <FormControlLabel
            control={
              <Switch
                size="small"
                checked={showLabels}
                onChange={(e) => setShowLabels(e.target.checked)}
              />
            }
            label="Show All Labels"
          />
          <FormControl size="small">
            <StyledSelect
              value={gridSize}
              onChange={(e) => setGridSize(e.target.value)}
            >
              <MenuItem value={4}>4 Per Row</MenuItem>
              <MenuItem value={6}>6 Per Row</MenuItem>
              <MenuItem value={8}>8 Per Row</MenuItem>
            </StyledSelect>
          </FormControl>
          <FormControl size="small">
            <StyledSelect
              value={sortMethod}
              onChange={(e) => setSortMethod(e.target.value)}
            >
              <MenuItem value="default">Printify Order (1-63)</MenuItem>
              <MenuItem value="popularity">Most Popular</MenuItem>
              <MenuItem value="name">Alphabetical</MenuItem>
              <MenuItem value="family">Color Family</MenuItem>
              <MenuItem value="lightest">Lightest First</MenuItem>
              <MenuItem value="darkest">Darkest First</MenuItem>
            </StyledSelect>
          </FormControl>
        </ControlsRow>
      </HeaderContainer>

      <GridContainer className={`size-${gridSize}`}>
        {sortedColors.map((color, index) => (
          <CatalogSwatch
            key={`${color.hex}-${index}`}
            color={color.hex}
            onClick={() => updateColorState(color.hex)}
            className={`${color.hex.toUpperCase() === currentColor.toUpperCase() ? 'selected' : ''} ${showLabels ? 'show-all-labels' : ''}`}
          >
            <SwatchLabel className="swatch-label">{color.name}</SwatchLabel>
          </CatalogSwatch>
        ))}
      </GridContainer>
    </Box>
  );
};

export default CatalogGrid;
