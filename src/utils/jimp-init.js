import 'react-app-polyfill/stable';
import { Buffer } from 'buffer';
import process from 'process';
import Jimp from 'jimp';

// Ensure Buffer is available globally
if (typeof window !== 'undefined') {
  window.Buffer = window.Buffer || Buffer;
}

// Ensure process is available globally
if (typeof window !== 'undefined') {
  window.process = window.process || process;
  window.global = window;
}

// Initialize Jimp with required settings
Jimp.prototype.hasAlpha = function() {
  return this.bitmap.data.length === this.bitmap.width * this.bitmap.height * 4;
};

export default Jimp;
