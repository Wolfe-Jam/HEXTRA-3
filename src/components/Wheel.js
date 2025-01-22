import React, { forwardRef, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { Box } from '@mui/material';

const Wheel = forwardRef(({ selectedColor, onChange, onClick, onDoubleClick }, ref) => {
  const canvasRef = useRef(null);
  const isDragging = useRef(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) / 2 - 5;

    // Draw color wheel
    for (let angle = 0; angle < 360; angle++) {
      const startAngle = (angle - 2) * Math.PI / 180;
      const endAngle = (angle + 2) * Math.PI / 180;

      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, radius, startAngle, endAngle);
      ctx.closePath();

      const gradient = ctx.createRadialGradient(
        centerX, centerY, 0,
        centerX, centerY, radius
      );

      const hue = angle;
      gradient.addColorStop(0, '#FFFFFF');
      gradient.addColorStop(0.5, `hsl(${hue}, 100%, 50%)`);
      gradient.addColorStop(1, '#000000');

      ctx.fillStyle = gradient;
      ctx.fill();
    }
  }, []);

  const getColorFromPosition = (x, y) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const ctx = canvas.getContext('2d');
    
    const pixelData = ctx.getImageData(
      x - rect.left,
      y - rect.top,
      1,
      1
    ).data;

    return {
      r: pixelData[0],
      g: pixelData[1],
      b: pixelData[2]
    };
  };

  const handleMouseDown = (e) => {
    isDragging.current = true;
    const color = getColorFromPosition(e.clientX, e.clientY);
    onChange(color);
    onClick?.(e);
  };

  const handleMouseMove = (e) => {
    if (isDragging.current) {
      const color = getColorFromPosition(e.clientX, e.clientY);
      onChange(color);
    }
  };

  const handleMouseUp = () => {
    isDragging.current = false;
  };

  const handleDoubleClick = (e) => {
    const color = getColorFromPosition(e.clientX, e.clientY);
    onDoubleClick?.(color);
  };

  return (
    <Box
      ref={ref}
      sx={{
        width: '100%',
        height: '100%',
        position: 'relative',
        cursor: 'crosshair'
      }}
    >
      <canvas
        ref={canvasRef}
        width={240}
        height={240}
        style={{
          width: '100%',
          height: '100%'
        }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onDoubleClick={handleDoubleClick}
      />
    </Box>
  );
});

Wheel.propTypes = {
  selectedColor: PropTypes.object,
  onChange: PropTypes.func.isRequired,
  onClick: PropTypes.func,
  onDoubleClick: PropTypes.func
};

Wheel.displayName = 'Wheel';

export default Wheel;
