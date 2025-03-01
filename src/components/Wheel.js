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
    // Adjust angle to match the rotated color wheel (-90 degrees)
    const angle = ((hue + 90) % 360 / 360) * (2 * Math.PI);
    const distance = saturation * radius;
    
    // Calculate x,y position on wheel
    const x = centerX + Math.cos(angle) * distance;
    const y = centerY + Math.sin(angle) * distance;
    
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
    
    // Set the initial color - start with red (#FF0000) if no color is provided
    if (color && color.startsWith('#')) {
      setColor(color);
    } else {
      setColor('#FF0000');
    }
  }, [width, height]);

  const drawWheel = (ctx) => {
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) / 2 - 5;
    
    // Create color wheel using image data for pixel-perfect results
    const imageData = ctx.createImageData(width, height);
    const data = imageData.data;
    
    // For each pixel in the canvas
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        // Calculate distance from center and angle
        const dx = x - centerX;
        const dy = y - centerY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        // Only color pixels within the wheel radius
        if (distance <= radius) {
          // Calculate angle in degrees (0-360)
          let angle = Math.atan2(dy, dx) * (180 / Math.PI);
          angle = (angle + 360) % 360;
          
          // Rotate by 90 degrees to put red at 12 o'clock
          // This moves red from 3 o'clock to 12 o'clock position
          const hue = (angle + 90) % 360;
          
          // Saturation increases linearly with distance from center
          const saturation = distance / radius;
          
          // Always full brightness/value
          const value = 1.0;
          
          // Convert HSV to RGB
          let [r, g, b] = hsvToRgb(hue, saturation, value);
          
          // Set the pixel in the image data
          const pixelIndex = (y * width + x) * 4;
          data[pixelIndex] = r;     // Red
          data[pixelIndex + 1] = g; // Green
          data[pixelIndex + 2] = b; // Blue
          data[pixelIndex + 3] = 255; // Alpha (fully opaque)
        }
      }
    }
    
    // Put the image data onto the canvas
    ctx.putImageData(imageData, 0, 0);
  };
  
  // Efficient HSV to RGB conversion
  const hsvToRgb = (h, s, v) => {
    // Ensure valid input ranges
    h = h % 360;
    s = Math.max(0, Math.min(1, s));
    v = Math.max(0, Math.min(1, v));
    
    if (s === 0) {
      // Achromatic (grey)
      const grey = Math.round(v * 255);
      return [grey, grey, grey];
    }
    
    h /= 60; // sector 0 to 5
    const i = Math.floor(h);
    const f = h - i; // factorial part of h
    const p = v * (1 - s);
    const q = v * (1 - s * f);
    const t = v * (1 - s * (1 - f));
    
    let r, g, b;
    switch (i % 6) {
      case 0: r = v; g = t; b = p; break;
      case 1: r = q; g = v; b = p; break;
      case 2: r = p; g = v; b = t; break;
      case 3: r = p; g = q; b = v; break;
      case 4: r = t; g = p; b = v; break;
      case 5: r = v; g = p; b = q; break;
    }
    
    return [
      Math.round(r * 255),
      Math.round(g * 255),
      Math.round(b * 255)
    ];
  };

  const getColorFromPosition = (x, y) => {
    try {
      const canvas = canvasRef.current;
      if (!canvas) return '#FF0000'; // Default to red
      
      const ctx = canvas.getContext('2d');
      
      // Store current cursor position
      cursorPos.current = { x, y };
      
      // Get the center of the wheel
      const centerX = width / 2;
      const centerY = height / 2;
      const radius = Math.min(width, height) / 2 - 5;
      
      // Calculate distance from center
      let dx = x - centerX;
      let dy = y - centerY;
      let distanceFromCenter = Math.sqrt(dx * dx + dy * dy);
      
      // If outside the wheel radius, constrain to edge
      if (distanceFromCenter > radius) {
        // Normalize the vector and scale to radius
        const angle = Math.atan2(dy, dx);
        dx = Math.cos(angle) * radius;
        dy = Math.sin(angle) * radius;
        
        // Update cursor position and distance
        x = Math.round(centerX + dx);
        y = Math.round(centerY + dy);
        cursorPos.current = { x, y };
        distanceFromCenter = radius;
      }
      
      // Calculate angle in degrees (0-360)
      let angle = Math.atan2(dy, dx) * (180 / Math.PI);
      angle = (angle + 360) % 360;
      
      // Rotate by 90 degrees to put red at 12 o'clock
      const hue = (angle + 90) % 360;
      
      // Saturation is proportional to distance from center
      const saturation = distanceFromCenter / radius;
      
      // Calculate color from HSV
      const [r, g, b] = hsvToRgb(hue, saturation, 1.0);
      
      // Clear canvas and redraw wheel with cursor
      ctx.clearRect(0, 0, width, height);
      drawWheel(ctx);
      drawCursor();
      
      // Format as HEX color
      const hex = '#' +
        r.toString(16).padStart(2, '0') +
        g.toString(16).padStart(2, '0') +
        b.toString(16).padStart(2, '0');
      
      return hex.toUpperCase();
    } catch (err) {
      console.error('Error getting color from position:', err);
      return '#FF0000'; // Default to red on error
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

  const handleMouseDown = (e) => {
    isDragging.current = true;
    if (onDragStart) onDragStart();
    
    // Capture current position
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Get color at the mouse position and trigger onChange
    const color = getColorFromPosition(x, y);
    if (color) {
      onChange(color);
    }
    
    // Call onClick if provided
    if (onClick) onClick(e);
  };

  const handleMouseMove = (e) => {
    if (isDragging.current) {
      // Capture current position
      const rect = canvasRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      // Get color at the mouse position and trigger onChange
      const color = getColorFromPosition(x, y);
      if (color) {
        onChange(color);
      }
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
  width: 222,
  height: 222
};

export default Wheel;
