#!/usr/bin/env node

/**
 * This script updates the scroll behavior in the Banner.js file
 * to scroll to the center of the page instead of a fixed position.
 */

const fs = require('fs');
const path = require('path');

// Path to the Banner.js file
const bannerFilePath = path.join(process.cwd(), 'src', 'components', 'Banner.js');

// Read the file content
let content = fs.readFileSync(bannerFilePath, 'utf8');

// Find all scroll functions in the Button Badge handlers
const scrollFunctionPattern = /const scrollToAvailablePlans = \(\) => \{\s*console\.log\('Scrolling to Available Plans section'\);\s*\/\/ Use a reliable fixed position that works across devices\s*window\.scrollTo\(\{\s*top: 500,\s*behavior: 'smooth'\s*\}\);\s*\};/g;

// Replace with the updated code that scrolls to the center of the page
const updatedScrollFunction = `const scrollToAvailablePlans = () => {
                    console.log('Scrolling to center of page where Available Plans are located');
                    // Scroll to center of page - works reliably across all devices
                    setTimeout(() => {
                      const pageHeight = document.documentElement.scrollHeight;
                      window.scrollTo({
                        top: pageHeight / 2 - 200, // Slightly above center for better visibility
                        behavior: 'smooth'
                      });
                    }, 100); // Small delay to ensure page is rendered
                  };`;

// Replace the scroll function
const updatedContent = content.replace(scrollFunctionPattern, updatedScrollFunction);

// Write the updated content back to the file
fs.writeFileSync(bannerFilePath, updatedContent, 'utf8');

// Count the number of replacements
const originalMatches = content.match(scrollFunctionPattern) || [];

console.log(`Successfully updated ${originalMatches.length} scroll functions to use center-of-page scrolling.`);
console.log('This change will make the "Available Plans" section more accessible across all devices.');
console.log('Tip: You can adjust the position of the Cards in the subscription page to ensure they appear in the center of the page.');
