import React, { forwardRef, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { Box } from '@mui/material';

const Wheel = forwardRef(({ color, onChange, onClick, onDoubleClick, onDragStart, onDragEnd, width, height }, ref) => {
  const canvasRef = useRef(null);
  const isDragging = useRef(false);
  const cursorPos = useRef({ x: null, y: null });

  // Method to set color programmatically
  const setColor = (hexColor) => {
    if (!hexColor || !hexColor.startsWith('#') || hexColor.length !== 7) {
      console.warn("Invalid hex color provided:", hexColor);
      return;
    }
    
    // Convert hex to RGB
    const r = parseInt(hexColor.substring(1, 3), 16);
    const g = parseInt(hexColor.substring(3, 5), 16);
    const b = parseInt(hexColor.substring(5, 7), 16);
    
    // Calculate the position in the color wheel
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) / 2 - 5;
    
    // Clear and redraw the wheel
    ctx.clearRect(0, 0, width, height);
    drawWheel(ctx);
    
    // Convert RGB to HSV for better mapping to wheel position
    const max = Math.max(r, g, b) / 255;
    const min = Math.min(r, g, b) / 255;
    const delta = max - min;
    
    let hue = 0;
    if (delta !== 0) {
      if (max === r / 255) {
        hue = ((g / 255 - b / 255) / delta) % 6;
      } else if (max === g / 255) {
        hue = (b / 255 - r / 255) / delta + 2;
      } else {
        hue = (r / 255 - g / 255) / delta + 4;
      }
    }
    
    hue = Math.round(hue * 60);
    if (hue < 0) hue += 360;
    
    const saturation = max === 0 ? 0 : delta / max;
    const value = max;
    
    // Convert HSV to wheel coordinates
    const angle = (hue / 360) * (2 * Math.PI);
    const distance = saturation * radius;
    
    // Calculate x,y position on wheel
    const x = centerX + Math.cos(angle) * distance;
    const y = centerY - Math.sin(angle) * distance;
    
    // Set cursor position
    cursorPos.current = { x, y };
    
    // Draw cursor
    drawCursor();
  };

  // Expose the setColor method through ref
  React.useImperativeHandle(ref, () => ({
    setColor
  }));

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    // Draw color wheel
    drawWheel(ctx);
    
    // Set the initial default color - always start with yellow (#FED141)
    if (color && color.startsWith('#')) {
      setColor(color);
    } else {
      setColor('#FED141');
    }
  }, [width, height]);

  const drawWheel = (ctx) => {
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) / 2 - 5;
    
    // Draw color wheel using HSL color space
    for (let angle = 0; angle < 360; angle++) {
      const startAngle = (angle - 0.5) * (Math.PI / 180);
      const endAngle = (angle + 0.5) * (Math.PI / 180);
      
      for (let saturation = 0; saturation < 100; saturation++) {
        const gradientRadius = saturation * (radius / 100);
        ctx.beginPath();
        ctx.arc(centerX, centerY, gradientRadius, startAngle, endAngle);
        ctx.lineWidth = 1.5;
        
        // Calculate color based on hue (angle) and saturation
        const hue = angle;
        const lightness = 50; // Fixed lightness for a balanced color wheel
        ctx.strokeStyle = `hsl(${hue}, ${saturation}%, ${lightness}%)`;
        ctx.stroke();
      }
    }
  };

  const drawCursor = () => {
    if (!cursorPos.current.x || !cursorPos.current.y) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    // Draw cursor as a white circle with black border
    ctx.beginPath();
    ctx.arc(cursorPos.current.x, cursorPos.current.y, 8, 0, 2 * Math.PI);
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.fillStyle = '#FFFFFF';
    ctx.fill();
  };

  const getColorFromPosition = (x, y) => {
    try {
      const canvas = canvasRef.current;
      if (!canvas) return '#FED141'; // Default to yellow
      
      const rect = canvas.getBoundingClientRect();
      const ctx = canvas.getContext('2d');
      
      // Convert client coordinates to canvas coordinates
      const canvasX = Math.round((x - rect.left) * (canvas.width / rect.width));
      const canvasY = Math.round((y - rect.top) * (canvas.height / rect.height));
      
      // Store current cursor position
      cursorPos.current = { x: canvasX, y: canvasY };
      
      // Clear canvas and redraw wheel with cursor at new position
      ctx.clearRect(0, 0, width, height);
      drawWheel(ctx);
      drawCursor();
      
      // Get pixel data at cursor position
      const pixelData = ctx.getImageData(canvasX, canvasY, 1, 1).data;
      
      // Convert RGB to HEX
      const r = pixelData[0];
      const g = pixelData[1];
      const b = pixelData[2];
      
      const hex = '#' + 
        r.toString(16).padStart(2, '0') +
        g.toString(16).padStart(2, '0') +
        b.toString(16).padStart(2, '0');
      
      return hex.toUpperCase();
    } catch (err) {
      console.error('Error getting color from position:', err);
      return '#FED141'; // Default to yellow on error
    }
  };

  const handleMouseDown = (e) => {
    isDragging.current = true;
    if (onDragStart) onDragStart();
    
    // Get color at the mouse position and trigger onChange
    const color = getColorFromPosition(e.clientX, e.clientY);
    onChange(color);
    
    // Call onClick if provided
    if (onClick) onClick(e);
  };

  const handleMouseMove = (e) => {
    if (isDragging.current) {
      // Get color at the mouse position and trigger onChange
      const color = getColorFromPosition(e.clientX, e.clientY);
      onChange(color);
    }
  };

  const handleMouseUp = () => {
    if (isDragging.current) {
      isDragging.current = false;
      if (onDragEnd) onDragEnd();
    }
  };
  
  const handleDoubleClick = (e) => {
    if (onDoubleClick) onDoubleClick(e);
  };

  return (
    <Box
      ref={ref}
      sx={{
        position: 'relative',
        width: `${width}px`,
        height: `${height}px`,
        borderRadius: '50%',
        overflow: 'hidden',
        cursor: 'crosshair',
        boxShadow: '0 0 0 1px rgba(0, 0, 0, 0.1), 0 4px 8px rgba(0, 0, 0, 0.1)',
        margin: '0 auto',
        touchAction: 'none', // Prevent touch scrolling while interacting with wheel
        userSelect: 'none' // Prevent text selection
      }}
    >
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onDoubleClick={handleDoubleClick}
        style={{ display: 'block' }}
      />
    </Box>
  );
});

Wheel.propTypes = {
  color: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  onClick: PropTypes.func,
  onDoubleClick: PropTypes.func,
  onDragStart: PropTypes.func,
  onDragEnd: PropTypes.func,
  width: PropTypes.number,
  height: PropTypes.number
};

Wheel.defaultProps = {
  width: 200,
  height: 200
};

export default Wheel;
