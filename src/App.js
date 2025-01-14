import React, { useState, useEffect } from 'react';
import { Box, Container, TextField, Button, Typography, IconButton } from '@mui/material';
import { Wheel } from '@uiw/react-color';
import Jimp from 'jimp';
import Banner from './components/Banner';
import ThemeToggleIcon from './components/ThemeToggleIcon';
import themeManager from './theme.js';
import './theme.css';

const DEFAULT_IMAGE_URL = 'https://cdn.shopify.com/s/files/1/0804/1136/1573/files/HEXTRA-Master-1800.png?v=1736817806';
const DEFAULT_COLOR = '#dd0000';
const VERSION = '1.1.0'; // Updated version

function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}

function App() {
  const [selectedColor, setSelectedColor] = useState(DEFAULT_COLOR);
  const [rgbColor, setRgbColor] = useState(hexToRgb(DEFAULT_COLOR));
  const [imageFile, setImageFile] = useState(null);
  const [imageUrl, setImageUrl] = useState(DEFAULT_IMAGE_URL);
  const [processedImage, setProcessedImage] = useState(null);
  const [error, setError] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(document.documentElement.getAttribute('data-theme') === 'dark');

  const handleColorChange = (color) => {
    setSelectedColor(color.hex);
    setRgbColor(hexToRgb(color.hex));
    setError('');
  };

  const handleHexInput = (event) => {
    const hex = event.target.value;
    if (hex.match(/^#[0-9A-Fa-f]{6}$/)) {
      setSelectedColor(hex);
      setRgbColor(hexToRgb(hex));
      setError('');
    } else {
      setError('Invalid HEX color');
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
    themeManager.init();
    setIsDarkMode(themeManager.getCurrentTheme() === 'dark');
    // Process the default image when the component mounts
    if (imageUrl) {
      applyColor();
    }
  }, []);

  // Theme toggle handler
  const toggleTheme = () => {
    const newTheme = themeManager.toggle();
    setIsDarkMode(newTheme === 'dark');
  };

  const theme = {
    typography: {
      fontFamily: "'Inter', sans-serif",
      button: {
        textTransform: 'none',
        fontWeight: 500
      }
    }
  };

  return (
    <Box
      sx={{
        backgroundColor: 'var(--bg-primary)',
        minHeight: '100vh',
        width: '100%',
        maxWidth: '100%',
        pt: '50px',
        color: 'var(--text-primary)',
        transition: 'background-color 0.3s, color 0.3s'
      }}
    >
      <Banner 
        version={VERSION}
        isDarkMode={isDarkMode}
        onThemeToggle={toggleTheme}
      />
      
      <Box sx={{ p: 1 }}>
        <Typography 
          variant="subtitle1" 
          component="h2" 
          sx={{ 
            mb: 3,
            textAlign: 'center',
            fontWeight: 500,
            fontFamily: "'Inter', sans-serif",
            fontSize: '0.75rem',
            letterSpacing: '0.25em',
            textTransform: 'uppercase',
            color: 'var(--text-secondary)'
          }}
        >
          Colorize | Visualize | Mesmerize
        </Typography>

        {/* Main content in vertical layout */}
        <Box sx={{ 
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
          maxWidth: '600px',
          margin: '0 auto'
        }}>
          {/* Color wheel section */}
          <Box sx={{ 
            display: 'flex',
            justifyContent: 'center',
            mb: 1,
            position: 'relative',
            width: '280px',
            height: '280px',
            margin: '0 auto'
          }}>
            <Wheel
              color={selectedColor}
              onChange={(color) => handleColorChange(color)}
              width={280}
              height={280}
              style={{ 
                position: 'absolute',
                top: 0,
                left: 0
              }}
            />
          </Box>

          {/* Color input and apply button */}
          <Box sx={{ 
            display: 'flex',
            gap: 1,
            alignItems: 'flex-start'
          }}>
            <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 1 }}>
              <TextField
                label="HEX Color"
                value={selectedColor}
                onChange={handleHexInput}
                error={!!error}
                helperText={error}
                sx={{ 
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': {
                      borderColor: 'var(--border-color)',
                      borderWidth: '1px'
                    },
                    '&:hover fieldset': {
                      borderColor: 'var(--border-color)',
                      borderWidth: '2px'
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: 'var(--border-color)',
                      borderWidth: '2px'
                    }
                  },
                  '& .MuiInputLabel-root': {
                    color: 'var(--text-secondary)',
                    fontFamily: "'Inter', sans-serif"
                  },
                  '& .MuiInputLabel-root.Mui-focused': {
                    color: 'var(--text-primary)'
                  },
                  '& .MuiInputBase-input': {
                    color: 'var(--text-primary)',
                    fontFamily: "'Inter', sans-serif"
                  }
                }}
                InputProps={{
                  sx: { fontFamily: "'Inter', sans-serif" },
                  endAdornment: (
                    <Box
                      sx={{
                        width: 24,
                        height: 24,
                        backgroundColor: selectedColor,
                        border: '1px solid var(--border-color)',
                        borderRadius: '4px',
                        mr: 1
                      }}
                    />
                  )
                }}
              />
              <Typography sx={{ 
                fontFamily: "'Inter', sans-serif",
                color: 'var(--text-primary)',
                fontSize: '0.875rem'
              }}>
                RGB: {rgbColor ? `${rgbColor.r}, ${rgbColor.g}, ${rgbColor.b}` : 'Invalid'}
              </Typography>
            </Box>
            <Button
              variant="contained"
              onClick={applyColor}
              disabled={isProcessing || !selectedColor || (!imageFile && !imageUrl)}
              sx={{ 
                bgcolor: 'var(--button-bg)',
                color: 'var(--button-text)',
                '&:hover': {
                  bgcolor: 'var(--button-hover)'
                },
                '&:disabled': {
                  bgcolor: 'var(--button-hover)',
                  color: 'var(--button-text)',
                  opacity: 0.5
                },
                height: '40px',
                minWidth: 'auto',
                px: 2,
                boxShadow: 'none',
                alignSelf: 'flex-start',
                fontFamily: "'Inter', sans-serif"
              }}
            >
              Apply
            </Button>
          </Box>

          {/* Image input section */}
          <Box sx={{ 
            display: 'flex',
            gap: 1,
            alignItems: 'center'
          }}>
            <Button
              component="label"
              sx={{ 
                flex: 1,
                bgcolor: 'var(--button-bg)',
                color: 'var(--button-text)',
                '&:hover': {
                  bgcolor: 'var(--button-hover)'
                },
                boxShadow: 'none',
                fontFamily: "'Inter', sans-serif"
              }}
            >
              Load Image
              <input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                hidden
              />
            </Button>
            <Typography sx={{ mx: 1, fontFamily: "'Inter', sans-serif" }}>OR URL:</Typography>
            <TextField
              placeholder="Image URL"
              value={imageUrl}
              onChange={handleUrlChange}
              size="small"
              sx={{ 
                flex: 2,
                '& .MuiOutlinedInput-root': {
                  '& fieldset': {
                    borderColor: 'var(--border-color)',
                    borderWidth: '1px'
                  },
                  '&:hover fieldset': {
                    borderColor: 'var(--border-color)',
                    borderWidth: '2px'
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: 'var(--border-color)',
                    borderWidth: '2px'
                  }
                },
                '& .MuiInputBase-input': {
                  color: 'var(--text-primary)',
                  fontFamily: "'Inter', sans-serif"
                },
                '& .MuiInputBase-input::placeholder': {
                  color: 'var(--text-secondary)',
                  opacity: 0.7
                }
              }}
            />
          </Box>

          {error && (
            <Typography 
              color="error" 
              sx={{ 
                mt: 1,
                fontSize: '0.875rem',
                fontFamily: "'Inter', sans-serif"
              }}
            >
              {error}
            </Typography>
          )}

          {/* Result section */}
          {processedImage && (
            <Box sx={{ mt: 2 }}>
              <img
                src={processedImage}
                alt="Processed"
                style={{ 
                  width: '100%',
                  display: 'block'
                }}
              />
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  );
}

export default App;
