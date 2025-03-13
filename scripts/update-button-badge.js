#!/usr/bin/env node

/**
 * This script updates the Button Badge in the Banner.js file
 * to toggle between the app and subscription pages.
 */

const fs = require('fs');
const path = require('path');

// Path to the Banner.js file
const bannerFilePath = path.join(process.cwd(), 'src', 'components', 'Banner.js');

// Read the file content
let content = fs.readFileSync(bannerFilePath, 'utf8');

// Find the Early Bird User button badge code
const earlyBirdButtonRegex = /title={\`Early Bird User: \${emailUser\.email \|\| 'Email User'}\`}[\s\S]*?if \(isSubscriptionPage\) \{[\s\S]*?\/\/ If already on subscription page, scroll directly[\s\S]*?scrollToAvailablePlans\(\);[\s\S]*?\} else \{/;

// Replace with the updated code that toggles between app and subscription
const updatedContent = content.replace(
  earlyBirdButtonRegex,
  (match) => match.replace(
    '// If already on subscription page, scroll directly\n                    scrollToAvailablePlans();',
    '// If already on subscription page, navigate back to the app\n                    navigate(\'/app\');'
  )
);

// Write the updated content back to the file
fs.writeFileSync(bannerFilePath, updatedContent, 'utf8');

console.log('Successfully updated the Button Badge to toggle between app and subscription pages.');
