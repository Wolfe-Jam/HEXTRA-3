// Import polyfills
import 'react-app-polyfill/stable';
import { Buffer } from 'buffer';
import process from 'process';

// Set up required globals
if (typeof window !== 'undefined') {
  window.Buffer = Buffer;
  window.process = process;
}

// Import Jimp
import Jimp from 'jimp';

// Configure Jimp for browser
Jimp.configure({
  disableWebWorkers: true,
  maxMemoryUsageInMB: 512
});

export default Jimp;
