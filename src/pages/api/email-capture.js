/**
 * Email Capture API (v2.2.5)
 * 
 * A simple, dedicated endpoint for capturing emails
 * - Minimal code to reduce potential issues
 * - No dependencies on MailChimp SDK
 * - Designed to work reliably on Vercel
 * 
 * @version 2.2.5
 * @lastUpdated 2025-03-12
 */

// Import Node.js built-in modules (no external dependencies)
import { writeFile, readFile, mkdir } from 'fs/promises';
import { join } from 'path';

// This is a Next.js API route handler
export default async function handler(req, res) {
  console.log(`[EMAIL-CAPTURE] Received ${req.method} request`);
  
  // Set CORS headers immediately
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    console.log('[EMAIL-CAPTURE] Handling OPTIONS request');
    return res.status(200).end();
  }
  
  // Handle GET requests (health check)
  if (req.method === 'GET') {
    console.log('[EMAIL-CAPTURE] Handling GET request (health check)');
    return res.status(200).json({
      success: true,
      message: 'Email capture endpoint is working',
      version: '2.2.5'
    });
  }
  
  // Handle POST requests (actual email capture)
  if (req.method === 'POST') {
    console.log('[EMAIL-CAPTURE] Handling POST request');
    
    try {
      // Extract email from request body
      const { email } = req.body;
      
      if (!email) {
        console.log('[EMAIL-CAPTURE] Missing email in request');
        return res.status(200).json({
          success: false,
          message: 'Email is required'
        });
      }
      
      console.log(`[EMAIL-CAPTURE] Processing email: ${email}`);
      
      // In a real implementation, you would store this email
      // For now, we'll just log it and return success
      
      return res.status(200).json({
        success: true,
        message: 'Email captured successfully',
        email: email
      });
    } catch (error) {
      console.error('[EMAIL-CAPTURE] Error processing request:', error);
      return res.status(200).json({
        success: false,
        message: 'An error occurred while processing your request'
      });
    }
  }
  
  // If we get here, it's a method we don't support
  console.log(`[EMAIL-CAPTURE] Unsupported method: ${req.method}`);
  return res.status(200).json({
    success: false,
    message: 'Method not supported'
  });
}
