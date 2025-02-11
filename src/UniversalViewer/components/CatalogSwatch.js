import React from 'react';
import styled from 'styled-components';

const SwatchContainer = styled.div`
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
  padding: 4px;
  transition: transform 0.2s;

  &:hover {
    transform: scale(1.05);
  }
`;

const Square = styled.div`
  width: 48px;
  height: 48px;
  background-color: ${props => props.color};
  box-shadow: inset 0 0 0 1px rgba(0,0,0,0.1);
`;

const Label = styled.div`
  font-size: 12px;
  margin-top: 4px;
  text-align: center;
  max-width: 48px;
  overflow: hidden;
  white-space: nowrap;
  color: #666;
  transform-origin: center;
  transform: scale(${props => props.scale});
`;

const CatalogSwatch = ({ 
  color, 
  name, 
  showHex = false,
  onClick 
}) => {
  // Calculate scale to fit text
  const getTextScale = (text) => {
    const baseWidth = 48; // Swatch width
    const approxCharWidth = 7; // Approximate width of each character in pixels
    const textWidth = text.length * approxCharWidth;
    return textWidth > baseWidth ? baseWidth / textWidth : 1;
  };

  const displayText = showHex ? color.toUpperCase() : name;
  const scale = getTextScale(displayText);

  return (
    <SwatchContainer onClick={onClick}>
      <Square color={color} />
      <Label scale={scale}>{displayText}</Label>
    </SwatchContainer>
  );
};

export default CatalogSwatch;
