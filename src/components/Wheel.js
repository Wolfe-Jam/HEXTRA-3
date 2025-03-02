import React, { forwardRef, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { Box } from '@mui/material';

const Wheel = forwardRef(({ color, onChange, onClick, onDoubleClick, onDragStart, onDragEnd, width, height, brightness = 255 }, ref) => {
  const canvasRef = useRef(null);
  const isDragging = useRef(false);
  const cursorPos = useRef({ x: null, y: null });
  const brightnessRef = useRef(brightness);

  // Update brightness reference when prop changes
  useEffect(() => {
    if (brightnessRef.current !== brightness) {
      brightnessRef.current = brightness;
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        drawWheel(ctx);
        drawCursor();
      }
    }
  }, [brightness]);

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
    // Adjust angle to match the rotated color wheel (90 degrees)
    // FIX: The angle was incorrectly calculated, causing a 180-degree offset
    // We need red (#FF0000) at 12 o'clock (90 degrees in the coordinate system)
    const angle = (((hue + 270) % 360) / 360) * (2 * Math.PI);
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
    
    // Get current brightness level (0-255)
    const brightnessLevel = brightnessRef.current;
    const brightnessRatio = brightnessLevel / 255;
    
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
          
          // Apply brightness from slider (0-1 range) 
          const value = brightnessRatio;
          
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
      // Calculate distance from center
      const centerX = width / 2;
      const centerY = height / 2;
      const dx = x - centerX;
      const dy = y - centerY;
      let distance = Math.sqrt(dx * dx + dy * dy);
      
      // Calculate angle
      let angle = Math.atan2(dy, dx) * (180 / Math.PI);
      if (angle < 0) angle += 360;
      
      // Store current cursor position (for drawing)
      cursorPos.current = { x, y };
      
      // Constrain to wheel boundaries if cursor is outside valid wheel radius
      const radius = width / 2;
      const isOutsideWheel = distance > radius;
      
      if (isOutsideWheel) {
        // Keep the cursor position where it is (for dragging), but
        // constrain the color sampling to the wheel's edge
        distance = radius;
      }
      
      // Normalize distance for saturation (0 to 1)
      const maxDistance = width / 2; // Radius
      const normalizedDistance = Math.min(distance / maxDistance, 1);
      
      // Convert to HSV
      // Adjust angle to place red (0 degrees) at top
      const hue = (angle + 90) % 360;
      const saturation = normalizedDistance;
      
      // Get current brightness level (0-1 range)
      const brightnessRatio = brightness / 255;
      
      // Convert HSV to RGB
      const [r, g, b] = hsvToRgb(hue, saturation, brightnessRatio);
      
      // Convert RGB to HEX
      const hexColor = `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`.toUpperCase();
      
      return hexColor;
    } catch (err) {
      console.error('Error getting color from position:', err);
      return '#FF0000'; // Default to red on error
    }
  };

  const drawCursor = () => {
    if (!cursorPos.current.x || !cursorPos.current.y) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    // Clear the previous cursor by redrawing the wheel
    ctx.clearRect(0, 0, width, height);
    drawWheel(ctx);
    
    // Get current brightness level to adapt cursor visibility
    const brightnessLevel = brightnessRef.current;
    const isDarkWheel = brightnessLevel < 80;
    
    // Get center and radius of wheel
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = width / 2;
    
    // Calculate whether cursor is outside valid wheel radius
    const dx = cursorPos.current.x - centerX;
    const dy = cursorPos.current.y - centerY;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const isOutsideWheel = distance > radius;
    
    // Calculate cursor position for drawing
    // If outside wheel, constrain to edge while maintaining angle
    let cursorDrawX = cursorPos.current.x;
    let cursorDrawY = cursorPos.current.y;
    
    if (isOutsideWheel) {
      // Calculate angle
      const angle = Math.atan2(dy, dx);
      
      // Constrain to wheel edge
      cursorDrawX = centerX + Math.cos(angle) * radius;
      cursorDrawY = centerY + Math.sin(angle) * radius;
    }
    
    // Draw outer ring - brighter for dark wheels
    ctx.beginPath();
    ctx.arc(cursorDrawX, cursorDrawY, 8, 0, 2 * Math.PI, false);
    ctx.strokeStyle = isDarkWheel ? 'rgba(255, 255, 255, 0.85)' : 'white';
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // Inner ring - color inverted for visibility
    ctx.beginPath();
    ctx.arc(cursorDrawX, cursorDrawY, 6, 0, 2 * Math.PI, false);
    ctx.strokeStyle = isDarkWheel ? 'rgba(0, 0, 0, 0.7)' : 'black';
    ctx.lineWidth = 1;
    ctx.stroke();
  };

  const handleMouseDown = (e) => {
    e.preventDefault();
    
    // Start dragging
    isDragging.current = true;
    if (onDragStart) onDragStart();
    
    // Calculate position relative to canvas
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left + 10; // Adjust for padding
    const y = e.clientY - rect.top + 10; // Adjust for padding
    
    // Store current cursor position
    cursorPos.current = { x, y };
    
    // Get color at the position
    const selectedColor = getColorFromPosition(x, y);
    
    // Update the color and trigger onChange
    onChange(selectedColor);
    
    // Also handle click event
    if (onClick) onClick(selectedColor);
    
    // Draw cursor at the position
    drawCursor();
  };

  const handleMouseMove = (e) => {
    if (!isDragging.current) return;
    
    e.preventDefault();
    
    // Calculate position relative to canvas
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left + 10; // Adjust for padding
    const y = e.clientY - rect.top + 10; // Adjust for padding
    
    // Store current cursor position
    cursorPos.current = { x, y };
    
    // Get color at the position
    const selectedColor = getColorFromPosition(x, y);
    
    // Update the color
    onChange(selectedColor);
    
    // Draw cursor at the position
    drawCursor();
  };

  const handleMouseUp = () => {
    if (!isDragging.current) return;
    
    isDragging.current = false;
    if (onDragEnd) onDragEnd();
  };

  const handleDoubleClick = (e) => {
    if (onDoubleClick) onDoubleClick(e);
  };

  return (
    <Box
      ref={ref}
      sx={{
        position: 'relative',
        width: width + 20, // Extra 20px for interaction area (10px on each side)
        height: height + 20, // Extra 20px for interaction area (10px on each side)
        borderRadius: '50%',
        cursor: 'crosshair',
        overflow: 'visible', // Allow cursor to be visible outside main wheel
        boxShadow: brightness < 50 ? 
          '0 0 1px rgba(255, 255, 255, 0.2), 0 0 3px rgba(255, 255, 255, 0.1), inset 0 0 2px rgba(255, 255, 255, 0.05)' : 
          '0 0 8px rgba(0, 0, 0, 0.08)',
        border: 'none',
        display: 'inline-block',
        padding: '10px', // Creates space for the interaction area
        boxSizing: 'border-box',
        background: 'transparent'
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
        style={{
          display: 'block',
          width: '100%',
          height: '100%',
          transform: 'translate(-10px, -10px)', // Offset by padding to center
          position: 'absolute',
          top: '10px',
          left: '10px'
        }}
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
  height: PropTypes.number,
  brightness: PropTypes.number
};

Wheel.defaultProps = {
  width: 300,
  height: 300,
  brightness: 255
};

export default Wheel;
