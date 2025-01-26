import styled, { css } from 'styled-components';
import { Box } from '@mui/material';

// Shared hover and selection styles
const glowEffects = css`
  &:hover {
    box-shadow: 0 0 15px rgba(255, 255, 255, 0.4),  // White glow
                0 0 5px rgba(0, 0, 0, 0.2);         // Subtle black
  }

  &.selected {
    border: 2px solid #FFFFFF;                      // White border
    outline: 2px solid #000000;                     // Black outline
  }
`;

// Standard Round Swatch (54x40)
export const RoundSwatch = styled.div`
  width: 54px;
  height: 40px;
  background-color: ${props => props.color};
  box-shadow: inset 0 0 0 1px rgba(0,0,0,0.1);
  transition: all 0.2s ease-in-out;
  border-radius: 20px;
  ${glowEffects}
`;

// Nearest Match Swatch Card (Smaller)
export const SwatchCard = styled.div`
  display: flex;
  align-items: center;
  padding: 8px;
  gap: 12px;
  background: #f5f5f5;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s ease-in-out;
  ${glowEffects}

  &:not(:last-child) {
    margin-bottom: 8px;
  }

  &:hover {
    background: #ebebeb;
  }
`;

export const SwatchCardColor = styled.div`
  width: 36px;
  height: 36px;
  background-color: ${props => props.color};
  box-shadow: inset 0 0 0 1px rgba(0,0,0,0.1);
  flex-shrink: 0;
  border-radius: 4px;
`;

export const SwatchCardInfo = styled.div`
  flex: 1;
  min-width: 0;  // Allow text truncation
  
  .name {
    font-size: 14px;
    font-weight: 500;
    margin-bottom: 2px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  
  .match {
    font-size: 12px;
    color: #666;
  }
`;

// Catalog Swatch with label
export const CatalogSwatch = styled(Box)`
  width: 100%;
  aspect-ratio: 1;
  background-color: ${props => props.color};
  border-radius: 4px;
  cursor: pointer;
  transition: transform 0.2s;
  position: relative;
  border: 1px solid var(--border-color);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);

    .swatch-label {
      opacity: 1;
    }
  }

  &.selected {
    border: 2px solid var(--primary-main);
    box-shadow: 0 0 0 2px var(--primary-light);

    .swatch-label {
      opacity: 1;
    }
  }

  &.show-all-labels .swatch-label {
    opacity: 1;
  }
`;

export const SwatchLabel = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 4px;
  background: rgba(0, 0, 0, 0.9);
  color: white;
  font-size: 12px;
  text-align: center;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  opacity: 0;
  font-weight: 500;
  transition: opacity 0.2s;
`;
