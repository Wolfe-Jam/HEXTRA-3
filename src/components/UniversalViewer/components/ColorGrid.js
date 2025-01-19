import React, { useState } from 'react';
import styled from 'styled-components';
import { ColorTheory } from '../../../utils/colorTheory';

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(${props => props.columns || 8}, 1fr);
  grid-template-rows: repeat(${props => props.rows || 8}, 1fr);
  gap: ${props => props.gap || 8}px;
  padding: 16px;
  background: #f5f5f5;
  border-radius: 8px;
`;

const ColorTile = styled.div`
  position: relative;
  aspect-ratio: 1;
  border-radius: 4px;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
  box-shadow: ${props => props.selected ? 
    '0 0 0 2px #1976d2, 0 4px 8px rgba(0,0,0,0.2)' : 
    '0 2px 4px rgba(0,0,0,0.1)'};
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  }
`;

const ColorSwatch = styled.div`
  width: 100%;
  height: 100%;
  background-color: ${props => props.color};
  border-radius: inherit;
`;

const ColorInfo = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 8px;
  background: rgba(255,255,255,0.9);
  border-bottom-left-radius: inherit;
  border-bottom-right-radius: inherit;
  font-size: 12px;
  color: ${props => props.dark ? '#fff' : '#000'};
  opacity: 0;
  transition: opacity 0.2s;

  ${ColorTile}:hover & {
    opacity: 1;
  }
`;

const RelationshipOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const RelationshipPanel = styled.div`
  background: white;
  padding: 24px;
  border-radius: 8px;
  max-width: 600px;
  width: 90%;
`;

const RelationshipGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  margin-top: 16px;
`;

const ColorGrid = ({
  colors,
  layout = { rows: 8, columns: 8, gap: 8 },
  onColorSelect
}) => {
  const [selectedColor, setSelectedColor] = useState(null);
  const [showRelationships, setShowRelationships] = useState(false);

  const handleColorClick = (color) => {
    setSelectedColor(color);
    onColorSelect?.(color);
  };

  const handleDoubleClick = (color) => {
    setSelectedColor(color);
    setShowRelationships(true);
  };

  const renderRelationships = () => {
    if (!selectedColor) return null;

    const relationships = ColorTheory.getRelationships(
      selectedColor.hex,
      colors.map(c => ColorTheory.hexToRgb(c.hex))
    );

    return (
      <RelationshipOverlay onClick={() => setShowRelationships(false)}>
        <RelationshipPanel onClick={e => e.stopPropagation()}>
          <h3>{selectedColor.name} Relationships</h3>
          <RelationshipGrid>
            <div>
              <h4>Opposite</h4>
              <ColorSwatch 
                color={ColorTheory.rgbToHex(
                  ColorTheory.hslToRgb(relationships.opposite)
                )} 
              />
            </div>
            <div>
              <h4>Split Complements</h4>
              {relationships.splitComplements.map((hsl, i) => (
                <ColorSwatch 
                  key={i}
                  color={ColorTheory.rgbToHex(ColorTheory.hslToRgb(hsl))}
                />
              ))}
            </div>
            <div>
              <h4>Triad</h4>
              {relationships.triad.map((hsl, i) => (
                <ColorSwatch 
                  key={i}
                  color={ColorTheory.rgbToHex(ColorTheory.hslToRgb(hsl))}
                />
              ))}
            </div>
          </RelationshipGrid>
        </RelationshipPanel>
      </RelationshipOverlay>
    );
  };

  return (
    <>
      <Grid 
        columns={layout.columns} 
        rows={layout.rows} 
        gap={layout.gap}
      >
        {colors.map(color => (
          <ColorTile 
            key={color.hex + color.name}
            selected={selectedColor?.hex === color.hex}
            onClick={() => handleColorClick(color)}
            onDoubleClick={() => handleDoubleClick(color)}
          >
            <ColorSwatch color={color.hex} />
            <ColorInfo>
              <div>{color.name}</div>
              <div>{color.hex}</div>
            </ColorInfo>
          </ColorTile>
        ))}
      </Grid>
      {showRelationships && renderRelationships()}
    </>
  );
};

export default ColorGrid;
