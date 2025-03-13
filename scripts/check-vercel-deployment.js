#!/usr/bin/env node

/**
 * Vercel Deployment Status Checker
 * 
 * A simple utility to check the status of your Vercel deployments
 * using the Vercel CLI for more reliable results.
 * 
 * Usage:
 *   node check-vercel-deployment.js
 * 
 * @version 1.1.0
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Configuration
const NUM_DEPLOYMENTS = 5; // Number of recent deployments to check

// ANSI color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  bgRed: '\x1b[41m',
  bgGreen: '\x1b[42m',
};

// Get the current git branch
function getCurrentBranch() {
  try {
    return execSync('git rev-parse --abbrev-ref HEAD').toString().trim();
  } catch (error) {
    console.error(`${colors.red}Error getting current branch:${colors.reset}`, error.message);
    return 'unknown';
  }
}

// Get the latest commit hash
function getLatestCommit() {
  try {
    return execSync('git rev-parse HEAD').toString().trim();
  } catch (error) {
    console.error(`${colors.red}Error getting latest commit:${colors.reset}`, error.message);
    return 'unknown';
  }
}

// Run a command and return the output
function runCommand(command) {
  try {
    return execSync(command, { encoding: 'utf8' });
  } catch (error) {
    console.error(`${colors.red}Error running command:${colors.reset}`, error.message);
    return '';
  }
}

// Format the deployment state with color
function formatState(state) {
  switch (state) {
    case 'READY':
      return `${colors.green}READY${colors.reset}`;
    case 'ERROR':
      return `${colors.red}ERROR${colors.reset}`;
    case 'BUILDING':
      return `${colors.yellow}BUILDING${colors.reset}`;
    case 'QUEUED':
      return `${colors.blue}QUEUED${colors.reset}`;
    default:
      return state;
  }
}

// Format the deployment date
function formatDate(timestamp) {
  const date = new Date(timestamp);
  return date.toLocaleString();
}

// Check Vercel configuration
function checkVercelConfig() {
  try {
    console.log(`\n${colors.bright}${colors.cyan}=== VERCEL CONFIGURATION CHECKER ===${colors.reset}\n`);
    console.log(`${colors.bright}Current Branch:${colors.reset} ${getCurrentBranch()}`);
    console.log(`${colors.bright}Latest Commit:${colors.reset} ${getLatestCommit().substring(0, 7)}\n`);
    
    // Check if vercel.json exists
    const vercelConfigPath = path.join(process.cwd(), 'vercel.json');
    if (fs.existsSync(vercelConfigPath)) {
      console.log(`${colors.green}✓${colors.reset} vercel.json found`);
      
      // Validate vercel.json
      try {
        const vercelConfig = JSON.parse(fs.readFileSync(vercelConfigPath, 'utf8'));
        console.log(`${colors.dim}Validating vercel.json...${colors.reset}`);
        
        // Check for common issues
        const issues = [];
        
        // Check for unsupported properties
        const unsupportedProps = ['cacheOutputs', 'functions.includeFiles'];
        unsupportedProps.forEach(prop => {
          const [parent, child] = prop.split('.');
          if (child && vercelConfig[parent] && vercelConfig[parent][child]) {
            issues.push(`Unsupported property: ${prop}`);
          } else if (!child && vercelConfig[parent]) {
            issues.push(`Unsupported property: ${prop}`);
          }
        });
        
        // Report issues
        if (issues.length > 0) {
          console.log(`\n${colors.yellow}${colors.bright}Issues found in vercel.json:${colors.reset}`);
          issues.forEach(issue => {
            console.log(`${colors.yellow}⚠${colors.reset} ${issue}`);
          });
        } else {
          console.log(`${colors.green}✓${colors.reset} No issues found in vercel.json`);
        }
        
        // Display config summary
        console.log(`\n${colors.bright}Configuration Summary:${colors.reset}`);
        console.log(`${colors.bright}Build Command:${colors.reset} ${vercelConfig.buildCommand || 'Not specified'}`);
        console.log(`${colors.bright}Output Directory:${colors.reset} ${vercelConfig.outputDirectory || 'Not specified'}`);
        if (vercelConfig.env) {
          console.log(`${colors.bright}Environment Variables:${colors.reset} ${Object.keys(vercelConfig.env).length} defined`);
        }
      } catch (error) {
        console.log(`${colors.red}✗${colors.reset} Invalid JSON in vercel.json: ${error.message}`);
      }
    } else {
      console.log(`${colors.yellow}⚠${colors.reset} vercel.json not found`);
    }
    
    // Check for recent deployments using Vercel CLI
    console.log(`\n${colors.bright}${colors.cyan}=== RECENT DEPLOYMENTS ===${colors.reset}\n`);
    console.log(`${colors.dim}Checking for recent deployments...${colors.reset}`);
    
    try {
      // Try to get deployment info using Vercel CLI
      const deploymentInfo = runCommand('npx vercel list --limit 5');
      if (deploymentInfo) {
        console.log(deploymentInfo);
      } else {
        console.log(`${colors.yellow}No deployment information available. You may need to run 'vercel login' first.${colors.reset}`);
      }
    } catch (error) {
      console.log(`${colors.yellow}Unable to fetch deployments. You may need to run 'vercel login' first.${colors.reset}`);
    }
    
    // Check build script
    console.log(`\n${colors.bright}${colors.cyan}=== BUILD CONFIGURATION ===${colors.reset}\n`);
    try {
      const packageJsonPath = path.join(process.cwd(), 'package.json');
      if (fs.existsSync(packageJsonPath)) {
        const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
        if (packageJson.scripts && packageJson.scripts['vercel-build']) {
          console.log(`${colors.green}✓${colors.reset} vercel-build script found: ${packageJson.scripts['vercel-build']}`);
        } else {
          console.log(`${colors.yellow}⚠${colors.reset} No vercel-build script found in package.json`);
        }
      }
    } catch (error) {
      console.log(`${colors.red}Error checking package.json:${colors.reset} ${error.message}`);
    }
    
    // Check API routes for Next.js format compliance
    console.log(`\n${colors.bright}${colors.cyan}=== API ROUTES VALIDATION ===${colors.reset}\n`);
    try {
      const apiDir = path.join(process.cwd(), 'src', 'pages', 'api');
      if (fs.existsSync(apiDir)) {
        console.log(`${colors.green}✓${colors.reset} API directory found: ${apiDir}`);
        
        // Get all JS files in the API directory
        const apiFiles = fs.readdirSync(apiDir)
          .filter(file => file.endsWith('.js') || file.endsWith('.ts'))
          .map(file => path.join(apiDir, file));
        
        console.log(`${colors.dim}Found ${apiFiles.length} API route files${colors.reset}`);
        
        let validCount = 0;
        let invalidCount = 0;
        let issuesFound = [];
        
        // Check each API file for Next.js format
        apiFiles.forEach(file => {
          const content = fs.readFileSync(file, 'utf8');
          const fileName = path.basename(file);
          
          // Check for export default function handler
          const hasDefaultExport = /export\s+default\s+(async\s+)?function\s+handler\s*\(/i.test(content);
          
          // Check for module.exports (CommonJS format)
          const hasCommonJSExport = /module\.exports\s*=/i.test(content);
          
          if (hasDefaultExport && !hasCommonJSExport) {
            validCount++;
          } else {
            invalidCount++;
            
            if (!hasDefaultExport) {
              issuesFound.push(`${fileName}: Missing 'export default function handler'`);
            }
            
            if (hasCommonJSExport) {
              issuesFound.push(`${fileName}: Uses CommonJS 'module.exports' instead of ES modules`);
            }
          }
        });
        
        // Report results
        if (validCount === apiFiles.length) {
          console.log(`${colors.green}✓${colors.reset} All ${validCount} API routes use correct Next.js format`);
        } else {
          console.log(`${colors.yellow}⚠${colors.reset} Found ${invalidCount} API routes with incorrect format`);
          console.log(`${colors.dim}API routes must use 'export default function handler(req, res)' format for Vercel${colors.reset}`);
          
          // List issues
          if (issuesFound.length > 0) {
            console.log(`\n${colors.yellow}${colors.bright}Issues found in API routes:${colors.reset}`);
            issuesFound.forEach(issue => {
              console.log(`${colors.yellow}⚠${colors.reset} ${issue}`);
            });
          }
        }
      } else {
        console.log(`${colors.dim}No API directory found at ${apiDir}${colors.reset}`);
      }
    } catch (error) {
      console.log(`${colors.red}Error checking API routes:${colors.reset} ${error.message}`);
    }
    
    console.log(`\n${colors.dim}For more details, visit: https://vercel.com/docs/concepts/deployments/configuration${colors.reset}\n`);
    
  } catch (error) {
    console.error(`${colors.red}Error checking Vercel configuration:${colors.reset}`, error.message);
  }
}

// Run the script
checkVercelConfig();
