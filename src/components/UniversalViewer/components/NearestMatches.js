import React, { useMemo } from 'react';
import styled from 'styled-components';
import { Box, Typography } from '@mui/material';
import useColorStore from '../../../state/ColorState';
import { SwatchCard, SwatchCardColor, SwatchCardInfo } from '../styles/SwatchStyles';
import GILDAN_64000 from '../../../data/catalogs/gildan64000';

// Constants
const MAX_MATCHES = 3;
const MIN_CONFIDENCE = 0;
const MAX_CONFIDENCE = 100;
const CONFIDENCE_SCALE = 2; // Higher = more aggressive confidence dropoff

// Styled Components
const Container = styled(Box)`
  padding: 0 16px 16px;
  background: #f5f5f5;
  border-radius: 4px;
  margin-top: -8px;
  overflow: hidden;
`;

const Title = styled(Typography)`
  font-family: 'Inter', sans-serif;
  font-size: 14px;
  font-style: italic;
  color: #666;
  margin: 0 -16px 12px -16px;
  padding: 16px;
  background: #f5f5f5;
`;

// Utility functions
const hexToRgb = (hex) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
};

// Color distance calculation
const getColorDistance = (color1, color2) => {
  const dr = color1.r - color2.r;
  const dg = color1.g - color2.g;
  const db = color1.b - color2.b;
  return Math.sqrt(dr * dr + dg * dg + db * db);
};

// Calculate confidence based on distance
const calculateConfidence = (distance) => {
  const confidence = MAX_CONFIDENCE - (distance * CONFIDENCE_SCALE);
  return Math.max(MIN_CONFIDENCE, Math.min(MAX_CONFIDENCE, confidence));
};

const MatchPercentage = ({ confidence }) => (
  <Typography sx={{ 
    fontSize: '12px',
    color: '#666',
    fontFamily: 'Inter, monospace'
  }}>
    {confidence.toFixed(1)}%
  </Typography>
);

const NearestMatches = () => {
  const { currentColor, updateColorState } = useColorStore();

  const matches = useMemo(() => {
    try {
      const rgb = hexToRgb(currentColor);
      if (!rgb) {
        console.warn('Invalid current color:', currentColor);
        return [];
      }

      // Calculate distances for all colors
      const colorMatches = GILDAN_64000
        .map(color => {
          const targetRgb = hexToRgb(color.hex);
          if (!targetRgb) return null;

          const distance = getColorDistance(rgb, targetRgb);
          return {
            hex: color.hex,
            name: color.name,
            distance,
            confidence: calculateConfidence(distance)
          };
        })
        .filter(match => match !== null)
        .sort((a, b) => a.distance - b.distance);

      // Find current color in matches
      const currentIndex = colorMatches.findIndex(
        match => match.hex.toUpperCase() === currentColor.toUpperCase()
      );

      // Get unique matches
      const uniqueMatches = new Set();
      const result = [];

      // Always include current color first if found
      if (currentIndex !== -1) {
        const current = colorMatches[currentIndex];
        result.push({ ...current, confidence: MAX_CONFIDENCE });
        uniqueMatches.add(current.hex.toUpperCase());
      }

      // Add remaining matches
      for (const match of colorMatches) {
        const upperHex = match.hex.toUpperCase();
        if (!uniqueMatches.has(upperHex) && result.length < MAX_MATCHES) {
          result.push(match);
          uniqueMatches.add(upperHex);
        }
      }

      return result;
    } catch (error) {
      console.error('Error calculating nearest matches:', error);
      return [];
    }
  }, [currentColor]);

  const handleMatchSelect = (match) => {
    try {
      updateColorState(match.hex);
    } catch (error) {
      console.error('Error selecting color match:', error);
    }
  };

  return (
    <Container>
      <Title>Nearest Matches</Title>
      {matches.map((match, index) => (
        <SwatchCard 
          key={`${match.hex}-${index}`}
          onClick={() => handleMatchSelect(match)}
          className={match.hex.toUpperCase() === currentColor.toUpperCase() ? 'selected' : ''}
        >
          <SwatchCardColor color={match.hex} />
          <SwatchCardInfo>
            <div className="name">{match.name}</div>
            <MatchPercentage confidence={match.confidence} />
          </SwatchCardInfo>
        </SwatchCard>
      ))}
    </Container>
  );
};

export default NearestMatches;
