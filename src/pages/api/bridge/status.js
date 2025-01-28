export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { jobId } = req.query;

  if (!jobId) {
    return res.status(400).json({ error: 'Job ID required' });
  }

  try {
    // Check Voidbox job status
    const statusResponse = await fetch(`${process.env.VOIDBOX_API_URL}/status/${jobId}`, {
      headers: {
        'Authorization': `Bearer ${process.env.VOIDBOX_API_KEY}`
      }
    });

    const status = await statusResponse.json();

    res.status(200).json({
      status: status.status,
      progress: status.progress,
      result: status.result,
      error: status.error
    });
  } catch (error) {
    console.error('Status check error:', error);
    res.status(500).json({ error: 'Failed to check status' });
  }
}
