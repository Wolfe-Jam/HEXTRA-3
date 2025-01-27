import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { Box, Button, Typography, Tooltip, Slider, CircularProgress, LinearProgress, TextField, InputAdornment, IconButton, ToggleButton } from '@mui/material';
import { Wheel } from '@uiw/react-color';
import Jimp from 'jimp';
import JSZip from 'jszip';
import Banner from './components/Banner';
import GlowButton from './components/GlowButton';
import GlowTextButton from './components/GlowTextButton';
import GlowToggleGroup from './components/GlowToggleGroup';
import GlowSwitch from './components/GlowSwitch';
import IconTextField from './components/IconTextField';
import SwatchDropdownField from './components/SwatchDropdownField';
import HCS from './components/HCS';
import GILDAN_64 from './data/catalogs/gildan64000';
import GILDAN_3000 from './data/catalogs/gildan3000';
import './theme.css';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import { RefreshRounded as ResetIcon, LinkRounded as LinkIcon } from '@mui/icons-material';
import TagIcon from '@mui/icons-material/Tag';
import { ColorTheory } from './utils/colorTheory';

const DEFAULT_COLOR = GILDAN_64[0].hex;  // White
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
  const [catalogColors, setCatalogColors] = useState(GILDAN_64);

  // Add state for advanced settings toggle
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Color catalog with RGB values for matching
  const colorCatalog = useMemo(() => 
    GILDAN_64.map(color => ({
      ...color,
      rgb: ColorTheory.hexToRgb(color.hex)
    }))
  , []);

  // Find matching colors as user types
  const handleColorSearch = (searchValue) => {
    if (!searchValue) return colorCatalog;
    
    // If it's a valid hex color, find nearest matches
    if (/^#?[0-9A-F]{6}$/i.test(searchValue.replace('#', ''))) {
      const targetRgb = ColorTheory.hexToRgb(searchValue);
      return ColorTheory.findNearest(targetRgb, colorCatalog);
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
    const defaultColor = GILDAN_64[0].hex; // White
    setSelectedColor(defaultColor);
    setHexInput(defaultColor.replace('#', ''));
    setRgbColor(ColorTheory.hexToRgb(defaultColor));
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
      const colorized = originalImage.clone();
      
      colorized.scan(0, 0, colorized.bitmap.width, colorized.bitmap.height, function(x, y, idx) {
        const red = this.bitmap.data[idx + 0];
        const green = this.bitmap.data[idx + 1];
        const blue = this.bitmap.data[idx + 2];
        const alpha = this.bitmap.data[idx + 3];
        
        if (alpha > 0) {
          const luminance = LUMINANCE_METHODS[luminanceMethod].calculate(red, green, blue);
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
      
      const colorized = originalImage.clone();
      
      colorized.scan(0, 0, colorized.bitmap.width, colorized.bitmap.height, function(x, y, idx) {
        const red = this.bitmap.data[idx + 0];
        const green = this.bitmap.data[idx + 1];
        const blue = this.bitmap.data[idx + 2];
        const alpha = this.bitmap.data[idx + 3];
        
        if (alpha > 0) {
          const luminance = LUMINANCE_METHODS[luminanceMethod].calculate(red, green, blue);
          this.bitmap.data[idx + 0] = Math.round(rgb.r * luminance);
          this.bitmap.data[idx + 1] = Math.round(rgb.g * luminance);
          this.bitmap.data[idx + 2] = Math.round(rgb.b * luminance);
        }
      });
      
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
      setWorkingImage(file);
      setWorkingImageUrl(DEFAULT_IMAGE_URL);
      setWorkingProcessedUrl(DEFAULT_IMAGE_URL);
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

  // Convert RGB to HSL
  const rgbToHsl = (r, g, b) => {
    r /= 255;
    g /= 255;
    b /= 255;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;

    if (max === min) {
      h = s = 0;
    } else {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      h /= 6;
    }
    return { h: h * 360, s: s * 100, l: l * 100 };
  };

  // Convert HSL to RGB
  const hslToRgb = (h, s, l) => {
    h /= 360;
    s /= 100;
    l /= 100;
    let r, g, b;

    if (s === 0) {
      r = g = b = l;
    } else {
      const hue2rgb = (p, q, t) => {
        if (t < 0) t += 1;
        if (t > 1) t -= 1;
        if (t < 1/6) return p + (q - p) * 6 * t;
        if (t < 1/2) return q;
        if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
        return p;
      };

      const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      const p = 2 * l - q;
      r = hue2rgb(p, q, h + 1/3);
      g = hue2rgb(p, q, h);
      b = hue2rgb(p, q, h - 1/3);
    }

    return {
      r: Math.round(r * 255),
      g: Math.round(g * 255),
      b: Math.round(b * 255)
    };
  };

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
    setError('');
    
    try {
      const colors = catalogColors; // Use current catalog
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
          colorized.scan(0, 0, colorized.bitmap.width, colorized.bitmap.height, function(x, y, idx) {
            const red = this.bitmap.data[idx + 0];
            const green = this.bitmap.data[idx + 1];
            const blue = this.bitmap.data[idx + 2];
            const alpha = this.bitmap.data[idx + 3];
            
            if (alpha > 0) {
              const luminance = LUMINANCE_METHODS[luminanceMethod].calculate(red, green, blue);
              this.bitmap.data[idx + 0] = Math.round(rgb.r * luminance);
              this.bitmap.data[idx + 1] = Math.round(rgb.g * luminance);
              this.bitmap.data[idx + 2] = Math.round(rgb.b * luminance);
            }
          });
          
          const buffer = await colorized.getBufferAsync(Jimp.MIME_PNG);
          folder.file(`${color.name.replace(/[^a-z0-9]/gi, '_')}.png`, buffer);
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
        
        colorized.scan(0, 0, colorized.bitmap.width, colorized.bitmap.height, function(x, y, idx) {
          const red = this.bitmap.data[idx + 0];
          const green = this.bitmap.data[idx + 1];
          const blue = this.bitmap.data[idx + 2];
          const alpha = this.bitmap.data[idx + 3];
          
          if (alpha > 0) {
            const luminance = LUMINANCE_METHODS[luminanceMethod].calculate(red, green, blue);
            
            this.bitmap.data[idx + 0] = Math.round(rgb.r * luminance);
            this.bitmap.data[idx + 1] = Math.round(rgb.g * luminance);
            this.bitmap.data[idx + 2] = Math.round(rgb.b * luminance);
          }
        });
        
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
        setCatalogColors(GILDAN_64);
        break;
      case 'GILDAN_3000':
        setActiveCatalog('GILDAN_3000');
        setCatalogColors(GILDAN_3000);
        break;
      default:
        setActiveCatalog('GILDAN_64000');
        setCatalogColors(GILDAN_64);
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
    <Box sx={{ 
      width: '100vw',
      height: '100vh',
      bgcolor: 'var(--bg-primary)',
      color: 'var(--text-primary)',
      transition: 'all 0.2s',
      overflow: 'auto'
    }}>
      <Banner 
        title="HEXTRA"
        version="2.1.1"
        subtitle="Color Management for T-Shirt Design"
        isDarkMode={theme === 'dark'}
        onThemeToggle={toggleTheme}
      />

      {/* Main Content Container */}
      <Box sx={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        width: '100%',
        maxWidth: '800px',
        mx: 'auto',
        px: 3,
        '@media (max-width: 832px)': {
          px: 2
        }
      }}>
        {/* Upload Controls */}
        <Box sx={{ 
          display: 'flex',
          justifyContent: 'center',
          gap: 2,
          width: '100%',
          mt: 16,
          mb: 1
        }}>
          <GlowTextButton
            component="label"
            variant="contained"
            disabled={isProcessing}
            sx={{ width: '110px' }}
          >
            UPLOAD
            <input
              type="file"
              hidden
              accept="image/*"
              onChange={(e) => handleImageUpload(e.target.files[0])}
            />
          </GlowTextButton>
        </Box>

        {/* URL Input and Button */}
        <Box sx={{ 
          display: 'flex', 
          gap: 2,
          alignItems: 'center',
          width: '100%',
          maxWidth: '800px',
          mb: 3
        }}>
          <IconTextField
            placeholder="Paste image URL here..."
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            onKeyDown={handleUrlKeyPress}
            startIcon={<LinkIcon />}
            hasReset
            onReset={() => setUrlInput('')}
            sx={{ 
              flex: 1,
              minWidth: '500px',
              '& .MuiInputBase-root': {
                width: '100%'
              }
            }}
          />
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

        {/* Background toggles */}
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center',
          justifyContent: 'center',
          gap: 3,
          mb: 1
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="caption" sx={{ color: 'var(--text-secondary)' }}>
              Show Background
            </Typography>
            <GlowSwitch
              checked={showCheckerboard}
              onChange={handleShowCheckerboardChange}
              size="small"
            />
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="caption" sx={{ color: 'var(--text-secondary)' }}>
              Use Chroma
            </Typography>
            <GlowSwitch
              checked={useChroma}
              onChange={(e) => setUseChroma(e.target.checked)}
              disabled={!showCheckerboard}
              size="small"
            />
          </Box>
        </Box>

        {/* Main Image Window with Controls */}
        <Box sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 2,
          width: '100%'
        }}>
          {/* Image Display */}
          <Box sx={{
            position: 'relative',
            width: '100%',
            maxWidth: '6000px',
            minHeight: '400px',
            maxHeight: '6000px',
            backgroundColor: showCheckerboard ? (useChroma ? '#00FF00' : 'transparent') : 'transparent',
            backgroundImage: showCheckerboard && !useChroma ? 'var(--checkerboard-pattern)' : 'none',
            borderRadius: '8px',
            overflow: 'hidden',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            transition: 'border-color 0.2s',
            mb: 1
          }}>
            {/* Checkerboard background */}
            {showCheckerboard && !useChroma && (
              <Box sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                zIndex: 0,
                backgroundImage: `
                  linear-gradient(45deg, #808080 25%, transparent 25%),
                  linear-gradient(-45deg, #808080 25%, transparent 25%),
                  linear-gradient(45deg, transparent 75%, #808080 75%),
                  linear-gradient(-45deg, transparent 75%, #808080 75%)
                `,
                backgroundSize: '20px 20px',
                backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px',
                opacity: 0.1
              }} />
            )}
            {/* Image content */}
            <Box sx={{ 
              position: 'relative', 
              zIndex: 1, 
              width: '100%',
              height: '100%',
              maxWidth: '6000px',
              maxHeight: '6000px',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center'
            }}>
              {isProcessing ? (
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  width: '100%',
                  height: '100%',
                  minHeight: '400px'
                }}>
                  <CircularProgress size={48} />
                </Box>
              ) : workingImageUrl ? (
                <img
                  src={useTestImage ? (testProcessedUrl || testImageUrl) : (workingProcessedUrl || workingImageUrl)}
                  alt="Working"
                  onLoad={handleImageLoad}
                  style={{
                    maxWidth: '100%',
                    maxHeight: '100%',
                    width: 'auto',
                    height: 'auto',
                    objectFit: 'contain',
                    display: 'block'
                  }}
                />
              ) : (
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  width: '100%',
                  height: '100%',
                  minHeight: '400px',
                  color: 'var(--text-secondary)'
                }}>
                  Upload an image to begin
                </Box>
              )}
            </Box>

            {/* Download button */}
            <GlowButton
              onClick={handleDownload}
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
                justifyContent: 'center',
                zIndex: 3
              }}
            >
              <FileDownloadIcon />
            </GlowButton>
          </Box>

          {/* Format toggle */}
          <Box sx={{ 
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',  
            gap: 2,
            width: '100%',
            pr: 1,
            mb: 3
          }}>
            <Typography 
              variant="caption" 
              sx={{ 
                color: !useWebP ? 'var(--primary-main)' : 'var(--text-secondary)',
                fontWeight: !useWebP ? 600 : 400
              }}
            >
              PNG
            </Typography>
            <GlowSwitch
              checked={useWebP}
              onChange={handleWebPToggle}
              size="small"
            />
            <Typography 
              variant="caption" 
              sx={{ 
                color: useWebP ? 'var(--primary-main)' : 'var(--text-secondary)',
                fontWeight: useWebP ? 600 : 400
              }}
            >
              WebP
            </Typography>
          </Box>
        </Box>

        {/* Color Controls Section */}
        <Box sx={{
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 2,
          mb: 3
        }}>
          {/* Color Wheel */}
          <Box sx={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'flex-start',
            justifyContent: 'center',
            gap: 4,
            width: '100%'
          }}>
            {/* Left side - Color Wheel */}
            <Box sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 1,
              mb: 2
            }}>
              <div 
                style={{ 
                  position: 'relative',
                  width: '240px',
                  height: '240px',
                  cursor: 'crosshair'
                }}
              >
                <Wheel
                  color={selectedColor}
                  onChange={(color) => {
                    const hex = color.hex.toUpperCase();
                    setSelectedColor(hex);
                    setHexInput(hex.replace('#', ''));
                    const newRgb = ColorTheory.hexToRgb(hex);
                    setRgbColor(newRgb);
                    // Update gray value (L from HSL)
                    const { l } = rgbToHsl(newRgb.r, newRgb.g, newRgb.b);
                    setGrayscaleValue(Math.round(l * 255 / 100));
                    // Focus the HEX input
                    if (hexInputRef.current) {
                      hexInputRef.current.focus();
                    }
                  }}
                  style={{
                    width: '240px',
                    height: '240px',
                    touchAction: 'none'
                  }}
                />
              </div>
              <Typography sx={{ 
                fontFamily: "'JetBrains Mono', 'Courier New', monospace",
                color: 'var(--text-primary)',
                fontSize: '0.875rem',
                whiteSpace: 'nowrap',
                minWidth: '240px',
                mr: -0.5  
              }}>
                RGB: {rgbColor.r.toString().padStart(3)}, {rgbColor.g.toString().padStart(3)}, {rgbColor.b.toString().padStart(3)}
              </Typography>
            </Box>

            {/* Right side - Controls */}
            <Box sx={{
              display: 'flex',
              flexDirection: 'column',
              gap: 3,
              flex: 1,
              maxWidth: '400px',
              pt: 1
            }}>
              {/* Title */}
              <Typography sx={{
                fontFamily: "'JetBrains Mono', 'Courier New', monospace",
                fontSize: '1rem',
                color: 'var(--text-primary)',
                ml: -1  // Align with color swatch
              }}>
                SINGLE COLOR APPLICATION
              </Typography>

              {/* Color Swatch and HEX Input on same line */}
              <Box sx={{ 
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                ml: -1 // Adjust to align with wheel
              }}>
                <Box
                  sx={{
                    width: '54px',
                    height: '54px',
                    backgroundColor: selectedColor,
                    borderRadius: '50%',
                    border: '1px solid var(--border-color)',
                    boxShadow: '0 0 0 1px rgba(0, 0, 0, 0.1)',
                    flexShrink: 0
                  }}
                />

                <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                  <SwatchDropdownField
                    ref={hexInputRef}
                    value={hexInput}
                    onChange={(e) => {
                      const newHex = e.target.value.toUpperCase();
                      setHexInput(newHex);
                      // Only update preview if it's a valid HEX
                      if (/^[0-9A-F]{6}$/.test(newHex)) {
                        const hex = '#' + newHex;
                        setSelectedColor(hex);
                        setRgbColor(ColorTheory.hexToRgb(hex));
                      }
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        const hex = '#' + hexInput;
                        setSelectedColor(hex);
                        const newRgb = hexToRgb(hex);
                        setRgbColor(newRgb);
                        // Update gray value
                        const grayValue = Math.round((newRgb.r + newRgb.g + newRgb.b) / 3);
                        setGrayscaleValue(grayValue);
                        applyColor();
                      }
                    }}
                    placeholder={GILDAN_64[0].hex.replace('#', '')}
                    startIcon={<TagIcon />}
                    hasReset
                    onReset={resetColor}
                    options={GILDAN_64}
                    onSelectionChange={(selected) => {
                      // Only for catalog colors
                      const hex = selected.hex;
                      setHexInput(hex.replace('#', ''));
                      setSelectedColor(hex);
                      setRgbColor(ColorTheory.hexToRgb(hex));
                      updateSingleColor(hex);
                    }}
                    sx={{ 
                      minWidth: '160px',
                      maxWidth: '200px',
                      '& .MuiOutlinedInput-root': {
                        paddingLeft: '8px'
                      }
                    }}
                  />
                  <Typography sx={{ 
                    fontFamily: "'JetBrains Mono', 'Courier New', monospace",
                    fontSize: '0.75rem',
                    color: 'var(--text-secondary)',
                    mt: 1,
                    ml: 1,
                    letterSpacing: '0.05em'
                  }}>
                    {colorCatalog.find(c => c.hex.replace('#', '') === hexInput)?.name?.toUpperCase() || '\u00A0'}
                  </Typography>
                </Box>
              </Box>

              {/* Grayscale Controls */}
              <Box sx={{
                position: 'relative',
                width: '100%',
                height: '24px',
                mt: 3,  // Add margin top
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

              {/* Gray value display */}
              <Box sx={{ 
                display: 'flex',
                alignItems: 'center',
                gap: 0,  
                mt: 1
              }}>
                <Typography sx={{ 
                  fontFamily: "'JetBrains Mono', 'Courier New', monospace",
                  color: 'var(--text-primary)',
                  fontSize: '0.875rem',
                  whiteSpace: 'nowrap',
                  minWidth: '120px',
                  mr: -0.5  
                }}>
                  GRAY Value: {grayscaleValue}
                </Typography>
                <Box
                  onClick={handleGraySwatchClick}
                  sx={{
                    width: 40,
                    height: 40,
                    flexShrink: 0,
                    backgroundColor: `rgb(${grayscaleValue}, ${grayscaleValue}, ${grayscaleValue})`,
                    borderRadius: '50%',
                    border: '1px solid var(--border-color)',
                    boxShadow: '0 0 0 1px rgba(0, 0, 0, 0.1)',
                    cursor: 'pointer',
                    transition: 'box-shadow 0.2s',
                    ml: 2,  
                    '&:hover': {
                      boxShadow: '0 0 0 2px var(--glow-color)',
                    }
                  }}
                />
              </Box>

            </Box>
          </Box>

          {/* Divider */}
          <Box sx={{ 
            width: '100%',  
            height: '1px',  
            bgcolor: 'var(--border-subtle)',
            mb: 2 
          }} />

          {/* Batch Processing */}
          <Box sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 2,
            width: '100%',
            maxWidth: '800px'
          }}>
            {/* Catalog selector */}
            <Box sx={{ 
              display: 'flex',  
              justifyContent: 'center',
              gap: 2,
              width: '100%',
              mb: 1
            }}>
              <GlowTextButton
                variant="contained"
                onClick={() => {
                  setActiveCatalog('GILDAN_64000');
                  setCatalogColors(GILDAN_64);
                }}
                sx={{ 
                  width: '180px',
                  backgroundColor: activeCatalog === 'GILDAN_64000' ? 'var(--primary-main)' : 'transparent'
                }}
              >
                GILDAN 64000
              </GlowTextButton>
              <GlowTextButton
                variant="contained"
                onClick={() => {
                  setActiveCatalog('GILDAN_3000');
                  setCatalogColors(GILDAN_3000);
                }}
                sx={{ 
                  width: '180px',
                  backgroundColor: activeCatalog === 'GILDAN_3000' ? 'var(--primary-main)' : 'transparent'
                }}
              >
                GILDAN 3000
              </GlowTextButton>
            </Box>

            {/* Batch Processing Box */}
            <Box sx={{
              display: 'flex',
              flexDirection: 'column',
              gap: 2,
              alignItems: 'center',
              p: 3,
              borderRadius: '8px',
              bgcolor: 'var(--bg-secondary)',
              border: '1px solid var(--border-subtle)',
              width: '100%'
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
                mb: 1
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
                  mt: 2
                }}>
                  <Typography variant="subtitle2" sx={{ 
                    mb: 1,  
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

          {/* HEXTRA Color System */}
          <HCS 
            catalog={catalogColors}
            onColorApply={updateSingleColor}
          />
        </Box>
      </Box>
    </Box>
  );
}

export default App;
