import styled, { css } from 'styled-components';

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

// Standard Round Swatch (48x48)
export const RoundSwatch = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background-color: ${props => props.color};
  box-shadow: inset 0 0 0 1px rgba(0,0,0,0.1);
  transition: all 0.2s ease-in-out;
  ${glowEffects}
`;

// Catalog Swatch (Flex Grid)
export const CatalogSwatch = styled.div`
  position: relative;
  aspect-ratio: 1;
  background-color: ${props => props.color};
  box-shadow: inset 0 0 0 1px rgba(0,0,0,0.1);
  cursor: pointer;
  transition: all 0.2s ease-in-out;
  ${glowEffects}
`;

// Swatch Name Label
export const SwatchLabel = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 4px;
  background: rgba(255,255,255,0.9);
  font-family: 'Inter', sans-serif;
  font-size: 12px;
  text-align: center;
  opacity: 0;
  transition: opacity 0.2s;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;

  ${CatalogSwatch}:hover & {
    opacity: 1;
  }
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
  border-radius: 4px;
  background-color: ${props => props.color};
  box-shadow: inset 0 0 0 1px rgba(0,0,0,0.1);
  flex-shrink: 0;
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
