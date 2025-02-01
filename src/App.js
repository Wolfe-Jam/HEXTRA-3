import React, { useState, useEffect, useRef } from 'react';
import { Box, Button, Typography, Tooltip, Slider, CircularProgress, LinearProgress, Chip } from '@mui/material';
import { Wheel } from '@uiw/react-color';
import JSZip from 'jszip';
import Jimp from 'jimp';
import Banner from './components/Banner';
import GlowButton from './components/GlowButton';
import GlowTextButton from './components/GlowTextButton';
import GlowToggleGroup from './components/GlowToggleGroup';
import GlowSwitch from './components/GlowSwitch';
import IconTextField from './components/IconTextField';
import SwatchDropdownField from './components/SwatchDropdownField';
import ColorDemo from './components/ColorDemo';
import { ToggleButton } from '@mui/material';
import GILDAN_6400 from './data/catalogs/gildan6400.js';
import HEXTRA_21 from './data/catalogs/hextra21';
import './theme.css';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import { RefreshRounded as ResetIcon, LinkRounded as LinkIcon } from '@mui/icons-material';
import { TextField, InputAdornment, IconButton } from '@mui/material';
import TagIcon from '@mui/icons-material/Tag';
import { VERSION } from './version';
import DefaultTshirt from './components/DefaultTshirt';
import { hexToRgb, processImage } from './utils/image-processing';
import { testJimp, replaceColor } from './utils/jimp-test';
import { LUMINANCE_METHODS } from './constants/luminance';
import { useKindeAuth } from '@kinde-oss/kinde-auth-react';
import KindeAuthButtons from './components/KindeAuthButtons';
import SubscriptionTest from './components/SubscriptionTest';
import SubscriptionSuccess from './components/SubscriptionSuccess';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';

const DEFAULT_COLOR = '#FED141';
const DEFAULT_IMAGE_URL = '/images/default-tshirt.webp';
const TEST_IMAGE_URL = '/images/Test-Gradient-600-400.webp';
const DEFAULT_COLORS = [
  '#D50032',  // Red
  '#00805E',  // Green
  '#224D8F',  // Blue
  '#FED141',  // Yellow
  '#FF4400',  // Orange
  '#CABFAD'   // Neutral
];

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
  const { isLoading, isAuthenticated, login } = useKindeAuth();
  const navigate = useNavigate();
  const [selectedColor, setSelectedColor] = useState(DEFAULT_COLOR);
  const [rgbColor, setRgbColor] = useState(hexToRgb(DEFAULT_COLOR));
  const [workingImage, setWorkingImage] = useState(null);
  const [workingImageUrl, setWorkingImageUrl] = useState(null);
  const [workingProcessedUrl, setWorkingProcessedUrl] = useState(null);
  const [testImage, setTestImage] = useState(null);
  const [testImageUrl, setTestImageUrl] = useState(null);
  const [testProcessedUrl, setTestProcessedUrl] = useState(null);
  const [originalImage, setOriginalImage] = useState(null);
  const [processedImage, setProcessedImage] = useState(null);
  const [error, setError] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [canDownload, setCanDownload] = useState(false);
  const [hexInput, setHexInput] = useState(DEFAULT_COLOR);
  const [urlInput, setUrlInput] = useState('');
  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem('hextraTheme');
    return savedTheme || 'dark';
  });
  const [isDropdownSelection, setIsDropdownSelection] = useState(false);
  const [lastClickColor, setLastClickColor] = useState(null);
  const [lastClickTime, setLastClickTime] = useState(0);
  const [enhanceEffect, setEnhanceEffect] = useState(true);  // Default to enhanced
  const [showTooltips, setShowTooltips] = useState(true);  // Default tooltips on
  const [useTestImage, setUseTestImage] = useState(false);
  const [lastWorkingImage, setLastWorkingImage] = useState(null);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [grayscaleValue, setGrayscaleValue] = useState(128); // Add state for grayscale value
  const [matteValue, setMatteValue] = useState(50);
  const [textureValue, setTextureValue] = useState(50);
  const [isTestingJimp, setIsTestingJimp] = useState(false);

  // MEZMERIZE States
  const [isBatchMode, setIsBatchMode] = useState(false);
  const [batchResults, setBatchResults] = useState([]);
  const [batchProgress, setBatchProgress] = useState(0);
  const [batchStatus, setBatchStatus] = useState('idle'); // idle, processing, complete, error
  const [selectedColors, setSelectedColors] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [processedCount, setProcessedCount] = useState(0);

  // Add state for catalog colors
  const [activeCatalog, setActiveCatalog] = useState('GILDAN_6400');
  const [catalogColors, setCatalogColors] = useState(GILDAN_6400);

  // Add state for advanced settings toggle
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Add state for subscription test
  const [showSubscriptionTest, setShowSubscriptionTest] = useState(false);

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
    // Color wheel returns an object, get the hex string
    const hex = color.hex || DEFAULT_COLOR;
    setSelectedColor(hex);
    setHexInput(hex);
    setRgbColor(hexToRgb(hex));
    
    // Update last click tracking
    setLastClickColor(hex);
    setLastClickTime(Date.now());
  };

  const applyColor = async () => {
    if (!imageLoaded || !originalImage) return;
    
    setIsProcessing(true);
    setError('');
    
    try {
      // Create a new image object with the same dimensions
      const colorized = {
        width: originalImage.width,
        height: originalImage.height,
        bitmap: {
          data: new Uint8ClampedArray(originalImage.bitmap.data),
          width: originalImage.width,
          height: originalImage.height
        }
      };
      
      // Process each pixel
      for (let i = 0; i < colorized.bitmap.data.length; i += 4) {
        const red = colorized.bitmap.data[i];
        const green = colorized.bitmap.data[i + 1];
        const blue = colorized.bitmap.data[i + 2];
        const alpha = colorized.bitmap.data[i + 3];
        
        if (alpha > 0) {
          // Calculate single luminance value
          const luminance = (0.299 * red + 0.587 * green + 0.114 * blue) / 255;
          
          // Apply same luminance to each channel of target color
          colorized.bitmap.data[i] = Math.round(rgbColor.r * luminance);
          colorized.bitmap.data[i + 1] = Math.round(rgbColor.g * luminance);
          colorized.bitmap.data[i + 2] = Math.round(rgbColor.b * luminance);
        }
      }

      // Create canvas to generate base64
      const canvas = document.createElement('canvas');
      canvas.width = colorized.width;
      canvas.height = colorized.height;
      const ctx = canvas.getContext('2d');
      
      // Create ImageData and put on canvas
      const imageData = new ImageData(
        colorized.bitmap.data,
        colorized.width,
        colorized.height
      );
      ctx.putImageData(imageData, 0, 0);
      
      // Get base64
      const base64 = canvas.toDataURL('image/png');
      
      setProcessedImage(colorized);
      setWorkingProcessedUrl(base64);
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
    
    try {
      const url = URL.createObjectURL(file);
      setWorkingImageUrl(url);
      setWorkingProcessedUrl(url);
      setImageLoaded(true);
      
      // Process with current color
      const processedUrl = await processImage(url, selectedColor);
      setWorkingProcessedUrl(processedUrl);
      setCanDownload(true);
    } catch (error) {
      console.error('Error uploading image:', error);
      setImageLoaded(false);
    }
  };

  const handleLoadUrl = () => {
    if (!urlInput.trim()) {
      // If no URL, open Google search for blank white t-shirts
      window.open('https://www.google.com/search?q=blank+white+t-shirts', '_blank');
      return;
    }
    // Reset file input by clearing imageFile state
    setWorkingImage(null);
    const url = urlInput.trim();
    setWorkingImageUrl(url);
  };

  const handleUrlKeyPress = (e) => {
    if (e.key === 'Enter' && urlInput.trim()) {
      e.preventDefault();
      // Reset file input by clearing imageFile state
      setWorkingImage(null);
      const url = urlInput.trim();
      setWorkingImageUrl(url);
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

  const handleGrayscaleChange = (event, newValue) => {
    const grayValue = newValue;
    const grayHex = `#${grayValue.toString(16).padStart(2, '0').repeat(3)}`.toUpperCase();
    setGrayscaleValue(grayValue);
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
  }, []);

  const handleDefaultImageLoad = async (imageUrl) => {
    try {
      console.log('Loading default WebP image from:', imageUrl);
      
      // Load image as HTMLImageElement first
      const img = new Image();
      img.crossOrigin = "anonymous";
      
      await new Promise((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => reject(new Error('Failed to load default image'));
        img.src = imageUrl;
      });

      // Create a canvas to get pixel data
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);
      
      // Get image data
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      
      // Create image from raw data
      const image = {
        width: imageData.width,
        height: imageData.height,
        bitmap: {
          data: imageData.data,
          width: imageData.width,
          height: imageData.height
        }
      };
      
      console.log('Default image loaded successfully');
      
      setOriginalImage(image);
      setWorkingImageUrl(imageUrl);
      setWorkingProcessedUrl(imageUrl);
      setImageLoaded(true);
      setCanDownload(true);
      setError('');
    } catch (err) {
      console.error('Error loading default image:', err);
      setError('Failed to load default image');
      setImageLoaded(false);
      setCanDownload(false);
    }
  };

  useEffect(() => {
    if (!workingImageUrl) return;
    
    // Skip if this is just a processed URL update
    if (workingImageUrl.startsWith('data:')) return;
    
    setError('');
    setIsProcessing(true);
    
    const loadImage = async () => {
      try {
        console.log('Loading image from:', workingImageUrl);
        
        // Load image as HTMLImageElement first
        const img = new Image();
        img.crossOrigin = "anonymous";
        
        await new Promise((resolve, reject) => {
          img.onload = () => resolve();
          img.onerror = () => reject(new Error('Failed to load image'));
          img.src = workingImageUrl;
        });

        // Create a canvas to get pixel data
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);
        
        // Get image data
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        
        // Create image from raw data
        const image = {
          width: imageData.width,
          height: imageData.height,
          bitmap: {
            data: new Uint8ClampedArray(imageData.data),
            width: imageData.width,
            height: imageData.height
          }
        };
        
        console.log('Image loaded successfully');
        
        setOriginalImage(image);
        setImageLoaded(true);
        setProcessedImage(image);
        setWorkingProcessedUrl(workingImageUrl);
        setCanDownload(true);
      } catch (error) {
        console.error('Error loading image:', error);
        setImageLoaded(false);
      } finally {
        setIsProcessing(false);
      }
    };

    loadImage();
  }, [workingImageUrl]);

  const isValidHex = (hex) => {
    // Remove hash if present
    hex = hex.replace('#', '');
    // Check if it's a valid 6-digit hex color
    return /^[0-9A-F]{6}$/i.test(hex);
  };

  // Color parsing utilities
  const parseColor = (input) => {
    if (!input) return null;
    console.log('Parsing color input:', input);
    
    // Remove any spaces, #, or other common prefixes
    input = input.trim().replace(/^[#\s]+/, '');
    console.log('After cleanup:', input);

    // If it's already a hex code (with or without #)
    // Check this first to avoid treating hex as decimal
    if (/^[0-9A-F]{6}$/i.test(input)) {
      const hex = '#' + input.toUpperCase();
      console.log('Valid hex code:', hex);
      return hex;
    }
    
    // Handle RGB format like "rgb(255, 0, 0)" or "rgb(255 0 0)"
    if (input.toLowerCase().includes('rgb')) {
      // Extract numbers from rgb format, handling both comma and space separation
      const numbers = input.match(/\d+/g);
      if (numbers && numbers.length >= 3) {
        const rgb = numbers.slice(0, 3).map(n => parseInt(n.trim()));
        console.log('RGB values from rgb():', rgb);
        if (rgb.every(n => !isNaN(n) && n >= 0 && n <= 255)) {
          const hex = '#' + rgb.map(n => 
            Math.max(0, Math.min(255, n)).toString(16).padStart(2, '0')
          ).join('');
          console.log('Converted RGB to hex:', hex);
          return hex.toUpperCase();
        }
      }
      return null; // Invalid RGB format
    }
    
    // Handle comma or space separated RGB values like "255,0,0" or "255 0 0"
    const rgbParts = input.split(/[\s,]+/);
    if (rgbParts.length === 3) {
      const rgb = rgbParts.map(n => parseInt(n.trim()));
      console.log('Space/comma-separated RGB values:', rgb);
      if (rgb.every(n => !isNaN(n) && n >= 0 && n <= 255)) {
        const hex = '#' + rgb.map(n => 
          Math.max(0, Math.min(255, n)).toString(16).padStart(2, '0')
        ).join('');
        console.log('Converted space/comma RGB to hex:', hex);
        return hex.toUpperCase();
      }
    }
    
    // Handle decimal numbers (convert to hex)
    if (!isNaN(input)) {
      const num = parseInt(input);
      console.log('Decimal number:', num);
      if (num >= 0 && num <= 16777215) { // Valid 24-bit color range
        const hex = '#' + num.toString(16).padStart(6, '0').toUpperCase();
        console.log('Converted decimal to hex:', hex);
        return hex;
      }
    }
    
    console.log('Failed to parse color');
    return null;
  };

  const handleCSVUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setBatchStatus('processing');
    setBatchProgress(0);

    try {
      const text = await file.text();
      // Split by newlines first, then handle each line's CSV parsing
      const lines = text.split('\n').map(line => {
        // Custom CSV parsing to handle rgb(x,y,z) format
        const result = [];
        let current = '';
        let inQuotes = false;
        let inRGB = false;
        
        for (let char of line) {
          if (char === '"') {
            inQuotes = !inQuotes;
          } else if (char === '(' && current.toLowerCase().endsWith('rgb')) {
            inRGB = true;
            current += char;
          } else if (char === ')' && inRGB) {
            inRGB = false;
            current += char;
          } else if (char === ',' && !inQuotes && !inRGB) {
            result.push(current.trim());
            current = '';
          } else {
            current += char;
          }
        }
        if (current) {
          result.push(current.trim());
        }
        return result;
      });
      
      const colors = [];
      let validLines = 0;
      let totalLines = lines.filter(line => line.length > 0).length;
      
      // Try to detect format from header
      const header = lines[0].map(col => col.toLowerCase());
      let colorColumn = 0;  // Default to first column
      let nameColumn = 1;   // Default to second column
      
      // Common column names for colors
      const colorKeywords = ['hex', 'color', 'code', 'rgb', 'value'];
      const nameKeywords = ['name', 'description', 'label', 'title'];
      
      console.log('Header columns:', header);
      
      // Only override defaults if we find matching columns
      header.forEach((col, index) => {
        if (colorKeywords.some(keyword => col.includes(keyword))) {
          if (col.includes('name')) {
            // Skip if it's "color name" instead of just "color"
            return;
          }
          colorColumn = index;
          console.log('Found color column:', index, col);
        }
        if (nameKeywords.some(keyword => col.includes(keyword))) {
          nameColumn = index;
          console.log('Found name column:', index, col);
        }
      });
      
      console.log('Using columns - Color:', colorColumn, 'Name:', nameColumn);
      
      // Process each line
      for (let i = 1; i < lines.length; i++) {
        const columns = lines[i];
        if (!columns.length) continue;
        
        console.log('\nProcessing line', i, ':', columns);
        
        const colorValue = columns[colorColumn];
        const name = columns[nameColumn];
        
        console.log('Color value:', colorValue);
        console.log('Name:', name);
        
        if (colorValue) {
          const hex = parseColor(colorValue);
          console.log('Parsed hex:', hex);
          
          if (hex) {
            colors.push({
              hex: hex,
              name: name || `Color ${validLines + 1}`,
              family: 'custom',
              tags: ['imported']
            });
            validLines++;
            console.log('Added color:', hex, name);
          }
        }
        
        setBatchProgress(Math.round((i / totalLines) * 100));
      }
      
      console.log('Final colors:', colors);
      
      if (colors.length > 0) {
        setCatalogColors(colors);
        setBatchResults(colors);
      }
      
      setBatchStatus('complete');
    } catch (error) {
      console.error('Error processing CSV:', error);
      setBatchStatus('error');
    }
  };

  const handleGenerateAll = async () => {
    console.log('handleGenerateAll called');
    console.log('Image state:', { 
      imageLoaded, 
      hasOriginalImage: !!originalImage,
      originalImageSize: originalImage ? {
        width: originalImage.width,
        height: originalImage.height,
        dataLength: originalImage.bitmap?.data?.length
      } : null
    });

    if (!imageLoaded) {
      console.error('No image loaded (imageLoaded is false)');
      setError('Please load an image first');
      return;
    }

    if (!originalImage) {
      console.error('No original image available');
      setError('Original image not available');
      return;
    }

    if (!originalImage.bitmap || !originalImage.bitmap.data) {
      console.error('Original image data is invalid:', originalImage);
      setError('Invalid image data');
      return;
    }

    try {
      console.log('Starting batch processing...');
      console.log(`Active catalog: ${activeCatalog}`);
      console.log(`Number of colors: ${catalogColors.length}`);
      console.log('First few colors:', catalogColors.slice(0, 3));

      // Initialize batch processing state
      setBatchStatus('processing');
      setBatchProgress(0);
      setProcessedCount(0);
      setTotalCount(catalogColors.length);
      
      // Create new ZIP file
      const zip = new JSZip();
      const folder = zip.folder("hextra-colors");
      
      // Process each color sequentially
      for (let i = 0; i < catalogColors.length; i++) {
        const color = catalogColors[i];
        console.log(`Processing color: ${color.name} (${color.hex})`);
        
        // Convert hex to RGB
        const rgbColor = hexToRgb(color.hex);
        if (!rgbColor) {
          console.error(`Invalid hex color: ${color.hex}`);
          continue;
        }

        // Create a clean copy of the original image for this color
        const imageData = {
          width: originalImage.width,
          height: originalImage.height,
          bitmap: {
            data: new Uint8ClampedArray(originalImage.bitmap.data),
            width: originalImage.width,
            height: originalImage.height
          }
        };

        // Process image using our proven color application method
        for (let idx = 0; idx < imageData.bitmap.data.length; idx += 4) {
          const red = imageData.bitmap.data[idx + 0];
          const green = imageData.bitmap.data[idx + 1];
          const blue = imageData.bitmap.data[idx + 2];
          const alpha = imageData.bitmap.data[idx + 3];
          
          if (alpha > 0) {
            // Calculate single luminance value (as required)
            const luminance = LUMINANCE_METHODS.NATURAL.calculate(red, green, blue);
            
            // Apply same luminance to each channel
            imageData.bitmap.data[idx + 0] = Math.round(rgbColor.r * luminance);
            imageData.bitmap.data[idx + 1] = Math.round(rgbColor.g * luminance);
            imageData.bitmap.data[idx + 2] = Math.round(rgbColor.b * luminance);
          }
        }

        // Convert to base64
        const canvas = document.createElement('canvas');
        canvas.width = imageData.width;
        canvas.height = imageData.height;
        const ctx = canvas.getContext('2d');
        const newImageData = new ImageData(
          imageData.bitmap.data,
          imageData.width,
          imageData.height
        );
        ctx.putImageData(newImageData, 0, 0);
        
        // Get base64 data
        const base64Data = canvas.toDataURL('image/png').split(',')[1];
        
        // Create filename: COLOR-NAME_HEX.png
        const filename = `${color.name.replace(/[^a-z0-9]/gi, '_')}_${color.hex.replace('#', '')}.png`;
        folder.file(filename, base64Data, { base64: true });

        // Update progress
        setProcessedCount(i + 1);
        setBatchProgress(Math.round(((i + 1) / catalogColors.length) * 100));
        
        // Let UI update
        await new Promise(resolve => setTimeout(resolve, 0));
      }

      // Switch to ZIP creation phase
      console.log('Creating ZIP file...');
      setBatchStatus('saving');
      setBatchProgress(0);

      // Generate ZIP with progress updates
      const content = await zip.generateAsync({
        type: "blob",
        compression: "DEFLATE",
        compressionOptions: { level: 5 }
      }, metadata => {
        setBatchProgress(Math.round(metadata.percent));
      });

      // Trigger download
      const url = URL.createObjectURL(content);
      const link = document.createElement('a');
      link.href = url;
      const date = new Date().toISOString().split('T')[0];
      link.download = `HEXTRA-${date}-${activeCatalog}_${catalogColors.length}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      // Complete
      setBatchStatus('complete');
      console.log('Batch processing complete');
      
    } catch (err) {
      console.error('Error in batch processing:', err);
      setError('Error processing batch: ' + err.message);
      setBatchStatus('error');
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
      const date = new Date().toISOString().split('T')[0];
      const colorName = hexInput.replace('#', '');
      link.download = `HEXTRA-${date}-${activeCatalog}_${colorName}.png`;
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

  const handleCatalogSwitch = (catalog) => {
    switch (catalog) {
      case 'GILDAN_6400':
        setActiveCatalog('GILDAN_6400');
        setCatalogColors(GILDAN_6400);
        break;
      case 'HEXTRA_21':
        setActiveCatalog('HEXTRA_21');
        setCatalogColors(HEXTRA_21);
        break;
      default:
        setActiveCatalog('GILDAN_6400');
        setCatalogColors(GILDAN_6400);
    }
  };

  const sectionHeaderStyle = {
    mb: 1,
    textAlign: 'center',
    fontWeight: 500,
    fontFamily: "'League Spartan', sans-serif",
    fontSize: '0.875rem',
    letterSpacing: '0.2em',
    textTransform: 'uppercase',
    color: 'var(--text-secondary)',
    '@media (max-width: 532px)': {
      fontSize: '0.75rem',
      letterSpacing: '0.15em'
    }
  };

  const actionButtonStyle = {
    width: '110px',  // Slightly smaller, consistent width
    minWidth: '110px',  // Ensure minimum width
    height: '36px',  // Consistent height
  };

  const handleTestImageToggle = (e) => {
    setUseTestImage(e.target.checked);
  };

  const handleEnhanceChange = (e) => {
    setEnhanceEffect(e.target.checked);
    if (imageLoaded) {
      applyColor();
    }
  };

  const handleLuminanceMethodChange = (value) => {
    // Removed this function
  };

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
    document.documentElement.style.setProperty('--glow-color', '#FF9900');
    document.documentElement.style.setProperty('--glow-subtle', theme === 'light' ? 'rgba(255, 153, 0, 0.2)' : 'rgba(255, 153, 0, 0.25)');
    document.documentElement.style.setProperty('--accent-color', '#FF4400');
    document.documentElement.style.setProperty('--accent-color-hover', '#FF5500');
    document.documentElement.style.setProperty('--accent-color-subtle', theme === 'light' ? 'rgba(255, 68, 0, 0.15)' : 'rgba(255, 68, 0, 0.25)');
  }, [theme]);

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
    if (!processedImage || !canDownload) return;
    
    const currentDate = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    const colorName = hexInput.replace('#', '');
    const link = document.createElement('a');
    link.href = useTestImage ? testProcessedUrl : workingProcessedUrl;
    link.download = `HEXTRA-${currentDate}-${activeCatalog}_${colorName}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
  };

  const validateColorApplication = (red, green, blue, rgbColor, luminance) => {
    // Verify we're using LUMINANCE_METHODS
    if (typeof LUMINANCE_METHODS.NATURAL.calculate !== 'function') {
      console.error('Color Application Error: LUMINANCE_METHODS.NATURAL.calculate is not available');
      return false;
    }

    // Verify luminance matches the required calculation
    const correctLuminance = LUMINANCE_METHODS.NATURAL.calculate(red, green, blue);
    if (Math.abs(correctLuminance - luminance) > 0.001) {
      console.error('Color Application Error: Incorrect luminance calculation detected');
      return false;
    }

    return true;
  };

  useEffect(() => {
    // Handle hash navigation
    if (window.location.hash === '#batch-section') {
      const batchSection = document.getElementById('batch-section');
      if (batchSection) {
        batchSection.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }, []);

  const PrivateRoute = ({ children }) => {
    if (!isAuthenticated) {
      return <Navigate to="/batch" />;
    }
    return children;
  };

  const mainContent = (
    <Box sx={{ 
      width: '100%',
      minWidth: '820px',
      maxWidth: '820px',
      minHeight: '100vh', 
      bgcolor: 'var(--bg-primary)', 
      color: 'var(--text-primary)',
      paddingTop: '62px',
      margin: '0 auto'
    }}>
      {/* Color Section */}
      <Box sx={{ mb: 1 }}>
        {/* Section B: RGB Color Disc */}
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
          Pick a color or Enter a HEX code
        </Typography>

        {/* SINGLE COLOR GENERATION heading */}
        <Typography 
          variant="h3" 
          sx={{ 
            mb: 3,
            textAlign: 'center',
            fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
            fontSize: '0.875rem',
            fontWeight: 500,
            letterSpacing: '0.1em',
            color: 'var(--text-secondary)',
            textTransform: 'uppercase'
          }}
        >
          SINGLE COLOR GENERATION
        </Typography>

        <Box sx={{ 
          display: 'flex',
          justifyContent: 'center',
          mb: 2
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
          mb: 2,
          justifyContent: 'center'  // Center the grayscale controls
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
          justifyContent: 'center',  // Center the hex input bar
          '@media (max-width: 532px)': {
            justifyContent: 'center',
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

      <Box sx={{ my: 2 }}>
        <Box
          sx={{
            width: '100%',
            height: '4px',
            backgroundColor: theme === 'dark' ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.15)',
            my: 2  
          }}
        />
      </Box>

      {/* Section D: Main Image Window Title */}
      <Typography 
        variant="h2" 
        sx={{ 
          marginTop: '10px',
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
        alignItems: 'center',
        justifyContent: 'center', 
        mt: 1,
        mb: 2,
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

      {/* Section F: Main Image */}
      <Box sx={{
        position: 'relative',
        zIndex: 1,
        mt: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        width: '100%',
        maxWidth: '800px',
        mx: 'auto',
        overflow: 'hidden',
        border: '1px solid var(--border-subtle)',
        borderRadius: '4px',
        bgcolor: 'var(--bg-secondary)',
        boxShadow: '0 0 1px var(--border-color)',
        '&:hover': {
          boxShadow: '0 0 2px var(--border-color)'
        }
      }}>
        {!imageLoaded && <DefaultTshirt onLoad={handleDefaultImageLoad} />}
        {imageLoaded && (
          <img
            src={useTestImage ? (testProcessedUrl || testImageUrl) : (workingProcessedUrl || workingImageUrl)}
            alt="Working"
            style={{
              maxWidth: '100%',
              height: 'auto',
              display: 'block' 
            }}
          />
        )}
      </Box>

      {/* Download button centered below image */}
      <Box sx={{ 
        display: 'flex',
        justifyContent: 'center',
        mt: 2,
        mb: 2
      }}>
        <Tooltip 
          title="Download Single Generation" 
          placement="top"
          arrow
        >
          <span>
            <GlowButton
              onClick={handleQuickDownload}
              disabled={!canDownload}
              sx={{
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
          </span>
        </Tooltip>
      </Box>

      {/* Section G: Image Processing */}
      <Box sx={{ 
        width: '100%', 
        mt: 1,
        position: 'relative',
        zIndex: 2  
      }}>
        {/* Advanced Settings Toggle Section */}
        <Box sx={{ 
          display: 'flex',
          justifyContent: 'flex-end',
          alignItems: 'center',
          gap: 1
        }}>
          <Typography sx={{ 
            fontSize: '0.75rem',
            color: 'var(--text-secondary)',
            fontFamily: "'Inter', sans-serif"
          }}>
            Advanced
          </Typography>
          <GlowSwitch
            checked={showAdvanced}
            onChange={(e) => setShowAdvanced(e.target.checked)}
            size="small"
          />
        </Box>

        {/* Image Processing Section */}
        {showAdvanced && (
          <Typography sx={{ 
            color: 'var(--text-secondary)',
            fontSize: '0.85rem',
            textAlign: 'center',
            mb: 2,
            fontStyle: 'italic'
          }}>
            Enhanced image processing features coming soon - Stay tuned!
          </Typography>
        )}
      </Box>

      {/* Section H: MESMERIZE */}
      <Box sx={{ 
        width: '100%',
        maxWidth: '800px',
        mt: 2,
        mx: 'auto',              // Center the box
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center'      // Center children
      }}>
        {/* MESMERIZE Section Title */}
        <Typography 
          variant="h2" 
          sx={{ 
            textAlign: 'center',
            fontFamily: "'Inter', sans-serif",
            fontSize: '1.25rem',
            fontWeight: 600,
            color: 'var(--text-primary)',
            mb: 1,
            '@media (max-width: 532px)': {
              fontSize: '1.1rem'
            }
          }}
        >
          B.I.G.
        </Typography>

        <Typography 
          variant="h3" 
          sx={{ 
            textAlign: 'center',
            fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
            fontSize: '0.875rem',
            fontWeight: 500,
            letterSpacing: '0.1em',
            color: 'var(--text-secondary)',
            textTransform: 'uppercase',
            mb: 3
          }}
        >
          BULK IMAGE GENERATION
        </Typography>

        <Typography 
          variant="h4" 
          sx={{ 
            textAlign: 'center',
            fontFamily: "'Inter', sans-serif",
            fontSize: '1.25rem',
            fontWeight: 600,
            color: 'var(--text-primary)',
            mb: 3,
            '@media (max-width: 532px)': {
              fontSize: '1.1rem'
            }
          }}
        >
          Create BULK T-Shirt blanks in True Color
        </Typography>

        {/* Batch Processing Section */}
        <Box 
          id="batch-section"
          className="batch-processing-section"
          sx={{
            mt: 4,
            p: 3,
            borderRadius: '8px',
            bgcolor: 'var(--bg-secondary)',
            border: '1px solid var(--border-subtle)',
            width: '100%',
            maxWidth: '800px',    // Match other sections
            mx: 'auto',           // Center the box
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            position: 'relative',
            transition: 'box-shadow 0.3s ease-in-out, border-color 0.3s ease-in-out',
            '&:hover': {
              boxShadow: !isAuthenticated ? 
                '0 0 30px rgba(255, 214, 0, 0.15)' : 
                'none',
              borderColor: !isAuthenticated ? 
                'rgba(255, 214, 0, 0.3)' : 
                'var(--border-subtle)'
            }
          }}
        >
          <Typography variant="h6" sx={{ 
            fontFamily: "'League Spartan', sans-serif",
            fontWeight: 600,
            color: 'var(--text-primary)',
            mb: 3,
            textTransform: 'uppercase',
            letterSpacing: '0.05em'
          }}>
            Batch Processing
          </Typography>

          {isAuthenticated ? (
            <>
              {/* Catalog selector */}
              <Box sx={{ 
                display: 'flex', 
                gap: 2, 
                justifyContent: 'center', 
                mt: 2,
                mb: 3
              }}>
                <GlowTextButton
                  variant="contained"
                  onClick={() => handleCatalogSwitch('GILDAN_6400')}
                  sx={{
                    width: '140px',
                    height: '36px',
                    fontSize: '0.8rem',
                    letterSpacing: '0.05em',
                    whiteSpace: 'nowrap',
                    opacity: activeCatalog === 'GILDAN_6400' ? 1 : 0.7,
                    p: 1
                  }}
                >
                  GILDAN 6400
                </GlowTextButton>
                <GlowTextButton
                  variant="contained"
                  onClick={() => handleCatalogSwitch('HEXTRA_21')}
                  sx={{
                    width: '140px',
                    height: '36px',
                    fontSize: '0.8rem',
                    letterSpacing: '0.05em',
                    whiteSpace: 'nowrap',
                    opacity: activeCatalog === 'HEXTRA_21' ? 1 : 0.7,
                    p: 1
                  }}
                >
                  HEXTRA 21
                </GlowTextButton>
              </Box>

              {/* Main Action Buttons */}
              <Box sx={{ 
                display: 'flex', 
                gap: 2,
                mb: 3,
                justifyContent: 'center'
              }}>
                <GlowTextButton
                  variant="contained"
                  onClick={handleGenerateAll}
                  disabled={batchStatus === 'processing' || batchStatus === 'saving' || !imageLoaded}
                  sx={{ 
                    width: '140px',
                    position: 'relative'
                  }}
                >
                  {batchStatus === 'processing' || batchStatus === 'saving' ? (
                    <>
                      <CircularProgress
                        size={16}
                        sx={{
                          color: 'var(--text-primary)',
                          position: 'absolute',
                          left: '50%',
                          marginLeft: '-8px'
                        }}
                      />
                      <span style={{ visibility: 'hidden' }}>GENERATE ALL</span>
                    </>
                  ) : (
                    'GENERATE ALL'
                  )}
                </GlowTextButton>
                <GlowTextButton
                  variant="contained"
                  onClick={handleGenerateSelected}
                  disabled={batchStatus === 'processing' || batchStatus === 'saving' || !imageLoaded || !selectedColors.length}
                  sx={{ width: '140px' }}
                >
                  SELECTED
                </GlowTextButton>
              </Box>

              {/* CSV Upload Button */}
              <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
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
              </Box>

              {/* Progress Indicator */}
              {(batchStatus === 'processing' || batchStatus === 'saving') && (
                <Box sx={{ width: '100%', maxWidth: 400, mt: 2, mx: 'auto' }}>
                  <Typography variant="body2" color="var(--text-secondary)" align="center" mt={1}>
                    {batchStatus === 'processing' ? (
                      `Processing: ${batchProgress}% (${processedCount} of ${totalCount})`
                    ) : (
                      'Creating ZIP file...'
                    )}
                  </Typography>
                  <LinearProgress 
                    variant={batchStatus === 'saving' ? 'indeterminate' : 'determinate'}
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
            </>
          ) : (
            <Box sx={{ 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center',
              gap: 3,
              p: 4,
              width: '100%',
              textAlign: 'center'
            }}>
              <Typography 
                variant="h5" 
                sx={{ 
                  fontFamily: "'League Spartan', sans-serif",
                  fontWeight: 600,
                  color: 'var(--text-primary)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em'
                }}
              >
                UNLOCK BULK GARMENT GENERATION
              </Typography>
              <GlowTextButton
                variant="contained"
                onClick={login}
                sx={{ 
                  width: '200px',
                  height: '48px',
                  fontSize: '1rem',
                  fontFamily: "'League Spartan', sans-serif",
                  fontWeight: 600,
                  letterSpacing: '0.05em'
                }}
              >
                SIGN IN
              </GlowTextButton>
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

      <ColorDemo catalog={catalogColors} />
    </Box>
  );

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/batch');
    }
  }, [isAuthenticated, navigate]);

  if (!isAuthenticated && window.location.pathname === '/') {
    return (
      <Box
        sx={{
          height: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(180deg, #1a1a1a 0%, #2d2d2d 100%)'
        }}
      >
        <Box
          component="img"
          src="/images/HEXTRA-3-logo-Wht.svg"
          alt="HEXTRA"
          sx={{
            height: '120px',
            width: 'auto',
            marginBottom: 4
          }}
        />
        <Button
          variant="contained"
          onClick={() => login()}
          sx={{
            backgroundColor: '#00805E',
            color: '#FFFFFF',
            '&:hover': {
              backgroundColor: '#006f52'
            }
          }}
        >
          Sign In
        </Button>
      </Box>
    );
  }

  if (!isAuthenticated && window.location.pathname === '/batch') {
    navigate('/');
    return null;
  }

  const handleBatchModeToggle = () => {
    setIsBatchMode(!isBatchMode);
  };

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/batch');
    }
  }, [isAuthenticated, navigate]);

  if (!isAuthenticated && window.location.pathname === '/') {
    return (
      <Box
        sx={{
          height: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(180deg, #1a1a1a 0%, #2d2d2d 100%)'
        }}
      >
        <Box
          component="img"
          src="/images/HEXTRA-3-logo-Wht.svg"
          alt="HEXTRA"
          sx={{
            height: '120px',
            width: 'auto',
            marginBottom: 4
          }}
        />
        <Button
          variant="contained"
          onClick={() => login()}
          sx={{
            backgroundColor: '#00805E',
            color: '#FFFFFF',
            '&:hover': {
              backgroundColor: '#006f52'
            }
          }}
        >
          Sign In
        </Button>
      </Box>
    );
  }

  if (!isAuthenticated && window.location.pathname === '/batch') {
    navigate('/');
    return null;
  }

  return (
    <Routes>
      <Route path="/" element={
        !isAuthenticated ? (
          <Box
            sx={{
              height: '100vh',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'linear-gradient(180deg, #1a1a1a 0%, #2d2d2d 100%)'
            }}
          >
            <Box
              component="img"
              src="/images/HEXTRA-3-logo-Wht.svg"
              alt="HEXTRA"
              sx={{
                height: '120px',
                width: 'auto',
                marginBottom: 4
              }}
            />
            <Button
              variant="contained"
              onClick={() => login()}
              sx={{
                backgroundColor: '#00805E',
                color: '#FFFFFF',
                '&:hover': {
                  backgroundColor: '#006f52'
                }
              }}
            >
              Sign In
            </Button>
          </Box>
        ) : (
          <Navigate to="/batch" replace />
        )
      } />
      <Route path="/batch" element={
        <Box sx={{ width: '100%', minHeight: '100vh', bgcolor: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
          <Banner 
            version={VERSION}
            isDarkMode={theme === 'dark'}
            onThemeToggle={toggleTheme}
            isBatchMode={isBatchMode}
            setIsBatchMode={setIsBatchMode}
            setShowSubscriptionTest={setShowSubscriptionTest}
          />
          {/* Add Subscription Test Dialog */}
          {showSubscriptionTest && (
            <SubscriptionTest onClose={() => setShowSubscriptionTest(false)} />
          )}
          {isAuthenticated ? (
            <Box 
              className="batch-processing-section"
              id="batch-section"
              sx={{ 
                width: '100%', 
                minHeight: 'calc(100vh - 62px)', // Account for new banner height
                bgcolor: 'var(--bg-primary)', 
                color: 'var(--text-primary)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                pt: 6, // Increased top padding to account for logo overlap
                px: 3,
                pb: 4,
                position: 'relative',
                overflow: 'visible'
              }}
            >
              {/* Main Content */}
              <Box sx={{ 
                width: '100%', 
                maxWidth: '800px', 
                mx: 'auto',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 4
              }}>
                {/* Color Section */}
                <Box sx={{ 
                  width: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 2
                }}>
                  {mainContent}
                </Box>
              </Box>
            </Box>
          ) : (
            <Box sx={{ 
              pt: 6, 
              display: 'flex', 
              justifyContent: 'center',
              minHeight: 'calc(100vh - 62px)', // Account for new banner height
              bgcolor: 'var(--bg-primary)'
            }}>
              <KindeAuthButtons />
            </Box>
          )}
        </Box>
      } />
      <Route path="/subscription" element={
        <PrivateRoute>
          <SubscriptionTest onClose={() => navigate('/batch')} />
        </PrivateRoute>
      } />
      <Route path="/success" element={
        <PrivateRoute>
          <SubscriptionSuccess />
        </PrivateRoute>
      } />
      <Route path="/subscription-success" element={
        <PrivateRoute>
          <SubscriptionSuccess />
        </PrivateRoute>
      } />
    </Routes>
  );
}

export default App;
