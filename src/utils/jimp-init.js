import 'react-app-polyfill/stable';
import { Buffer } from 'buffer';
import process from 'process';

// Import specific parts of Jimp
import { read, MIME_PNG } from 'jimp/es';

// Ensure Buffer is available globally
if (typeof window !== 'undefined') {
  window.Buffer = window.Buffer || Buffer;
  window.process = window.process || process;
  
  // Add any missing browser APIs that Jimp might need
  if (!window.TextDecoder) {
    window.TextDecoder = require('text-encoding').TextDecoder;
  }
  
  if (!window.TextEncoder) {
    window.TextEncoder = require('text-encoding').TextEncoder;
  }
}

export { read as jimpRead, MIME_PNG };
