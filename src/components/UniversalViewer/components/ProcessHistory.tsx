import React, { useState } from 'react';
import { useProcessHistory } from '../hooks/useProcessHistory';
import { CoreImageMetadata } from '../types';
import styled from 'styled-components';

const HistoryContainer = styled.div`
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 8px;
  max-height: 600px;
  overflow-y: auto;
`;

const HistoryGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1rem;
  padding: 1rem;
`;

const HistoryItem = styled.div`
  background: white;
  border-radius: 6px;
  padding: 0.5rem;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  transition: transform 0.2s;
  cursor: pointer;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0,0,0,0.15);
  }
`;

const Thumbnail = styled.img`
  width: 100%;
  height: 150px;
  object-fit: cover;
  border-radius: 4px;
`;

const ColorChips = styled.div`
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
  margin: 0.5rem 0;
`;

const ColorChip = styled.div<{ color: string }>`
  width: 24px;
  height: 24px;
  border-radius: 12px;
  background-color: ${props => props.color};
  border: 1px solid rgba(0,0,0,0.1);
`;

const ItemInfo = styled.div`
  font-size: 0.875rem;
  color: #666;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 1rem;
`;

const Title = styled.h3`
  margin: 0;
  color: #333;
`;

const ClearButton = styled.button`
  background: #dc3545;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.875rem;

  &:hover {
    background: #c82333;
  }
`;

interface ProcessHistoryProps {
  onItemClick?: (metadata: CoreImageMetadata) => void;
}

export const ProcessHistory: React.FC<ProcessHistoryProps> = ({ onItemClick }) => {
  const { recentImages, hasHistory, clearHistory } = useProcessHistory();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const handleItemClick = (metadata: CoreImageMetadata) => {
    setSelectedId(metadata.id);
    onItemClick?.(metadata);
  };

  if (!hasHistory) {
    return (
      <HistoryContainer>
        <Title>No processed images yet</Title>
      </HistoryContainer>
    );
  }

  return (
    <HistoryContainer>
      <Header>
        <Title>Recent Processed Images</Title>
        <ClearButton onClick={clearHistory}>Clear History</ClearButton>
      </Header>
      
      <HistoryGrid>
        {recentImages.map((img) => (
          <HistoryItem 
            key={img.id}
            onClick={() => handleItemClick(img)}
            style={{
              border: selectedId === img.id ? '2px solid #007bff' : 'none'
            }}
          >
            <Thumbnail 
              src={img.preview?.thumbnail} 
              alt="Processed Result" 
            />
            
            <ColorChips>
              {img.colors.map((color, index) => (
                <ColorChip 
                  key={index} 
                  color={color.hex}
                  title={color.name || color.hex}
                />
              ))}
            </ColorChips>
            
            <ItemInfo>
              <div>Created: {new Date(img.created).toLocaleDateString()}</div>
              <div>{img.colors.length} colors</div>
            </ItemInfo>
          </HistoryItem>
        ))}
      </HistoryGrid>
    </HistoryContainer>
  );
};

// Optional: Export a compact version for sidebars
export const CompactProcessHistory = styled(ProcessHistory)`
  ${HistoryGrid} {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  }

  ${Thumbnail} {
    height: 100px;
  }

  ${ColorChip} {
    width: 20px;
    height: 20px;
  }
`;

// Usage example:
/*
const App = () => {
  const handleImageSelect = (metadata: CoreImageMetadata) => {
    console.log('Selected:', metadata);
    // Handle reloading the image into editor, etc.
  };

  return (
    <div>
      <ProcessHistory onItemClick={handleImageSelect} />
      
      {/* Or use compact version in sidebar */}
      <CompactProcessHistory onItemClick={handleImageSelect} />
    </div>
  );
};
*/
