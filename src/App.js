import React, { useState, useEffect } from 'react';
import { Box, TextField, Button, Typography, IconButton, Tooltip } from '@mui/material';
import { Wheel } from '@uiw/react-color';
import Jimp from 'jimp';
import Banner from './components/Banner';
import './theme.css';
import FileDownloadIcon from '@mui/icons-material/FileDownload';

const DEFAULT_IMAGE_URL = '/images/default-tshirt.png';
const DEFAULT_COLOR = '#D50032';
const DEFAULT_COLORS = [
  '#D50032',  // Red
  '#00805E',  // Green
  '#224D8F',  // Blue
  '#FED141',  // Yellow
  '#FF4400',  // Orange
  '#CABFAD'   // Neutral
];
const VERSION = '1.2.2'; // Updated version for UI improvements

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

function normalizeHex(hex) {
  // Remove #
  hex = hex.replace('#', '');
  
  // Handle short forms like #000 -> #000000
  if (hex.length === 3) {
    hex = hex.split('').map(char => char + char).join('');
  }
  
  return '#' + hex;
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
  const [canDownload, setCanDownload] = useState(false);
  const [urlInput, setUrlInput] = useState('');
  const [recentColors, setRecentColors] = useState(() => {
    const saved = localStorage.getItem('recentHexColors');
    return saved ? JSON.parse(saved) : DEFAULT_COLORS;
  });

  // Theme handling
  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem('hextraTheme');
    return savedTheme || 'dark'; // Default to dark if no saved preference
  });

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('hextraTheme', newTheme);
  };

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // Add color to recent list
  const addToRecentColors = (color) => {
    // Only add valid 6-digit hex codes
    if (/^#[0-9a-f]{6}$/i.test(color)) {
      setRecentColors(prev => {
        const newColors = [color, ...prev.filter(c => c !== color)].slice(0, 6);
        localStorage.setItem('recentHexColors', JSON.stringify(newColors));
        return newColors;
      });
    }
  };

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

  useEffect(() => {
    // Load default image
    Jimp.read(DEFAULT_IMAGE_URL)
      .then(image => {
        setOriginalImage(image);
        setImageLoaded(true);
        // Get initial base64 for display
        image.getBase64(Jimp.MIME_PNG, (err, base64) => {
          if (!err) {
            setProcessedImage(base64);
          }
        });
      })
      .catch(err => {
        console.error('Error loading default image:', err);
        setError('Failed to load default image');
      });
  }, []);

  useEffect(() => {
    if (processedImage) {
      setProcessedImageUrl(processedImage);
      setCanDownload(true);
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
    let value = event.target.value;
    
    // Always keep # at start
    if (!value.startsWith('#')) {
      value = '#' + value;
    }
    
    // Remove any non-hex characters after #
    value = '#' + value.slice(1).replace(/[^0-9a-f]/gi, '');
    
    // Limit to 6 characters after #
    value = '#' + value.slice(1).slice(0, 6);
    
    setSelectedColor(value);
    
    // Update RGB if we have a valid hex
    if (/^#[0-9a-f]{6}$/i.test(value)) {
      const rgb = hexToRgb(value);
      if (rgb) {
        setRgbColor(rgb);
      }
    }
  };

  const handleHexInputKeyDown = (event) => {
    if (event.key === 'Enter') {
      let value = event.target.value;
      if (!value.startsWith('#')) {
        value = '#' + value;
      }
      value = '#' + value.slice(1).padEnd(6, '0');
      setSelectedColor(value);
      
      if (/^#[0-9a-f]{6}$/i.test(value)) {
        const rgb = hexToRgb(value);
        if (rgb) {
          setRgbColor(rgb);
          applyColor(); // This will add to history only after applying
        }
      }
      event.preventDefault();
    }
  };

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setImageFile(file);
    setError('');
    
    try {
      const buffer = await file.arrayBuffer();
      const image = await Jimp.read(Buffer.from(buffer));
      setOriginalImage(image);
      setImageLoaded(true);
      
      // Get initial base64 for display
      image.getBase64(Jimp.MIME_PNG, (err, base64) => {
        if (!err) {
          setProcessedImage(base64);
          setCanDownload(true);
        }
      });
    } catch (err) {
      console.error('Error loading image:', err);
      setError('Failed to load image');
      setImageLoaded(false);
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
      setImageLoaded(true);
      setError('');
      setUrlInput('');
      
      // Get initial base64 for display
      img.getBase64(Jimp.MIME_PNG, (err, base64) => {
        if (!err) {
          setProcessedImage(base64);
          setCanDownload(true);
        }
      });
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
      setImageLoaded(true);
      setError('');
      
      // Get initial base64 for display
      img.getBase64(Jimp.MIME_PNG, (err, base64) => {
        if (!err) {
          setProcessedImage(base64);
          setCanDownload(true);
        }
      });
    } catch (err) {
      console.error('Error loading image:', err);
      setError('Failed to load image. Please try a different URL.');
      setImageUrl(DEFAULT_IMAGE_URL);
    }
  };

  const colorize = async () => {
    if (!imageLoaded || !originalImage) return;
    
    setIsProcessing(true);
    setError('');
    
    try {
      const colorized = originalImage.clone();
      
      colorized.scan(0, 0, colorized.bitmap.width, colorized.bitmap.height, function(x, y, idx) {
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

      colorized.getBase64(Jimp.MIME_PNG, (err, base64) => {
        if (err) {
          console.error('Error converting to base64:', err);
          setError('Error processing image');
          setCanDownload(false);
        } else {
          setProcessedImage(base64);
          setCanDownload(true);
          setError('');
        }
        setIsProcessing(false);
      });
    } catch (err) {
      console.error('Error in colorize:', err);
      setError('Error processing image');
      setCanDownload(false);
      setIsProcessing(false);
    }
  };

  const applyColor = async () => {
    if (/^#[0-9a-f]{6}$/i.test(selectedColor)) {
      await colorize();
      addToRecentColors(selectedColor);
    }
  };

  const handleColorSelect = (color) => {
    const rgb = hexToRgb(color);
    if (rgb) {
      setSelectedColor(color);
      setRgbColor(rgb);
      // Apply color immediately
      if (originalImage) {
        const colorized = originalImage.clone();
        colorized.scan(0, 0, colorized.bitmap.width, colorized.bitmap.height, function(x, y, idx) {
          const red = this.bitmap.data[idx + 0];
          const green = this.bitmap.data[idx + 1];
          const blue = this.bitmap.data[idx + 2];
          const alpha = this.bitmap.data[idx + 3];
          
          const luminance = (red * 0.299 + green * 0.587 + blue * 0.114) / 255;
          
          if (alpha > 0) {
            this.bitmap.data[idx + 0] = Math.round(rgb.r * luminance);
            this.bitmap.data[idx + 1] = Math.round(rgb.g * luminance);
            this.bitmap.data[idx + 2] = Math.round(rgb.b * luminance);
            this.bitmap.data[idx + 3] = alpha;
          }
        });

        colorized.getBase64(Jimp.MIME_PNG, (err, base64) => {
          if (!err) {
            setProcessedImage(base64);
            setCanDownload(true);
            addToRecentColors(color);
          }
        });
      }
    }
  };

  const handleQuickDownload = async () => {
    if (!processedImage) return;
    
    try {
      const base64 = processedImage;
      const filename = generateFilename();
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
        isDarkMode={theme === 'dark'}
        onThemeToggle={toggleTheme}
      />
      
      <Box sx={{ 
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        minHeight: '100vh',
        paddingTop: '45px', 
        backgroundColor: 'var(--bg-primary)',
        transition: 'background-color 0.3s'
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
          gap: 3,
          maxWidth: '600px',
          margin: '0 auto'
        }}>
          {/* Color Section */}
          <Box sx={{ mb: 3 }}>
            {/* Color Wheel */}
            <Box sx={{ 
              display: 'flex',
              justifyContent: 'center',
              mb: 3
            }}>
              <Wheel
                color={selectedColor}
                onChange={handleColorChange}
                width={240}
                height={240}
              />
            </Box>

            {/* Value Display */}
            <Box sx={{ width: '100%', mb: 3 }}>
              <Box
                sx={{
                  width: '100%',
                  height: '20px',
                  background: 'linear-gradient(to right, #000000 0%, #FFFFFF 100%)',
                  borderRadius: '6px',
                  position: 'relative',
                  pointerEvents: 'none',
                  mb: 1
                }}
              >
                <Box
                  sx={{
                    position: 'absolute',
                    left: `${(rgbColor.r * 0.299 + rgbColor.g * 0.587 + rgbColor.b * 0.114) / 2.55}%`,
                    top: -2,
                    bottom: -2,
                    width: '4px',
                    backgroundColor: '#FF4400',
                    opacity: 1,
                    pointerEvents: 'none',
                    borderRadius: '2px'
                  }}
                />
              </Box>
              <Typography 
                sx={{ 
                  fontFamily: "'Inter', sans-serif",
                  color: 'var(--text-primary)',
                  fontSize: '0.875rem',
                  pl: '40px'  // Align with RGB text
                }}
              >
                Gray Value: {Math.round((rgbColor.r * 0.299 + rgbColor.g * 0.587 + rgbColor.b * 0.114))}
              </Typography>
            </Box>

            {/* Color controls */}
            <Box sx={{ 
              display: 'flex',
              gap: 3,
              alignItems: 'center',
              width: '100%',
              pl: '40px'  // Consistent left padding
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
                <Box component="span" sx={{ display: 'inline-block', width: '40px', textAlign: 'right' }}>
                  RGB:
                </Box>
                {' '}
                <Box component="span" sx={{ display: 'inline-block', width: '85px', textAlign: 'left', fontFamily: 'monospace' }}>
                  {rgbColor ? `${rgbColor.r},${rgbColor.g},${rgbColor.b}` : '0,0,0'}
                </Box>
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
              <Box sx={{ position: 'relative' }}>
                <TextField
                  label="HEX Color"
                  value={selectedColor}
                  onChange={handleHexInputChange}
                  onKeyDown={handleHexInputKeyDown}
                  autoComplete="off"
                  sx={{ 
                    width: '150px',
                    '& .MuiOutlinedInput-root': {
                      '& fieldset': {
                        borderColor: 'var(--border-color)',
                      },
                      '&:hover fieldset': {
                        borderColor: 'var(--border-hover)',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: 'var(--primary-color)',
                      },
                      backgroundColor: 'var(--background)'
                    },
                    '& .MuiInputLabel-root': {
                      color: 'var(--text-secondary)',
                      '&.Mui-focused': {
                        color: 'var(--primary-color)',
                      },
                    },
                    '& .MuiInputBase-input': {
                      color: 'var(--text-primary)',
                      backgroundColor: 'var(--background)',
                      fontFamily: "'Inter', sans-serif",
                      textTransform: 'lowercase',
                      fontSize: '0.875rem',
                      '&:-webkit-autofill': {
                        WebkitBoxShadow: '0 0 0 100px var(--background) inset',
                        WebkitTextFillColor: 'var(--text-primary)',
                        fontSize: 'inherit',
                        fontFamily: 'inherit'
                      }
                    }
                  }}
                />
                
                {/* Google-style Recent Colors Dropdown */}
                {recentColors.length > 0 && (
                  <Box
                    sx={{
                      position: 'absolute',
                      top: '100%',
                      left: 0,
                      width: '150px',
                      display: 'none',
                      flexDirection: 'column',
                      backgroundColor: 'var(--bg-primary)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '4px',
                      marginTop: '4px',
                      zIndex: 1000,
                      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                      '.MuiTextField-root:focus-within + &': {
                        display: 'flex'
                      },
                      '&:hover': {
                        display: 'flex'
                      }
                    }}
                  >
                    {recentColors.map((color, index) => (
                      <Box
                        key={index}
                        onClick={() => handleColorSelect(color)}
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          padding: '8px',
                          cursor: 'pointer',
                          '&:hover': {
                            backgroundColor: 'var(--hover-bg)'
                          }
                        }}
                      >
                        <Box
                          sx={{
                            width: '20px',
                            height: '20px',
                            backgroundColor: color,
                            marginRight: '8px',
                            border: '1px solid var(--border-color)',
                            borderRadius: '2px'
                          }}
                        />
                        <Typography
                          sx={{
                            color: 'var(--text-primary)',
                            fontSize: '0.875rem',
                            fontFamily: "'Inter', sans-serif"
                          }}
                        >
                          {color.toLowerCase()}
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                )}
              </Box>

              {/* Apply Button */}
              <Button
                variant="contained"
                onClick={applyColor}
                disabled={isProcessing || !imageLoaded}
                sx={{
                  bgcolor: 'var(--button-bg)',
                  color: 'var(--button-text)',
                  '&:hover': {
                    bgcolor: 'var(--button-hover)',
                  },
                  '&.Mui-disabled': {
                    bgcolor: 'var(--disabled-bg)',
                    color: 'var(--disabled-text)',
                  },
                  fontFamily: "'Inter', sans-serif",
                  textTransform: 'none',
                  minWidth: '100px',
                  padding: '6px 16px',
                  boxShadow: 'none',
                  border: '1px solid var(--border-color)'
                }}
              >
                Apply Color
              </Button>
            </Box>
          </Box>

          {/* Separator between Color and Image sections */}
          <Box sx={{ 
            width: '100%', 
            height: '1px', 
            bgcolor: 'var(--text-primary)',
            opacity: 0.3,
            mb: 3
          }} />

          {/* Image Section */}
          <Box sx={{ 
            display: 'flex', 
            gap: 3,
            alignItems: 'center',
            mb: 3
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
                onChange={handleImageUpload}
                disabled={isProcessing}
              />
            </Button>

            <Typography sx={{ mx: 3, fontFamily: "'Inter', sans-serif" }}>OR</Typography>
            
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
            mb: 3
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
                  gap: 3
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
                gap: 3
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
                    mt: 3,
                    mb: 3
                  }} />

                  {/* Color Mode Toggle and Download button container */}
                  <Box sx={{ 
                    display: 'flex', 
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 3,
                    width: '100%',
                    position: 'relative'
                  }}>
                    {/* Color Mode Toggle */}
                    <Box sx={{ 
                      display: 'flex', 
                      justifyContent: 'center',
                      gap: 3
                    }}>
                      {Object.entries(LUMINANCE_METHODS).map(([key, method]) => (
                        <Tooltip
                          title={method.tooltip}
                          arrow
                          enterDelay={200}
                          leaveDelay={0}
                          PopperProps={{
                            sx: {
                              '& .MuiTooltip-tooltip': {
                                backgroundColor: 'var(--bg-secondary)',
                                color: 'var(--text-primary)',
                                fontSize: '0.75rem',
                                padding: '8px 12px',
                                borderRadius: '4px',
                                maxWidth: '200px'
                              },
                              '& .MuiTooltip-arrow': {
                                color: 'var(--bg-secondary)'
                              }
                            }
                          }}
                        >
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
                        </Tooltip>
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
  );
}

export default App;
