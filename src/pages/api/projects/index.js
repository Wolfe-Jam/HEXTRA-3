import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";

export default async function handler(req, res) {
  const { getUser } = getKindeServerSession();
  
  try {
    const user = await getUser();
    
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    switch (req.method) {
      case 'GET':
        // Get user's projects
        // TODO: Implement database query
        return res.status(200).json({
          projects: [
            // Will be populated from database
          ]
        });

      case 'POST':
        // Create new project
        const { name, description } = req.body;
        
        if (!name) {
          return res.status(400).json({ error: 'Project name is required' });
        }

        // TODO: Save to database
        return res.status(201).json({
          message: 'Project created',
          project: {
            id: 'generated-id',
            name,
            description,
            userId: user.id,
            createdAt: new Date().toISOString()
          }
        });

      default:
        res.setHeader('Allow', ['GET', 'POST']);
        return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
    }
  } catch (error) {
    console.error('Projects API error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
