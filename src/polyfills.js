// React polyfills
import 'react-app-polyfill/stable';
import 'core-js/stable';
import 'regenerator-runtime/runtime';

// Node.js polyfills
import { Buffer } from 'buffer';
import process from 'process';
import 'core-js/features/array/flat';
import 'core-js/features/array/flat-map';
import 'core-js/features/object/from-entries';
import 'core-js/features/promise/finally';
import 'core-js/features/string/pad-start';
import 'core-js/features/string/pad-end';
import 'core-js/features/url';
import 'core-js/features/url-search-params';
import 'stream-browserify';
import 'buffer';

// Ensure polyfills are available globally
if (typeof window !== 'undefined') {
  window.Buffer = window.Buffer || Buffer;
  window.process = window.process || process;
  window.global = window;
  
  // Use URLSearchParams instead of querystring
  window.URLSearchParams = window.URLSearchParams || URLSearchParams;
  window.URL = window.URL || URL;
}

// Ensure fs is mocked
if (typeof window !== 'undefined') {
  window.fs = {
    readFileSync: () => {},
    writeFileSync: () => {},
    existsSync: () => false
  };
}
