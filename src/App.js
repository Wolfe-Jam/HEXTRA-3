import React, { useState, useEffect } from 'react';
import { Box, TextField, Button, Typography, IconButton } from '@mui/material';
import { Wheel } from '@uiw/react-color';
import Jimp from 'jimp';
import Banner from './components/Banner';
import './theme.css';
import FileDownloadIcon from '@mui/icons-material/FileDownload';

const DEFAULT_IMAGE_URL = '/images/default-tshirt.png';
const DEFAULT_COLOR = '#FFA500';
const VERSION = '1.2.1'; // Updated version

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
  const [originalImage, setOriginalImage] = useState(null);
  const [processedImage, setProcessedImage] = useState(null);
  const [processedImageUrl, setProcessedImageUrl] = useState('');
  const [error, setError] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(document.documentElement.getAttribute('data-theme') === 'dark');
  const [canDownload, setCanDownload] = useState(false);
  const [urlInput, setUrlInput] = useState('');

  // Luminance calculation methods
  const LUMINANCE_METHODS = {
    NATURAL: {
      label: 'Natural',
      tooltip: 'Uses ITU-R BT.709 standard weights for most accurate color perception',
      calculate: (r, g, b) => (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255
    },
    VIBRANT: {
      label: 'Vibrant',
      tooltip: 'Maximizes color saturation for bold, vivid results',
      calculate: (r, g, b) => (r + g + b) / (3 * 255)
    },
    BALANCED: {
      label: 'Balanced',
      tooltip: 'Uses NTSC/PAL standard for a middle-ground approach',
      calculate: (r, g, b) => (0.299 * r + 0.587 * g + 0.114 * b) / 255
    }
  };

  const [luminanceMethod, setLuminanceMethod] = useState('NATURAL');

  // Load default image on mount
  useEffect(() => {
    loadImage(DEFAULT_IMAGE_URL);
  }, []);

  useEffect(() => {
    if (processedImage) {
      processedImage.getBase64Async(Jimp.MIME_PNG)
        .then(base64 => {
          setProcessedImageUrl(base64);
          setCanDownload(true);
        })
        .catch(err => console.error('Error converting to base64:', err));
    }
  }, [processedImage]);

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
        setError('');
        
        const buffer = await file.arrayBuffer();
        const img = await Jimp.read(Buffer.from(buffer));
        
        if (!img.hasAlpha()) {
          img.rgba(true);
        }
        
        setOriginalImage(img);
        setProcessedImage(img.clone());
        setImageLoaded(true);
        setError('');
      } catch (err) {
        console.error('Error processing file:', err);
        setError('Failed to process image. Please try a different file.');
      } finally {
        setIsProcessing(false);
      }
    }
  };

  const handleUrlKeyPress = (event) => {
    if (event.key === 'Enter') {
      handleLoadUrl();
    }
  };

  const handleLoadUrl = async () => {
    if (!urlInput.trim()) {
      window.open('https://www.google.com/search?q=white+t-shirt+transparent+background&tbm=isch', '_blank');
      return;
    }

    try {
      setIsProcessing(true);
      setError('');
      
      const img = await Jimp.read(urlInput);
      
      if (!img.hasAlpha()) {
        img.rgba(true);
      }
      
      setOriginalImage(img);
      setProcessedImage(img.clone());
      setImageLoaded(true);
      setError('');
      setUrlInput('');
    } catch (err) {
      console.error('Error loading image from URL:', err);
      setError('Failed to load image. Please try a different URL.');
    } finally {
      setIsProcessing(false);
    }
  };

  const loadImage = async (url) => {
    try {
      const img = await Jimp.read(url);
      setOriginalImage(img);
      setProcessedImage(img.clone());  // Set the processed image initially
      setImageUrl(url);
      setImageLoaded(true);
      setError('');
    } catch (err) {
      console.error('Error loading image:', err);
      setError('Failed to load image. Please try a different URL.');
      setImageUrl(DEFAULT_IMAGE_URL);
    }
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

  const colorize = async () => {
    if (!originalImage) return;
    
    setIsProcessing(true);
    try {
      const colorized = originalImage.clone();
      const calculateLuminance = LUMINANCE_METHODS[luminanceMethod].calculate;
      
      // Process each pixel to maintain luminance
      colorized.scan(0, 0, colorized.bitmap.width, colorized.bitmap.height, function(x, y, idx) {
        const red = this.bitmap.data[idx + 0];
        const green = this.bitmap.data[idx + 1];
        const blue = this.bitmap.data[idx + 2];
        const alpha = this.bitmap.data[idx + 3];
        
        // Calculate luminance using selected method
        const luminance = calculateLuminance(red, green, blue);
        
        if (alpha > 0) {
          // Apply color while preserving luminance
          this.bitmap.data[idx + 0] = Math.round(rgbColor.r * luminance);
          this.bitmap.data[idx + 1] = Math.round(rgbColor.g * luminance);
          this.bitmap.data[idx + 2] = Math.round(rgbColor.b * luminance);
          this.bitmap.data[idx + 3] = alpha;
        }
      });
      
      setProcessedImage(colorized);
      setError('');
    } catch (err) {
      console.error('Error colorizing image:', err);
      setError('Failed to colorize image. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleQuickDownload = async () => {
    if (!processedImage) return;
    
    try {
      const base64 = await processedImage.getBase64Async(Jimp.MIME_PNG);
      const filename = 'hextra-tshirt.png';
      const link = document.createElement('a');
      link.href = base64;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error('Error downloading image:', err);
      setError('Failed to download image. Please try again.');
    }
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
    setIsDarkMode(document.documentElement.getAttribute('data-theme') === 'dark');
  }, []);

  // Theme toggle handler
  const toggleTheme = () => {
    const newTheme = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', newTheme);
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
      
      <Box sx={{ 
        width: '100%',
        maxWidth: '800px',
        margin: '0 auto',
        padding: '36px 16px 32px',  
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column'
      }}>
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
                    colorize();
                  }
                }}
              />

              {/* Apply Button */}
              <Button
                variant="contained"
                onClick={colorize}
                sx={{ 
                  bgcolor: 'var(--button-bg)',
                  color: 'var(--button-text)',
                  '&:hover': {
                    bgcolor: 'var(--button-hover)'
                  },
                  boxShadow: 'none',
                  fontFamily: "'Inter', sans-serif"
                }}
              >
                Apply
              </Button>
            </Box>

            {/* Separator after Apply button */}
            <Box sx={{ 
              width: '100%', 
              height: '1px', 
              bgcolor: 'var(--text-primary)',
              opacity: 0.3,
              mb: 2
            }} />

            {/* Error message */}
            {error && (
              <Typography 
                color="error" 
                sx={{ 
                  mb: 2,
                  textAlign: 'center',
                  fontFamily: "'Inter', sans-serif"
                }}
              >
                {error}
              </Typography>
            )}

            {/* Image input section */}
            <Box sx={{ 
              display: 'flex', 
              gap: 1,
              alignItems: 'center',
              mb: 2,
              '& .MuiButton-root': {
                minWidth: '120px'  // Align button widths
              }
            }}>
              <Button
                component="label"
                variant="contained"
                disabled={isProcessing}
                sx={{ 
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
                  hidden
                  accept="image/*"
                  onChange={handleFileUpload}
                  disabled={isProcessing}
                />
              </Button>

              <Typography sx={{ mx: 1, fontFamily: "'Inter', sans-serif" }}>OR</Typography>
              
              <TextField
                placeholder="Enter image URL"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                onKeyPress={handleUrlKeyPress}
                sx={{
                  flexGrow: 1,
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
                  }
                }}
              />

              <Button
                onClick={handleLoadUrl}
                variant="contained"
                sx={{ 
                  bgcolor: 'var(--button-bg)',
                  color: 'var(--button-text)',
                  '&:hover': {
                    bgcolor: 'var(--button-hover)'
                  },
                  boxShadow: 'none',
                  fontFamily: "'Inter', sans-serif"
                }}
              >
                Load URL
              </Button>
            </Box>

            {/* Separator before image */}
            <Box sx={{ 
              width: '100%', 
              height: '1px', 
              bgcolor: 'var(--text-primary)',
              opacity: 0.3,
              mb: 2
            }} />

            {/* Result section */}
            <Box sx={{ position: 'relative' }}>
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
              <Box
                sx={{
                  width: '100%',
                  height: 'auto',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 2
                }}
              >
                {processedImageUrl ? (
                  <>
                    <img
                      src={processedImageUrl}
                      alt="Processed T-shirt"
                      style={{
                        maxWidth: '100%',
                        height: 'auto',
                        borderRadius: '4px'
                      }}
                    />
                    
                    {/* Separator between image and color mode toggle */}
                    <Box sx={{ 
                      width: '100%', 
                      height: '1px', 
                      bgcolor: 'var(--text-primary)',
                      opacity: 0.3,
                      mt: 2,
                      mb: 2
                    }} />

                    {/* Color Mode Toggle and Download button container */}
                    <Box sx={{ 
                      display: 'flex', 
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: 2,
                      width: '100%',
                      position: 'relative'
                    }}>
                      {/* Color Mode Toggle */}
                      <Box sx={{ 
                        display: 'flex', 
                        justifyContent: 'center',
                        gap: 1
                      }}>
                        {Object.entries(LUMINANCE_METHODS).map(([key, method]) => (
                          <Button
                            key={key}
                            variant={luminanceMethod === key ? "contained" : "outlined"}
                            size="small"
                            onClick={() => {
                              setLuminanceMethod(key);
                              if (processedImage) {
                                colorize();
                              }
                            }}
                            title={method.tooltip}
                            sx={{
                              bgcolor: luminanceMethod === key ? 'var(--button-bg)' : 'transparent',
                              color: luminanceMethod === key ? 'var(--button-text)' : 'var(--text-primary)',
                              borderColor: 'var(--border-color)',
                              '&:hover': {
                                bgcolor: luminanceMethod === key ? 'var(--button-hover)' : 'var(--button-hover-light)'
                              },
                              fontFamily: "'Inter', sans-serif",
                              textTransform: 'none',
                              minWidth: '80px'
                            }}
                          >
                            {method.label}
                          </Button>
                        ))}
                      </Box>

                      {/* Download button */}
                      <IconButton
                        onClick={handleQuickDownload}
                        disabled={!canDownload}
                        sx={{
                          position: 'absolute',
                          right: 0,
                          top: '50%',
                          transform: 'translateY(-50%)',
                          bgcolor: canDownload ? 'var(--button-bg)' : 'rgba(0, 0, 0, 0.12)',
                          color: canDownload ? 'var(--button-text)' : 'rgba(0, 0, 0, 0.26)',
                          '&:hover': {
                            bgcolor: canDownload ? 'var(--button-hover)' : 'rgba(0, 0, 0, 0.12)'
                          }
                        }}
                      >
                        <FileDownloadIcon />
                      </IconButton>
                    </Box>
                  </>
                ) : (
                  <Typography>Loading image...</Typography>
                )}
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

export default App;
