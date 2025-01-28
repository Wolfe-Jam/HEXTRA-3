import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";

export default async function handler(req, res) {
  const { getUser } = getKindeServerSession();
  
  try {
    const user = await getUser();
    
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Here we'll add user preferences and settings from database
    const userWithPreferences = {
      ...user,
      preferences: {
        defaultColorMode: 'rgb',
        defaultLuminanceMethod: 'average',
        // Add more user preferences
      }
    };

    res.status(200).json(userWithPreferences);
  } catch (error) {
    console.error('Auth error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
