/**
 * Color utility functions for the HEXTRA-3 app
 */

/**
 * Converts a hex color string to an RGB object
 * @param {string} hex - The hex color string (e.g., "#RRGGBB")
 * @returns {Object|null} - An object with r, g, b properties or null if invalid
 */
export function hexToRgb(hex) {
  if (!hex || typeof hex !== 'string') {
    return null;
  }

  // Remove the # if present
  hex = hex.replace(/^#/, '');

  // Handle both 3-digit and 6-digit formats
  if (hex.length === 3) {
    hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
  }

  // Validate the hex format
  if (!/^[0-9A-F]{6}$/i.test(hex)) {
    return null;
  }

  // Parse the hex values to integers
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);

  return { r, g, b };
}

/**
 * Converts an RGB object to a hex color string
 * @param {Object} rgb - An object with r, g, b properties
 * @returns {string} - The hex color string (e.g., "#RRGGBB")
 */
export function rgbToHex(rgb) {
  if (!rgb || typeof rgb !== 'object' || 
      rgb.r === undefined || rgb.g === undefined || rgb.b === undefined) {
    return '#000000';
  }

  // Ensure values are within 0-255 range
  const r = Math.max(0, Math.min(255, rgb.r));
  const g = Math.max(0, Math.min(255, rgb.g));
  const b = Math.max(0, Math.min(255, rgb.b));

  // Convert to hex and pad with 0 if needed
  const hexR = r.toString(16).padStart(2, '0');
  const hexG = g.toString(16).padStart(2, '0');
  const hexB = b.toString(16).padStart(2, '0');

  return `#${hexR}${hexG}${hexB}`.toUpperCase();
}

/**
 * Validates if a string is a valid hex color
 * @param {string} hex - The hex color string to validate
 * @returns {boolean} - True if valid, false otherwise
 */
export function isValidHexColor(hex) {
  if (!hex || typeof hex !== 'string') {
    return false;
  }
  
  // Check if it's a valid hex color with or without the # symbol
  return /^#?[0-9A-F]{6}$/i.test(hex);
}

/**
 * Ensures a hex color string starts with #
 * @param {string} hex - The hex color string
 * @returns {string} - The hex color with # added if needed
 */
export function ensureHexPrefix(hex) {
  if (!hex || typeof hex !== 'string') {
    return '#000000';
  }
  
  return hex.startsWith('#') ? hex : `#${hex}`;
}
