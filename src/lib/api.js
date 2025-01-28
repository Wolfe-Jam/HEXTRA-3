// Client-side API utilities

export async function processImage(imageData, operations) {
  const response = await fetch('/api/image/process', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ imageData, operations }),
  });

  if (!response.ok) {
    throw new Error('Failed to process image');
  }

  return response.json();
}

export async function getUserData() {
  const response = await fetch('/api/auth/user');
  
  if (!response.ok) {
    throw new Error('Failed to fetch user data');
  }

  return response.json();
}

export async function getProjects() {
  const response = await fetch('/api/projects');
  
  if (!response.ok) {
    throw new Error('Failed to fetch projects');
  }

  return response.json();
}

export async function createProject(projectData) {
  const response = await fetch('/api/projects', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(projectData),
  });

  if (!response.ok) {
    throw new Error('Failed to create project');
  }

  return response.json();
}
