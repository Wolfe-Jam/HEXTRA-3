import React from 'react';
import { ColorGrid } from '../components/ColorGrid';
import { GILDAN_6400 } from '../data/catalogs/gildan64';
import styled from 'styled-components';

const DemoContainer = styled.div`
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
`;

const Title = styled.h1`
  color: #333;
  margin-bottom: 2rem;
`;

const Demo = () => {
  return (
    <DemoContainer>
      <Title>HEXTRA Color System Demo</Title>
      <ColorGrid colors={GILDAN_6400} />
    </DemoContainer>
  );
};

export default Demo;
