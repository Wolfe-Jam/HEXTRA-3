#!/usr/bin/env node

/**
 * API Route Format Fixer for Vercel Deployment
 * 
 * This script automatically converts CommonJS module.exports in API routes
 * to the Next.js export default format required by Vercel.
 * 
 * Usage:
 *   node fix-api-routes.js
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

console.log(`\n${colors.bright}${colors.cyan}=== API ROUTE FORMAT FIXER FOR VERCEL ===${colors.reset}\n`);
console.log(`${colors.dim}This script converts CommonJS module.exports to Next.js export default format${colors.reset}\n`);

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
  
  // Check if file uses CommonJS exports
  const hasCommonJSExport = /module\.exports\s*=\s*\w+\s*;?/.test(content);
  
  // Check if file already has default export
  const hasDefaultExport = /export\s+default\s+(async\s+)?function\s+\w+\s*\(/.test(content) || 
                          /export\s+default\s+\w+\s*;/.test(content);
  
  if (hasCommonJSExport && !hasDefaultExport) {
    try {
      // Extract the handler function name
      const handlerMatch = content.match(/(?:async\s+)?function\s+(\w+)\s*\([^)]*\)/);
      const handlerName = handlerMatch ? handlerMatch[1] : null;
      
      if (!handlerName) {
        console.log(`${colors.yellow}⚠ Skipping ${fileName}: Could not identify handler function${colors.reset}`);
        errorCount++;
        return;
      }
      
      // Replace CommonJS export with ES module export
      const newContent = content.replace(
        /\/\/\s*Export.*\s*module\.exports\s*=\s*\w+\s*;?/,
        `// Export handler using Next.js API route format for Vercel compatibility\nexport default ${handlerName};`
      );
      
      // If the above replacement didn't work, try a more generic approach
      if (newContent === content) {
        const newContent2 = content.replace(
          /module\.exports\s*=\s*\w+\s*;?/,
          `export default ${handlerName};`
        );
        
        if (newContent2 !== content) {
          fs.writeFileSync(file, newContent2, 'utf8');
          console.log(`${colors.green}✓ Fixed ${fileName}${colors.reset}`);
          fixedCount++;
          return;
        } else {
          console.log(`${colors.yellow}⚠ Could not fix ${fileName}: Pattern not matched${colors.reset}`);
          errorCount++;
          return;
        }
      }
      
      fs.writeFileSync(file, newContent, 'utf8');
      console.log(`${colors.green}✓ Fixed ${fileName}${colors.reset}`);
      fixedCount++;
    } catch (error) {
      console.log(`${colors.red}✗ Error fixing ${fileName}: ${error.message}${colors.reset}`);
      errorCount++;
    }
  } else if (hasDefaultExport) {
    console.log(`${colors.blue}✓ ${fileName} already uses correct format${colors.reset}`);
    alreadyCorrectCount++;
  } else {
    console.log(`${colors.yellow}⚠ Skipping ${fileName}: No export pattern detected${colors.reset}`);
    errorCount++;
  }
});

console.log(`\n${colors.bright}=== SUMMARY ===${colors.reset}`);
console.log(`${colors.green}✓ Fixed: ${fixedCount} files${colors.reset}`);
console.log(`${colors.blue}✓ Already correct: ${alreadyCorrectCount} files${colors.reset}`);
console.log(`${colors.yellow}⚠ Skipped/Errors: ${errorCount} files${colors.reset}`);

if (fixedCount > 0) {
  console.log(`\n${colors.bright}${colors.green}Successfully fixed ${fixedCount} API routes!${colors.reset}`);
  console.log(`${colors.dim}These changes should resolve the Vercel deployment issues.${colors.reset}`);
} else if (alreadyCorrectCount === apiFiles.length) {
  console.log(`\n${colors.bright}${colors.green}All API routes are already using the correct format!${colors.reset}`);
} else {
  console.log(`\n${colors.bright}${colors.yellow}Some files could not be automatically fixed.${colors.reset}`);
  console.log(`${colors.dim}You may need to manually update these files to use the export default format.${colors.reset}`);
}

console.log(`\n${colors.dim}Next steps:${colors.reset}`);
console.log(`${colors.dim}1. Run 'node scripts/check-vercel-deployment.js' to verify the changes${colors.reset}`);
console.log(`${colors.dim}2. Commit and push the changes to trigger a new Vercel build${colors.reset}\n`);
