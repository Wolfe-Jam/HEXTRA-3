import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Box, Slider, Typography, CircularProgress, LinearProgress, Tooltip } from '@mui/material';
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
import { useNavigate } from 'react-router-dom';
import DefaultTshirt from './components/DefaultTshirt';
import GILDAN_64000 from './data/catalogs/gildan64000.js';
import './theme.css';
import { debounce } from 'lodash';

const DEFAULT_COLOR = GILDAN_64000[0].hex;  // White
const DEFAULT_IMAGE_URL = '/images/default-tshirt.png';
const TEST_IMAGE_URL = '/images/Test-Gradient-600-400.webp';
const DEFAULT_COLORS = [
  '#D50032',  // Red
  '#00805E',  // Green
  '#224D8F',  // Blue
  '#FED141',  // Yellow
  '#FF4400',  // Orange
  '#CABFAD'   // Neutral
];
const VERSION = '2.1.1'; // Starting new features after THE IMAGE FACTORY

function App() {
  // State for color selection
  const [selectedColor, setSelectedColor] = useState(DEFAULT_COLOR);
  const [rgbColor, setRgbColor] = useState(hexToRgb(DEFAULT_COLOR));
  
  // Image states
  const [workingImage, setWorkingImage] = useState(null);
  const [workingImageUrl, setWorkingImageUrl] = useState(DEFAULT_IMAGE_URL);
  const [workingProcessedUrl, setWorkingProcessedUrl] = useState(DEFAULT_IMAGE_URL);
  const [workingImageSize, setWorkingImageSize] = useState({ width: 0, height: 0 });
  const [imageMode, setImageMode] = useState('single');
  const [testImage, setTestImage] = useState(null);
  const [testImageUrl, setTestImageUrl] = useState(null);
  const [testProcessedUrl, setTestProcessedUrl] = useState(null);
  const [originalImage, setOriginalImage] = useState(null);
  const [processedImage, setProcessedImage] = useState(null);
  
  // UI states
  const [error, setError] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [canDownload, setCanDownload] = useState(false);
  const [hexInput, setHexInput] = useState(DEFAULT_COLOR.replace('#', ''));
  const [urlInput, setUrlInput] = useState('');
  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem('hextraTheme');
    return savedTheme || 'dark';
  });
  const [isDropdownSelection, setIsDropdownSelection] = useState(false);
  const [lastClickColor, setLastClickColor] = useState(null);
  const [lastClickTime, setLastClickTime] = useState(0);
  const [hasFirstClick, setHasFirstClick] = useState(false);
  const [enhanceEffect, setEnhanceEffect] = useState(true);  // Default to enhanced
  const [showTooltips, setShowTooltips] = useState(true);  // Default tooltips on
  const [useTestImage, setUseTestImage] = useState(false);
  const [lastWorkingImage, setLastWorkingImage] = useState(null);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [grayscaleValue, setGrayscaleValue] = useState(128);
  const [useWebP, setUseWebP] = useState(true);
  const [isBatchMode, setIsBatchMode] = useState(false);
  const [batchResults, setBatchResults] = useState([]);
  const [batchProgress, setBatchProgress] = useState(0);
  const [batchStatus, setBatchStatus] = useState('idle'); // idle, processing, complete, error
  const [selectedColors, setSelectedColors] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [processedCount, setProcessedCount] = useState(0);
  const [showCheckerboard, setShowCheckerboard] = useState(true);
  const [useChroma, setUseChroma] = useState(false);

  // Add state for catalog colors
  const [activeCatalog, setActiveCatalog] = useState('GILDAN_64000');
  const [catalogColors, setCatalogColors] = useState(GILDAN_64000);

  // Add state for advanced settings toggle
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Color catalog with RGB values for matching
  const colorCatalog = useMemo(() => 
    GILDAN_64000.map(color => ({
      ...color,
      rgb: hexToRgb(color.hex)
    }))
  , []);

  // Find matching colors as user types
  const handleColorSearch = (searchValue) => {
    if (!searchValue) return colorCatalog;
    
    // If it's a valid hex color, find nearest matches
    if (/^#?[0-9A-F]{6}$/i.test(searchValue.replace('#', ''))) {
      const targetRgb = hexToRgb(searchValue);
      return findNearest(targetRgb, colorCatalog);
    }
    
    // Otherwise filter by name and family
    const searchLower = searchValue.toLowerCase();
    return colorCatalog.filter(color => 
      color.name.toLowerCase().includes(searchLower) ||
      color.family?.toLowerCase().includes(searchLower)
    );
  };

  // Image processing methods
  const LUMINANCE_METHODS = {
    NATURAL: {
      label: 'Natural',
      tooltip: 'Uses ITU-R BT.709 standard weights for most accurate color perception',
      calculate: (r, g, b) => {
        const base = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
        return enhanceEffect ? Math.pow(base, 0.8) : Math.pow(base, 0.95);  // Subtle enhancement even in normal mode
      }
    },
    VIBRANT: {
      label: 'Vibrant',
      tooltip: 'Maximizes color saturation for bold, vivid results',
      calculate: (r, g, b) => {
        const base = (r + g + b) / (3 * 255);
        return enhanceEffect ? Math.pow(base, 0.7) : Math.pow(base, 0.9);  // More contrast in normal mode
      }
    },
    BALANCED: {
      label: 'Balanced',
      tooltip: 'Uses NTSC/PAL standard for a middle-ground approach',
      calculate: (r, g, b) => {
        const base = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
        return enhanceEffect ? Math.pow(base, 0.85) : Math.pow(base, 0.98);  // Slight enhancement in normal mode
      }
    }
  };

  const [luminanceMethod, setLuminanceMethod] = useState('NATURAL');
  const [matteValue, setMatteValue] = useState(50);
  const [textureValue, setTextureValue] = useState(50);

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
        const newRgb = hexToRgb(value);
        setRgbColor(newRgb);
        // Update gray value
        const grayValue = Math.round((newRgb.r + newRgb.g + newRgb.b) / 3);
        setGrayscaleValue(grayValue);
        applyColor();
      }
    }
  };

  const resetColor = () => {
    const defaultColor = GILDAN_64000[0].hex; // White
    setSelectedColor(defaultColor);
    setHexInput(defaultColor.replace('#', ''));
    setRgbColor(hexToRgb(defaultColor));
    updateSingleColor(defaultColor);
  };

  const handleColorChange = (color) => {
    const hex = color.hex.toUpperCase();
    setSelectedColor(hex);
    setHexInput(hex.replace('#', ''));
    const newRgb = hexToRgb(hex);
    setRgbColor(newRgb);
    // Update grayscale value based on RGB average
    setGrayscaleValue(Math.round((newRgb.r + newRgb.g + newRgb.b) / 3));
  };

  const applyColor = async () => {
    if (!imageLoaded || !originalImage) return;
    
    setIsProcessing(true);
    setError('');
    
    try {
      const colorized = await processImage(originalImage, rgbColor, luminanceMethod, enhanceEffect);
      
      const base64 = await new Promise((resolve, reject) => {
        colorized.getBase64(Jimp.MIME_PNG, (err, base64) => {
          if (err) reject(err);
          else resolve(base64);
        });
      });
      
      setProcessedImage(colorized);
      if (useTestImage) {
        setTestProcessedUrl(base64);
      } else {
        setWorkingProcessedUrl(base64);
      }
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

  // Fast update for single color changes
  const updateSingleColor = async (hex) => {
    if (!imageLoaded || !originalImage) return;
    
    try {
      const rgb = hexToRgb(hex);
      if (!rgb) return;
      
      const colorized = await processImage(originalImage, rgb, luminanceMethod, enhanceEffect);
      
      const buffer = await colorized.getBufferAsync(Jimp.MIME_PNG);
      const url = URL.createObjectURL(new Blob([buffer], { type: 'image/png' }));
      setWorkingProcessedUrl(url);
      
    } catch (err) {
      console.error('Error updating color:', err);
    }
  };

  const handleImageUpload = async (file) => {
    if (!file) return;
    
    // Check file type
    const validTypes = ['image/png', 'image/webp', 'image/jpeg', 'image/jpg'];
    if (!validTypes.includes(file.type)) {
      setError('Please upload a PNG, WebP, or JPEG file');
      return;
    }
    
    setIsProcessing(true);
    setError('');
    
    try {
      const image = await Jimp.read(await file.arrayBuffer());
      setOriginalImage(image);
      setImageLoaded(true);
      // Get initial base64 for display
      image.getBase64(Jimp.MIME_PNG, (err, base64) => {
        if (!err) {
          setProcessedImage(image);
          setWorkingProcessedUrl(base64);
          setCanDownload(true);
        }
      });
    } catch (err) {
      console.error('Error loading image:', err);
      setError('Error loading image. Please try a different file.');
    } finally {
      setIsProcessing(false);
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
  const hexInputRef = useRef(null);

  const handleGraySwatchClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Ignore double clicks
    if (e.detail > 1) return;
    
    // Get lightness from current color using HSL
    const { l } = rgbToHsl(rgbColor.r, rgbColor.g, rgbColor.b);
    // Create true gray using HSL (h=0, s=0)
    const grayRgb = hslToRgb(0, 0, l);
    const grayHex = '#' + [grayRgb.r, grayRgb.g, grayRgb.b]
      .map(x => x.toString(16).padStart(2, '0'))
      .join('')
      .toUpperCase();
    
    setHexInput(grayHex.replace('#', ''));
    setSelectedColor(grayHex);
    setRgbColor(grayRgb);
    setGrayscaleValue(Math.round(l * 255 / 100));
    // Focus the HEX input after setting gray value
    if (hexInputRef.current) {
      hexInputRef.current.focus();
    }
  };

  const handleGrayscaleChange = (event, newValue) => {
    // Convert slider value (0-255) directly to lightness (0-100)
    const lightness = (newValue / 255) * 100;
    // Create true gray using HSL (h=0, s=0)
    const grayRgb = hslToRgb(0, 0, lightness);
    const grayHex = '#' + [grayRgb.r, grayRgb.g, grayRgb.b]
      .map(x => x.toString(16).padStart(2, '0'))
      .join('')
      .toUpperCase();
    
    setGrayscaleValue(newValue);
    setHexInput(grayHex.replace('#', ''));
    setSelectedColor(grayHex);
    setRgbColor(grayRgb);
    // Focus the HEX input after setting gray value
    if (hexInputRef.current) {
      hexInputRef.current.focus();
    }
  };

  const handleGradientClick = (e) => {
    e.preventDefault(); // Prevent any default handling
    e.stopPropagation(); // Stop event bubbling
    
    // Ignore double clicks
    if (e.detail > 1) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    // Get lightness directly from position (0-100)
    const lightness = Math.min(Math.max(x / rect.width, 0), 1) * 100;
    // Create true gray using HSL (h=0, s=0)
    const grayRgb = hslToRgb(0, 0, lightness);
    const grayHex = '#' + [grayRgb.r, grayRgb.g, grayRgb.b]
      .map(x => x.toString(16).padStart(2, '0'))
      .join('')
      .toUpperCase();
    
    setGrayscaleValue(Math.round(lightness * 255 / 100));
    setHexInput(grayHex.replace('#', ''));
    setSelectedColor(grayHex);
    setRgbColor(grayRgb);
    // Ensure focus goes to HEX input
    if (hexInputRef.current) {
      hexInputRef.current.focus();
    }
  };

  const handleWheelClick = (color) => {
    const now = Date.now();
    
    if (!hasFirstClick) {
      // First click - just select color
      setHasFirstClick(true);
      setLastClickTime(now);
      return;
    }

    // Check if this is a double-click after first click
    if (now - lastClickTime < 500) {  // 500ms double-click threshold
      // Apply color!
      if (hexInputRef.current) {
        hexInputRef.current.dispatchEvent(new KeyboardEvent('keydown', {key: 'Enter', code: 'Enter'}));
      }
      // Reset state
      setHasFirstClick(false);
    } else {
      // Too slow, treat as new first click
      setLastClickTime(now);
    }
  };

  const handleWheelContext = (e) => {
    e.preventDefault(); // Prevent context menu
    // Apply current color
    if (hexInputRef.current) {
      hexInputRef.current.dispatchEvent(new KeyboardEvent('keydown', {key: 'Enter', code: 'Enter'}));
    }
  };

  const handleWheelPointer = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Only update display if within wheel bounds
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const radius = Math.min(centerX, centerY);
    const distance = Math.sqrt(Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2));
    
    if (distance <= radius) {
      // Get color at pointer position
      const hsv = {
        h: Math.atan2(y - centerY, x - centerX) * (180 / Math.PI) + 180,
        s: Math.min(distance / radius, 1) * 100,
        v: 100
      };
      
      // Convert HSV to RGB
      const rgb = hsvToRgb(hsv.h, hsv.s, hsv.v);
      // Pad numbers to 3 digits
      const r = rgb.r.toString().padStart(3);
      const g = rgb.g.toString().padStart(3);
      const b = rgb.b.toString().padStart(3);
      // Removed setRgbDisplay
    }
  };

  // Convert HSV to RGB
  const hsvToRgb = (h, s, v) => {
    s = s / 100;
    v = v / 100;
    
    const i = Math.floor(h / 60);
    const f = h / 60 - i;
    const p = v * (1 - s);
    const q = v * (1 - f * s);
    const t = v * (1 - (1 - f) * s);
    
    let r, g, b;
    switch (i % 6) {
      case 0: r = v; g = t; b = p; break;
      case 1: r = q; g = v; b = p; break;
      case 2: r = p; g = v; b = t; break;
      case 3: r = p; g = q; b = v; break;
      case 4: r = t; g = p; b = v; break;
      case 5: r = v; g = p; b = q; break;
    }
    
    return {
      r: Math.round(r * 255),
      g: Math.round(g * 255),
      b: Math.round(b * 255)
    };
  };

  const handleGlobalDoubleClick = useCallback((e) => {
    // Get element color
    const element = document.elementFromPoint(e.clientX, e.clientY);
    if (!element) return;
    
    const bgColor = window.getComputedStyle(element).backgroundColor;
    if (!bgColor || bgColor === 'transparent') return;
    
    // Parse RGB
    const match = bgColor.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
    if (!match) return;
    
    // Convert to HEX
    const hex = '#' + [match[1], match[2], match[3]]
      .map(x => parseInt(x).toString(16).padStart(2, '0'))
      .join('')
      .toUpperCase();
    
    // Set HEX input (this triggers our normal color flow)
    setHexInput(hex.replace('#', ''));
    
    // Focus and simulate Enter key
    if (hexInputRef.current) {
      hexInputRef.current.focus();
      hexInputRef.current.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
    }
  }, []);

  useEffect(() => {
    window.addEventListener('dblclick', handleGlobalDoubleClick);
    return () => window.removeEventListener('dblclick', handleGlobalDoubleClick);
  }, [handleGlobalDoubleClick]);

  // Load default image on mount
  useEffect(() => {
    // Set initial color states
    setSelectedColor(DEFAULT_COLOR);
    setHexInput(DEFAULT_COLOR.replace('#', ''));
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
            setWorkingProcessedUrl(base64);
            setCanDownload(true);
          }
        });
      })
      .catch(err => {
        console.error('Error loading default image:', err);
        setError('Failed to load default image');
      });
  }, []);

  useEffect(() => {
    document.body.style.cursor = '';
    window.removeEventListener('click', handlePickerClick);
  }, []);

  // Theme effect
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  useEffect(() => {
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

  const handleDropdownSelection = (option) => {
    const hex = typeof option === 'string' ? option : option.hex;
    setHexInput(hex);
    setSelectedColor(hex);
  };

  const handleQuickDownload = () => {
    // Use the same download handler for consistency
    handleDownload();
  };

  const handleDownload = () => {
    if (!processedImage || !canDownload) return;
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const colorCode = selectedColor.replace('#', '');
    const extension = useWebP ? 'webp' : 'png';
    const filename = `hextra_${colorCode}_${timestamp}.${extension}`;
    
    try {
      if (useWebP) {
        // For WebP, first get PNG buffer then convert to WebP
        processedImage.getBuffer(Jimp.MIME_PNG, (err, buffer) => {
          if (err) {
            console.error('Error getting PNG buffer:', err);
            setError('Error preparing WebP download');
            return;
          }
          
          // Convert PNG buffer to WebP
          const img = new Image();
          img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0);
            
            canvas.toBlob((blob) => {
              const url = window.URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = filename;
              document.body.appendChild(a);
              a.click();
              window.URL.revokeObjectURL(url);
              document.body.removeChild(a);
            }, 'image/webp');
          };
          img.src = URL.createObjectURL(new Blob([buffer], { type: 'image/png' }));
        });
      } else {
        // For PNG, use direct Jimp buffer
        processedImage.getBuffer(Jimp.MIME_PNG, (err, buffer) => {
          if (err) {
            console.error('Error getting PNG buffer:', err);
            setError('Error downloading image');
            return;
          }
          
          const blob = new Blob([buffer], { type: 'image/png' });
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = filename;
          document.body.appendChild(a);
          a.click();
          window.URL.revokeObjectURL(url);
          document.body.removeChild(a);
        });
      }
    } catch (err) {
      console.error('Error in download:', err);
      setError('Error downloading image');
    }
  };

  useEffect(() => {
    if (!workingImageUrl || workingImageUrl === DEFAULT_IMAGE_URL) return;
    
    // Reset states before loading new image
    setProcessedImage(null);
    setWorkingProcessedUrl('');
    setCanDownload(false);
    setError('');
    setIsProcessing(true);
    
    Jimp.read(workingImageUrl)
      .then(image => {
        setOriginalImage(image);
        setImageLoaded(true);
        // Get initial base64 for display
        image.getBase64(Jimp.MIME_PNG, (err, base64) => {
          if (!err) {
            setProcessedImage(image);
            setWorkingProcessedUrl(base64);
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
    if (/^#?[0-9A-F]{6}$/i.test(input.replace('#', ''))) {
      const hex = '#' + input.toUpperCase();
      console.log('Valid hex code:', hex);
      return hex;
    }
    
    // Check for rgb() format
    if (input.startsWith('rgb(') && input.endsWith(')')) {
      const numbers = input.substring(4, input.length - 1).split(',');
      const rgb = numbers.slice(0, 3).map(n => parseInt(n.trim()));
      console.log('RGB values from rgb():', rgb);
      if (rgb.every(n => !isNaN(n) && n >= 0 && n <= 255)) {
        const hex = '#' + rgb.map(x => 
          Math.max(0, Math.min(255, x)).toString(16).padStart(2, '0')
        ).join('');
        console.log('Converted RGB to hex:', hex);
        return hex;
      }
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
        return hex;
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
      
      console.log('Header columns:', header);
      
      // Only override defaults if we find matching columns
      header.forEach((col, index) => {
        if (col.includes('hex') || col.includes('color') || col.includes('code')) {
          colorColumn = index;
          console.log('Found color column:', index, col);
        }
        if (col.includes('name') || col.includes('description') || col.includes('label') || col.includes('title')) {
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
    if (!imageLoaded || !originalImage) {
      console.log('No image loaded');
      return;
    }
    
    setIsProcessing(true);
    setBatchStatus('processing');
    setBatchProgress(0);
    setProcessedCount(0);
    setError('');
    
    try {
      const colors = catalogColors; // Use current catalog
      setTotalCount(colors.length);
      console.log(`Processing ${colors.length} colors from ${activeCatalog}`);
      
      const zip = new JSZip();
      const folder = zip.folder("hextra-colors");
      
      // Process in chunks to prevent UI freeze
      const CHUNK_SIZE = 5;
      const chunks = [];
      for (let i = 0; i < colors.length; i += CHUNK_SIZE) {
        chunks.push(colors.slice(i, i + CHUNK_SIZE));
      }
      
      let processed = 0;
      for (let chunkIndex = 0; chunkIndex < chunks.length; chunkIndex++) {
        const chunk = chunks[chunkIndex];
        
        // Process chunk
        await Promise.all(chunk.map(async (color) => {
          console.log(`Processing color: ${color.name} (${color.hex})`);
          
          const rgbColor = hexToRgb(color.hex);
          if (!rgbColor) {
            console.error(`Invalid hex color: ${color.hex}`);
            return;
          }
          
          const colorized = originalImage.clone();
          
          // Process image using exact required implementation
          for (let idx = 0; idx < colorized.bitmap.data.length; idx += 4) {
            const red = colorized.bitmap.data[idx + 0];
            const green = colorized.bitmap.data[idx + 1];
            const blue = colorized.bitmap.data[idx + 2];
            const alpha = colorized.bitmap.data[idx + 3];
            
            if (alpha > 0) {
              // Calculate SINGLE luminance value using required method
              const luminance = LUMINANCE_METHODS.NATURAL.calculate(red, green, blue);
              
              // Apply same luminance value to each channel exactly as specified
              colorized.bitmap.data[idx + 0] = Math.round(rgbColor.r * luminance);
              colorized.bitmap.data[idx + 1] = Math.round(rgbColor.g * luminance);
              colorized.bitmap.data[idx + 2] = Math.round(rgbColor.b * luminance);
            }
          }
          
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
          processed++;
          setProcessedCount(processed);
          setBatchProgress(Math.round((processed / colors.length) * 100));
        }));
        
        // Let UI update
        await new Promise(resolve => setTimeout(resolve, 0));
      }
      
      console.log('Generating ZIP file...');
      setBatchStatus('saving');
      setBatchProgress(0);
      
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
      const url = URL.createObjectURL(content);
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
      setProcessedCount(0);
      setTotalCount(0);
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
        
        const colorized = await processImage(originalImage, rgb, luminanceMethod, enhanceEffect);
        
        const base64 = await new Promise((resolve, reject) => {
          colorized.getBase64(Jimp.MIME_PNG, (err, base64) => {
            if (err) reject(err);
            else resolve(base64);
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
      URL.revokeObjectURL(url);
      
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
        setCatalogColors(GILDAN_64000);
        break;
      case 'GILDAN_3000':
        setActiveCatalog('GILDAN_3000');
        setCatalogColors(GILDAN_3000);
        break;
      default:
        setActiveCatalog('GILDAN_64000');
        setCatalogColors(GILDAN_64000);
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
    setLuminanceMethod(value);
    if (imageLoaded) {
      setTimeout(() => applyColor(), 0);
    }
  };

  const handleWebPToggle = () => {
    setUseWebP(!useWebP);
    if (processedImage) {
      updateProcessedImage(processedImage, !useWebP);
    }
  };

  const updateProcessedImage = async (image, useWebPFormat = useWebP) => {
    try {
      const mimeType = useWebPFormat ? Jimp.MIME_WEBP : Jimp.MIME_PNG;
      const base64 = await new Promise((resolve, reject) => {
        image.getBase64(mimeType, (err, base64) => {
          if (err) reject(err);
          else resolve(base64);
        });
      });
      
      if (useTestImage) {
        setTestProcessedUrl(base64);
      } else {
        setWorkingProcessedUrl(base64);
      }
      setCanDownload(true);
    } catch (err) {
      console.error('Error updating image format:', err);
      setError('Failed to update image format');
    }
  };

  // Add function for simple color naming
  const getSimpleColorName = (r, g, b) => {
    // Convert to HSL for better color naming
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const l = (max + min) / 510; // Lightness 0-1
    
    if (max === min) {
      if (l < 0.1) return 'BLACK';
      if (l > 0.9) return 'WHITE';
      return `GRAY ${Math.round(l * 100)}%`;
    }

    const d = max - min;
    const s = d / (1 - Math.abs(2 * l - 1)) / 255;
    
    // Just return PALE if saturation is low
    if (s < 0.3) return 'PALE';
    
    // Otherwise return empty string (no label needed)
    return '';
  };

  const handleDoubleClick = useCallback((e) => {
    const element = document.elementFromPoint(e.clientX, e.clientY);
    if (!element) return;
    
    const bgColor = window.getComputedStyle(element).backgroundColor;
    if (!bgColor || bgColor === 'transparent') return;
    
    const match = bgColor.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
    if (!match) return;
    
    const hex = '#' + [match[1], match[2], match[3]]
      .map(x => parseInt(x).toString(16).padStart(2, '0'))
      .join('')
      .toUpperCase();
    
    updateSingleColor(hex);
  }, [updateSingleColor]);

  const handlePickerClick = useCallback((e) => {
    // Removed isPickerMode check
    const element = document.elementFromPoint(e.clientX, e.clientY);
    if (!element) return;
    
    const color = window.getComputedStyle(element).backgroundColor;
    if (!color || color === 'transparent') return;

    // Parse rgb(r, g, b)
    const rgb = color.match(/\d+/g);
    if (!rgb) return;
    
    // Convert to hex
    const hex = '#' + rgb.map(x => parseInt(x).toString(16).padStart(2, '0')).join('').toUpperCase();
    
    // Put in hex input and apply
    setHexInput(hex.replace('#', ''));
    if (hexInputRef.current) {
      hexInputRef.current.focus();
      hexInputRef.current.dispatchEvent(new KeyboardEvent('keydown', {key: 'Enter'}));
    }
  }, []);

  useEffect(() => {
    // Removed isPickerMode check
    document.body.style.cursor = '';
    window.removeEventListener('click', handlePickerClick);
  }, []);

  const handleShowCheckerboardChange = (e) => {
    setShowCheckerboard(e.target.checked);
    if (!e.target.checked) {
      setUseChroma(false);
    }
  };

  const handleImageLoad = (e) => {
    const img = e.target;
    if (img.naturalWidth > 6000 || img.naturalHeight > 6000) {
      setError({
        message: 'Image dimensions exceed 6000x6000 pixels. For larger images, please contact team@HEXTRA.io',
        severity: 'warning'
      });
    }
    setImageLoaded(true);
  };

  return (
    <Box className="App" sx={{ 
      minHeight: '100vh',
      backgroundColor: '#000000',
      color: '#ffffff',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      p: 2
    }}>
      <Banner version={VERSION} />
      
      {/* Main Content Area */}
      <Box sx={{ 
        width: '100%',
        maxWidth: '1200px',
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
        mt: 2
      }}>
        
        {/* Image Preview Section */}
        <Box sx={{
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          gap: 2,
          width: '100%'
        }}>
          
          {/* Original Image */}
          <Box sx={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 1
          }}>
            <Typography variant="h6" sx={{ color: '#ffffff' }}>
              Original Image
            </Typography>
            
            <Box sx={{
              width: '100%',
              aspectRatio: '1',
              backgroundColor: '#1a1a1a',
              borderRadius: 2,
              overflow: 'hidden',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              {imageLoaded ? (
                <img
                  src={workingImageUrl}
                  alt="Original"
                  style={{
                    maxWidth: '100%',
                    maxHeight: '100%',
                    objectFit: 'contain'
                  }}
                />
              ) : (
                <DefaultTshirt />
              )}
            </Box>
            
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              style={{ display: 'none' }}
              ref={fileInputRef}
            />
            
            <GlowButton
              variant="contained"
              onClick={() => fileInputRef.current?.click()}
              sx={{ width: '180px' }}
            >
              Upload Image
            </GlowButton>
          </Box>
          
          {/* Processed Image */}
          <Box sx={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 1
          }}>
            <Typography variant="h6" sx={{ color: '#ffffff' }}>
              Processed Image
            </Typography>
            
            <Box sx={{
              width: '100%',
              aspectRatio: '1',
              backgroundColor: '#1a1a1a',
              borderRadius: 2,
              overflow: 'hidden',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative'
            }}>
              {isProcessing && (
                <CircularProgress
                  sx={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    zIndex: 1
                  }}
                />
              )}
              
              <img
                src={workingProcessedUrl}
                alt="Processed"
                style={{
                  maxWidth: '100%',
                  maxHeight: '100%',
                  objectFit: 'contain',
                  opacity: isProcessing ? 0.5 : 1
                }}
              />
            </Box>
            
            <GlowButton
              variant="contained"
              onClick={handleDownload}
              disabled={!canDownload}
              startIcon={<FileDownloadIcon />}
              sx={{ width: '180px' }}
            >
              Download
            </GlowButton>
          </Box>
        </Box>
        
        {/* Color Selection Section */}
        <Box sx={{
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          gap: 2,
          width: '100%'
        }}>
          
          {/* Color Wheel */}
          <Box sx={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 1
          }}>
            <Typography variant="h6" sx={{ color: '#ffffff' }}>
              Color Selection
            </Typography>
            
            <Box sx={{
              width: '100%',
              aspectRatio: '1',
              backgroundColor: '#1a1a1a',
              borderRadius: 2,
              p: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Wheel
                width={240}
                height={240}
                color={selectedColor}
                onChange={(color) => {
                  const hex = color.hex.toUpperCase();
                  setSelectedColor(hex);
                  setHexInput(hex.replace('#', ''));
                  setRgbColor(hexToRgb(hex));
                  updateSingleColor(hex);
                }}
              />
            </Box>
            
            <Box sx={{
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
              gap: 1
            }}>
              <SwatchDropdownField
                ref={hexInputRef}
                label="HEX Color"
                value={hexInput}
                onChange={(e) => {
                  const newHex = e.target.value.toUpperCase();
                  setHexInput(newHex);
                  if (/^[0-9A-F]{6}$/.test(newHex)) {
                    const hex = '#' + newHex;
                    setSelectedColor(hex);
                    setRgbColor(hexToRgb(hex));
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    const hex = '#' + hexInput;
                    setSelectedColor(hex);
                    setRgbColor(hexToRgb(hex));
                    updateSingleColor(hex);
                  }
                }}
                placeholder={GILDAN_64000[0].hex.replace('#', '')}
                startIcon={<TagIcon />}
                hasReset
                onReset={resetColor}
                options={GILDAN_64000}
                onSelectionChange={(selected) => {
                  const hex = selected.hex;
                  setHexInput(hex.replace('#', ''));
                  setSelectedColor(hex);
                  setRgbColor(hexToRgb(hex));
                  updateSingleColor(hex);
                }}
                sx={{ 
                  width: '100%',
                  '& .MuiInputBase-root': {
                    backgroundColor: '#1a1a1a'
                  }
                }}
              />
              
              <Box sx={{
                display: 'flex',
                gap: 1
              }}>
                <GlowButton
                  variant="contained"
                  onClick={applyColor}
                  disabled={!imageLoaded || isProcessing}
                  sx={{ flex: 1 }}
                >
                  Apply Color
                </GlowButton>
              </Box>
            </Box>
          </Box>
          
          {/* Catalog Colors */}
          <Box sx={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 1
          }}>
            <Typography variant="h6" sx={{ color: '#ffffff' }}>
              Catalog Colors
            </Typography>
            
            <Box sx={{
              width: '100%',
              aspectRatio: '1',
              backgroundColor: '#1a1a1a',
              borderRadius: 2,
              p: 2,
              overflowY: 'auto'
            }}>
              <Box sx={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(60px, 1fr))',
                gap: 1
              }}>
                {catalogColors.map((color) => (
                  <Tooltip
                    key={color.hex}
                    title={`${color.name} (${color.hex})`}
                    arrow
                  >
                    <Box
                      onClick={() => {
                        setSelectedColor(color.hex);
                        setHexInput(color.hex.replace('#', ''));
                        setRgbColor(hexToRgb(color.hex));
                        updateSingleColor(color.hex);
                      }}
                      sx={{
                        width: '100%',
                        aspectRatio: '1',
                        backgroundColor: color.hex,
                        borderRadius: 1,
                        cursor: 'pointer',
                        border: selectedColor === color.hex ? '2px solid #ffffff' : 'none',
                        '&:hover': {
                          transform: 'scale(1.1)',
                          transition: 'transform 0.2s'
                        }
                      }}
                    />
                  </Tooltip>
                ))}
              </Box>
            </Box>
            
            <Box sx={{
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
              gap: 1
            }}>
              <Box sx={{
                display: 'flex',
                gap: 1
              }}>
                <GlowButton
                  variant="contained"
                  onClick={handleGenerateSelected}
                  disabled={!imageLoaded || isProcessing}
                  sx={{ flex: 1 }}
                >
                  Generate Selected
                </GlowButton>
                
                <GlowButton
                  variant="contained"
                  onClick={handleGenerateAll}
                  disabled={!imageLoaded || isProcessing}
                  sx={{ flex: 1 }}
                >
                  Generate All
                </GlowButton>
              </Box>
              
              {batchStatus !== 'idle' && (
                <Box sx={{ width: '100%' }}>
                  <LinearProgress
                    variant="determinate"
                    value={batchProgress}
                    sx={{
                      height: 10,
                      borderRadius: 5,
                      backgroundColor: '#1a1a1a',
                      '& .MuiLinearProgress-bar': {
                        backgroundColor: '#00ff00'
                      }
                    }}
                  />
                  
                  <Typography
                    variant="caption"
                    sx={{
                      color: '#ffffff',
                      mt: 0.5,
                      display: 'block',
                      textAlign: 'center'
                    }}
                  >
                    {batchStatus === 'processing' && `Processing ${processedCount} of ${totalCount}`}
                    {batchStatus === 'saving' && 'Creating ZIP file...'}
                    {batchStatus === 'complete' && 'Processing complete!'}
                    {batchStatus === 'error' && error}
                  </Typography>
                </Box>
              )}
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

export default App;
