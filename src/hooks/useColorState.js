import { useState, useCallback } from 'react';

const useColorState = () => {
  const [hexInput, setHexInput] = useState('#000000');
  const [selectedColor, setSelectedColor] = useState({ r: 0, g: 0, b: 0 });
  const [activeCatalog, setActiveCatalog] = useState('basic');

  const catalogColors = {
    basic: [
      { r: 255, g: 0, b: 0 },
      { r: 0, g: 255, b: 0 },
      { r: 0, g: 0, b: 255 },
    ],
    grayscale: Array.from({ length: 11 }, (_, i) => {
      const value = Math.round((i / 10) * 255);
      return { r: value, g: value, b: value };
    }),
  };

  const rgbColor = selectedColor;

  const handleColorChange = useCallback((color) => {
    setSelectedColor(color);
    setHexInput(rgbToHex(color.r, color.g, color.b));
  }, []);

  const handleWheelClick = useCallback((color) => {
    handleColorChange(color);
  }, [handleColorChange]);

  const handleCatalogSwitch = useCallback((catalog) => {
    setActiveCatalog(catalog);
  }, []);

  const handleDropdownSelection = useCallback((color) => {
    handleColorChange(color);
  }, [handleColorChange]);

  const handleHexKeyPress = useCallback((event) => {
    if (event.key === 'Enter') {
      const color = hexToRgb(hexInput);
      if (color) {
        handleColorChange(color);
      }
    }
  }, [hexInput, handleColorChange]);

  const handleGraySwatchClick = useCallback((value) => {
    const color = { r: value, g: value, b: value };
    handleColorChange(color);
  }, [handleColorChange]);

  const resetColor = useCallback(() => {
    handleColorChange({ r: 0, g: 0, b: 0 });
  }, [handleColorChange]);

  const applyColor = useCallback(async () => {
    // Implement color application logic here
    console.log('Applying color:', selectedColor);
  }, [selectedColor]);

  return {
    hexInput,
    setHexInput,
    selectedColor,
    rgbColor,
    catalogColors,
    activeCatalog,
    handleColorChange,
    handleWheelClick,
    handleCatalogSwitch,
    handleDropdownSelection,
    handleHexKeyPress,
    handleGraySwatchClick,
    resetColor,
    applyColor,
  };
};

// Helper functions
function rgbToHex(r, g, b) {
  return '#' + [r, g, b].map(x => {
    const hex = x.toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  }).join('');
}

function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}

export default useColorState;
