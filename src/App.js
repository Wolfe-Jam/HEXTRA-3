import React, { useState, useEffect, useRef } from 'react';
import { Box, Button, Typography, Tooltip, Slider, CircularProgress } from '@mui/material';
import { Wheel } from '@uiw/react-color';
import Jimp from 'jimp';
import Banner from './components/Banner';
import GlowButton from './components/GlowButton';
import GlowTextButton from './components/GlowTextButton';
import IconTextField from './components/IconTextField';
import SwatchDropdownField from './components/SwatchDropdownField';
import './theme.css';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import { RefreshRounded as ResetIcon, LinkRounded as LinkIcon } from '@mui/icons-material';
import { TextField, InputAdornment, IconButton } from '@mui/material';
import TagIcon from '@mui/icons-material/Tag';

const DEFAULT_COLOR = '#FED141';
const DEFAULT_IMAGE_URL = '/images/default-tshirt.png';
const DEFAULT_COLORS = [
  '#D50032',  // Red
  '#00805E',  // Green
  '#224D8F',  // Blue
  '#FED141',  // Yellow
  '#FF4400',  // Orange
  '#CABFAD'   // Neutral
];
const VERSION = '1.2.6'; // Starting new features

function hexToRgb(hex) {
  // Remove the hash if present
  hex = hex.replace('#', '');
  
  // Parse the hex values
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  
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

function rgbToHsv(r, g, b) {
  r /= 255;
  g /= 255;
  b /= 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const delta = max - min;

  let h;
  if (delta === 0) {
    h = 0;
  } else if (max === r) {
    h = (60 * ((g - b) / delta) + 360) % 360;
  } else if (max === g) {
    h = (60 * ((b - r) / delta) + 120) % 360;
  } else if (max === b) {
    h = (60 * ((r - g) / delta) + 240) % 360;
  }

  const s = max === 0 ? 0 : delta / max;
  const v = max;

  return { h, s, v };
}

function App() {
  const [selectedColor, setSelectedColor] = useState(DEFAULT_COLOR);
  const [rgbColor, setRgbColor] = useState(hexToRgb(DEFAULT_COLOR));
  const [imageFile, setImageFile] = useState(null);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [originalImage, setOriginalImage] = useState(null);
  const [processedImage, setProcessedImage] = useState(null);
  const [processedImageUrl, setProcessedImageUrl] = useState('');
  const [error, setError] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [canDownload, setCanDownload] = useState(false);
  const [hexInput, setHexInput] = useState(DEFAULT_COLOR);
  const [urlInput, setUrlInput] = useState('');
  const [imageUrl, setImageUrl] = useState(DEFAULT_IMAGE_URL);
  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem('hextraTheme');
    return savedTheme || 'dark';
  });
  const [isDropdownSelection, setIsDropdownSelection] = useState(false);
  const [lastClickColor, setLastClickColor] = useState(null);
  const [lastClickTime, setLastClickTime] = useState(0);

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('hextraTheme', newTheme);
  };

  const handleHexInputChange = (e) => {
    const value = e.target.value;
    setHexInput(value);
    
    // If empty and we have a selectedColor, use that
    if (!value && selectedColor) {
      setHexInput(selectedColor);
      return;
    }

    // Add # if missing
    const hexValue = value.startsWith('#') ? value : '#' + value;
    
    // Allow default color to pass through
    if (hexValue === DEFAULT_COLOR || /^#[0-9A-F]{6}$/i.test(hexValue)) {
      setSelectedColor(hexValue.toUpperCase());
      setRgbColor(hexToRgb(hexValue));
    }
  };

  const handleHexKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault(); // Prevent default behavior
      e.stopPropagation(); // Stop event from bubbling up
      
      let value = e.target.value;
      // If no value, use the current selectedColor
      if (!value && selectedColor) {
        value = selectedColor;
      }
      // Add # if missing
      if (!value.startsWith('#')) {
        value = '#' + value;
      }
      value = value.toUpperCase();
      
      // Allow the default color to pass through
      if (value === DEFAULT_COLOR || /^#[0-9A-F]{6}$/i.test(value)) {
        setSelectedColor(value);
        setHexInput(value);
        setRgbColor(hexToRgb(value));
        applyColor();
      }
    }
  };

  const resetColor = () => {
    const defaultRgb = hexToRgb(DEFAULT_COLOR);
    setSelectedColor(DEFAULT_COLOR);
    setHexInput(DEFAULT_COLOR);
    setRgbColor(defaultRgb);
    // Force update the color wheel
    if (wheelRef.current) {
      wheelRef.current.setHex(DEFAULT_COLOR);
    }
  };

  const handleColorChange = (color) => {
    const hexValue = color.hex.toUpperCase();
    setSelectedColor(hexValue);
    setHexInput(hexValue);
    setRgbColor(hexToRgb(hexValue));
  };

  const applyColor = async () => {
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
        
        if (alpha > 0) {
          const luminance = (0.299 * red + 0.587 * green + 0.114 * blue) / 255;
          this.bitmap.data[idx + 0] = Math.round(rgbColor.r * luminance);
          this.bitmap.data[idx + 1] = Math.round(rgbColor.g * luminance);
          this.bitmap.data[idx + 2] = Math.round(rgbColor.b * luminance);
        }
      });

      const base64 = await new Promise((resolve, reject) => {
        colorized.getBase64(Jimp.MIME_PNG, (err, base64) => {
          if (err) reject(err);
          else resolve(base64);
        });
      });
      
      setProcessedImage(colorized);
      setProcessedImageUrl(base64);
      setCanDownload(true);
      setError('');
    } catch (err) {
      console.error('Error in colorize:', err);
      setError('Error processing image');
      setCanDownload(false);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleImageUpload = async (file) => {
    if (!file) return;
    
    // Reset states for new upload
    setProcessedImage(null);
    setProcessedImageUrl('');
    setCanDownload(false);
    setError('');
    setImageUrl(''); // Clear any previous URL
    setIsProcessing(true);
    
    try {
      const image = await Jimp.read(await file.arrayBuffer());
      setOriginalImage(image);
      setImageLoaded(true);
      
      image.getBase64(Jimp.MIME_PNG, (err, base64) => {
        if (!err) {
          setProcessedImage(image);
          setProcessedImageUrl(base64);
          setCanDownload(true);
        }
        setIsProcessing(false);
      });
    } catch (err) {
      console.error('Error loading image:', err);
      setError('Failed to load image');
      setImageLoaded(false);
      setCanDownload(false);
      setIsProcessing(false);
    }
  };

  const handleLoadUrl = () => {
    if (!urlInput.trim()) {
      window.open('https://www.google.com/search?q=white+t-shirt+mockup&tbm=isch', '_blank');
      return;
    }
    // Reset file input by clearing imageFile state
    setImageFile(null);
    const url = urlInput.trim();
    setImageUrl(url);
  };

  const handleUrlKeyPress = (e) => {
    if (e.key === 'Enter' && urlInput.trim()) {
      e.preventDefault();
      // Reset file input by clearing imageFile state
      setImageFile(null);
      const url = urlInput.trim();
      setImageUrl(url);
    }
  };

  const resetUrl = () => {
    setUrlInput('');
  };

  // Add refs
  const wheelRef = useRef(null);
  const grayValueRef = useRef(null);

  const handleGraySwatchClick = () => {
    const grayValue = Math.round((rgbColor.r + rgbColor.g + rgbColor.b) / 3);
    const grayHex = `#${grayValue.toString(16).padStart(2, '0').repeat(3)}`.toUpperCase();
    setHexInput(grayHex);
    setSelectedColor(grayHex);
    setRgbColor({ r: grayValue, g: grayValue, b: grayValue });
  };

  const handleGradientClick = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = Math.min(Math.max(x / rect.width, 0), 1);
    const grayValue = Math.round(percentage * 255);
    const grayHex = `#${grayValue.toString(16).padStart(2, '0').repeat(3)}`.toUpperCase();
    setHexInput(grayHex);
    setSelectedColor(grayHex);
    setRgbColor({ r: grayValue, g: grayValue, b: grayValue });
  };

  const handleWheelClick = (e) => {
    const now = Date.now();
    const timeDiff = now - lastClickTime;
    
    if (lastClickColor && timeDiff < 500) {  // 500ms window for double-click
      // Average the colors for quick double-click
      const last = hexToRgb(lastClickColor);
      const current = hexToRgb(selectedColor);
      const avgColor = {
        r: Math.round((last.r + current.r) / 2),
        g: Math.round((last.g + current.g) / 2),
        b: Math.round((last.b + current.b) / 2)
      };
      const avgHex = `#${avgColor.r.toString(16).padStart(2, '0')}${avgColor.g.toString(16).padStart(2, '0')}${avgColor.b.toString(16).padStart(2, '0')}`.toUpperCase();
      setSelectedColor(avgHex);
      setHexInput(avgHex);
      setRgbColor(avgColor);
      applyColor();
      // Reset after applying
      setLastClickColor(null);
      setLastClickTime(0);
    } else {
      // Store first click info
      setLastClickColor(selectedColor);
      setLastClickTime(now);
    }
  };

  // Load default image on mount
  useEffect(() => {
    // Set initial color states
    setSelectedColor(DEFAULT_COLOR);
    setHexInput(DEFAULT_COLOR);
    setRgbColor(hexToRgb(DEFAULT_COLOR));
    
    // Load default image
    Jimp.read(DEFAULT_IMAGE_URL)
      .then(image => {
        setOriginalImage(image);
        setImageLoaded(true);
        // Get initial base64 for display
        image.getBase64(Jimp.MIME_PNG, (err, base64) => {
          if (!err) {
            setProcessedImage(image);
            setProcessedImageUrl(base64);
            setCanDownload(true);
          }
        });
      })
      .catch(err => {
        console.error('Error loading default image:', err);
        setError('Failed to load default image');
      });
  }, []);

  // Theme effect
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    document.documentElement.style.setProperty('--text-primary', theme === 'light' ? '#141414' : '#F8F8F8');
    document.documentElement.style.setProperty('--text-secondary', theme === 'light' ? '#666666' : '#A0A0A0');
    document.documentElement.style.setProperty('--text-disabled', theme === 'light' ? 'rgba(20, 20, 20, 0.26)' : 'rgba(248, 248, 248, 0.3)');
    document.documentElement.style.setProperty('--bg-primary', theme === 'light' ? '#F8F8F8' : '#141414');
    document.documentElement.style.setProperty('--bg-secondary', theme === 'light' ? '#F0F0F0' : '#1E1E1E');
    document.documentElement.style.setProperty('--element-bg', theme === 'light' ? '#FFFFFF' : '#000000');
    document.documentElement.style.setProperty('--border-color', theme === 'light' ? '#E0E0E0' : '#2A2A2A');
    document.documentElement.style.setProperty('--border-subtle', theme === 'light' ? 'rgba(20, 20, 20, 0.1)' : 'rgba(248, 248, 248, 0.15)');
    document.documentElement.style.setProperty('--input-border', theme === 'light' ? '#E0E0E0' : '#333333');
    document.documentElement.style.setProperty('--glow-color', '#FED141');
    document.documentElement.style.setProperty('--glow-subtle', theme === 'light' ? 'rgba(254, 209, 65, 0.2)' : 'rgba(254, 209, 65, 0.25)');
    document.documentElement.style.setProperty('--accent-color', '#FF4400');
    document.documentElement.style.setProperty('--accent-color-hover', '#FF5500');
    document.documentElement.style.setProperty('--accent-color-subtle', theme === 'light' ? 'rgba(255, 68, 0, 0.15)' : 'rgba(255, 68, 0, 0.25)');
  }, [theme]);

  // Input hover/focus styles
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      input:hover {
        border-color: var(--glow-color) !important;
        box-shadow: 0 0 0 3px var(--glow-subtle) !important;
      }
      input:focus {
        border-color: var(--glow-color) !important;
        box-shadow: 0 0 0 3px var(--glow-subtle) !important;
      }
      input::placeholder {
        color: var(--text-secondary);
      }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, [theme]);

  useEffect(() => {
    if (isDropdownSelection) {
      applyColor();
      setIsDropdownSelection(false);  // Reset the flag after applying
    }
  }, [isDropdownSelection]);  

  const handleDropdownSelection = (color) => {
    const rgb = hexToRgb(color);
    if (rgb) {
      setRgbColor(rgb);
      setSelectedColor(color);
      setHexInput(color);
      setIsDropdownSelection(true);
      if (wheelRef.current) {
        wheelRef.current.setHsva({
          h: rgbToHsv(rgb.r, rgb.g, rgb.b).h,
          s: rgbToHsv(rgb.r, rgb.g, rgb.b).s,
          v: rgbToHsv(rgb.r, rgb.g, rgb.b).v,
          a: 1
        });
      }
    }
  };

  const handleQuickDownload = () => {
    if (!processedImageUrl || !canDownload) return;
    
    const currentDate = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    const filename = `HEXTRA-${currentDate}-${selectedColor.replace('#', '')}.png`;
    
    const link = document.createElement('a');
    link.href = processedImageUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  useEffect(() => {
    if (!imageUrl || imageUrl === DEFAULT_IMAGE_URL) return;
    
    // Reset states before loading new image
    setProcessedImage(null);
    setProcessedImageUrl('');
    setCanDownload(false);
    setError('');
    setIsProcessing(true);
    
    Jimp.read(imageUrl)
      .then(image => {
        setOriginalImage(image);
        setImageLoaded(true);
        image.getBase64(Jimp.MIME_PNG, (err, base64) => {
          if (!err) {
            setProcessedImage(image);
            setProcessedImageUrl(base64);
            setCanDownload(true);
          }
          setIsProcessing(false);
        });
      })
      .catch(err => {
        console.error('Error loading image:', err);
        setError('Failed to load image');
        setImageLoaded(false);
        setCanDownload(false);
        setIsProcessing(false);
      });
  }, [imageUrl]);

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
        version="1.2.6"
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
          <Box sx={{ mb: 1 }}>
            {/* Section B: RGB Color Disc */}
            <Box sx={{ 
              display: 'flex',
              justifyContent: 'center',
              mb: 3
            }}>
              <Wheel
                ref={wheelRef}
                color={selectedColor}
                onChange={handleColorChange}
                onClick={handleWheelClick}
                onDoubleClick={() => applyColor()}
                width={240}
                height={240}
              />
            </Box>

            {/* Section C: Grayscale Display Bar */}
            <Box sx={{ 
              display: 'flex',
              alignItems: 'center',
              gap: 2,
              width: '100%',
              mb: 3,
              pl: '40px'  // Match the HEX input bar padding
            }}>
              {/* GRAY Value Display */}
              <Typography sx={{ 
                fontFamily: "'Inter', sans-serif",
                color: 'var(--text-primary)',
                fontSize: '0.875rem',
                whiteSpace: 'nowrap',
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                width: '120px'
              }}>
                <Box component="span" sx={{ flexShrink: 0 }}>GRAY Value:</Box>
                <Box component="span" sx={{ 
                  fontFamily: 'monospace',
                  textAlign: 'left'
                }}>
                  {`${Math.round((rgbColor.r + rgbColor.g + rgbColor.b) / 3)}`.padStart(3, ' ')}
                </Box>
              </Typography>

              {/* Gray Swatch */}
              <Box
                onClick={handleGraySwatchClick}
                sx={{
                  width: '36px',
                  height: '36px',
                  flexShrink: 0,
                  backgroundColor: `rgb(${Math.round((rgbColor.r + rgbColor.g + rgbColor.b) / 3)}, ${Math.round((rgbColor.r + rgbColor.g + rgbColor.b) / 3)}, ${Math.round((rgbColor.r + rgbColor.g + rgbColor.b) / 3)})`,
                  borderRadius: '50%',
                  border: '1px solid var(--border-color)',
                  boxShadow: '0 0 0 1px rgba(0, 0, 0, 0.1)',
                  cursor: 'pointer',
                  transition: 'box-shadow 0.2s',
                  '&:hover': {
                    boxShadow: '0 0 0 2px var(--glow-color)',
                  }
                }}
              />

              {/* Slider */}
              <Box 
                onClick={handleGradientClick}
                sx={{
                  position: 'relative',
                  width: '200px',
                  height: '24px',
                  backgroundColor: 'transparent',
                  borderRadius: '12px',
                  border: '1px solid var(--border-color)',
                  background: 'linear-gradient(to right, #000000, #FFFFFF)',
                  overflow: 'hidden',
                  cursor: 'pointer'
                }}
              >
                <Box sx={{
                  position: 'absolute',
                  left: `${(Math.round((rgbColor.r + rgbColor.g + rgbColor.b) / 3) / 255) * 100}%`,
                  top: 0,
                  width: '2px',
                  height: '100%',
                  backgroundColor: 'var(--glow-color)',
                  transform: 'translateX(-50%)',
                  boxShadow: '0 0 4px var(--glow-color)',
                  pointerEvents: 'none'
                }} />
              </Box>
            </Box>

            {/* Section D: HEX Input Bar */}
            <Box sx={{ 
              display: 'flex',
              gap: 2,
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
                width: '140px',  // Fixed width
                display: 'flex',
                alignItems: 'center',
                gap: 1
              }}>
                <Box component="span" sx={{ flexShrink: 0 }}>RGB:</Box>
                <Box component="span" sx={{ 
                  fontFamily: 'monospace',
                  width: '85px',  // Fixed width for numbers
                  textAlign: 'left'
                }}>
                  {rgbColor.r},{rgbColor.g},{rgbColor.b}
                </Box>
              </Typography>

              {/* Color Swatch */}
              <Box
                sx={{
                  width: '48px',
                  height: '48px',
                  backgroundColor: selectedColor,
                  borderRadius: '50%',
                  border: '1px solid var(--border-color)',
                  boxShadow: '0 0 0 1px rgba(0, 0, 0, 0.1)',
                  flexShrink: 0
                }}
              />

              {/* HEX Input with Reset Icon */}
              <SwatchDropdownField
                value={hexInput}
                onChange={(e) => setHexInput(e.target.value)}
                onKeyDown={handleHexKeyPress}
                placeholder="#FED141"
                startIcon={<TagIcon />}
                hasReset
                onReset={resetColor}
                options={[
                  '#FED141',
                  '#D50032',
                  '#00805E',
                  '#224D8F',
                  '#FF4400',
                  '#CABFAD'
                ]}
                onSelectionChange={handleDropdownSelection}
                sx={{ 
                  width: '180px',  
                  '& .MuiOutlinedInput-root': {
                    paddingLeft: '8px'  
                  }
                }}
              />
              {/* Apply Button */}
              <GlowTextButton
                id="apply-button"
                variant="contained"
                onClick={applyColor}
                disabled={isProcessing || !imageLoaded}
              >
                APPLY
              </GlowTextButton>
            </Box>
          </Box>

          {/* Separator */}
          <Box
            sx={{
              width: '100%',
              height: '4px',
              backgroundColor: theme === 'dark' ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.15)',
              mb: 1
            }}
          />

          {/* Image Section Title */}
          <Typography 
            variant="subtitle1" 
            component="h2" 
            sx={{ 
              mb: 1,
              textAlign: 'center',
              fontWeight: 500,
              fontFamily: "'League Spartan', sans-serif",
              fontSize: '1rem',
              letterSpacing: '0.25em',
              textTransform: 'uppercase',
              color: 'var(--text-secondary)'
            }}
          >
            THE IMAGE FACTORY
          </Typography>

          {/* Image Section */}
          <Box sx={{ 
            display: 'flex', 
            gap: 2,
            alignItems: 'center',
            mt: 1,
            mb: 3,
            width: '100%',
            pr: '12px'  // Restore the padding for USE URL alignment
          }}>
            <GlowTextButton
              component="label"
              variant="contained"
              disabled={isProcessing}
            >
              UPLOAD
              <input
                type="file"
                hidden
                accept="image/*"
                onChange={(e) => handleImageUpload(e.target.files[0])}
                disabled={false}
              />
            </GlowTextButton>

            <Box sx={{ flex: 1, mr: 'auto' }}>
              <IconTextField
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                onKeyDown={handleUrlKeyPress}
                placeholder="Enter image URL..."
                startIcon={<LinkIcon />}
                hasReset
                onReset={resetUrl}
                sx={{ width: '100%' }}
              />
            </Box>

            <Button
              variant="contained"
              onClick={handleLoadUrl}
              sx={{
                minWidth: 'auto',
                px: 2,
                fontFamily: "'Inter', sans-serif",
                color: theme === 'dark' ? 'black' : 'white',
                bgcolor: theme === 'dark' ? 'white' : 'black',
                '&:hover': {
                  bgcolor: theme === 'dark' ? '#e0e0e0' : '#333333'
                }
              }}
            >
              USE URL
            </Button>
          </Box>

          {/* Result section */}
          <Box sx={{ position: 'relative' }}>
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 3
              }}
            >
              <Box sx={{ 
                position: 'relative',
                width: '100%'
              }}>
                <img
                  src={processedImageUrl || DEFAULT_IMAGE_URL}
                  alt="Processed"
                  style={{
                    maxWidth: '100%',
                    height: 'auto',
                    borderRadius: '4px',
                    border: '1px solid var(--border-color)'
                  }}
                />
                {isProcessing && (
                  <Box
                    sx={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: 'rgba(0, 0, 0, 0.3)',
                      borderRadius: '4px',
                      zIndex: 1
                    }}
                  >
                    <CircularProgress sx={{ color: 'var(--glow-color)' }} />
                  </Box>
                )}
                {/* Download button using GlowButton */}
                <GlowButton
                  onClick={handleQuickDownload}
                  disabled={!canDownload}
                  sx={{
                    position: 'absolute',
                    right: '12px',
                    top: '12px',
                    backgroundColor: 'var(--element-bg)',
                  }}
                >
                  <FileDownloadIcon />
                </GlowButton>
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

export default App;
