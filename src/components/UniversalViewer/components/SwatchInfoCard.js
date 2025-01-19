import React from 'react';
import { Paper, Typography } from '@mui/material';
import styled from 'styled-components';

const Card = styled(Paper)`
  padding: 16px;
  margin: 8px 0;
  display: flex;
  align-items: center;
  gap: 16px;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  }
`;

const Swatch = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 4px;
  background-color: ${props => props.color};
  box-shadow: inset 0 0 0 1px rgba(0,0,0,0.1);
`;

const Info = styled.div`
  flex: 1;
`;

const ConfidenceBar = styled.div`
  height: 4px;
  background: #eee;
  border-radius: 2px;
  margin-top: 4px;
  overflow: hidden;
  
  &::after {
    content: '';
    display: block;
    height: 100%;
    width: ${props => props.value}%;
    background: ${props => 
      props.value > 80 ? '#4caf50' :
      props.value > 60 ? '#8bc34a' :
      props.value > 40 ? '#ffc107' :
      props.value > 20 ? '#ff9800' : '#f44336'
    };
    transition: width 0.3s ease;
  }
`;

const ColorValues = styled(Typography)`
  font-family: monospace;
  font-size: 0.85rem;
  opacity: 0.8;
`;

const SwatchInfoCard = ({ 
  color,
  name,
  hex,
  confidence,
  showRgb = false,
  showHsv = false,
  rgb,
  hsv,
  onClick,
  elevation = 1
}) => (
  <Card elevation={elevation} onClick={onClick}>
    <Swatch color={hex} />
    <Info>
      <Typography variant="subtitle1">
        {name}
      </Typography>
      <Typography variant="caption" color="textSecondary">
        {hex.toUpperCase()} • {confidence?.toFixed(1)}% match
      </Typography>
      {showRgb && rgb && (
        <ColorValues variant="caption" display="block">
          RGB: {rgb.r}, {rgb.g}, {rgb.b}
        </ColorValues>
      )}
      {showHsv && hsv && (
        <ColorValues variant="caption" display="block">
          HSV: {hsv.h}°, {hsv.s}%, {hsv.v}%
        </ColorValues>
      )}
      {typeof confidence === 'number' && (
        <ConfidenceBar value={confidence} />
      )}
    </Info>
  </Card>
);

export default SwatchInfoCard;
