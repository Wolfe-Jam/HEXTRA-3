import React, { useState, useEffect } from 'react';
import { Box, Container, TextField, Button, Typography, IconButton } from '@mui/material';
import { Wheel } from '@uiw/react-color';
import Jimp from 'jimp';
import Banner from './components/Banner';
import ThemeToggleIcon from './components/ThemeToggleIcon';
import themeManager from './theme.js';
import './theme.css';
import FileDownloadIcon from '@mui/icons-material/FileDownload';

const DEFAULT_IMAGE_URL = 'https://cdn.shopify.com/s/files/1/0804/1136/1573/files/printify-t-shirt-white-xs-hextra-master-white-t-shirt-49101104120101.png?v=1736860133';
const DEFAULT_COLOR = '#FFA500';
const VERSION = '1.1.2'; // Updated version

function hexToRgb(hex) {
  // Remove # if present
  hex = hex.replace(/^#/, '');
  
  // Parse hex values
  const bigint = parseInt(hex, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  
  return { r, g, b };
}

function App() {
  const [selectedColor, setSelectedColor] = useState(DEFAULT_COLOR);
  const [rgbColor, setRgbColor] = useState(hexToRgb(DEFAULT_COLOR));
  const [imageFile, setImageFile] = useState(null);
  const [imageUrl, setImageUrl] = useState(DEFAULT_IMAGE_URL);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [processedImage, setProcessedImage] = useState(null);
  const [error, setError] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(document.documentElement.getAttribute('data-theme') === 'dark');
  const [canDownload, setCanDownload] = useState(false);

  const handleColorChange = (color) => {
    setSelectedColor(color.hex);
    const rgb = hexToRgb(color.hex);
    if (rgb) {
      setRgbColor(rgb);
    }
  };

  const handleHexInputChange = (event) => {
    let hex = event.target.value;
    setSelectedColor(hex);
    
    // Only update RGB if it's a valid hex code
    if (/^#?[0-9A-Fa-f]{6}$/.test(hex)) {
      if (!hex.startsWith('#')) {
        hex = '#' + hex;
      }
      const rgb = hexToRgb(hex);
      if (rgb) {
        setRgbColor(rgb);
      }
    }
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (file) {
      try {
        setIsProcessing(true);
        setImageFile(file);
        setImageUrl('');
        setError('');
        
        console.log('Starting file processing...');
        const buffer = await file.arrayBuffer();
        console.log('File buffer created');
        
        const image = await Jimp.read(Buffer.from(buffer));
        console.log('Image loaded into Jimp');
        
        if (!image.hasAlpha()) {
          image.rgba(true);
          console.log('Alpha channel added');
        }
        
        console.log('Starting image processing...');
        image.scan(0, 0, image.bitmap.width, image.bitmap.height, function(x, y, idx) {
          const red = this.bitmap.data[idx + 0];
          const green = this.bitmap.data[idx + 1];
          const blue = this.bitmap.data[idx + 2];
          const alpha = this.bitmap.data[idx + 3];
          
          const luminance = (red * 0.299 + green * 0.587 + blue * 0.114) / 255;
          
          if (alpha > 0) {
            this.bitmap.data[idx + 0] = Math.round(rgbColor.r * luminance);
            this.bitmap.data[idx + 1] = Math.round(rgbColor.g * luminance);
            this.bitmap.data[idx + 2] = Math.round(rgbColor.b * luminance);
            this.bitmap.data[idx + 3] = alpha;
          }
        });
        console.log('Image processing complete');

        const base64 = await image.getBase64Async(Jimp.MIME_PNG);
        console.log('Base64 conversion complete');
        setProcessedImage(base64);
        console.log('Image set to state');
      } catch (err) {
        console.error('Error processing uploaded file:', err);
        setError(`Error processing image: ${err.message}`);
      } finally {
        setIsProcessing(false);
        console.log('Processing complete');
      }
    }
  };

  const handleUrlChange = (event) => {
    setImageUrl(event.target.value);
  };

  const handleUrlKeyPress = (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      handleLoadUrl();
    }
  };

  const handleLoadUrl = () => {
    const urlInput = imageUrl.trim();
    if (!urlInput) {
      // Open a new tab for user to find an image URL
      window.open('https://www.google.com/search?q=white+t-shirt+png&tbm=isch', '_blank');
      return;
    }
    setImageFile(null);
    loadImage(urlInput);
  };

  const applyColor = async () => {
    try {
      setIsProcessing(true);
      setError('');
      
      let image;
      if (imageFile) {
        const buffer = await imageFile.arrayBuffer();
        image = await Jimp.read(Buffer.from(buffer));
      } else {
        image = await Jimp.read(imageUrl);
      }

      if (!image.hasAlpha()) {
        image.rgba(true);
      }
      
      image.scan(0, 0, image.bitmap.width, image.bitmap.height, function(x, y, idx) {
        const red = this.bitmap.data[idx + 0];
        const green = this.bitmap.data[idx + 1];
        const blue = this.bitmap.data[idx + 2];
        const alpha = this.bitmap.data[idx + 3];
        
        const luminance = (red * 0.299 + green * 0.587 + blue * 0.114) / 255;
        
        if (alpha > 0) {
          this.bitmap.data[idx + 0] = Math.round(rgbColor.r * luminance);
          this.bitmap.data[idx + 1] = Math.round(rgbColor.g * luminance);
          this.bitmap.data[idx + 2] = Math.round(rgbColor.b * luminance);
          this.bitmap.data[idx + 3] = alpha;
        }
      });

      const base64 = await image.getBase64Async(Jimp.MIME_PNG);
      setProcessedImage(base64);
      setCanDownload(true);
      setError('');
    } catch (err) {
      console.error('Error applying color:', err);
      setError(err.message || 'Error applying color');
      setCanDownload(false);
    } finally {
      setIsProcessing(false);
    }
  };

  const loadImage = async (url) => {
    try {
      setIsProcessing(true);
      setError('');
      const image = await Jimp.read(url);
      setImageUrl(url);
      
      // Process the image directly without using applyColor
      if (!image.hasAlpha()) {
        image.rgba(true);
      }
      
      image.scan(0, 0, image.bitmap.width, image.bitmap.height, function(x, y, idx) {
        const red = this.bitmap.data[idx + 0];
        const green = this.bitmap.data[idx + 1];
        const blue = this.bitmap.data[idx + 2];
        const alpha = this.bitmap.data[idx + 3];
        
        const luminance = (red * 0.299 + green * 0.587 + blue * 0.114) / 255;
        
        if (alpha > 0) {
          this.bitmap.data[idx + 0] = Math.round(rgbColor.r * luminance);
          this.bitmap.data[idx + 1] = Math.round(rgbColor.g * luminance);
          this.bitmap.data[idx + 2] = Math.round(rgbColor.b * luminance);
          this.bitmap.data[idx + 3] = alpha;
        }
      });

      const base64 = await image.getBase64Async(Jimp.MIME_PNG);
      setProcessedImage(base64);
      setError('');
    } catch (err) {
      console.error('Error loading image:', err);
      setError(err.message || 'Error loading image');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleQuickDownload = () => {
    const filename = generateFilename();
    const byteString = atob(processedImage.split(',')[1]);
    const mimeString = processedImage.split(',')[0].split(':')[1].split(';')[0];
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }
    const blob = new Blob([ab], { type: mimeString });
    const url = window.URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = filename + '.png';
    link.style.display = 'none';
    link.click();
    
    window.URL.revokeObjectURL(url);
  };

  const handleSaveAs = () => {
    const filename = generateFilename();
    const link = document.createElement('a');
    link.href = processedImage;
    link.download = filename + '.png';
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const dataURLtoBlob = (dataURL) => {
    const arr = dataURL.split(',');
    const mime = arr[0].match(/:(.*?);/)[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new Blob([u8arr], { type: mime });
  };

  const generateFilename = () => {
    const now = new Date();
    const dateString = now.getFullYear().toString() +
                      (now.getMonth() + 1).toString().padStart(2, '0') +
                      now.getDate().toString().padStart(2, '0');
    const hexColor = rgbToHex(rgbColor.r, rgbColor.g, rgbColor.b);
    return `HEXTRA-3-${dateString}-HEX-${hexColor.substring(1)}`;
  };

  const rgbToHex = (r, g, b) => {
    const toHex = (c) => {
      const hex = c.toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    };
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  };

  useEffect(() => {
    themeManager.init();
    setIsDarkMode(themeManager.getCurrentTheme() === 'dark');
    loadImage(DEFAULT_IMAGE_URL);
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

          {/* Color input section with separator */}
          <Box sx={{ 
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            width: '100%',
            mb: 3,
            mt: 4
          }}>
            {/* Color controls */}
            <Box sx={{ 
              display: 'flex',
              gap: 2,
              alignItems: 'center',
              justifyContent: 'center',
              width: '100%',
              mb: 3
            }}>
              {/* RGB Display */}
              <Typography sx={{ 
                fontFamily: "'Inter', sans-serif",
                color: 'var(--text-primary)',
                fontSize: '0.875rem',
                whiteSpace: 'nowrap',
                width: '140px',  
                textAlign: 'right'
              }}>
                RGB: {rgbColor ? `${rgbColor.r.toString().padStart(3, ' ')}, ${rgbColor.g.toString().padStart(3, ' ')}, ${rgbColor.b.toString().padStart(3, ' ')}` : '  0,   0,   0'}
              </Typography>

              {/* Color Swatch */}
              <Box
                sx={{
                  width: '48px',
                  height: '48px',
                  backgroundColor: selectedColor,
                  borderRadius: '50%',
                  border: '1px solid rgba(0, 0, 0, 0.1)',
                  flexShrink: 0
                }}
              />

              {/* HEX Input */}
              <TextField
                label="HEX Color"
                value={selectedColor}
                onChange={handleHexInputChange}
                sx={{ 
                  width: '160px',
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
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    applyColor();
                  }
                }}
              />

              {/* Apply Button */}
              <Button
                variant="contained"
                onClick={applyColor}
                sx={{
                  bgcolor: 'var(--button-bg)',
                  color: 'var(--button-text)',
                  '&:hover': {
                    bgcolor: 'var(--button-hover)'
                  },
                  fontFamily: "'Inter', sans-serif",
                  boxShadow: 'none'
                }}
              >
                Apply
              </Button>
            </Box>

            {/* Bottom separator */}
            <Box sx={{ 
              width: '100%', 
              height: '1px', 
              bgcolor: 'var(--border-color)'
            }} />
          </Box>

          {/* Image input section */}
          <Box sx={{ 
            display: 'flex',
            gap: 1,
            alignItems: 'center'
          }}>
            <Button
              component="label"
              disabled={isProcessing}
              sx={{ 
                flex: 1,
                bgcolor: 'var(--button-bg)',
                color: 'var(--button-text) !important',
                '&:hover': {
                  bgcolor: 'var(--button-hover)'
                },
                '&.Mui-disabled': {
                  color: 'var(--button-text) !important',
                  bgcolor: 'var(--button-bg)',
                  opacity: 0.7
                },
                boxShadow: 'none',
                fontFamily: "'Inter', sans-serif"
              }}
            >
              {isProcessing ? 'Loading...' : 'Load Image'}
              <input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                disabled={isProcessing}
                hidden
              />
            </Button>
            <Typography sx={{ mx: 1, fontFamily: "'Inter', sans-serif" }}>OR URL:</Typography>
            <TextField
              placeholder="Image URL"
              value={imageUrl}
              onChange={handleUrlChange}
              onKeyPress={handleUrlKeyPress}
              onDoubleClick={(event) => event.target.select()}
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
            <Button
              data-testid="load-url-button"
              onClick={handleLoadUrl}
              sx={{ 
                bgcolor: 'var(--button-bg)',
                color: 'var(--button-text)',
                '&:hover': {
                  bgcolor: 'var(--button-hover)'
                },
                boxShadow: 'none',
                fontFamily: "'Inter', sans-serif",
                minWidth: 'auto'
              }}
            >
              Load URL
            </Button>
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
            <Box sx={{ mt: 2, position: 'relative' }}>
              {isProcessing && (
                <Box
                  sx={{
                    position: 'absolute',
                    top: '10px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    bgcolor: 'rgba(0, 0, 0, 0.8)',
                    color: 'white',
                    padding: '8px 16px',
                    borderRadius: '4px',
                    zIndex: 1000,
                    boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1
                  }}
                >
                  <Typography
                    sx={{
                      fontSize: '0.875rem',
                      fontFamily: "'Inter', sans-serif"
                    }}
                  >
                    Processing image...
                  </Typography>
                </Box>
              )}
              <img
                src={processedImage}
                alt="Processed"
                style={{ 
                  width: '100%',
                  display: 'block'
                }}
              />
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'flex-end',
                mt: 1
              }}>
                <IconButton
                  onClick={handleQuickDownload}
                  disabled={!canDownload}
                  sx={{
                    bgcolor: canDownload ? 'var(--button-bg)' : 'rgba(0, 0, 0, 0.12)',
                    color: canDownload ? 'var(--button-text)' : 'rgba(0, 0, 0, 0.26)',
                    '&:hover': {
                      bgcolor: canDownload ? 'var(--button-hover)' : 'rgba(0, 0, 0, 0.12)'
                    },
                    padding: '8px',
                    borderRadius: '50%',
                    width: 36,
                    height: 36,
                    '& svg': {
                      fontSize: '1.25rem'
                    }
                  }}
                  aria-label="Download image"
                >
                  <FileDownloadIcon />
                </IconButton>
              </Box>
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  );
}

export default App;
