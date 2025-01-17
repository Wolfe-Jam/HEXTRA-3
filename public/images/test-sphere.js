const { createCanvas } = require('canvas');
const fs = require('fs');

// Create a canvas
const size = 400;
const canvas = createCanvas(size, size);
const ctx = ctx = canvas.getContext('2d');

// Draw background
ctx.fillStyle = '#ffffff';
ctx.fillRect(0, 0, size, size);

// Create chrome ball gradient
const centerX = size / 2;
const centerY = size / 2;
const radius = size * 0.4;

// Create radial gradient
const gradient = ctx.createRadialGradient(
  centerX - radius * 0.3, // Highlight x
  centerY - radius * 0.3, // Highlight y
  radius * 0.1,          // Highlight radius
  centerX,               // Center x
  centerY,               // Center y
  radius                 // Sphere radius
);

// Add color stops for chrome effect
gradient.addColorStop(0, '#ffffff');    // Highlight
gradient.addColorStop(0.2, '#f0f0f0');  // Light gray
gradient.addColorStop(0.5, '#808080');  // Mid gray
gradient.addColorStop(0.8, '#404040');  // Dark gray
gradient.addColorStop(1, '#000000');    // Shadow

// Draw the sphere
ctx.beginPath();
ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
ctx.fillStyle = gradient;
ctx.fill();

// Add a subtle reflection
ctx.beginPath();
ctx.arc(
  centerX - radius * 0.3,
  centerY - radius * 0.3,
  radius * 0.1,
  0,
  Math.PI * 2
);
ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
ctx.fill();

// Save the image
const buffer = canvas.toBuffer('image/png');
fs.writeFileSync('public/images/test-sphere.png', buffer);
