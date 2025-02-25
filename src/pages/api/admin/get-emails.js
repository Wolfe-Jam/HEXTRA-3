import fs from 'fs';
import path from 'path';

// Path to the JSON file where emails are stored
const EMAIL_STORAGE_FILE = path.join(process.cwd(), 'email-subscribers.json');

export default async function handler(req, res) {
  // This endpoint should only be accessible to admins in a production environment
  // Add authentication check here in the future
  
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Check if the file exists
    if (!fs.existsSync(EMAIL_STORAGE_FILE)) {
      return res.json({ emails: [] });
    }

    // Read the file
    const data = fs.readFileSync(EMAIL_STORAGE_FILE, 'utf8');
    const { emails } = JSON.parse(data);

    return res.status(200).json({ emails: emails || [] });
  } catch (error) {
    console.error('Error getting emails:', error);
    res.status(500).json({ error: 'Failed to get emails' });
  }
}
