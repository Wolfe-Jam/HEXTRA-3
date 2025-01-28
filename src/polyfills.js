// React polyfills
import 'react-app-polyfill/stable';
import 'core-js/stable';
import 'regenerator-runtime/runtime';

// Node.js polyfills
import { Buffer } from 'buffer';
import process from 'process';

// Ensure polyfills are available globally
if (typeof window !== 'undefined') {
  window.Buffer = window.Buffer || Buffer;
  window.process = window.process || process;
  window.global = window;
}

// Additional polyfills for specific features
import 'core-js/features/array/flat';
import 'core-js/features/array/flat-map';
import 'core-js/features/object/from-entries';
import 'core-js/features/promise/finally';
import 'core-js/features/string/pad-start';
import 'core-js/features/string/pad-end';

// Stream polyfills
import 'stream-browserify';
import 'buffer';

// Ensure fs is mocked
if (typeof window !== 'undefined') {
  window.fs = {
    readFileSync: () => {},
    writeFileSync: () => {},
    existsSync: () => false
  };
}
