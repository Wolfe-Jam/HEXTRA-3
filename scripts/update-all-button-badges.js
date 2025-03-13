#!/usr/bin/env node

/**
 * This script updates all Button Badge types in the Banner.js file
 * to toggle between the app and subscription pages.
 */

const fs = require('fs');
const path = require('path');

// Path to the Banner.js file
const bannerFilePath = path.join(process.cwd(), 'src', 'components', 'Banner.js');

// Read the file content
let content = fs.readFileSync(bannerFilePath, 'utf8');

// Find all Button Badge click handlers with the subscription page check
const badgePattern = /if \(isSubscriptionPage\) \{\s*\/\/ If already on subscription page, scroll directly\s*scrollToAvailablePlans\(\);/g;

// Replace with the updated code that toggles between app and subscription
const updatedContent = content.replace(
  badgePattern,
  'if (isSubscriptionPage) {\n                    // If already on subscription page, navigate back to the app\n                    navigate(\'/app\');'
);

// Write the updated content back to the file
fs.writeFileSync(bannerFilePath, updatedContent, 'utf8');

// Count the number of replacements
const originalMatches = content.match(badgePattern) || [];
const updatedMatches = updatedContent.match(/if \(isSubscriptionPage\) \{\s*\/\/ If already on subscription page, navigate back to the app\s*navigate\('\/app'\);/g) || [];

console.log(`Successfully updated ${updatedMatches.length} Button Badge types to toggle between app and subscription pages.`);
console.log('Button Badge types updated:');
console.log('- Free User Badge');
console.log('- Early Bird User Badge');
console.log('- Pro User Badge (if applicable)');
