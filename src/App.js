import React, { useState, useEffect } from 'react';
import { Box, Container, TextField, Button, Typography } from '@mui/material';
import { Wheel } from '@uiw/react-color';
import Jimp from 'jimp';

const DEFAULT_IMAGE_URL = 'https://cdn.shopify.com/s/files/1/0804/1136/1573/files/HEXTRA-Master-1800.png?v=1736817806';
const DEFAULT_COLOR = '#dd0000';

function App() {
  const [selectedColor, setSelectedColor] = useState(DEFAULT_COLOR);
  const [imageFile, setImageFile] = useState(null);
  const [imageUrl, setImageUrl] = useState(DEFAULT_IMAGE_URL);
  const [processedImage, setProcessedImage] = useState(null);
  const [error, setError] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleColorChange = (color) => {
    const hex = color.hex;
    if (/^#[0-9A-F]{6}$/i.test(hex)) {
      setSelectedColor(hex);
      setError('');
    } else {
      setError('Invalid HEX color code');
    }
  };

  const handleHexInput = (event) => {
    const hex = event.target.value;
    if (hex.startsWith('#') && hex.length <= 7) {
      setSelectedColor(hex);
      if (hex.length === 7 && !/^#[0-9A-F]{6}$/i.test(hex)) {
        setError('Invalid HEX color code');
      } else {
        setError('');
      }
    }
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setImageFile(file);
      setImageUrl('');
      setError('');
    }
  };

  const handleUrlChange = (event) => {
    setImageUrl(event.target.value);
    setImageFile(null);
  };

  const applyColor = async () => {
    try {
      setIsProcessing(true);
      setError('');
      
      let image;
      if (imageFile) {
        const buffer = await imageFile.arrayBuffer();
        image = await Jimp.read(Buffer.from(buffer));
      } else if (imageUrl) {
        image = await Jimp.read(imageUrl);
      } else {
        throw new Error('Please upload an image or provide an image URL');
      }

      const processImage = async (image) => {
        // Ensure image has alpha channel
        if (!image.hasAlpha()) {
          image.rgba(true);
        }
        
        image.scan(0, 0, image.bitmap.width, image.bitmap.height, function(x, y, idx) {
          // Get the current pixel's RGBA values
          const red = this.bitmap.data[idx + 0];
          const green = this.bitmap.data[idx + 1];
          const blue = this.bitmap.data[idx + 2];
          const alpha = this.bitmap.data[idx + 3];
          
          // Calculate luminance (brightness)
          const luminance = (red * 0.299 + green * 0.587 + blue * 0.114) / 255;
          
          // Only modify pixels that aren't fully transparent
          if (alpha > 0) {
            // Convert hex color to RGB
            const r = parseInt(selectedColor.slice(1, 3), 16);
            const g = parseInt(selectedColor.slice(3, 5), 16);
            const b = parseInt(selectedColor.slice(5, 7), 16);
            
            // Apply color while preserving luminance
            this.bitmap.data[idx + 0] = Math.round(r * luminance);
            this.bitmap.data[idx + 1] = Math.round(g * luminance);
            this.bitmap.data[idx + 2] = Math.round(b * luminance);
            // Preserve original alpha
            this.bitmap.data[idx + 3] = alpha;
          }
        });

        // Convert to base64
        const base64 = await image.getBase64Async(Jimp.MIME_PNG);
        setProcessedImage(base64);
        setError('');
      };

      await processImage(image);
    } catch (err) {
      console.error('Error processing image:', err);
      setError(err.message || 'Error processing image');
    } finally {
      setIsProcessing(false);
    }
  };

  useEffect(() => {
    // Process the default image when the component mounts
    if (imageUrl) {
      applyColor();
    }
  }, []); // Empty dependency array means this runs once on mount

  return (
    <Container maxWidth="md">
      <Box sx={{ my: 4, display: 'flex', flexDirection: 'column', gap: 3 }}>
        <Typography variant="h4" component="h1">
          HEXTRA Color Application
        </Typography>

        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <Box sx={{ width: 200, height: 200 }}>
            <Wheel
              color={selectedColor}
              onChange={(color) => handleColorChange(color)}
              style={{ width: '100%', height: '100%' }}
            />
          </Box>
          
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="HEX Color"
              value={selectedColor}
              onChange={handleHexInput}
              error={!!error}
              helperText={error}
            />
            <Box
              sx={{
                width: 50,
                height: 50,
                backgroundColor: selectedColor,
                border: '1px solid #ccc',
                borderRadius: '4px'
              }}
            />
          </Box>
        </Box>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
          />
          <Typography>OR</Typography>
          <TextField
            label="Image URL"
            value={imageUrl}
            onChange={handleUrlChange}
            fullWidth
          />
        </Box>

        <Button
          variant="contained"
          onClick={applyColor}
          disabled={isProcessing || !selectedColor || (!imageFile && !imageUrl)}
        >
          {isProcessing ? 'Processing...' : 'Apply Color'}
        </Button>

        {error && (
          <Typography color="error">
            {error}
          </Typography>
        )}

        {processedImage && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="h6">Processed Image:</Typography>
            <img
              src={processedImage}
              alt="Processed"
              style={{ maxWidth: '100%', marginTop: '1rem' }}
            />
          </Box>
        )}
      </Box>
    </Container>
  );
}

export default App;
