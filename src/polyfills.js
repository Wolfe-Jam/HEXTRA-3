// Import polyfills
import 'react-app-polyfill/stable';
import 'core-js/stable';
import 'regenerator-runtime/runtime';

// Node.js polyfills
import { Buffer } from 'buffer';
import process from 'process';

// Browser globals
window.Buffer = Buffer;
window.process = process;

// Additional polyfills for specific features
import 'core-js/features/array/flat';
import 'core-js/features/array/flat-map';
import 'core-js/features/object/from-entries';
import 'core-js/features/promise/finally';
import 'core-js/features/string/pad-start';
import 'core-js/features/string/pad-end';

// Stream polyfills for Jimp
import 'stream-browserify';
import 'buffer';
