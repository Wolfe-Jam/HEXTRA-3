// Import polyfills
import 'react-app-polyfill/stable';
import { Buffer } from 'buffer';
import process from 'process';

// Set up required globals
window.Buffer = Buffer;
window.process = process;

// Import Jimp browser build
import Jimp from 'jimp/browser/lib/jimp';

// Configure Jimp for browser
Jimp.configure({
  disableWebWorkers: true,
  maxMemoryUsageInMB: 512
});

export default Jimp;
