import fs from 'fs';
import path from 'path';

// This is a simple endpoint to store emails
// In a production environment, you would want to store these in a database

// Path to the JSON file where emails will be stored
const EMAIL_STORAGE_FILE = path.join(process.cwd(), 'email-subscribers.json');

// Initialize the storage file if it doesn't exist
function initializeStorageFile() {
  if (!fs.existsSync(EMAIL_STORAGE_FILE)) {
    fs.writeFileSync(EMAIL_STORAGE_FILE, JSON.stringify({ emails: [] }));
  }
}

// Load emails from storage
function loadEmails() {
  try {
    initializeStorageFile();
    const data = fs.readFileSync(EMAIL_STORAGE_FILE, 'utf8');
    return JSON.parse(data).emails || [];
  } catch (error) {
    console.error('Error loading emails:', error);
    return [];
  }
}

// Save emails to storage
function saveEmails(emails) {
  try {
    fs.writeFileSync(EMAIL_STORAGE_FILE, JSON.stringify({ emails }, null, 2));
    return true;
  } catch (error) {
    console.error('Error saving emails:', error);
    return false;
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email } = req.body;

  if (!email || !/\S+@\S+\.\S+/.test(email)) {
    return res.status(400).json({ error: 'Valid email is required' });
  }

  try {
    // Load existing emails
    const emails = loadEmails();
    
    // Check if email already exists
    if (!emails.includes(email)) {
      // Add new email
      emails.push(email);
      
      // Save updated emails
      if (saveEmails(emails)) {
        console.log('Email stored:', email);
        console.log('Total emails stored:', emails.length);
      } else {
        return res.status(500).json({ error: 'Failed to save email' });
      }
    } else {
      console.log('Email already exists:', email);
    }

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error storing email:', error);
    return res.status(500).json({ error: 'Failed to store email' });
  }
}
