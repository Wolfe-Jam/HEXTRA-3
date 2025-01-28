import 'react-app-polyfill/stable';
import { Buffer } from 'buffer';
import process from 'process';

// Ensure Buffer is available globally
if (typeof window !== 'undefined') {
  window.Buffer = window.Buffer || Buffer;
}

// Ensure process is available globally
if (typeof window !== 'undefined') {
  window.process = window.process || process;
}

// Import Jimp after polyfills are set up
import Jimp from 'jimp';

export default Jimp;
