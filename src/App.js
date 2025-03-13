/**
 * HEXTRA-3 App Component (v2.2.5)
 * Main application component integrating color selection, image processing, and user tier management.
 * 
 * VERSION: 2.2.5
 * BUILD_ID: HEXTRA-2025-03-11-MC2245
 * BUILD_DATE: 2025-03-11
 */

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
  Tooltip,
  IconButton
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
import CUSTOM_21 from './data/catalogs/gildan3000.js';
import './theme.css';
import { useKindeAuth } from '@kinde-oss/kinde-auth-react';
import { useTheme } from './context/ThemeContext';
import JSZip from 'jszip';
import Wheel from './components/Wheel';
import RestoreIcon from '@mui/icons-material/Restore';
import GlowIconButton from './components/GlowIconButton';
import SearchIcon from '@mui/icons-material/Search';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import DownloadIcon from '@mui/icons-material/Download';
import EmailCollectionDialog from './components/EmailCollectionDialog';

// Constants
const DEFAULT_COLOR = '#FFFFFF'; // White

const COLOR_GROUPS = [
  {
    name: 'Recently Used',
    colors: [] // This will be populated dynamically
  },
  {
    name: 'Brand Colors',
    colors: [
      { value: '#D50032', label: 'Dark Red' },
      { value: '#00805E', label: 'Green' },
      { value: '#224D8F', label: 'Blue' },
      { value: '#FED141', label: 'Daisy' }
    ]
  },
  {
    name: 'Grayscale',
    colors: [
      { value: '#000000', label: 'Black' },
      { value: '#333333', label: 'Dark Grey' },
      { value: '#999999', label: 'Mid Grey' },
      { value: '#CCCCCC', label: 'Light Grey' },
      { value: '#FFFFFF', label: 'White' }
    ]
  },
  {
    name: 'Useful',
    colors: [
      { value: '#FF4400', label: 'Orange' },
      { value: '#FFAA00', label: 'Amber' },
      { value: '#CABFAD', label: 'Stone' },
      { value: '#9900CC', label: 'Purple' },
      { value: '#00CCFF', label: 'Cyan' },
      { value: '#FF00FF', label: 'Magenta' },
      { value: '#00FF00', label: 'Chroma Green' },
      { value: '#0000FF', label: 'Chroma Blue' },
      { value: '#FF0000', label: 'Bright Red' }
    ]
  }
];

// Keep backward compatibility with existing code that uses DEFAULT_COLORS
const DEFAULT_COLORS = [
  DEFAULT_COLOR,
  '#D50032',  // Dark Red
  '#00805E',  // Green
  '#224D8F',  // Blue
  '#FED141',  // Daisy
  '#FF4400',  // Orange
  '#CABFAD',  // Stone
];
/**
 * HEXTRA-3 - v2.2.5
 * Build Date: 2025-03-12
 * Build ID: HEXTRA-2025-03-12-MC2250
 * 
 * Features:
 * - Complete image processing pipeline
 * - Kinde authentication
 * - Stripe subscription system (Early-Bird $5/mo, Pro $10/mo)
 * - Color management & visualization
 */
const VERSION = '2.2.5';
const BUILD_ID = 'HEXTRA-2025-03-12-MC2250';

// Browser environment check for SSR compatibility
const isBrowser = typeof window !== 'undefined' && typeof document !== 'undefined';

function App() {
  console.log('App: Starting initialization...');
  // 1. Basic hooks
  const navigate = useNavigate();
  // eslint-disable-next-line no-unused-vars
  const { isAuthenticated: kindeAuthenticated, user } = useKindeAuth();
  
  // Use the actual authentication status from Kinde
  const isAuthenticated = kindeAuthenticated;
  const [isSubscribed, setIsSubscribed] = useState(false); // Default to not subscribed
  
  // Email user state for handling email-only users
  const [emailUser, setEmailUser] = useState(null);
  const [emailDialogOpen, setEmailDialogOpen] = useState(false);

  // 2. Refs
  const wheelRef = useRef(null);
  const hexInputRef = useRef(null);
  const isDragging = useRef(false);

  // 2. State hooks
  const [isLoading, setIsLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [workingImageUrl, setWorkingImageUrl] = useState('');
  const [originalImageUrl, setOriginalImageUrl] = useState('');
  const [workingProcessedUrl, setWorkingProcessedUrl] = useState('');
  const [selectedColor, setSelectedColor] = useState(DEFAULT_COLOR);
  const [recentlyUsedColors, setRecentlyUsedColors] = useState(
    () => {
      try {
        const saved = localStorage.getItem('recentColors');
        return saved ? JSON.parse(saved) : [];
      } catch (e) {
        console.error('Error parsing recent colors from localStorage:', e);
        return [];
      }
    }
  );
  const [rgbColor, setRgbColor] = useState({ r: 255, g: 255, b: 255 }); // Default to white
  const [grayscaleValue, setGrayscaleValue] = useState(255); // Changed from 200 to 255 for maximum brightness
  const [canDownload, setCanDownload] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [showHexDropDown, setShowHexDropDown] = useState(false);
  const [colorApplied, setColorApplied] = useState(false);
  const [selectedFormat, setSelectedFormat] = useState('png'); // 'png' or 'webp'
  const [autoApplyColors, setAutoApplyColors] = useState(false); // Default to OFF for better user control
  const [urlInput, setUrlInput] = useState('/images/default-tshirt.webp');
  const { theme, toggleTheme } = useTheme();
  const [enhanceEffect, setEnhanceEffect] = useState(true);
  const [showTooltips, setShowTooltips] = useState(true);
  const [showSubscriptionTest, setShowSubscriptionTest] = useState(false);
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
  const [lastClickColor, setLastClickColor] = useState(null);
  const [lastClickTime, setLastClickTime] = useState(0);

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

  // Load email user data from localStorage on app initialization
  useEffect(() => {
    const savedEmailUser = localStorage.getItem('hextra_email_user');
    console.log('[DEBUG] Init - localStorage email user data:', savedEmailUser);
    if (savedEmailUser) {
      try {
        const parsedUser = JSON.parse(savedEmailUser);
        console.log('[DEBUG] Init - Setting email user state:', parsedUser);
        setEmailUser(parsedUser);
      } catch (error) {
        console.error('Failed to parse saved email user data:', error);
      }
    } else {
      console.log('[DEBUG] Init - No email user data found in localStorage');
    }
  }, []);

  // Initialize the COLOR_GROUPS with the recent colors from localStorage
  useEffect(() => {
    if (recentlyUsedColors && recentlyUsedColors.length > 0) {
      COLOR_GROUPS[0].colors = recentlyUsedColors;
    }
  }, [recentlyUsedColors]);

  // Function to save color to recent list, only on deliberate actions
  const saveToRecentColors = useCallback((color) => {
    if (!color || color === '#FFFFFF') return; // Don't store empty or pure white
    
    // Ensure color is properly formatted
    let formattedColor = color.toUpperCase();
    if (formattedColor.length < 7) {
      console.warn('Invalid color format:', color);
      return;
    }
    
    // Add to local storage recent colors
    setRecentlyUsedColors(prev => {
      // Create the color object with value and label
      const newColor = { value: formattedColor, label: formattedColor };
      
      // Check if we already have an identical color
      const exactMatch = prev.find(c => c.value === formattedColor);
      if (exactMatch) {
        // Move it to the front without adding duplicate
        const filtered = prev.filter(c => c.value !== formattedColor);
        const updated = [newColor, ...filtered].slice(0, 4);
        
        // Update the COLOR_GROUPS with the new recently used colors
        COLOR_GROUPS[0].colors = updated;
        
        // Save to localStorage
        localStorage.setItem('recentColors', JSON.stringify(updated));
        
        return updated;
      }
      
      // Check for similar colors - consider colors within 10% difference as similar
      const rgbNew = hexToRgb(formattedColor);
      
      // Check if any existing color is too similar
      const tooSimilar = prev.some(existing => {
        const rgbExisting = hexToRgb(existing.value);
        
        // Calculate color distance (simple Euclidean distance)
        const rDiff = Math.abs(rgbNew.r - rgbExisting.r);
        const gDiff = Math.abs(rgbNew.g - rgbExisting.g);
        const bDiff = Math.abs(rgbNew.b - rgbExisting.b);
        
        // If the total difference is less than 30 (out of 765 max), consider it too similar
        return (rDiff + gDiff + bDiff) < 30;
      });
      
      // If too similar to existing color and we're in a dragging operation, don't add
      if (tooSimilar && isDragging.current) {
        return prev;
      }
      
      // Filter out the color if it already exists
      const filtered = prev.filter(c => c.value !== formattedColor);
      
      // Add to front of array and limit to 4 colors
      const updated = [newColor, ...filtered].slice(0, 4);
      
      // Update the COLOR_GROUPS with the new recently used colors
      COLOR_GROUPS[0].colors = updated;
      
      // Save to localStorage
      localStorage.setItem('recentColors', JSON.stringify(updated));
      
      return updated;
    });
  }, []);

  // Process the selected color - now used by multiple event handlers
  const processColor = useCallback(() => {
    if (!selectedColor || !workingImageUrl || !imageLoaded) {
      console.error('Cannot process color - missing requirements', {
        hasColor: !!selectedColor, 
        hasImage: !!workingImageUrl,
        imageLoaded
      });
      return;
    }
    
    // Save to recent colors on application (deliberate user action)
    saveToRecentColors(selectedColor);
    
    // Skip processing if auto-apply is off
    if (!autoApplyColors) return;
    
    setIsProcessing(true);
    
    try {
      console.log('Calling processImage...');
      const processedUrl = processImage(workingImageUrl, selectedColor);
      console.log('Processing complete, updating UI');
      setWorkingProcessedUrl(processedUrl);
      setCanDownload(true);
      setIsProcessing(false);
    } catch (error) {
      console.error('Error in processColor:', error);
      setCanDownload(false);
      setIsProcessing(false);
    }
  }, [selectedColor, workingImageUrl, imageLoaded, autoApplyColors, saveToRecentColors]);

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
          setIsProcessing(false);
        })
        .catch(error => {
          console.error('ERROR: Image processing failed:', error);
          // Don't reset to original image automatically, just keep current state
          setCanDownload(true);
          setIsProcessing(false);
        })
        .finally(() => {
          console.log('Processing complete (success or error)');
          focusHexInput();
        });
    } catch (e) {
      console.error('FATAL ERROR in image processing:', e);
      setIsProcessing(false);
    }
  }, [selectedColor, workingImageUrl, originalImageUrl, imageLoaded, focusHexInput]);

  const handleColorWheelChange = useCallback((color) => {
    if (!color) return;
    
    console.log('Color wheel changed to', color);
    setSelectedColor(color);
    setShowHexDropDown(false);
    
    // Extract RGB
    const rgb = hexToRgb(color);
    setRgbColor({ r: rgb.r, g: rgb.g, b: rgb.b });
    
    // Focus the HEX input (important for workflow)
    focusHexInput();
    
    // Only apply color if auto-apply is enabled, but DON'T save to recent colors
    // during wheel movement - only apply the color to preview
    if (autoApplyColors) {
      // Apply color without saving to recent
      if (selectedColor && workingImageUrl && imageLoaded) {
        setIsProcessing(true);
        
        try {
          processImage(workingImageUrl, color)
            .then(processedUrl => {
              setWorkingProcessedUrl(processedUrl);
              setCanDownload(true);
              setIsProcessing(false);
            })
            .catch(error => {
              console.error('Error during wheel movement preview:', error);
              setIsProcessing(false);
            });
        } catch (error) {
          console.error('Error processing color during wheel movement:', error);
          setIsProcessing(false);
        }
      }
    }
  }, [focusHexInput, autoApplyColors, workingImageUrl, imageLoaded, setShowHexDropDown]);

  const handleDragStart = useCallback(() => {
    isDragging.current = true;
  }, []);

  const handleDragEnd = useCallback(() => {
    isDragging.current = false;
    
    // Now we save to recent when user releases the mouse (deliberate action)
    if (selectedColor) {
      saveToRecentColors(selectedColor);
    }
    
    // Apply the color when dragging ends if autoApplyColors is enabled
    if (autoApplyColors && selectedColor && workingImageUrl && imageLoaded) {
      setIsProcessing(true);
      
      try {
        processImage(workingImageUrl, selectedColor)
          .then(processedUrl => {
            setWorkingProcessedUrl(processedUrl);
            setCanDownload(true);
            setIsProcessing(false);
          })
          .catch(error => {
            console.error('Error during color application at drag end:', error);
            setIsProcessing(false);
          });
      } catch (error) {
        console.error('Error processing color at drag end:', error);
        setIsProcessing(false);
      }
    }
  }, [selectedColor, autoApplyColors, saveToRecentColors, workingImageUrl, imageLoaded]);

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
      
      // Calculate the HSV values to extract value component
      const max = Math.max(rgb.r, rgb.g, rgb.b) / 255;
      
      // Update grayscale value to match the brightness (value) of the selected color
      const valueComponent = Math.round(max * 255);
      setGrayscaleValue(valueComponent);
      
      // Update the color wheel position to match the selected color
      if (wheelRef.current && wheelRef.current.setColor) {
        wheelRef.current.setColor(hexColor);
      }
    }
    
    // Save to recent colors on dropdown select (deliberate user action)
    saveToRecentColors(hexColor);
    
    // Only process the image if Auto Apply is enabled
    // This makes the dropdown behave like Google menus:
    // - Auto Off: Only changes the round swatch
    // - Auto On: Changes everything (like hitting Apply button)
    if (autoApplyColors) {
      // Process the image immediately when Auto Apply is on
      processColor();
    }
    
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
  }, [saveToRecentColors, processColor, autoApplyColors]);

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

  const handleSearchTshirts = useCallback(() => {
    window.open('https://www.google.com/search?q=blank+white+t-shirt&tbm=isch', '_blank');
  }, []);

  const handleLoadUrl = useCallback(async (directUrl) => {
    // Use either the provided directUrl or the urlInput state
    const urlToLoad = directUrl || urlInput.trim();
    
    if (!urlToLoad) {
      return;
    }

    console.log('Attempting to load image from URL:', urlToLoad);
    setIsProcessing(true);

    try {
      console.log('Fetching image from URL');
      const response = await fetch(urlToLoad);
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

  const handleWheelClick = useCallback((color) => {
    if (!color) return;
    
    console.log('Color wheel clicked on', color);
    setSelectedColor(color);
    setShowHexDropDown(false);
    
    // Extract RGB
    const rgb = hexToRgb(color);
    setRgbColor({ r: rgb.r, g: rgb.g, b: rgb.b });
    
    // Focus the HEX input
    focusHexInput();
    
    // Save to recent colors on click (deliberate user action)
    saveToRecentColors(color);
    
    // Only apply color if auto-apply is enabled
    if (autoApplyColors) {
      processColor();
    }
  }, [focusHexInput, saveToRecentColors, autoApplyColors, processColor, setShowHexDropDown]);

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
          
          // Calculate the HSV values to extract value component
          const max = Math.max(rgb.r, rgb.g, rgb.b) / 255;
          
          // Update grayscale value to match the brightness (value) of the selected color
          const valueComponent = Math.round(max * 255);
          setGrayscaleValue(valueComponent);
          
          // Update the color wheel position to match the new HEX code
          if (wheelRef.current && wheelRef.current.setColor) {
            wheelRef.current.setColor(fullHex);
          }
        }
      }
    }
  }, []);

  // Reset color to default yellow
  const resetColor = useCallback(() => {
    setSelectedColor(DEFAULT_COLOR);
    setRgbColor(hexToRgb(DEFAULT_COLOR));
    
    // Update the color wheel to the default color
    if (wheelRef.current && wheelRef.current.setColor) {
      wheelRef.current.setColor(DEFAULT_COLOR);
    }
  }, []);

  // Clear color (set empty)
  const clearColor = useCallback(() => {
    setSelectedColor('');
    setRgbColor({ r: 0, g: 0, b: 0 });
    
    // Update the color wheel to black when cleared
    if (wheelRef.current && wheelRef.current.setColor) {
      wheelRef.current.setColor('#000000');
    }
  }, []);

  const handleGrayscaleChange = useCallback((event, newValue) => {
    const grayValue = newValue;
    setGrayscaleValue(grayValue);
    
    // If we're at 0, set to pure black
    if (grayValue === 0) {
      const grayHex = '#000000';
      setSelectedColor(grayHex);
      setRgbColor({ r: 0, g: 0, b: 0 });
      
      // Update the wheel - the wheel's internal brightness will handle the display
      if (wheelRef.current && wheelRef.current.setColor) {
        wheelRef.current.setColor(grayHex);
      }
      return;
    }
    
    // For all other values, preserve the hue/saturation but apply the new brightness
    const currentColor = selectedColor;
    if (currentColor && currentColor.startsWith('#')) {
      // Convert the current color to HSV
      const rgb = hexToRgb(currentColor);
      if (rgb) {
        // Calculate the current HSV values
        const max = Math.max(rgb.r, rgb.g, rgb.b) / 255;
        const min = Math.min(rgb.r, rgb.g, rgb.b) / 255;
        const delta = max - min;
        
        let hue = 0;
        if (delta !== 0) {
          if (max === rgb.r / 255) {
            hue = ((rgb.g / 255 - rgb.b / 255) / delta) % 6;
          } else if (max === rgb.g / 255) {
            hue = (rgb.b / 255 - rgb.r / 255) / delta + 2;
          } else {
            hue = (rgb.r / 255 - rgb.g / 255) / delta + 4;
          }
        }
        
        hue = Math.round(hue * 60);
        if (hue < 0) hue += 360;
        
        const saturation = max === 0 ? 0 : delta / max;
        
        // Apply new brightness level (0-1 scale)
        const value = grayValue / 255;
        
        // Convert back to RGB
        let r, g, b;
        
        if (saturation === 0) {
          // Achromatic (gray)
          r = g = b = Math.round(value * 255);
        } else {
          hue /= 60; // sector 0 to 5
          const i = Math.floor(hue);
          const f = hue - i; // factorial part of h
          const p = value * (1 - saturation);
          const q = value * (1 - saturation * f);
          const t = value * (1 - saturation * (1 - f));
          
          switch (i % 6) {
            case 0: r = value; g = t; b = p; break;
            case 1: r = q; g = value; b = p; break;
            case 2: r = p; g = value; b = t; break;
            case 3: r = p; g = q; b = value; break;
            case 4: r = t; g = p; b = value; break;
            case 5: r = value; g = p; b = q; break;
            default: r = value; g = 0; b = 0;
          }
          
          r = Math.round(r * 255);
          g = Math.round(g * 255);
          b = Math.round(b * 255);
        }
        
        // Create new hex color with preserved hue/saturation but new brightness
        const newHex = `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`.toUpperCase();
        setSelectedColor(newHex);
        setRgbColor({ r, g, b });
        
        // We don't need to call wheelRef.setColor here since the brightness prop will handle the wheel display
      }
    }
  }, [selectedColor]);

  const handleGraySwatchClick = useCallback(() => {
    // Calculate the current gray value
    const grayValue = Math.round((rgbColor.r + rgbColor.g + rgbColor.b) / 3);
    const grayHex = `#${grayValue.toString(16).padStart(2, '0').repeat(3)}`.toUpperCase();
    
    // Update state
    setGrayscaleValue(grayValue);
    setSelectedColor(grayHex);
    setRgbColor({ r: grayValue, g: grayValue, b: grayValue });
    
    // Update the color wheel position to match this gray
    if (wheelRef.current && wheelRef.current.setColor) {
      wheelRef.current.setColor(grayHex);
    }
    
    // Save to recent colors on gray swatch click (deliberate user action)
    saveToRecentColors(grayHex);
    
    // Apply the gray color immediately only if autoApplyColors is enabled
    if (autoApplyColors) {
      processColor();
    } else {
      // If not auto-applying, make sure to focus the hex input
      focusHexInput();
    }
  }, [rgbColor, saveToRecentColors, autoApplyColors, focusHexInput, processColor]);

  // Function to perform the actual download
  const performDownload = useCallback(() => {
    // If there's no processed URL but there is a working image, set the working image as the URL to download
    const urlToDownload = workingProcessedUrl || (imageLoaded ? workingImageUrl : null);
    
    if (!urlToDownload) {
      console.log('No image available to download');
      return;
    }
    
    const currentDate = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    const filename = `HEXTRA-${currentDate}-${selectedColor.replace('#', '')}.${selectedFormat}`;
    
    const link = document.createElement('a');
    link.href = urlToDownload;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    if (urlToDownload.startsWith('blob:')) {
      URL.revokeObjectURL(urlToDownload);
    }
  }, [selectedColor, workingProcessedUrl, selectedFormat, workingImageUrl, imageLoaded]);
  
  // Handle email submission from dialog
  const handleEmailSubmit = useCallback((email) => {
    if (!email) return;
    console.log('[DEBUG] Email Submit - Processing email:', email);
    
    // Create user info object
    const userInfo = {
      email,
      timestamp: Date.now()
    };
    console.log('[DEBUG] Email Submit - Created user info:', userInfo);
    
    // Save to localStorage for persistence across sessions
    try {
      localStorage.setItem('hextra_email_user', JSON.stringify(userInfo));
      console.log('[DEBUG] Email Submit - Saved to localStorage successfully');
    } catch (error) {
      console.error('Failed to save email user data to localStorage:', error);
    }
    
    // Update state
    setEmailUser(userInfo);
    console.log('[DEBUG] Email Submit - Updated emailUser state');
    
    // Proceed with download after collecting email
    console.log('[DEBUG] Email Submit - Proceeding with download');
    performDownload();
  }, [performDownload]);
  
  // Main download handler - checks user state and shows dialog if needed
  const handleQuickDownload = useCallback(() => {
    console.log('[DEBUG] QuickDownload - Authentication state:', isAuthenticated);
    console.log('[DEBUG] QuickDownload - Email user state:', emailUser);
    
    // If user is authenticated or has already provided email, proceed with download
    if (isAuthenticated || emailUser) {
      console.log('[DEBUG] QuickDownload - User is authenticated or has email, proceeding with download');
      performDownload();
    } else {
      // Show email collection dialog for anonymous users
      console.log('[DEBUG] QuickDownload - User anonymous, showing email dialog');
      setEmailDialogOpen(true);
    }
  }, [isAuthenticated, emailUser, performDownload]);

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

  const DEFAULT_TSHIRT_URL = '/images/default-tshirt.webp';

  const handleDefaultImageLoad = useCallback((urlOrEvent) => {
    // Handle both event objects and direct URL strings
    const imageUrl = urlOrEvent?.target?.src || urlOrEvent;
    
    if (imageUrl) {
      setWorkingImageUrl(imageUrl);
      setWorkingProcessedUrl(null); // Don't set processed URL for default image
      setImageLoaded(true);
      setCanDownload(false); // Default image shouldn't be downloadable until processed
    }
  }, []);

  const handleCatalogSwitch = useCallback((catalog) => {
    switch (catalog) {
      case 'GILDAN_64000':
        setActiveCatalog('GILDAN_64000');
        break;
      case 'CUSTOM_21':
        setActiveCatalog('CUSTOM_21');
        break;
      default:
        setActiveCatalog('GILDAN_64000');
    }
  }, []);

  // Reset image to original (pre-color) state
  const handleResetImage = useCallback(() => {
    console.log('Resetting image to original state');
    if (originalImageUrl) {
      console.log('Restoring original image');
      setWorkingImageUrl(originalImageUrl);
      setWorkingProcessedUrl(null);
      console.log('Image reset to original');
      setCanDownload(false);
    } else if (imageLoaded) {
      // Default image reset case - revert to default t-shirt
      console.log('Resetting to default t-shirt');
      setWorkingImageUrl(DEFAULT_TSHIRT_URL);
      setWorkingProcessedUrl(null);
      setCanDownload(false);
    } else {
      console.log('No original image available to reset to');
    }
  }, [originalImageUrl, imageLoaded]);

  // 6. Effect hooks
  
  // Load email user data from localStorage
  useEffect(() => {
    const savedEmailUser = localStorage.getItem('hextra_email_user');
    if (savedEmailUser) {
      try {
        setEmailUser(JSON.parse(savedEmailUser));
        console.log('Loaded email user data from localStorage');
      } catch (error) {
        console.error('Failed to parse saved email user data:', error);
      }
    }
  }, []);
  
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

  useEffect(() => {
    if (!workingImageUrl && !originalImageUrl) {
      console.log('Setting default T-shirt image');
      setUrlInput(DEFAULT_TSHIRT_URL);
      handleLoadUrl(DEFAULT_TSHIRT_URL);
    }
  }, [workingImageUrl, originalImageUrl, handleLoadUrl, DEFAULT_TSHIRT_URL]);

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
      {/* Section 1.0 - Banner */}
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
          <Box sx={{ mb: 2 }}>
            {/* Catalog Title */}
            <Typography 
              variant="h5" 
              component="h2" 
              sx={{ 
                textAlign: 'center', 
                fontFamily: "'Inter', sans-serif",
                fontWeight: 500,
                mb: 3,
                mt: 0,  
                color: 'var(--text-primary)'
              }}
            >
              Apparel Base Mockups | Bulk Image Generation
            </Typography>
            {/* Section 2.0 - Title and RGB Color Disc */}
            <Typography 
              variant="h5" 
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
                initialColor={DEFAULT_COLOR}
                initialBrightness={1.0}
                brightness={grayscaleValue}
                size={270}
                onChange={handleColorWheelChange}
                onClick={handleWheelClick}
                onDoubleClick={() => applyColor('double-click')}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
                isDragging={isDragging.current}
              />
            </Box>

            {/* Section 3.0 - Grayscale Tool Bar */}
            <Box sx={{ 
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: "center",
              width: '100%',
              pl: '42px',  
              pr: '30px',  
              mb: 2,
              '@media (max-width: 600px)': { 
                justifyContent: 'center',
                pl: 2,
                pr: 2
              }
            }}>
              {/* GRAY Value Display */}
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
                <Box component="span" sx={{ flexShrink: 0 }}>GRAY Value:</Box>
                <Box component="span" sx={{ 
                  fontFamily: 'monospace',
                  width: '85px',  
                  textAlign: 'left'
                }}>
                  {`${Math.round((rgbColor.r + rgbColor.g + rgbColor.b) / 3)}`.padStart(3, ' ')}
                </Box>
              </Typography>

              {/* Centered layout container for swatch and slider */}
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center',
                gap: 2,
                flex: 1,
                pl: 1
              }}>
                {/* Gray Swatch - Clickable */}
                <Box 
                  onClick={handleGraySwatchClick}
                  sx={{
                    width: '40px',
                    height: '40px',
                    backgroundColor: `rgb(${Math.round((rgbColor.r + rgbColor.g + rgbColor.b) / 3)}, ${Math.round((rgbColor.r + rgbColor.g + rgbColor.b) / 3)}, ${Math.round((rgbColor.r + rgbColor.g + rgbColor.b) / 3)})`,
                    borderRadius: '50%',
                    border: '1px solid var(--border-color)',
                    cursor: 'pointer',
                    transition: 'transform 0.2s ease',
                    '&:hover': {
                      transform: 'scale(1.05)',
                      boxShadow: '0 0 5px rgba(255, 153, 0, 0.5)'
                    }
                  }}
                />

                {/* Slider */}
                <Box sx={{
                  position: 'relative',
                  width: '225px',
                  height: '24px',
                  backgroundColor: 'transparent',
                  borderRadius: '12px',
                  background: 'linear-gradient(to right, #000000, #FFFFFF)',
                  overflow: 'visible', 
                  display: 'flex',
                  alignItems: "center",
                  px: 1,
                  mt: 2.5, // Reduced from 3.5px since we removed the text labels
                  mb: 2, // Adjusted since markers are now closer to the slider
                  outline: '1px solid rgba(200, 200, 200, 0.2)'
                }}>
                  {/* Grayscale Markers */}
                  <Box sx={{
                    position: 'absolute',
                    bottom: '-14px', 
                    left: 0,
                    right: 0,
                    display: 'flex',
                    justifyContent: 'space-between',
                    px: 1.5,
                    pointerEvents: 'none',
                    zIndex: 5 // Increased z-index to ensure markers are always visible
                  }}>
                    {[
                      { color: '#000000', position: '0%' },
                      { color: '#333333', position: '25%' },
                      { color: '#999999', position: '50%' },
                      { color: '#CCCCCC', position: '75%' },
                      { color: '#FFFFFF', position: '100%' }
                    ].map((marker, index) => (
                      <Box 
                        key={index}
                        sx={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          position: 'relative',
                          pointerEvents: 'auto' // Enable pointer events for entire box
                        }}
                      >
                        {/* Circle marker with tooltip */}
                        <Tooltip 
                          title={marker.color.toUpperCase()}
                          placement="top"
                          arrow
                          enterDelay={100}
                          leaveDelay={200}
                          componentsProps={{
                            tooltip: {
                              sx: {
                                bgcolor: theme === 'dark' ? '#333' : '#fff',
                                color: theme === 'dark' ? '#fff' : '#333',
                                border: theme === 'dark' ? '1px solid #555' : '1px solid #ddd',
                                fontFamily: '"Roboto Mono", monospace',
                                fontSize: '12px',
                                fontWeight: 'bold',
                                padding: '4px 8px',
                                filter: 'drop-shadow(0px 2px 3px rgba(0,0,0,0.2))'
                              }
                            },
                            arrow: {
                              sx: {
                                color: theme === 'dark' ? '#333' : '#fff'
                              }
                            }
                          }}
                        >
                          <div> {/* Wrapping in a regular DOM element for tooltip to attach properly */}
                            <Box 
                              component="button" // Make it a button element for better accessibility
                              sx={{
                                width: '12px',
                                height: '12px',
                                backgroundColor: marker.color,
                                borderRadius: '50%',
                                border: theme === 'dark' 
                                  ? (marker.color === '#000000' ? '1.5px solid rgba(255, 255, 255, 0.9)' : '1px solid rgba(180, 180, 180, 0.7)')
                                  : (marker.color === '#FFFFFF' ? '1.5px solid rgba(0, 0, 0, 0.8)' : '1px solid rgba(100, 100, 100, 0.7)'),
                                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.3)',
                                position: 'relative',
                                transform: 'translateY(0)', // Slightly lowered to be more visible below the slider
                                cursor: 'pointer !important', // Force pointer cursor
                                transition: 'transform 0.15s ease, box-shadow 0.15s ease',
                                padding: 0, // Remove default button padding
                                margin: 0,  // Remove default button margin
                                outline: 'none', // Remove default focus outline
                                '&:hover': {
                                  transform: 'translateY(2px) scale(1.15)', // Lower and enlarge slightly on hover
                                  boxShadow: '0 3px 5px rgba(0, 0, 0, 0.4)', // Enhanced shadow on hover
                                  borderColor: '#FF9900', // Highlight with app's orange accent color
                                  zIndex: 2
                                }
                              }} 
                              onClick={() => {
                                // Convert from hex to RGB
                                const hexToRgb = (hex) => {
                                  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
                                  return result ? {
                                    r: parseInt(result[1], 16),
                                    g: parseInt(result[2], 16),
                                    b: parseInt(result[3], 16)
                                  } : null;
                                };
                                
                                // Get the marker's color (HEX-ready mode - populates the HEX input but doesn't apply)
                                const hexColor = marker.color.toUpperCase();
                                const rgb = hexToRgb(hexColor);
                                
                                if (rgb) {
                                  // Set grayscale value for slider position
                                  const grayValue = Math.round((rgb.r + rgb.g + rgb.b) / 3);
                                  setGrayscaleValue(grayValue);
                                  
                                  // Update HEX input with the selected color (HEX-ready behavior)
                                  setSelectedColor(hexColor);
                                  setRgbColor({ r: rgb.r, g: rgb.g, b: rgb.b });
                                  
                                  // Update the wheel - the wheel's internal brightness will handle the display
                                  if (wheelRef && wheelRef.current && wheelRef.current.setColor) {
                                    wheelRef.current.setColor(hexColor);
                                  }
                                  
                                  // Focus the HEX input after setting the value (maintaining workflow)
                                  if (hexInputRef && hexInputRef.current) {
                                    hexInputRef.current.focus();
                                  }
                                }
                              }}
                            />
                          </div>
                        </Tooltip>
                      </Box>
                    ))}
                  </Box>
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
                        border: '2px solid #FF9900',
                        outline: '1px solid rgba(0, 0, 0, 0.2)',
                        boxShadow: 'inset 0 0 4px #FF9900, 0 0 4px #FF9900',
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
                          outline: '1px solid rgba(0, 0, 0, 0.3)',
                          boxShadow: 'inset 0 0 6px #FF9900, 0 0 8px #FF9900',
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
            </Box>

            {/* Section 4.0 - HEX Input Bar */}
            <Box sx={{ 
              display: 'flex',
              flexWrap: 'wrap',  
              gap: 2,
              alignItems: "center",
              width: '100%',
              pl: '42px',  
              pr: '30px',  
              mb: 2,
              '@media (max-width: 600px)': { 
                justifyContent: 'center',
                pl: 2,
                pr: 2
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

              <SwatchDropdownField
                label="HEX Code"
                value={selectedColor}
                onChange={handleHexInputChange}
                onEnterPress={(trigger) => {
                  handleHexInputChange(trigger);
                  saveToRecentColors(selectedColor);
                  processColor();
                }}
                onDropdownSelect={handleDropdownSelect}
                options={COLOR_GROUPS}
                ref={hexInputRef}
                onReset={() => resetColor()}
                onClear={() => clearColor()}
                sx={{ 
                  width: '225px', 
                  '& .MuiAutocomplete-inputRoot': {
                    paddingRight: '45px !important', 
                    height: '42px'
                  },
                  '& .MuiOutlinedInput-input': {
                    padding: '9px 0px 9px 0', 
                    fontFamily: '"Roboto Mono", monospace',
                    letterSpacing: '0px',
                    fontSize: '14.5px', 
                    minWidth: '100px' 
                  }
                }}
              />

              {/* Custom square container for controls with precise spacing */}
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  width: '110px', 
                  height: '78px', 
                  ml: '16px', // Use same spacing as between HEX and color swatch
                  mr: 0,
                  mb: 0, 
                  mt: 0, 
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                  backgroundColor: 'var(--background-paper)',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.08)',
                  overflow: 'hidden',
                  alignSelf: 'center', // Vertically center with other elements
                }}
              >
                {/* Top section - APPLY button */}
                <Box
                  sx={{
                    display: 'flex',
                    flex: 1,
                    alignItems: 'stretch', 
                    justifyContent: 'center',
                    borderBottom: '1px solid var(--border-color)',
                    position: 'relative',
                    p: 0, 
                    m: 0, 
                    overflow: 'hidden' 
                  }}
                >
                  <GlowTextButton
                    id="apply-button"
                    variant="contained"
                    onClick={() => {
                      console.log('Apply button clicked with color:', selectedColor);
                      
                      // Validate requirements
                      if (!selectedColor || !workingImageUrl || !imageLoaded) {
                        console.error('Cannot apply color - missing requirements', {
                          hasColor: !!selectedColor, 
                          hasImage: !!workingImageUrl,
                          imageLoaded
                        });
                        return;
                      }
                      
                      // Save to recent colors when APPLY is clicked (deliberate action)
                      saveToRecentColors(selectedColor);
                      
                      // Visual feedback - only for Apply button
                      setColorApplied(true);
                      setTimeout(() => setColorApplied(false), 500);
                      
                      // Set processing state - make this independent from other animations
                      setIsProcessing(true);
                      
                      // Process the image with the selected color
                      processImage(workingImageUrl, selectedColor)
                        .then(processedUrl => {
                          console.log('Image successfully processed with color:', selectedColor);
                          setWorkingProcessedUrl(processedUrl);
                          setCanDownload(true);
                          setIsProcessing(false);
                        })
                        .catch(error => {
                          console.error('ERROR processing image:', error);
                          // Reset the processed URL to the original image as fallback
                          setWorkingProcessedUrl(workingImageUrl);
                          setIsProcessing(false);
                        });
                    }}
                    sx={{
                      height: '100%', 
                      fontSize: '13px', 
                      fontWeight: 'bold',
                      boxShadow: 'none',
                      width: '100%', 
                      borderRadius: 0, 
                      m: 0, 
                      transition: 'all 0.3s ease',
                      background: colorApplied ? `linear-gradient(135deg, ${selectedColor}, #FFFFFF, ${selectedColor})` : undefined,
                      backgroundSize: colorApplied ? '300% 300%' : undefined,
                      animation: colorApplied ? 'gradient-animation 2s ease infinite' : undefined,
                    }}
                  >
                    APPLY
                  </GlowTextButton>
                </Box>

                {/* Bottom section - Auto toggle and Reset */}
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    px: 1.5,
                    py: 0.5,
                    backgroundColor: 'var(--bg-paper-secondary)',
                    border: 'none',
                    borderTop: '1px solid var(--border-color)',
                    minHeight: '36px'
                  }}
                >
                  {/* Auto toggle with tooltip */}
                  <Tooltip 
                    title={autoApplyColors ? "Auto mode - colors apply immediately (click to disable)" : "Manual mode - requires APPLY button (recommended)"}
                    placement="bottom"
                    arrow
                    enterDelay={400}
                  >
                    <Box 
                      sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        cursor: 'pointer',
                        userSelect: 'none'
                      }}
                      onClick={() => setAutoApplyColors(!autoApplyColors)}
                    >
                      <Typography 
                        variant="caption" 
                        sx={{ 
                          mr: 0, // Reduce margin between text and toggle
                          fontSize: '10px',
                          color: 'var(--text-secondary)',
                          userSelect: 'none'
                        }}
                      >
                        Auto
                      </Typography>
                      <GlowSwitch
                        checked={autoApplyColors}
                        onChange={(e) => setAutoApplyColors(e.target.checked)}
                        size="small"
                        sx={{
                          '& .MuiSwitch-track': {
                            backgroundColor: 'var(--border-color)',
                          },
                          transform: 'scale(0.65)', // Slightly smaller scale
                          my: -0.5,
                          ml: -0.5 // Negative margin to pull closer to text
                        }}
                      />
                    </Box>
                  </Tooltip>
                  
                  {/* Reset Button - moved to the right with auto-margin */}
                  <Tooltip title="Reset to original image">
                    <GlowIconButton
                      id="reset-button"
                      size="small"
                      onClick={handleResetImage}
                      disabled={isProcessing || !imageLoaded}
                      sx={{
                        color: 'var(--text-primary)',
                        padding: '4px',
                        ml: 'auto', 
                        mr: 0.5 
                      }}
                    >
                      <RestoreIcon fontSize="small" />
                    </GlowIconButton>
                  </Tooltip>
                </Box>
              </Box>
            </Box>

          </Box>

          {/* === Separator === */}
          <Box
            sx={{
              width: '100%',
              height: '4px',
              backgroundColor: theme === 'dark' ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.15)',
              my: 1
            }}
          />

          {/* Section 5.0 - Main Image Window Title/Image Loading */}
          <Typography 
            variant="h6" 
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

          {/* Section 6.0 - Main Image Window (with integrated download button) */}
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
                onReset={() => setUrlInput(DEFAULT_TSHIRT_URL)}
                sx={{ width: '100%' }}
                InputProps={{
                  endAdornment: (
                    <IconButton 
                      onClick={handleLoadUrl}
                      size="small"
                      sx={{ 
                        color: theme => theme.palette.primary.main,
                        '&:hover': {
                          bgcolor: theme => theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.04)'
                        }
                      }}
                    >
                      <ArrowForwardIcon />
                    </IconButton>
                  )
                }}
              />
            </Box>

            <GlowTextButton
              variant="contained"
              onClick={handleSearchTshirts}
              sx={{ 
                width: '110px'
              }}
              startIcon={<SearchIcon />}
            >
              FIND
            </GlowTextButton>
          </Box>

          {/* Display Image Box */}
          <Box sx={{
            width: '100%',
            maxWidth: '720px',
            height: '720px',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            margin: '0 auto',
            mb: 1, 
            position: 'relative'
          }}>
            {workingProcessedUrl || workingImageUrl ? (
              <>
                <Box 
                  component="img"
                  src={workingProcessedUrl || workingImageUrl}
                  alt="T-shirt or selected image"
                  sx={{
                    width: 'auto',
                    maxWidth: '720px',
                    maxHeight: '720px',
                    objectFit: 'contain',
                    border: theme => theme.palette.mode === 'dark' ? '1px solid rgba(150, 150, 150, 0.2)' : '1px solid rgba(128, 128, 128, 0.15)',
                    boxShadow: theme => theme.palette.mode === 'dark' ? '0 0 5px rgba(255, 255, 255, 0.1)' : '0 0 2px rgba(0, 0, 0, 0.1)'
                  }}
                />
                
                {/* Download Button - always visible when there's an image */}
                <Tooltip title="Download image">
                  <GlowIconButton
                    onClick={handleQuickDownload}
                    disabled={!canDownload}
                    sx={{
                      position: 'absolute',
                      bottom: '20px',
                      right: '20px',
                      backgroundColor: theme => theme.palette.mode === 'dark' ? 'rgba(50, 50, 50, 0.8)' : 'rgba(255, 255, 255, 0.6)',
                      '&:hover': {
                        backgroundColor: theme => theme.palette.mode === 'dark' ? 'rgba(60, 60, 60, 0.9)' : 'rgba(255, 255, 255, 0.8)',
                      },
                      '&.Mui-disabled': {
                        opacity: 0.4,
                        backgroundColor: theme => theme.palette.mode === 'dark' ? 'rgba(40, 40, 40, 0.4)' : 'rgba(255, 255, 255, 0.4)',
                      }
                    }}
                  >
                    <DownloadIcon sx={{
                      color: theme => theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.85)' : undefined
                    }} />
                  </GlowIconButton>
                </Tooltip>
              </>
            ) : (
              <Typography variant="body1" sx={{ color: 'var(--text-secondary)' }}>
                No image loaded yet. Please upload or select an image.
              </Typography>
            )}
            
            {/* Use DefaultTshirt component to preload the default t-shirt */}
            <DefaultTshirt onLoad={(url) => {
              if (!workingImageUrl && !originalImageUrl) {
                console.log('Setting default t-shirt from component:', url);
                setWorkingImageUrl(url);
                setImageLoaded(true);
              }
            }} />
          </Box>

          {/* Format Toggle */}
          <Box sx={{
            display: 'flex',
            justifyContent: 'center',
            width: '100%',
            maxWidth: '720px',
            margin: '0 auto',
            mt: 0.5, 
            mb: 2 
          }}>
            <Box sx={{ 
              display: 'flex',
              alignItems: 'center',
              padding: '6px 12px',
              borderRadius: '8px',
              backgroundColor: theme => theme.palette.mode === 'dark' ? 'rgba(90, 90, 90, 0.5)' : 'rgba(240, 240, 240, 0.5)'
            }}>
              <Tooltip title="Choose PNG format (higher quality, larger file size)">
                <Typography
                  component="span"
                  variant="body2"
                  sx={{
                    fontWeight: selectedFormat === 'png' ? 600 : 400,
                    color: selectedFormat === 'png' 
                      ? theme => theme.palette.mode === 'dark' ? '#FFFFFF' : 'var(--text-primary)'
                      : theme => theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.75)' : 'var(--text-secondary)',
                    cursor: 'pointer',
                    mr: 1
                  }}
                  onClick={() => setSelectedFormat('png')}
                >
                  PNG
                </Typography>
              </Tooltip>
              
              <GlowSwitch
                checked={selectedFormat === 'webp'}
                onChange={(e) => setSelectedFormat(e.target.checked ? 'webp' : 'png')}
                size="small"
                sx={{
                  '& .MuiSwitch-track': {
                    backgroundColor: theme => theme.palette.mode === 'dark' ? 'rgba(150, 150, 150, 0.5) !important' : undefined
                  }
                }}
              />
              
              <Tooltip title="Choose WebP format (smaller file size, good compatibility)">
                <Typography
                  component="span"
                  variant="body2"
                  sx={{
                    fontWeight: selectedFormat === 'webp' ? 600 : 400,
                    color: selectedFormat === 'webp' 
                      ? theme => theme.palette.mode === 'dark' ? '#FFFFFF' : 'var(--text-primary)'
                      : theme => theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.75)' : 'var(--text-secondary)',
                    cursor: 'pointer',
                    ml: 1
                  }}
                  onClick={() => setSelectedFormat('webp')}
                >
                  WebP
                </Typography>
              </Tooltip>
            </Box>
          </Box>

          {/* === Separator === */}
          <Box
            sx={{
              width: '100%',
              height: '4px',
              backgroundColor: theme === 'dark' ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.15)',
              my: 1
            }}
          />

          {/* Section 7.0 - Image Adjustments */}
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

          {/* === Separator === */}
          <Box
            sx={{
              width: '100%',
              height: '4px',
              backgroundColor: theme === 'dark' ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.15)',
              my: 1
            }}
          />

          {/* Section 8.0 - BULK Image Generation (Batch Processing) */}
          <Box sx={{ 
            width: '100%',
            maxWidth: '800px',
            mt: 1
          }}>
            {/* MESMERIZE Section Title */}
            <Typography 
              variant="h6" 
              sx={{ 
                mb: 1,
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
                variant={activeCatalog === 'GILDAN_64000' ? 'contained' : 'outlined'}
                onClick={() => {
                  setActiveCatalog('GILDAN_64000');
                }}
                sx={{
                  width: '140px',
                  height: '36px',
                  fontSize: '0.8rem',
                  letterSpacing: '0.05em',
                  whiteSpace: 'nowrap',
                  opacity: activeCatalog === 'GILDAN_64000' ? 1 : 0.7
                }}
              >
                GILDAN 64000
              </GlowTextButton>
              <GlowTextButton
                variant={activeCatalog === 'CUSTOM_21' ? 'contained' : 'outlined'}
                onClick={() => {
                  setActiveCatalog('CUSTOM_21');
                }}
                sx={{
                  width: '140px',
                  height: '36px',
                  fontSize: '0.8rem',
                  letterSpacing: '0.05em',
                  whiteSpace: 'nowrap',
                  opacity: activeCatalog === 'CUSTOM_21' ? 1 : 0.7
                }}
              >
                CUSTOM 21
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
                mb: 2,
                flexWrap: 'wrap',
                justifyContent: 'center'
              }}>
                <GlowTextButton
                  variant="contained"
                  onClick={async () => {
                    setIsProcessing(true);
                    setBatchStatus('processing');
                    
                    try {
                      const colors = activeCatalog === 'GILDAN_64000' ? GILDAN_64000 : CUSTOM_21; // Use current catalog
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
                          
                          const date = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
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

                {/* Multi-Batch Button */}
                <GlowTextButton
                  variant="outlined"
                  disabled={true}
                  sx={{ 
                    width: '140px', 
                    bgcolor: 'transparent',
                    '&.Mui-disabled': {
                      color: 'var(--text-secondary)',
                      borderColor: 'var(--border-color)',
                      opacity: 0.7
                    },
                    display: 'flex',
                    flexDirection: 'column',
                    height: 'auto',
                    py: 1
                  }}
                >
                  <Box>MULTI-BATCH</Box>
                  <Typography 
                    variant="caption" 
                    sx={{ 
                      color: 'var(--text-secondary)',
                      fontSize: '10px',
                      opacity: 0.8,
                      mt: 0.5
                    }}
                  >
                    coming soon
                  </Typography>
                </GlowTextButton>
              </Box>

              {/* CSV Upload Button */}
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
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
              </Box>

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
                  <Typography variant="h6" sx={{ 
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

          {/* Section 9.0 - HEXTRA Color System (HCS) */}
          <Box
            sx={{
              width: '100%',
              mt: 2
            }}
          >
            {/* HEXTRA Section Title */}
            <Typography 
              variant="h6" 
              sx={{ 
                mb: 1,
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
              HEXTRA Color System (HCS)
            </Typography>

            {/* HEXTRA Section Content */}
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
              <Typography variant="body1" sx={{ 
                fontFamily: "'Inter', sans-serif",
                color: 'var(--text-primary)'
              }}>
                The HEXTRA Color System (HCS) is a proprietary color management system designed to provide accurate and consistent color representation across various mediums.
              </Typography>
            </Box>
          </Box>

          {/* Section 10.0 - Footer */}
          <Box 
            component="footer"
            sx={{ 
              width: '100%', 
              py: 2,
              mt: 2,
              textAlign: 'center',
              borderTop: '1px solid',
              borderColor: 'var(--border-color)'
            }}
          >
            <Typography 
              variant="body2" 
              sx={{ color: 'var(--text-secondary)' }} 
              align="center"
            >
              &copy; 2025 HEXTRA Color System - All rights reserved.
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );
  
  // Render the app content and dialogs
  return (
    <>
      {mainContent}
      
      {/* Email Collection Dialog */}
      <EmailCollectionDialog 
        open={emailDialogOpen} 
        onClose={() => setEmailDialogOpen(false)}
        onSubmit={handleEmailSubmit}
      />
    </>
  );
}

export default App;
