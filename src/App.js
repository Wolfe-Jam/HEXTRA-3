import React, { useState, useEffect, useRef } from 'react';
import { Box, Button, Typography, Tooltip, Slider, CircularProgress, LinearProgress } from '@mui/material';
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
import ColorDemo from './components/ColorDemo';
import GILDAN_64 from './data/catalogs/gildan64';
import GILDAN_3000 from './data/catalogs/gildan3000';
import './theme.css';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import { RefreshRounded as ResetIcon, LinkRounded as LinkIcon } from '@mui/icons-material';
import { TextField, InputAdornment, IconButton } from '@mui/material';
import TagIcon from '@mui/icons-material/Tag';

const DEFAULT_COLOR = '#FED141';
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
const VERSION = '1.2.7'; // Starting new features after THE IMAGE FACTORY

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

  // MEZMERIZE States
  const [isBatchMode, setIsBatchMode] = useState(false);
  const [batchResults, setBatchResults] = useState([]);
  const [batchProgress, setBatchProgress] = useState(0);
  const [batchStatus, setBatchStatus] = useState('idle'); // idle, processing, complete, error
  const [selectedColors, setSelectedColors] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [processedCount, setProcessedCount] = useState(0);

  // Add state for catalog colors
  const [activeCatalog, setActiveCatalog] = useState('GILDAN_64');
  const [catalogColors, setCatalogColors] = useState(GILDAN_64);

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
          const luminance = LUMINANCE_METHODS[luminanceMethod].calculate(red, green, blue);
          
          // Always apply color to working image, keep test image grayscale
          if (useTestImage) {
            const value = Math.round(luminance * 255);
            this.bitmap.data[idx + 0] = value;
            this.bitmap.data[idx + 1] = value;
            this.bitmap.data[idx + 2] = value;
          } else {
            this.bitmap.data[idx + 0] = Math.round(rgbColor.r * luminance);
            this.bitmap.data[idx + 1] = Math.round(rgbColor.g * luminance);
            this.bitmap.data[idx + 2] = Math.round(rgbColor.b * luminance);
          }
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

  const handleImageUpload = async (file) => {
    if (!file) return;
    
    const url = URL.createObjectURL(file);
    
    try {
      const image = await Jimp.read(await file.arrayBuffer());
      
      if (useTestImage) {
        setTestImage(file);
        setTestImageUrl(url);
        setTestProcessedUrl(url);
      } else {
        setWorkingImage(file);
        setWorkingImageUrl(url);
        setWorkingProcessedUrl(url);
      }
      
      setOriginalImage(image);
      setImageLoaded(true);
      setError('');
      
      if (rgbColor) {
        setTimeout(() => applyColor(), 0);
      }
    } catch (err) {
      console.error('Error loading image:', err);
      setError('Error loading image');
      setImageLoaded(false);
    }
  };

  const handleLoadUrl = () => {
    if (!urlInput.trim()) {
      window.open('https://www.google.com/search?q=white+t-shirt+mockup&tbm=isch', '_blank');
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
    if (!processedImage || !canDownload) return;
    
    const currentDate = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    const filename = `HEXTRA-${currentDate}-${selectedColor.replace('#', '')}.png`;
    
    const link = document.createElement('a');
    link.href = useTestImage ? testProcessedUrl : workingProcessedUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
      
      for (let i = 0; i < colors.length; i++) {
        const color = colors[i];
        console.log(`Processing color: ${color.name} (${color.hex})`);
        
        const rgb = hexToRgb(color.hex);
        if (!rgb) {
          console.error(`Invalid hex color: ${color.hex}`);
          continue;
        }
        
        // Clone the original image for this color
        const colorized = originalImage.clone();
        
        // Process the image
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
        
        // Get base64 data
        const base64 = await new Promise((resolve, reject) => {
          colorized.getBase64(Jimp.MIME_PNG, (err, base64) => {
            if (err) {
              console.error('Error generating base64:', err);
              reject(err);
            } else {
              resolve(base64);
            }
          });
        });
        
        // Add to zip with descriptive filename
        const colorCode = color.hex.replace('#', '');
        const colorName = color.name ? color.name.replace(/[^a-z0-9]/gi, '_').toLowerCase() : 'color';
        const filename = `${colorName}_${colorCode}.png`;
        
        // Convert base64 to binary and add to zip
        const imageData = base64.replace(/^data:image\/\w+;base64,/, "");
        folder.file(filename, imageData, {base64: true});
        
        console.log(`Added ${filename} to ZIP`);
        
        // Update progress
        setProcessedCount(i + 1);
        setTotalCount(colors.length);
        setBatchProgress(Math.round(((i + 1) / colors.length) * 100));
      }
      
      console.log('Generating final ZIP file...');
      
      // Generate and download zip
      const content = await zip.generateAsync({
        type: "blob",
        compression: "DEFLATE",
        compressionOptions: {
          level: 9
        }
      });
      
      console.log('ZIP generated, size:', content.size);
      
      // Create download link
      const url = window.URL.createObjectURL(content);
      const link = document.createElement('a');
      link.href = url;
      link.download = `hextra-colors-${activeCatalog.toLowerCase()}.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      console.log('Download initiated');
      setBatchStatus('complete');
      
    } catch (err) {
      console.error('Error in batch processing:', err);
      setError(`Error generating all: ${err.message}`);
      setBatchStatus('error');
    } finally {
      setIsProcessing(false);
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
      case 'GILDAN_64':
        setActiveCatalog('GILDAN_64');
        setCatalogColors(GILDAN_64);
        break;
      case 'GILDAN_3000':
        setActiveCatalog('GILDAN_3000');
        setCatalogColors(GILDAN_3000);
        break;
      default:
        setActiveCatalog('GILDAN_64');
        setCatalogColors(GILDAN_64);
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
      {/* Section A: Banner */}
      <Banner 
        version="1.2.7"
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

            {/* Section C: Grayscale Tool Bar */}
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

          {/* Section E: Image Loading */}
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

          {/* Section F: Main Image (with integrated download button) */}
          <Box sx={{
            position: 'relative',
            zIndex: 1,  // Lower z-index for image container
            mt: 2,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '200px'
          }}>
            <img
              src={useTestImage ? TEST_IMAGE_URL : workingProcessedUrl}
              alt={useTestImage ? "Test Gradient" : "Processed Image"}
              style={{
                maxWidth: '100%',
                height: 'auto',
                borderRadius: '4px',
                border: '1px solid var(--border-color)'
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
            zIndex: 2  // Higher z-index for controls
          }}>
            {/* Luminance Method Buttons */}
            <Box sx={{ mb: 3 }}>
              <GlowToggleGroup
                options={Object.entries(LUMINANCE_METHODS).map(([key, method]) => ({
                  value: key,
                  label: method.label,
                  tooltip: method.tooltip
                }))}
                value={luminanceMethod}
                onChange={(value) => {
                  setLuminanceMethod(value);
                  if (imageLoaded) {
                    setTimeout(() => applyColor(), 0);
                  }
                }}
                showTooltips={showTooltips}
              />
            </Box>

            {/* Enhancement and Tooltip Controls */}
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
              <GlowSwitch
                checked={useTestImage}
                onChange={(e) => setUseTestImage(e.target.checked)}
                label="Test Image"
              />
            </Box>
            {/* Sliders */}
            <Box sx={{ px: 3 }}>
              <Box sx={{ mb: 2 }}>
                <Typography gutterBottom sx={{ 
                  fontFamily: "'Inter', sans-serif",
                  letterSpacing: '0.05em',
                  color: 'rgba(128, 128, 128, 0.5)'
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
                    color: 'rgba(128, 128, 128, 0.5)',
                    '& .MuiSlider-thumb': {
                      color: 'rgba(128, 128, 128, 0.5)',
                    },
                    '& .MuiSlider-track': {
                      color: 'rgba(128, 128, 128, 0.5)',
                    },
                    '& .MuiSlider-rail': {
                      color: 'rgba(128, 128, 128, 0.5)',
                    }
                  }}
                />
              </Box>
              <Box>
                <Typography gutterBottom sx={{ 
                  fontFamily: "'Inter', sans-serif",
                  letterSpacing: '0.05em',
                  color: 'rgba(128, 128, 128, 0.5)'
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
                    color: 'rgba(128, 128, 128, 0.5)',
                    '& .MuiSlider-thumb': {
                      color: 'rgba(128, 128, 128, 0.5)',
                    },
                    '& .MuiSlider-track': {
                      color: 'rgba(128, 128, 128, 0.5)',
                    },
                    '& .MuiSlider-rail': {
                      color: 'rgba(128, 128, 128, 0.5)',
                    }
                  }}
                />
              </Box>
            </Box>
          </Box>

          {/* Section H: MESMERIZE */}
          <Box sx={{ 
            width: '100%',
            mt: 4,
            pt: 4,
            borderTop: '1px solid var(--border-subtle)'
          }}>
            {/* MESMERIZE Section Title */}
            <Typography 
              variant="subtitle1" 
              component="h2" 
              sx={{ 
                mb: 3,
                textAlign: 'center',
                fontWeight: 500,
                fontFamily: "'League Spartan', sans-serif",
                fontSize: '1rem',
                letterSpacing: '0.25em',
                textTransform: 'uppercase',
                color: 'var(--text-secondary)'
              }}
            >
              MESMERIZE
            </Typography>

            {/* Catalog selector */}
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', mb: 2 }}>
              <GlowTextButton
                variant={activeCatalog === 'GILDAN_64' ? 'contained' : 'outlined'}
                onClick={() => handleCatalogSwitch('GILDAN_64')}
                sx={{ minWidth: '140px' }}
              >
                GILDAN 64
              </GlowTextButton>
              <GlowTextButton
                variant={activeCatalog === 'GILDAN_3000' ? 'contained' : 'outlined'}
                onClick={() => handleCatalogSwitch('GILDAN_3000')}
                sx={{ minWidth: '140px' }}
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
                  sx={{ minWidth: '180px' }}
                >
                  GENERATE ALL
                </GlowTextButton>
                <GlowTextButton
                  variant="contained"
                  onClick={handleGenerateSelected}
                  disabled={isProcessing || !imageLoaded || !selectedColors.length}
                  sx={{ minWidth: '180px' }}
                >
                  GENERATE SELECTED
                </GlowTextButton>
              </Box>

              {/* CSV Upload Button */}
              <GlowTextButton
                component="label"
                variant="contained"
                disabled={isProcessing || batchStatus === 'processing'}
                sx={{ width: '200px' }}
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
                  <Typography variant="body2" sx={{ mb: 1, textAlign: 'center', color: 'var(--text-secondary)' }}>
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

        </Box>
      </Box>
      <ColorDemo catalog={catalogColors} />
    </Box>
  );
}

export default App;
