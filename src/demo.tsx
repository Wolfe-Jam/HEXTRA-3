import React from 'react';
import ColorGrid from '../components/UniversalViewer/components/ColorGrid';
import { GILDAN_64 } from '../data/catalogs/gildan64';
import { CoreColorMetadata } from '../components/UniversalViewer/types';
import styled from 'styled-components';

const DemoContainer = styled.div`
  padding: 24px;
  max-width: 1200px;
  margin: 0 auto;
`;

const DemoSection = styled.section`
  margin-bottom: 32px;
`;

const DemoTitle = styled.h2`
  color: #333;
  margin-bottom: 16px;
`;

const Demo = () => {
  return (
    <DemoContainer>
      <DemoSection>
        <DemoTitle>Color Grid Demo</DemoTitle>
        <ColorGrid 
          colors={GILDAN_64}
          layout={{ rows: 8, columns: 8, gap: 8 }}
          onColorSelect={(color: CoreColorMetadata) => console.log('Selected color:', color)}
        />
      </DemoSection>
    </DemoContainer>
  );
};

export default Demo;
