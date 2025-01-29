import 'react-app-polyfill/stable';
import { Buffer } from 'buffer';
import process from 'process';
import Jimp from 'jimp/es';

// Ensure Buffer is available globally
if (typeof window !== 'undefined') {
  window.Buffer = window.Buffer || Buffer;
}

// Ensure process is available globally
if (typeof window !== 'undefined') {
  window.process = window.process || process;
}

export default Jimp;
