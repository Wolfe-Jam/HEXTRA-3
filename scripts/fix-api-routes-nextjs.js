#!/usr/bin/env node

/**
 * Next.js API Route Format Fixer for Vercel Deployment
 * 
 * This script converts API routes to the exact Next.js format required by Vercel:
 * export default async function handler(req, res) { ... }
 * 
 * Usage:
 *   node fix-api-routes-nextjs.js
 */

const fs = require('fs');
const path = require('path');

// ANSI color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

console.log(`\n${colors.bright}${colors.cyan}=== NEXT.JS API ROUTE FORMAT FIXER FOR VERCEL ===${colors.reset}\n`);
console.log(`${colors.dim}This script converts API routes to the exact Next.js format required by Vercel${colors.reset}\n`);

// Path to API routes directory
const apiDir = path.join(process.cwd(), 'src', 'pages', 'api');

if (!fs.existsSync(apiDir)) {
  console.log(`${colors.red}Error: API directory not found at ${apiDir}${colors.reset}`);
  process.exit(1);
}

// Get all JS files in the API directory
const apiFiles = fs.readdirSync(apiDir)
  .filter(file => file.endsWith('.js') || file.endsWith('.ts'))
  .map(file => path.join(apiDir, file));

console.log(`${colors.blue}Found ${apiFiles.length} API route files${colors.reset}\n`);

let fixedCount = 0;
let alreadyCorrectCount = 0;
let errorCount = 0;

// Process each API file
apiFiles.forEach(file => {
  const fileName = path.basename(file);
  let content = fs.readFileSync(file, 'utf8');
  
  // Check if file already has the exact Next.js handler format
  const hasExactNextJsFormat = /export\s+default\s+(async\s+)?function\s+handler\s*\([^)]*\)/.test(content);
  
  if (hasExactNextJsFormat) {
    console.log(`${colors.blue}✓ ${fileName} already uses correct Next.js format${colors.reset}`);
    alreadyCorrectCount++;
    return;
  }
  
  try {
    // Check for named function pattern
    const namedFunctionMatch = content.match(/(?:async\s+)?function\s+(\w+)\s*\(([^)]*)\)\s*{/);
    
    // Check for export default pattern
    const exportDefaultMatch = content.match(/export\s+default\s+(\w+)\s*;/);
    
    if (namedFunctionMatch && exportDefaultMatch) {
      const functionName = namedFunctionMatch[1];
      const functionParams = namedFunctionMatch[2];
      const exportedName = exportDefaultMatch[1];
      
      // Only proceed if the exported name matches the function name
      if (functionName === exportedName) {
        // Extract function body by finding the matching closing brace
        let openBraces = 0;
        let startPos = content.indexOf('{', content.indexOf(`function ${functionName}`));
        let endPos = -1;
        
        for (let i = startPos; i < content.length; i++) {
          if (content[i] === '{') openBraces++;
          if (content[i] === '}') openBraces--;
          
          if (openBraces === 0) {
            endPos = i + 1;
            break;
          }
        }
        
        if (endPos > startPos) {
          const functionBody = content.substring(startPos, endPos);
          
          // Check if function is async
          const isAsync = /async\s+function/.test(content);
          const asyncPrefix = isAsync ? 'async ' : '';
          
          // Create new content with the Next.js handler format
          let newContent = content.substring(0, content.indexOf(`function ${functionName}`));
          newContent += `export default ${asyncPrefix}function handler(${functionParams}) ${functionBody}`;
          
          // Remove the old export default statement
          newContent = newContent.replace(/export\s+default\s+\w+\s*;/, '');
          
          // Write the updated content
          fs.writeFileSync(file, newContent, 'utf8');
          console.log(`${colors.green}✓ Fixed ${fileName} to use Next.js handler format${colors.reset}`);
          fixedCount++;
        } else {
          console.log(`${colors.yellow}⚠ Could not determine function body in ${fileName}${colors.reset}`);
          errorCount++;
        }
      } else {
        console.log(`${colors.yellow}⚠ Function name (${functionName}) and exported name (${exportedName}) don't match in ${fileName}${colors.reset}`);
        errorCount++;
      }
    } else {
      console.log(`${colors.yellow}⚠ Could not identify function pattern in ${fileName}${colors.reset}`);
      errorCount++;
    }
  } catch (error) {
    console.log(`${colors.red}✗ Error fixing ${fileName}: ${error.message}${colors.reset}`);
    errorCount++;
  }
});

console.log(`\n${colors.bright}=== SUMMARY ===${colors.reset}`);
console.log(`${colors.green}✓ Fixed: ${fixedCount} files${colors.reset}`);
console.log(`${colors.blue}✓ Already correct: ${alreadyCorrectCount} files${colors.reset}`);
console.log(`${colors.yellow}⚠ Skipped/Errors: ${errorCount} files${colors.reset}`);

if (fixedCount > 0) {
  console.log(`\n${colors.bright}${colors.green}Successfully fixed ${fixedCount} API routes to use Next.js handler format!${colors.reset}`);
  console.log(`${colors.dim}These changes should resolve the Vercel deployment issues.${colors.reset}`);
} else if (alreadyCorrectCount === apiFiles.length) {
  console.log(`\n${colors.bright}${colors.green}All API routes are already using the correct Next.js format!${colors.reset}`);
} else {
  console.log(`\n${colors.bright}${colors.yellow}Some files could not be automatically fixed.${colors.reset}`);
  console.log(`${colors.dim}You may need to manually update these files to use the Next.js handler format.${colors.reset}`);
}

console.log(`\n${colors.dim}Next steps:${colors.reset}`);
console.log(`${colors.dim}1. Run 'node scripts/check-vercel-deployment.js' to verify the changes${colors.reset}`);
console.log(`${colors.dim}2. Commit and push the changes to trigger a new Vercel build${colors.reset}\n`);
