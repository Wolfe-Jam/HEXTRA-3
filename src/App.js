import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Box, IconButton, Slider, Typography, CircularProgress, LinearProgress, Tooltip } from '@mui/material';
import { hexToRgb } from './utils/image-processing';
import { processImage } from './utils/image-processing';
import TagIcon from '@mui/icons-material/Tag';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import { LinkRounded as LinkIcon } from '@mui/icons-material';
import { Wheel } from '@uiw/react-color';
import JSZip from 'jszip';
import SwatchDropdownField from './components/SwatchDropdownField';
import GlowTextButton from './components/GlowTextButton';
import GlowButton from './components/GlowButton';
import GlowSwitch from './components/GlowSwitch';
import IconTextField from './components/IconTextField';
import Banner from './components/Banner';
import { Routes, Route } from 'react-router-dom';
import DefaultTshirt from './components/DefaultTshirt';
import GILDAN_64000 from './data/catalogs/gildan64000.js';
import './theme.css';

// Constants
const DEFAULT_COLOR = '#FED141';

function App() {
  // State variables
  const [selectedColor, setSelectedColor] = useState(DEFAULT_COLOR);
  const [rgbColor, setRgbColor] = useState(hexToRgb(DEFAULT_COLOR));
  const [workingImageUrl, setWorkingImageUrl] = useState(null);
  const [workingProcessedUrl, setWorkingProcessedUrl] = useState(null);
  const [originalImage, setOriginalImage] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [canDownload, setCanDownload] = useState(false);
  const [urlInput, setUrlInput] = useState('');
  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem('hextraTheme');
    return savedTheme || 'dark';
  });
  const [lastClickColor, setLastClickColor] = useState(null);
  const [lastClickTime, setLastClickTime] = useState(0);
  const [enhanceEffect, setEnhanceEffect] = useState(true);
  const [showTooltips, setShowTooltips] = useState(true);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [grayscaleValue, setGrayscaleValue] = useState(128);
  const [matteValue, setMatteValue] = useState(50);
  const [textureValue, setTextureValue] = useState(50);
  const [error, setError] = useState('');
  const [batchResults, setBatchResults] = useState([]);
  const [batchProgress, setBatchProgress] = useState(0);
  const [batchStatus, setBatchStatus] = useState('idle');
  const [selectedColors, setSelectedColors] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [processedCount, setProcessedCount] = useState(0);
  const [activeCatalog, setActiveCatalog] = useState('GILDAN_64000');
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Add refs
  const wheelRef = useRef(null);
  const hexInputRef = useRef(null);

  const applyColor = useCallback(async (color) => {
    if (!workingImageUrl) return;
    
    try {
      setIsProcessing(true);
      const processedUrl = await processImage(workingImageUrl, color);
      setWorkingProcessedUrl(processedUrl);
      setCanDownload(true);
    } catch (err) {
      console.error('Failed to process image:', err);
      setCanDownload(false);
    } finally {
      setIsProcessing(false);
    }
  }, [workingImageUrl]);

  useEffect(() => {
    if (selectedColor && imageLoaded) {
      applyColor(selectedColor);
    }
  }, [selectedColor, imageLoaded, applyColor]);

  const handleColorChange = (color) => {
    setSelectedColor(color.hex);
    setRgbColor(hexToRgb(color.hex));
    // Focus hex input as per workflow requirements
    if (hexInputRef.current) {
      hexInputRef.current.focus();
    }
  };

  const handleDropdownSelect = (color) => {
    setSelectedColor(color.hex);
    setRgbColor(hexToRgb(color.hex));
    // Focus hex input as per workflow requirements
    if (hexInputRef.current) {
      hexInputRef.current.focus();
    }
  };

  const handleImageUpload = async (file) => {
    if (!file) return;
    
    try {
      const url = URL.createObjectURL(file);
      setWorkingImageUrl(url);
      setImageLoaded(true);
      
      // Process with current color
      if (selectedColor) {
        await applyColor(selectedColor);
      }
    } catch (err) {
      console.error('Failed to load image:', err);
      setImageLoaded(false);
    }
  };

  const handleLoadUrl = async () => {
    if (!urlInput.trim()) {
      window.open('https://www.google.com/search?q=blank+white+t-shirt&tbm=isch', '_blank');
      return;
    }

    try {
      const response = await fetch(urlInput);
      const blob = await response.blob();
      const file = new File([blob], 'image.png', { type: blob.type });
      await handleImageUpload(file);
      setUrlInput('');
    } catch (err) {
      console.error('Failed to load image from URL:', err);
    }
  };

  const handleUrlKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleLoadUrl();
    }
  };

  const handleWheelClick = (e) => {
    const now = Date.now();
    const timeDiff = now - lastClickTime;
    
    if (timeDiff < 300 && lastClickColor === selectedColor) {
      applyColor(selectedColor);
    }
    
    setLastClickColor(selectedColor);
    setLastClickTime(now);
  };

  const handleHexInputChange = (e) => {
    const value = e.target.value;
    // If empty and we have a selectedColor, use that
    if (!value && selectedColor) {
      e.target.value = selectedColor;
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
        setRgbColor(hexToRgb(value));
        applyColor();
      }
    }
  };

  const resetColor = () => {
    const defaultRgb = hexToRgb(DEFAULT_COLOR);
    setSelectedColor(DEFAULT_COLOR);
    setRgbColor(defaultRgb);
    // Force update the color wheel
    if (wheelRef.current) {
      wheelRef.current.setHex(DEFAULT_COLOR);
    }
  };

  const handleGrayscaleChange = (event, newValue) => {
    const grayValue = newValue;
    const grayHex = `#${grayValue.toString(16).padStart(2, '0').repeat(3)}`.toUpperCase();
    setGrayscaleValue(grayValue);
    setSelectedColor(grayHex);
    setRgbColor({ r: grayValue, g: grayValue, b: grayValue });
  };

  const handleDownload = async () => {
    if (!workingProcessedUrl) {
      console.error('No processed image to download');
      return;
    }

    try {
      const response = await fetch(workingProcessedUrl);
      const blob = await response.blob();
      const downloadUrl = URL.createObjectURL(blob);
      const filename = `processed-image.png`;
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(downloadUrl);
    } catch (err) {
      console.error('Failed to download image:', err);
    }
  };

  const handleBatchProcess = async () => {
    if (!workingImageUrl || selectedColors.length === 0) {
      console.error('Please select an image and colors first');
      return;
    }

    setBatchStatus('processing');
    setBatchProgress(0);
    setTotalCount(selectedColors.length);
    setProcessedCount(0);

    const results = [];
    const zip = new JSZip();

    try {
      for (let i = 0; i < selectedColors.length; i++) {
        const color = selectedColors[i];
        const processedUrl = await processImage(workingImageUrl, color);
        
        // Add to zip
        const response = await fetch(processedUrl);
        const blob = await response.blob();
        zip.file(`${color.name}.png`, blob);

        results.push({
          color: color,
          url: processedUrl
        });

        setProcessedCount(i + 1);
        setBatchProgress(((i + 1) / selectedColors.length) * 100);
      }

      // Generate zip file
      const content = await zip.generateAsync({ type: 'blob' });
      const downloadUrl = window.URL.createObjectURL(content);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `HEXTRA-${activeCatalog}-${new Date().toISOString().split('T')[0]}.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(downloadUrl);

      setBatchResults(results);
      setBatchStatus('complete');
    } catch (err) {
      console.error('Failed to process batch:', err);
      setBatchStatus('error');
    }
  };

  const handleGenerateAll = async () => {
    if (!imageLoaded || !originalImage) {
      console.log('No image loaded');
      return;
    }
    
    setIsProcessing(true);
    setBatchStatus('processing');
    setError('');
    
    try {
      const colors = GILDAN_64000; // Use current catalog
      console.log(`Processing ${colors.length} colors from ${activeCatalog}`);
      
      const zip = new JSZip();
      const folder = zip.folder("hextra-colors");
      
      // Process in chunks to prevent UI freeze
      const CHUNK_SIZE = 5;
      const chunks = [];
      for (let i = 0; i < colors.length; i += CHUNK_SIZE) {
        chunks.push(colors.slice(i, i + CHUNK_SIZE));
      }
      
      for (let chunkIndex = 0; chunkIndex < chunks.length; chunkIndex++) {
        const chunk = chunks[chunkIndex];
        
        // Process chunk
        await Promise.all(chunk.map(async (color) => {
          console.log(`Processing color: ${color.name} (${color.hex})`);
          
          const rgb = hexToRgb(color.hex);
          if (!rgb) {
            console.error(`Invalid hex color: ${color.hex}`);
            return;
          }
          
          const colorized = originalImage.clone();
          
          // Process image
          colorized.bitmap.data = colorized.bitmap.data.map((pixel, index) => {
            const red = colorized.bitmap.data[index + 0];
            const green = colorized.bitmap.data[index + 1];
            const blue = colorized.bitmap.data[index + 2];
            const alpha = colorized.bitmap.data[index + 3];
            
            if (alpha > 0) {
              const luminance = 0.2126 * red + 0.7152 * green + 0.0722 * blue;
              return [
                Math.round(rgb.r * luminance),
                Math.round(rgb.g * luminance),
                Math.round(rgb.b * luminance),
                alpha
              ];
            }
            return [red, green, blue, alpha];
          }).flat();
          
          const base64 = await new Promise((resolve, reject) => {
            const canvas = document.createElement('canvas');
            canvas.width = colorized.width;
            canvas.height = colorized.height;
            const ctx = canvas.getContext('2d');
            const imageData = new ImageData(colorized.bitmap.data, colorized.width, colorized.height);
            ctx.putImageData(imageData, 0, 0);
            canvas.toBlob((blob) => {
              const reader = new FileReader();
              reader.onload = () => {
                resolve(reader.result);
              };
              reader.readAsDataURL(blob);
            });
          });
          folder.file(`${color.name.replace(/[^a-z0-9]/gi, '_')}.png`, base64);
        }));
        
        // Update progress after each chunk
        const progress = Math.round(((chunkIndex + 1) * CHUNK_SIZE / colors.length) * 100);
        setBatchProgress(Math.min(progress, 100));
        
        // Let UI update
        await new Promise(resolve => setTimeout(resolve, 0));
      }
      
      console.log('Generating ZIP file...');
      setBatchStatus('saving');
      
      const content = await zip.generateAsync({
        type: "blob",
        compression: "DEFLATE",
        compressionOptions: {
          level: 5
        }
      }, (metadata) => {
        setBatchProgress(Math.round(metadata.percent));
      });
      
      // Create download link
      const url = window.URL.createObjectURL(content);
      const link = document.createElement('a');
      link.href = url;
      link.download = `HEXTRA-${activeCatalog}-${new Date().toISOString().split('T')[0]}.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      setBatchStatus('complete');
      console.log('Batch processing complete');
      
    } catch (err) {
      console.error('Error in batch processing:', err);
      setError('Error processing batch: ' + err.message);
      setBatchStatus('error');
    } finally {
      setIsProcessing(false);
      setBatchProgress(0);
    }
  };

  const handleGenerateSelected = async () => {
    if (!imageLoaded || !originalImage) return;
    
    setIsProcessing(true);
    setBatchStatus('processing');
    setError('');
    
    try {
      const colors = selectedColors;
      const zip = new JSZip();
      
      for (let i = 0; i < colors.length; i++) {
        const color = colors[i];
        const rgb = hexToRgb(color);
        
        const colorized = originalImage.clone();
        
        colorized.bitmap.data = colorized.bitmap.data.map((pixel, index) => {
          const red = colorized.bitmap.data[index + 0];
          const green = colorized.bitmap.data[index + 1];
          const blue = colorized.bitmap.data[index + 2];
          const alpha = colorized.bitmap.data[index + 3];
          
          if (alpha > 0) {
            const luminance = 0.2126 * red + 0.7152 * green + 0.0722 * blue;
            
            return [
              Math.round(rgb.r * luminance),
              Math.round(rgb.g * luminance),
              Math.round(rgb.b * luminance),
              alpha
            ];
          }
          return [red, green, blue, alpha];
        }).flat();
        
        const base64 = await new Promise((resolve, reject) => {
          const canvas = document.createElement('canvas');
          canvas.width = colorized.width;
          canvas.height = colorized.height;
          const ctx = canvas.getContext('2d');
          const imageData = new ImageData(colorized.bitmap.data, colorized.width, colorized.height);
          ctx.putImageData(imageData, 0, 0);
          canvas.toBlob((blob) => {
            const reader = new FileReader();
            reader.onload = () => {
              resolve(reader.result);
            };
            reader.readAsDataURL(blob);
          });
        });

        // Add to zip with color code in filename
        const colorCode = color.replace('#', '');
        const filename = `color_${colorCode}.png`;
        
        // Convert base64 to binary
        const imageData = base64.replace(/^data:image\/\w+;base64,/, "");
        zip.file(filename, imageData, {base64: true});
        
        setProcessedCount(i + 1);
        setTotalCount(colors.length);
        setBatchProgress(Math.round(((i + 1) / colors.length) * 100));
      }
      
      // Generate and download zip
      const content = await zip.generateAsync({type: "blob"});
      const url = window.URL.createObjectURL(content);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'hextra-selected-colors.zip';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      setBatchStatus('complete');
      
    } catch (err) {
      console.error('Error generating selected:', err);
      setError('Error generating selected');
      setBatchStatus('error');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleColorSelect = (color) => {
    if (selectedColors.includes(color)) {
      setSelectedColors(selectedColors.filter(c => c !== color));
    } else {
      setSelectedColors([...selectedColors, color]);
    }
  };

  const handleCatalogSwitch = (catalogName) => {
    switch(catalogName) {
      case 'GILDAN_64000':
        setActiveCatalog('GILDAN_64000');
        break;
      case 'GILDAN_3000':
        setActiveCatalog('GILDAN_3000');
        break;
      default:
        setActiveCatalog('GILDAN_64000');
    }
  };

  const handleEnhanceChange = (e) => {
    setEnhanceEffect(e.target.checked);
    if (imageLoaded) {
      applyColor();
    }
  };

  const handleQuickDownload = () => {
    if (!workingProcessedUrl || !canDownload) return;
    
    const currentDate = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    const filename = `HEXTRA-${currentDate}-${selectedColor.replace('#', '')}.png`;
    
    const link = document.createElement('a');
    link.href = workingProcessedUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(workingProcessedUrl);
  };

  const handleCSVUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setBatchStatus('processing');
    setBatchProgress(0);

    try {
      const text = await file.text();
      const lines = text.split('\n');
      const colors = [];
      
      // Skip header row
      for (let i = 1; i < lines.length; i++) {
        const columns = lines[i].split(',');
        if (columns.length >= 2) {
          const hex = columns[0].trim();
          const name = columns[1].trim();
          
          if (hex.match(/^#[0-9A-F]{6}$/i)) {
            colors.push({
              hex: hex.toUpperCase(),
              name: name || `Color ${i}`,
              family: 'custom',
              tags: ['imported']
            });
          }
        }
        setBatchProgress(Math.round((i / lines.length) * 100));
      }
      
      if (colors.length > 0) {
        setBatchResults(colors);
      }
      
      setBatchStatus('complete');
    } catch (err) {
      console.error('Error processing CSV:', err);
      setBatchStatus('error');
    }
  };

  const handleDefaultImageLoad = (e) => {
    if (e.target.src) {
      setWorkingImageUrl(e.target.src);
      setWorkingProcessedUrl(e.target.src);
      setImageLoaded(true);
      setCanDownload(true);
    }
  };

  return (
    <Box
      sx={{
        backgroundColor: 'var(--bg-primary)',
        minHeight: '100vh',
        width: '100%',
        maxWidth: '100%',
        pt: '48px',  
        color: 'var(--text-primary)',
        transition: 'background-color 0.3s, color 0.3s'
      }}
    >
      {/* Section A: Banner */}
      <Banner 
        version={''}
        isDarkMode={theme === 'dark'}
        onThemeToggle={() => setTheme(prevTheme => {
          const newTheme = prevTheme === 'dark' ? 'light' : 'dark';
          localStorage.setItem('hextraTheme', newTheme);
          return newTheme;
        })}
      />
      
      <Box sx={{ 
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        width: '100%',
        maxWidth: '100%',
        pt: '48px',  
        color: 'var(--text-primary)',
        transition: 'background-color 0.3s, color 0.3s'
      }}>
        <Typography 
          variant="h2" 
          sx={{ 
            textAlign: 'center',
            fontFamily: "'League Spartan', sans-serif",
            fontSize: '0.75rem',
            letterSpacing: '0.25em',
            textTransform: 'uppercase',
            color: 'var(--text-secondary)',
            mb: 5,  
            '@media (max-width: 532px)': {
              fontSize: '0.7rem'
            }
          }}
        >
          <Box component="span">COLORIZE</Box> | <Box component="span">VISUALIZE</Box> | <Box component="span">MESMERIZE</Box>
        </Typography>

        {/* Main content in vertical layout */}
        <Box sx={{ 
          display: 'flex',
          flexDirection: 'column',
          gap: 4,
          width: '100%',
          maxWidth: '800px',  
          mx: 'auto',
          p: 3,
          alignItems: 'center',
          '@media (max-width: 832px)': { 
            maxWidth: 'calc(100% - 32px)', 
            p: 2
          }
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

            {/* Section C: Grayscale Tool Bar */}
            <Box sx={{ 
              display: 'flex',
              alignItems: 'center',
              gap: 2,
              width: '100%',
              mb: 3,
              pl: '40px'  
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

              {/* Slider */}
              <Box sx={{
                position: 'relative',
                width: '200px',
                height: '24px',
                backgroundColor: 'transparent',
                borderRadius: '12px',
                border: '1px solid var(--border-color)',
                background: 'linear-gradient(to right, #000000, #FFFFFF)',
                overflow: 'hidden',
                display: 'flex',
                alignItems: 'center',
                px: 1
              }}>
                <Slider
                  value={grayscaleValue}
                  onChange={handleGrayscaleChange}
                  min={0}
                  max={255}
                  sx={{
                    width: '100%',
                    '& .MuiSlider-thumb': {
                      width: 20,
                      height: 20,
                      backgroundColor: 'transparent',
                      border: '2px solid var(--glow-color)',
                      outline: '1px solid rgba(0, 0, 0, 0.3)',
                      boxShadow: 'inset 0 0 4px var(--glow-color), 0 0 4px var(--glow-color)',
                      '&:before': {
                        content: '""',
                        position: 'absolute',
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        backgroundColor: 'transparent',
                      },
                      '&:hover, &.Mui-focusVisible': {
                        outline: '1px solid rgba(0, 0, 0, 0.4)',
                        boxShadow: 'inset 0 0 6px var(--glow-color), 0 0 8px var(--glow-color)',
                      }
                    },
                    '& .MuiSlider-track': {
                      display: 'none'
                    },
                    '& .MuiSlider-rail': {
                      opacity: 0
                    }
                  }}
                />
              </Box>
            </Box>

            {/* Section D: HEX Input Bar */}
            <Box sx={{ 
              display: 'flex',
              flexWrap: 'wrap',  
              gap: 2,
              alignItems: 'center',
              width: '100%',
              pl: '40px',  
              '@media (max-width: 532px)': {
                justifyContent: 'center',
                pl: 2,  
                '& #apply-button': {
                  width: '100%',  
                  maxWidth: '200px',
                  marginTop: '8px'
                }
              }
            }}>
              {/* RGB Display */}
              <Typography sx={{ 
                fontFamily: "'Inter', sans-serif",
                color: 'var(--text-primary)',
                fontSize: '0.875rem',
                whiteSpace: 'nowrap',
                width: '140px',  
                display: 'flex',
                alignItems: 'center',
                gap: 1
              }}>
                <Box component="span" sx={{ flexShrink: 0 }}>RGB:</Box>
                <Box component="span" sx={{ 
                  fontFamily: 'monospace',
                  width: '85px',  
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
                value={selectedColor}
                onChange={handleHexInputChange}
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
                onSelectionChange={handleDropdownSelect}
                sx={{ 
                  width: '180px',  
                  '& .MuiOutlinedInput-root': {
                    paddingLeft: '8px'  
                  }
                }}
                inputRef={hexInputRef}
              />
              {/* Apply Button */}
              <GlowTextButton
                id="apply-button"
                variant="contained"
                onClick={applyColor}
                disabled={isProcessing || !imageLoaded}
                sx={{
                  width: '110px',
                  '@media (max-width: 532px)': {
                    width: '110px',
                    marginTop: '8px'
                  }
                }}
              >
                APPLY
              </GlowTextButton>
            </Box>
          </Box>

          <Box
            sx={{
              width: '100%',
              height: '4px',
              backgroundColor: theme === 'dark' ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.15)',
              my: 5  
            }}
          />

          {/* Section D: Main Image Window Title */}
          <Typography 
            variant="h2" 
            sx={{ 
              mb: 4,  
              textAlign: 'center',
              fontFamily: "'Inter', sans-serif",
              fontSize: '1.25rem',
              fontWeight: 600,
              color: 'var(--text-primary)',
              '@media (max-width: 532px)': {
                fontSize: '1.1rem'
              }
            }}
          >
            Upload your T-shirt or other Image
          </Typography>

          {/* Section E: Image Loading */}
          <Box sx={{ 
            display: 'flex', 
            gap: 2,
            alignItems: 'center',
            justifyContent: 'center', 
            mt: 1,
            mb: 3,
            width: '100%',
            '@media (max-width: 600px)': {
              flexDirection: 'column',
              alignItems: 'center', 
              '& > button': {
                width: '110px', 
                alignSelf: 'center'
              }
            }
          }}>
            <GlowTextButton
              component="label"
              variant="contained"
              disabled={isProcessing}
              sx={{ 
                width: '110px',
                flexShrink: 0
              }}
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

            <Box sx={{ 
              flex: 1,
              minWidth: 0, 
              maxWidth: '600px', 
              '@media (max-width: 600px)': {
                width: '100%',
                maxWidth: '300px',
                alignSelf: 'center'
              }
            }}>
              <IconTextField
                placeholder="Paste image URL here..."
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                onKeyDown={handleUrlKeyPress}
                startIcon={<LinkIcon />}
                hasReset
                onReset={() => setUrlInput('')}
                sx={{ width: '100%' }}
              />
            </Box>

            <GlowTextButton
              variant="contained"
              onClick={handleLoadUrl}
              sx={{ 
                width: '110px',
                flexShrink: 0
              }}
            >
              USE URL
            </GlowTextButton>
          </Box>

          {/* Section F: Main Image (with integrated download button) */}
          <Box sx={{
            position: 'relative',
            zIndex: 1,
            mt: 2,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '200px',
            width: '100%',
            maxWidth: '800px', 
            overflow: 'hidden'
          }}>
            <DefaultTshirt onLoad={handleDefaultImageLoad} />
            <img
              src={workingProcessedUrl || workingImageUrl}
              alt="Working"
              style={{
                maxWidth: '100%',
                height: 'auto',
                display: 'block' 
              }}
            />
            {/* Download button using GlowButton */}
            <GlowButton
              onClick={handleQuickDownload}
              disabled={!canDownload}
              sx={{
                position: 'absolute',
                right: '12px',
                bottom: '12px',
                minWidth: 'auto',
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                padding: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <FileDownloadIcon />
            </GlowButton>
          </Box>

          {/* Section G: Image Processing */}
          <Box sx={{ 
            width: '100%', 
            mt: 2,
            position: 'relative',
            zIndex: 2  
          }}>
            {/* Advanced Settings Toggle Section */}
            <Box sx={{ 
              display: 'flex',
              justifyContent: 'flex-end',
              alignItems: 'center',
              mb: 2
            }}>
              <Box sx={{ 
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center'
              }}>
                <GlowSwitch
                  checked={showAdvanced}
                  onChange={(e) => setShowAdvanced(e.target.checked)}
                  size="small"
                />
                <Typography sx={{ 
                  fontSize: '0.75rem',
                  color: 'var(--text-secondary)',
                  mt: 0.5
                }}>
                  Advanced
                </Typography>
              </Box>
            </Box>

            {/* Image Processing Section */}
            <Box sx={{ 
              width: '100%',
              opacity: showAdvanced ? 1 : 0.6,
              transition: 'opacity 0.2s',
              pointerEvents: showAdvanced ? 'auto' : 'none'
            }}>
              {/* Controls Row */}
              <Box sx={{ 
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                gap: 4,
                mb: 3
              }}>
                <GlowSwitch
                  checked={enhanceEffect}
                  onChange={(e) => {
                    setEnhanceEffect(e.target.checked);
                    if (imageLoaded) {
                      applyColor();
                    }
                  }}
                  label="Enhanced"
                />
                <GlowSwitch
                  checked={showTooltips}
                  onChange={(e) => setShowTooltips(e.target.checked)}
                  label="Tooltips"
                />
              </Box>

              {/* Sliders */}
              <Box sx={{ px: 3 }}>
                <Box sx={{ mb: 2 }}>
                  <Typography gutterBottom sx={{ 
                    fontFamily: "'Inter', sans-serif",
                    letterSpacing: '0.05em',
                    color: 'var(--text-secondary)'
                  }}>
                    Matte Effect
                  </Typography>
                  <Slider
                    value={matteValue}
                    onChange={(e, newValue) => setMatteValue(newValue)}
                    min={0}
                    max={100}
                    disabled={true}
                    sx={{ 
                      color: 'var(--text-secondary)',
                      '& .MuiSlider-thumb': {
                        color: 'var(--text-secondary)',
                      },
                      '& .MuiSlider-track': {
                        color: 'var(--text-secondary)',
                      },
                      '& .MuiSlider-rail': {
                        color: 'var(--text-secondary)',
                      }
                    }}
                  />
                </Box>
                <Box>
                  <Typography gutterBottom sx={{ 
                    fontFamily: "'Inter', sans-serif",
                    letterSpacing: '0.05em',
                    color: 'var(--text-secondary)'
                  }}>
                    Texture Effect
                  </Typography>
                  <Slider
                    value={textureValue}
                    onChange={(e, newValue) => setTextureValue(newValue)}
                    min={0}
                    max={100}
                    disabled={true}
                    sx={{ 
                      color: 'var(--text-secondary)',
                      '& .MuiSlider-thumb': {
                        color: 'var(--text-secondary)',
                      },
                      '& .MuiSlider-track': {
                        color: 'var(--text-secondary)',
                      },
                      '& .MuiSlider-rail': {
                        color: 'var(--text-secondary)',
                      }
                    }}
                  />
                </Box>
              </Box>
            </Box>
          </Box>

          <Box sx={{ my: 5 }}>
            <Box
              sx={{
                width: '100%',
                height: '4px',
                backgroundColor: theme === 'dark' ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.15)'
              }}
            />
          </Box>

          {/* Third separator - before MESMERIZE section */}
          <Box
            sx={{
              width: '100%',
              height: '4px',
              backgroundColor: theme === 'dark' ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.15)',
              my: 5  
            }}
          />

          {/* Section H: MESMERIZE */}
          <Box sx={{ 
            width: '100%',
            maxWidth: '800px',
            mt: 3 
          }}>
            {/* MESMERIZE Section Title */}
            <Typography 
              variant="h2" 
              sx={{ 
                mb: 4,  
                textAlign: 'center',
                fontFamily: "'Inter', sans-serif",
                fontSize: '1.25rem',
                fontWeight: 600,
                color: 'var(--text-primary)',
                '@media (max-width: 532px)': {
                  fontSize: '1.1rem'
                }
              }}
            >
              Create your color T-shirt/product blanks in Bulk
            </Typography>

            {/* Catalog selector */}
            <Box sx={{ 
              display: 'flex', 
              gap: 2, 
              justifyContent: 'center', 
              mb: 2,
              mt: 4  
            }}>
              <GlowTextButton
                variant="contained"
                onClick={() => handleCatalogSwitch('GILDAN_64000')}
                sx={{
                  width: '140px',
                  height: '36px',
                  fontSize: '0.8rem',
                  letterSpacing: '0.05em',
                  whiteSpace: 'nowrap',
                  opacity: activeCatalog === 'GILDAN_64000' ? 1 : 0.7
                }}
              >
                GILDAN 64,000
              </GlowTextButton>
              <GlowTextButton
                variant="contained"
                onClick={() => handleCatalogSwitch('GILDAN_3000')}
                sx={{
                  width: '140px',
                  height: '36px',
                  fontSize: '0.8rem',
                  letterSpacing: '0.05em',
                  whiteSpace: 'nowrap',
                  opacity: activeCatalog === 'GILDAN_3000' ? 1 : 0.7
                }}
              >
                GILDAN 3000
              </GlowTextButton>
            </Box>

            {/* Batch Processing Controls */}
            <Box sx={{
              display: 'flex',
              flexDirection: 'column',
              gap: 2,
              alignItems: 'center',
              p: 3,
              borderRadius: '8px',
              bgcolor: 'var(--bg-secondary)',
              border: '1px solid var(--border-subtle)'
            }}>
              <Typography variant="h6" sx={{ 
                fontFamily: "'Inter', sans-serif",
                fontWeight: 500,
                color: 'var(--text-primary)'
              }}>
                Batch Processing
              </Typography>

              {/* Main Action Buttons */}
              <Box sx={{ 
                display: 'flex', 
                gap: 2,
                mb: 2
              }}>
                <GlowTextButton
                  variant="contained"
                  onClick={handleGenerateAll}
                  disabled={isProcessing || !imageLoaded}
                  sx={{ width: '140px' }}
                >
                  GENERATE ALL
                </GlowTextButton>
                <GlowTextButton
                  variant="contained"
                  onClick={handleGenerateSelected}
                  disabled={isProcessing || !imageLoaded || !selectedColors.length}
                  sx={{ width: '140px' }}
                >
                  SELECTED
                </GlowTextButton>
              </Box>

              {/* CSV Upload Button */}
              <GlowTextButton
                component="label"
                variant="contained"
                disabled={isProcessing || batchStatus === 'processing'}
                sx={{ width: '140px' }}
              >
                UPLOAD CSV
                <input
                  type="file"
                  hidden
                  accept=".csv"
                  onChange={handleCSVUpload}
                />
              </GlowTextButton>

              {/* Progress Indicator */}
              {batchStatus === 'processing' && (
                <Box sx={{ width: '100%', maxWidth: 400, mt: 2 }}>
                  <Typography variant="body2" color="var(--text-secondary)" align="center" mt={1}>
                    Processing: {batchProgress}% ({processedCount} of {totalCount})
                  </Typography>
                  <LinearProgress 
                    variant="determinate" 
                    value={batchProgress} 
                    sx={{
                      height: 8,
                      borderRadius: 4,
                      backgroundColor: 'var(--border-subtle)',
                      '& .MuiLinearProgress-bar': {
                        backgroundColor: 'var(--glow-color)',
                        borderRadius: 4
                      }
                    }}
                  />
                </Box>
              )}

              {/* Color Results */}
              {batchResults && batchResults.length > 0 && (
                <Box sx={{ 
                  width: '100%',
                  maxWidth: '800px',
                  mt: 3
                }}>
                  <Typography variant="subtitle2" sx={{ 
                    mb: 2, 
                    textAlign: 'center',
                    color: 'var(--text-secondary)',
                    letterSpacing: '0.1em'
                  }}>
                    Available Colors
                  </Typography>
                  <Box sx={{ 
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: 1.5,
                    justifyContent: 'center',
                    maxWidth: '100%',
                    p: 2
                  }}>
                    {batchResults.map((color, index) => (
                      <Tooltip 
                        key={index} 
                        title={color.name || color.hex}
                        arrow
                        placement="top"
                      >
                        <Box
                          sx={{
                            width: 36,
                            height: 36,
                            aspectRatio: '1/1',
                            backgroundColor: color.hex,
                            borderRadius: '50%',
                            cursor: 'pointer',
                            border: '1px solid var(--border-color)',
                            boxShadow: theme => `0 0 0 ${selectedColors.includes(color.hex) ? '2px var(--glow-color)' : '1px rgba(0, 0, 0, 0.1)'}`,
                            transition: 'transform 0.2s, box-shadow 0.2s',
                            '&:hover': {
                              transform: 'scale(1.1)',
                              boxShadow: '0 0 0 2px var(--glow-color)',
                            }
                          }}
                          onClick={() => handleColorSelect(color.hex)}
                        />
                      </Tooltip>
                    ))}
                  </Box>
                </Box>
              )}
            </Box>
          </Box>

          <Box sx={{ my: 5 }}>
            <Box
              sx={{
                width: '100%',
                height: '4px',
                backgroundColor: theme === 'dark' ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.15)'
              }}
            />
          </Box>

          {/* Fourth separator - before HEXTRA section */}
          <Box
            sx={{
              width: '100%',
              height: '4px',
              backgroundColor: theme === 'dark' ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.15)',
              my: 5  
            }}
          />

        </Box>
      </Box>

      {/* Footer */}
      <Box 
        component="footer" 
        sx={{
          width: '100%',
          borderTop: '1px solid var(--border-color)',
          bgcolor: 'var(--background-paper)',
          p: 2,
          mt: 'auto'
        }}
      >
        <Typography 
          variant="body2" 
          color="text.secondary" 
          align="center"
        >
          2025 HEXTRA Color System v. All rights reserved.
        </Typography>
      </Box>

      {isProcessing && (
        <Box
          position="fixed"
          top={0}
          left={0}
          right={0}
          bottom={0}
          bgcolor="rgba(0, 0, 0, 0.7)"
          display="flex"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
          zIndex={9999}
        >
          <CircularProgress size={60} thickness={4} />
          <Typography variant="h6" color="white" mt={2}>
            {batchStatus === 'processing' ? 'Processing Images...' : 'Preparing Download...'}
          </Typography>
          {batchProgress > 0 && (
            <Box sx={{ width: '200px', mt: 2 }}>
              <Typography variant="body2" color="white" align="center" mt={1}>
                Processing: {batchProgress}%
              </Typography>
              <LinearProgress 
                variant="determinate" 
                value={batchProgress} 
                sx={{
                  height: 8,
                  borderRadius: 4,
                  backgroundColor: 'rgba(255,255,255,0.2)',
                  '& .MuiLinearProgress-bar': {
                    borderRadius: 4,
                  }
                }}
              />
            </Box>
          )}
        </Box>
      )}
      <Routes>
        <Route path="/" element={<div>Home Page</div>} />
        <Route path="/stripe-test" element={<div>Stripe Test Page</div>} />
        <Route path="/pricing" element={<div>Pricing Page</div>} />
      </Routes>
    </Box>
  );
}

export default App;
