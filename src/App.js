import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { 
  Box, 
  Button, 
  Container, 
  Grid, 
  TextField, 
  Typography, 
  Paper, 
  CircularProgress, 
  Slider, 
  LinearProgress, 
  Tooltip
} from '@mui/material';
import TagIcon from '@mui/icons-material/Tag';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import { LinkRounded as LinkIcon } from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { debounce } from 'lodash';
import { hexToRgb } from './utils/colorUtils';
import { processImage } from './utils/image-processing';
import SwatchDropdownField from './components/SwatchDropdownField';
import GlowTextButton from './components/GlowTextButton';
import GlowButton from './components/GlowButton';
import GlowSwitch from './components/GlowSwitch';
import IconTextField from './components/IconTextField';
import Banner from './components/Banner';
import { useNavigate } from 'react-router-dom';
import DefaultTshirt from './components/DefaultTshirt';
import GILDAN_64000 from './data/catalogs/gildan64000.js';
import './theme.css';
import { useKindeAuth } from '@kinde-oss/kinde-auth-react';
import { useTheme } from './context/ThemeContext';
import JSZip from 'jszip';
import Wheel from './components/Wheel';

// Constants
const DEFAULT_COLOR = '#FED141';
const DEFAULT_COLORS = [
  '#FED141',  // Default yellow
  '#D50032',  // Red
  '#00805E',  // Green
  '#224D8F',  // Blue
  '#FF4400',  // Orange
  '#CABFAD',  // Beige
];
// Improved color wheel with accurate selection and visual feedback - v2.2.3
const VERSION = '2.2.3';

// Browser environment check for SSR compatibility
const isBrowser = typeof window !== 'undefined' && typeof document !== 'undefined';

function App() {
  console.log('App: Starting initialization...');
  // 1. Basic hooks
  const navigate = useNavigate();
  // eslint-disable-next-line no-unused-vars
  const { isAuthenticated: kindeAuthenticated, user } = useKindeAuth();
  
  // Force authentication and subscription to be true for localhost development
  const isAuthenticated = true; // Bypass authentication check
  const [isSubscribed, setIsSubscribed] = useState(true); // Default to subscribed

  // 2. Refs
  const wheelRef = useRef(null);
  const hexInputRef = useRef(null);
  const isDragging = useRef(false);

  // 3. State hooks
  const [selectedColor, setSelectedColor] = useState(DEFAULT_COLOR);
  const [rgbColor, setRgbColor] = useState(hexToRgb(DEFAULT_COLOR));
  const [workingImageUrl, setWorkingImageUrl] = useState(null);
  const [originalImageUrl, setOriginalImageUrl] = useState(null);
  const [workingProcessedUrl, setWorkingProcessedUrl] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [canDownload, setCanDownload] = useState(false);
  const [urlInput, setUrlInput] = useState('');
  const { theme, toggleTheme } = useTheme();
  const [lastClickColor, setLastClickColor] = useState(null);
  const [lastClickTime, setLastClickTime] = useState(0);
  const [enhanceEffect, setEnhanceEffect] = useState(true);
  const [showTooltips, setShowTooltips] = useState(true);
  const [showSubscriptionTest, setShowSubscriptionTest] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [grayscaleValue, setGrayscaleValue] = useState(128);
  const [matteValue, setMatteValue] = useState(50);
  const [textureValue, setTextureValue] = useState(50);
  const [batchResults, setBatchResults] = useState([]);
  const [batchProgress, setBatchProgress] = useState(0);
  const [batchStatus, setBatchStatus] = useState('idle');
  const [totalCount, setTotalCount] = useState(0);
  const [processedCount, setProcessedCount] = useState(0);
  const [activeCatalog, setActiveCatalog] = useState('GILDAN_64000');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [isBatchMode, setIsBatchMode] = useState(false);
  const [selectedColors, setSelectedColors] = useState([]);
  const [showSubscription, setShowSubscription] = useState(false);
  const [colorApplied, setColorApplied] = useState(false);

  // Check subscription status when user is authenticated
  useEffect(() => {
    if (isAuthenticated && user?.id) {
      // For now, we'll just mock the subscription check
      // In production, this would call your API
      console.log("Checking subscription status for user:", user.id);
      // Mock response - set to true to test subscription features
      setIsSubscribed(false);
    }
  }, [isAuthenticated, user]);

  // 4. Memo hooks
  const debouncedProcessImage = useMemo(
    () => debounce(async (url, color) => {
      if (!url || !color) {
        console.log('Missing URL or color for image processing', { url: !!url, color });
        setIsProcessing(false);
        return;
      }
      
      console.log(`Debounced processing: URL: ${url.substring(0, 30)}..., Color: ${color}`);
      setIsProcessing(true);
      
      try {
        console.log('Calling processImage...');
        const processedUrl = await processImage(url, color);
        console.log('Processing complete, updating UI');
        setWorkingProcessedUrl(processedUrl);
        setCanDownload(true);
        setIsProcessing(false);
      } catch (error) {
        console.error('Error in debouncedProcessImage:', error);
        setCanDownload(false);
        setIsProcessing(false);
      }
    }, 150),
    [] // No dependencies needed here
  );

  // 5. Callback hooks
  const focusHexInput = useCallback(() => {
    try {
      // Try using the provided ref first
      if (hexInputRef.current && hexInputRef.current.focus) {
        hexInputRef.current.focus();
        return;
      }
      
      // If ref approach fails, try DOM selection
      const inputElement = document.querySelector('.color-picker-container input');
      if (inputElement) {
        inputElement.focus();
      }
    } catch (err) {
      console.error('Error focusing hex input:', err);
    }
  }, []);

  const applyColor = useCallback((trigger) => {
    console.log('applyColor called with:', {
      trigger,
      selectedColor,
      workingImageUrl: workingImageUrl?.substring(0, 30),
      imageLoaded
    });
    
    // Only proceed if we have a color and an image
    if (!selectedColor || !workingImageUrl || !imageLoaded) {
      console.error('Cannot apply color - missing requirements', {
        hasColor: !!selectedColor, 
        hasImage: !!workingImageUrl,
        imageLoaded
      });
      return;
    }
    
    // Set processing state
    setIsProcessing(true);
    
    // Force color to be the hex value, not the 'apply' trigger
    const colorToApply = selectedColor;
    console.log('Starting image processing with color:', colorToApply);
    
    // IMPORTANT: Use the direct processImage function, not the debounced version
    try {
      console.log('Processing image with dimensions:', {
        imageUrl: workingImageUrl ? 'present' : 'missing',
        originalImageUrl: originalImageUrl ? 'present' : 'missing'
      });
      
      processImage(workingImageUrl, colorToApply)
        .then(processedUrl => {
          console.log('SUCCESS: Image processed with color', colorToApply);
          setWorkingProcessedUrl(processedUrl);
          setCanDownload(true);
        })
        .catch(error => {
          console.error('ERROR: Image processing failed:', error);
          // Don't reset to original image automatically, just keep current state
          setCanDownload(true);
        })
        .finally(() => {
          console.log('Processing complete (success or error)');
          setIsProcessing(false);
          focusHexInput();
        });
    } catch (e) {
      console.error('FATAL ERROR in image processing:', e);
      setIsProcessing(false);
    }
  }, [selectedColor, workingImageUrl, originalImageUrl, imageLoaded, focusHexInput]);

  const handleColorWheelChange = useCallback((color) => {
    // Ensure we have a valid hex color with # prefix
    if (!color || !color.startsWith('#')) {
      return;
    }
    
    // Update the selected color
    setSelectedColor(color);
    
    // Convert to RGB
    const rgb = hexToRgb(color);
    if (rgb) {
      setRgbColor(rgb);
    }
    
    // Focus the hex input field
    focusHexInput();
  }, [focusHexInput]);

  const handleColorChange = useCallback((color) => {
    console.log("Color changed to:", color);
    setSelectedColor(color);
    
    // Validate color and convert to RGB
    const rgb = hexToRgb(color);
    if (rgb) {
      setRgbColor(rgb);
    } else {
      console.warn('Invalid color format received:', color);
      // Use default RGB if conversion fails
      setRgbColor(hexToRgb(DEFAULT_COLOR));
    }
    
    // Focus the hex input field
    focusHexInput();
    
    if (!isDragging.current) {
      applyColor('color-change');
    }
  }, [applyColor, focusHexInput]);

  const handleDragStart = useCallback(() => {
    isDragging.current = true;
  }, []);

  const handleDragEnd = useCallback(() => {
    isDragging.current = false;
    
    // Apply the color when dragging ends
    applyColor('drag-end');
  }, [applyColor]);

  const handleDropdownSelect = useCallback((color) => {
    // Basic validation
    if (!color) {
      console.log('Invalid color from dropdown:', color);
      return;
    }
    
    // Make sure color is a string
    const hexColor = typeof color === 'string' ? color : 
                     (color.hex ? color.hex : null);
    
    if (!hexColor) {
      console.log('Could not extract hex color from:', color);
      return;
    }
    
    console.log('Selected color from dropdown:', hexColor);
    
    // Update the selected color
    setSelectedColor(hexColor);
    
    // Convert to RGB
    const rgb = hexToRgb(hexColor);
    if (rgb) {
      setRgbColor(rgb);
    }
    
    // Apply the selected color immediately
    applyColor('dropdown');
    
    // Try to focus the hex input
    try {
      setTimeout(() => {
        const inputElement = document.querySelector('.color-picker-container input');
        if (inputElement) {
          inputElement.focus();
        }
      }, 100);
    } catch (err) {
      console.log('Error focusing input:', err);
    }
  }, [applyColor]);

  const handleImageUpload = useCallback(async (file) => {
    if (!file) {
      console.log('No file provided to handleImageUpload');
      return;
    }
    
    // Log file details for debugging
    console.log('Image upload initiated with file:', {
      name: file.name,
      type: file.type,
      size: `${(file.size / 1024).toFixed(2)} KB`
    });
    
    // Set loading state first
    setIsProcessing(true);
    
    try {
      // Create object URL immediately
      console.log('Creating object URL for uploaded file');
      const url = URL.createObjectURL(file);
      
      // Store both original and working image URLs
      console.log('Setting image URLs in state');
      setOriginalImageUrl(url);
      setWorkingImageUrl(url);
      setWorkingProcessedUrl(null); // Clear any previous processed image
      setCanDownload(false); // Reset download state for new image
      
      // Set image as loaded AFTER URLs are set
      console.log('Image successfully loaded');
      setImageLoaded(true);
      
      // Do NOT automatically apply color
      // if (selectedColor) {
      //   await applyColor(selectedColor);
      // }
    } catch (err) {
      console.error('ERROR in handleImageUpload:', err);
      setImageLoaded(false);
    } finally {
      // Always ensure processing state is reset
      setIsProcessing(false);
    }
  }, []);  // Remove dependencies on applyColor and selectedColor

  const handleLoadUrl = useCallback(async () => {
    if (!urlInput.trim()) {
      window.open('https://www.google.com/search?q=blank+white+t-shirt&tbm=isch', '_blank');
      return;
    }

    console.log('Attempting to load image from URL:', urlInput);
    setIsProcessing(true);

    try {
      console.log('Fetching image from URL');
      const response = await fetch(urlInput);
      const blob = await response.blob();
      const file = new File([blob], 'image-from-url.png', { type: blob.type });
      
      console.log('Image fetched successfully, creating file object');
      // Since handleImageUpload now handles setting isProcessing false, we don't need to handle it here
      await handleImageUpload(file);
    } catch (err) {
      console.error('ERROR loading image from URL:', err);
      setIsProcessing(false); // Make sure to reset processing state on error
    }
  }, [handleImageUpload, urlInput]);

  const handleUrlKeyPress = useCallback((e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleLoadUrl();
    }
  }, [handleLoadUrl]);

  const handleWheelClick = useCallback((e, color) => {
    // Update the selected color from the wheel click
    if (color) {
      setSelectedColor(color);
      
      // Convert to RGB
      const rgb = hexToRgb(color);
      if (rgb) {
        setRgbColor(rgb);
      }
      
      // Focus the hex input after clicking on the wheel
      focusHexInput();
    }
    
    // Handle the click logic for possibly applying the color
    const now = Date.now();
    
    // If this is another click on the same color within the time window, apply the color
    if (lastClickColor === color && now - lastClickTime < 500) {
      applyColor('wheel-double-click');
    }
    
    // Update the last click info
    setLastClickColor(color);
    setLastClickTime(now);
  }, [applyColor, focusHexInput, lastClickColor, lastClickTime]);

  const handleHexInputChange = useCallback((event) => {
    if (!event || !event.target) return;
    
    // Get the input value
    let inputValue = event.target.value || '';
    
    // Don't add # here - this is just the raw input change
    // The full hex with # will be managed by the component state
    
    // Update the selected color with # prefix
    let fullHex = inputValue.startsWith('#') ? inputValue : '#' + inputValue;
    fullHex = fullHex.toUpperCase(); // Ensure uppercase
    
    // Basic validation
    const validHex = /^#[0-9A-F]{0,6}$/i.test(fullHex);
    if (validHex || fullHex === '#') {
      setSelectedColor(fullHex);
      
      // Only convert to RGB if we have a valid 6-digit hex code
      if (/^#[0-9A-F]{6}$/i.test(fullHex)) {
        const rgb = hexToRgb(fullHex);
        if (rgb) {
          setRgbColor(rgb);
        }
      }
    }
  }, []);

  const resetColor = useCallback(() => {
    const defaultRgb = hexToRgb(DEFAULT_COLOR);
    setSelectedColor(DEFAULT_COLOR);
    setRgbColor(defaultRgb);
    if (wheelRef.current) {
      wheelRef.current.setColor(DEFAULT_COLOR);
    }
  }, []);

  const handleGrayscaleChange = useCallback((event, newValue) => {
    const grayValue = newValue;
    const grayHex = `#${grayValue.toString(16).padStart(2, '0').repeat(3)}`.toUpperCase();
    setGrayscaleValue(grayValue);
    setSelectedColor(grayHex);
    setRgbColor({ r: grayValue, g: grayValue, b: grayValue });
  }, []);

  const handleQuickDownload = useCallback(() => {
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
  }, [canDownload, selectedColor, workingProcessedUrl]);

  const handleCSVUpload = useCallback(async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setBatchStatus('processing');
    setBatchProgress(0);

    try {
      const text = await file.text();
      const lines = text.split('\n');
      const colors = [];
      
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
  }, []);

  const handleDefaultImageLoad = useCallback((urlOrEvent) => {
    // Handle both event objects and direct URL strings
    const imageUrl = urlOrEvent?.target?.src || urlOrEvent;
    
    if (imageUrl) {
      setWorkingImageUrl(imageUrl);
      setWorkingProcessedUrl(imageUrl);
      setImageLoaded(true);
      setCanDownload(true);
    }
  }, []);

  const handleCatalogSwitch = useCallback((catalogName) => {
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
  }, []);

  // Function to reset image to original state
  const handleResetImage = useCallback(() => {
    console.log('Resetting image to original state');
    if (originalImageUrl) {
      console.log('Restoring original image');
      setWorkingProcessedUrl(null);
      setWorkingImageUrl(originalImageUrl);
      // We don't need to set canDownload to false since the user might want to download 
      // the original image too
    } else {
      console.log('No original image available to reset to');
    }
  }, [originalImageUrl]);

  // 6. Effect hooks
  useEffect(() => {
    console.log('Subscription check bypassed for local development');
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('subscription') === 'true') {
      setShowSubscription(true);
    }
  }, []);

  useEffect(() => {
    // Removed themeManager.applyTheme(theme);
  }, [theme]);

  // Add a button to toggle subscription view for testing
  const toggleSubscriptionView = () => {
    setShowSubscription(!showSubscription);
  };

  // Import the subscription page component lazily
  const SubscriptionPage = React.lazy(() => import('./components/SubscriptionPage'));

  // Handle loading state
  if (false) {
    return (
      <Box
        sx={{
          height: '100vh',
          display: 'flex',
          alignItems: "center",
          background: '#000000'
        }}
      >
        <Box
          component="img"
          src="/images/HEXTRA-3-logo-Blk.svg"
          alt="HEXTRA"
          sx={{ width: 200, mb: 4 }}
        />
        <CircularProgress sx={{ color: 'white', ml: 2 }} />
      </Box>
    );
  }

  // Show login if not authenticated
  if (false) {
    return (
      <Box
        sx={{
          height: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: "center",
          background: '#000000'
        }}
      >
        <Box
          component="img"
          src="/images/HEXTRA-3-logo-Blk.svg"
          alt="HEXTRA"
          sx={{ width: 200, mb: 4 }}
        />
        <Button
          variant="contained"
          sx={{
            bgcolor: '#4CAF50',
            '&:hover': {
              bgcolor: '#45a049'
            }
          }}
        >
          Sign In
        </Button>
      </Box>
    );
  }

  // Show subscription page if subscription is required
  if (showSubscription) {
    return (
      <React.Suspense fallback={<CircularProgress />}>
        <SubscriptionPage />
      </React.Suspense>
    );
  }

  const mainContent = (
    <Box className={`app ${theme}`} sx={{ 
      width: '100%', 
      overflowX: 'hidden',
      boxSizing: 'border-box',
      backgroundColor: 'var(--bg-primary)',
      color: 'var(--text-primary)',
      minHeight: '100vh'
    }}>
      {/* Section A: Banner */}
      <Banner 
        version={VERSION}
        isDarkMode={theme === 'dark'}
        onThemeToggle={toggleTheme}
        isBatchMode={isBatchMode}
        setIsBatchMode={setIsBatchMode}
        setShowSubscriptionTest={setShowSubscriptionTest}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {/* Subscription button removed */}
        </Box>
      </Banner>
      
      <Box className="app-content" sx={{ 
        pt: '25px',
        width: '100%',
        maxWidth: '1200px',
        boxSizing: 'border-box',
        overflowX: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        backgroundColor: 'var(--bg-primary)'
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
            height: '0px',
            padding: 0,
            margin: 0,
            overflow: 'hidden',
            position: 'absolute',
            visibility: 'hidden'
          }}
        >
          <Box component="span">COLORIZE</Box> | <Box component="span">VISUALIZE</Box> | <Box component="span">MESMERIZE</Box>
        </Typography>

        {/* Main content in vertical layout */}
        <Box sx={{ 
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
          width: '100%',
          maxWidth: '800px',  
          margin: '0 auto',
          p: 2,
          pt: 2,
          paddingLeft: 'calc(2 * 8px + 15px)', // 2 for p:2 + 15px offset
          alignItems: 'center',
          textAlign: 'center',
          boxSizing: 'border-box',
          overflow: 'hidden',
          '@media (max-width: 832px)': { 
            maxWidth: '100%', 
            p: 1,
            pt: 1,
            paddingLeft: 'calc(1 * 8px + 15px)' // 1 for p:1 + 15px offset
          }
        }}>
          {/* Color Section */}
          <Box sx={{ mb: 0 }}>
            {/* Section B: Title and RGB Color Disc */}
            <Typography 
              variant="h6" 
              sx={{ 
                textAlign: 'center', 
                mb: 1,
                fontFamily: "'League Spartan', sans-serif",
                color: 'var(--text-primary)'
              }}
            >
              Pick a Color, or Enter a HEX code
            </Typography>
            <Box 
              className="color-picker-container"
              sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                mb: 2,
                width: '100%'
              }}
            >
              <Wheel
                ref={wheelRef}
                color={selectedColor}
                onChange={handleColorWheelChange}
                onClick={handleWheelClick}
                onDoubleClick={() => applyColor('double-click')}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
                isDragging={isDragging.current}
              />
            </Box>

            {/* Section C: Grayscale Tool Bar */}
            <Box sx={{ 
              display: 'flex',
              alignItems: "center",
              gap: 2,
              width: '100%',
              mb: 1,
              pl: '40px'  
            }}>
              {/* GRAY Value Display */}
              <Typography sx={{ 
                fontFamily: "'Inter', sans-serif",
                color: 'var(--text-primary)',
                fontSize: '0.875rem',
                whiteSpace: 'nowrap',
                width: '120px',  
                display: 'flex',
                alignItems: "center",
                gap: 1
              }}>
                <Box component="span" sx={{ flexShrink: 0 }}>GRAY Value:</Box>
                <Box component="span" sx={{ 
                  fontFamily: 'monospace',
                  width: '85px',  
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
                alignItems: "center",
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
              alignItems: "center",
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
                alignItems: "center",
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
                ref={hexInputRef}
                value={selectedColor}
                onChange={handleHexInputChange}
                onEnterPress={(trigger) => applyColor(trigger)}
                onDropdownSelect={handleDropdownSelect}
                onReset={resetColor}
                label="HEX"
                options={DEFAULT_COLORS}
                sx={{ 
                  width: '180px',
                  marginLeft: '12px',
                  marginRight: '12px'
                }}
              />
              {/* Apply Button */}
              <GlowTextButton
                id="apply-button"
                variant="contained"
                onClick={() => {
                  console.log('Apply button clicked with color:', selectedColor);
                  
                  // Validate requirements
                  if (!selectedColor || !workingImageUrl || !imageLoaded) {
                    console.error('Cannot apply color - missing requirements', {
                      hasColor: !!selectedColor, 
                      hasWorkingImage: !!workingImageUrl,
                      imageLoaded
                    });
                    return;
                  }
                  
                  // Visual feedback - only for Apply button
                  setColorApplied(true);
                  setTimeout(() => setColorApplied(false), 500);
                  
                  // Set processing state - make this independent from other animations
                  setIsProcessing(true);
                  
                  // Direct image processing with proper error handling
                  processImage(workingImageUrl, selectedColor)
                    .then(processedUrl => {
                      console.log('Image successfully processed with color:', selectedColor);
                      setWorkingProcessedUrl(processedUrl);
                      setCanDownload(true);
                    })
                    .catch(error => {
                      console.error('ERROR processing image:', error);
                      // Reset the processed URL to the original image as fallback
                      setWorkingProcessedUrl(workingImageUrl);
                    })
                    .finally(() => {
                      // Always ensure processing state is reset
                      console.log('Image processing completed (success or error)');
                      setIsProcessing(false);
                    });
                }}
                disabled={isProcessing || !imageLoaded}
                sx={{
                  width: '110px',
                  transition: 'all 0.2s ease',
                  transform: colorApplied ? 'scale(1.05)' : 'scale(1)',
                  background: colorApplied ? `linear-gradient(135deg, ${selectedColor}, #FFFFFF, ${selectedColor})` : undefined,
                  '@media (max-width: 532px)': {
                    width: '110px',
                    marginTop: '8px'
                  }
                }}
              >
                APPLY
              </GlowTextButton>
              {/* Reset Button */}
              <GlowTextButton
                id="reset-button"
                variant="contained"
                onClick={handleResetImage}
                disabled={isProcessing || !imageLoaded || !originalImageUrl}
                sx={{
                  width: '110px',
                  transition: 'all 0.2s ease',
                  '@media (max-width: 532px)': {
                    width: '110px',
                    marginTop: '8px'
                  }
                }}
              >
                RESET
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
              mb: 2,  
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
            alignItems: "center",
            justifyContent: 'center', 
            mt: 1,
            mb: 2,
            width: '100%',
            '@media (max-width: 600px)': {
              flexDirection: 'column',
              alignItems: "center",
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
                width: '110px'
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
            alignItems: "center",
            minHeight: '200px',
            width: '100%',
            maxWidth: '800px', 
            overflow: 'hidden'
          }}>
            {/* Processing overlay - positioned at the top of the main image */}
            {isProcessing && (
              <Box
                position="absolute"
                top="10px" 
                left="50%"
                sx={{
                  transform: 'translateX(-50%)',
                  bgcolor: 'rgba(0, 0, 0, 0.85)',
                  display: 'flex',
                  flexDirection: 'row',
                  alignItems: "center",
                  justifyContent: 'center',
                  zIndex: 999,
                  borderRadius: 2,
                  padding: 2,
                  boxShadow: '0 4px 20px rgba(0,0,0,0.25)',
                  maxWidth: '300px',
                  minWidth: '200px',
                }}
              >
                <CircularProgress size={30} thickness={4} sx={{ mr: 2 }} />
                <Box>
                  <Typography variant="body1" color="white">
                    {batchStatus === 'processing' ? 'Processing Images...' : 'Applying Color...'}
                  </Typography>
                  {batchProgress > 0 && (
                    <Box sx={{ width: '100%', mt: 1 }}>
                      <Typography variant="caption" color="white">
                        {batchProgress}% Complete
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
                </Box>
              </Box>
            )}
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
                alignItems: "center",
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
              alignItems: "center",
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
                alignItems: "center",
                gap: 4,
                mb: 3
              }}>
                <GlowSwitch
                  checked={enhanceEffect}
                  onChange={(e) => {
                    setEnhanceEffect(e.target.checked);
                    if (imageLoaded) {
                      applyColor('enhance-toggle');
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
            mt: 1 // Changed from mt: 3 to mt: 1
          }}>
            {/* MESMERIZE Section Title */}
            <Typography 
              variant="h2" 
              sx={{ 
                mb: 1, // Changed from mb: 4 to mb: 1
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
              alignItems: "center",
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
                  onClick={async () => {
                    setIsProcessing(true);
                    setBatchStatus('processing');
                    
                    try {
                      const colors = GILDAN_64000; // Use current catalog
                      console.log(`Processing ${colors.length} colors from ${activeCatalog}`);
                      
                      const zip = new JSZip();
                      const folder = zip.folder("hextra-colors");
                      
                      const CHUNK_SIZE = 5;
                      const chunks = [];
                      for (let i = 0; i < colors.length; i += CHUNK_SIZE) {
                        chunks.push(colors.slice(i, i + CHUNK_SIZE));
                      }
                      
                      for (let chunkIndex = 0; chunkIndex < chunks.length; chunkIndex++) {
                        const chunk = chunks[chunkIndex];
                        
                        await Promise.all(chunk.map(async (color) => {
                          console.log(`Processing color: ${color.name} (${color.hex})`);
                          
                          const rgb = hexToRgb(color.hex);
                          if (!rgb) {
                            console.error(`Invalid hex color: ${color.hex}`);
                            return;
                          }
                          
                          const processedUrl = await processImage(workingImageUrl, color.hex);
                          const response = await fetch(processedUrl);
                          const blob = await response.blob();
                          
                          const date = new Date().toISOString().split('T')[0];
                          const filename = `HEXTRA-${date}-${activeCatalog}_${color.hex.replace('#', '')}.png`;
                          folder.file(filename, blob);
                        }));
                        
                        const progress = Math.round(((chunkIndex + 1) * CHUNK_SIZE / colors.length) * 100);
                        setBatchProgress(Math.min(progress, 100));
                        
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
                      
                      const url = window.URL.createObjectURL(content);
                      const link = document.createElement('a');
                      link.href = url;
                      const date = new Date().toISOString().split('T')[0];
                      link.download = `HEXTRA-${date}-${activeCatalog}_${colors.length}`;
                      document.body.appendChild(link);
                      link.click();
                      document.body.removeChild(link);
                      URL.revokeObjectURL(url);
                      
                      setBatchStatus('complete');
                      console.log('Batch processing complete');
                      
                    } catch (err) {
                      console.error('Error in batch processing:', err);
                      setBatchStatus('error');
                    } finally {
                      setIsProcessing(false);
                      setBatchProgress(0);
                    }
                  }}
                  disabled={isProcessing || !imageLoaded}
                  sx={{ width: '140px' }}
                >
                  GENERATE ALL
                </GlowTextButton>
                <GlowTextButton
                  variant="contained"
                  onClick={async () => {
                    setIsProcessing(true);
                    setBatchStatus('processing');
                    
                    try {
                      const colors = selectedColors;
                      const zip = new JSZip();
                      
                      for (let i = 0; i < colors.length; i++) {
                        const color = colors[i];
                        const processedUrl = await processImage(workingImageUrl, color);
                        const response = await fetch(processedUrl);
                        const blob = await response.blob();

                        const colorCode = color.replace('#', '');
                        const filename = `color_${colorCode}.png`;
                        zip.file(filename, blob);
                        
                        setProcessedCount(i + 1);
                        setTotalCount(colors.length);
                        setBatchProgress(Math.round(((i + 1) / colors.length) * 100));
                      }
                      
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
                      setBatchStatus('error');
                    } finally {
                      setIsProcessing(false);
                    }
                  }}
                  disabled={isProcessing || !imageLoaded || !selectedColors.length}
                  sx={{ width: '140px' }}
                >
                  SELECTED
                </GlowTextButton>
              </Box>

              {/* CSV Upload Button */}
              <Tooltip title={!isSubscribed ? "Subscribe to unlock batch processing" : ""}>
                <span>
                  <GlowTextButton
                    component="label"
                    variant="contained"
                    disabled={isProcessing || batchStatus === 'processing' || !isSubscribed}
                    sx={{ width: '140px' }}
                    onClick={!isSubscribed && isAuthenticated ? () => navigate('/subscription') : undefined}
                  >
                    UPLOAD CSV
                    <input
                      type="file"
                      hidden
                      accept=".csv"
                      onChange={handleCSVUpload}
                      disabled={!isSubscribed}
                    />
                  </GlowTextButton>
                </span>
              </Tooltip>

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
                          onClick={() => {
                            if (selectedColors.includes(color.hex)) {
                              setSelectedColors(selectedColors.filter(c => c !== color.hex));
                            } else {
                              setSelectedColors([...selectedColors, color.hex]);
                            }
                          }}
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
    </Box>
  );

  return mainContent;
}

export default App;
