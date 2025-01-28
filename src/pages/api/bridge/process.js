import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { getUser } = getKindeServerSession();
  const user = await getUser();

  try {
    const { image, operations } = req.body;

    // Categorize operations
    const hextraOps = operations.filter(op => op.processor === 'hextra');
    const voidboxOps = operations.filter(op => op.processor === 'voidbox');

    let processedImage = image;
    let metadata = {};

    // HEXTRA operations (processed immediately)
    if (hextraOps.length > 0) {
      metadata.hextra = {
        operations: hextraOps.map(op => op.type),
        processingTime: 'immediate'
      };
    }

    // Voidbox operations (async processing)
    if (voidboxOps.length > 0) {
      // Call Voidbox API
      const voidboxResponse = await fetch('${process.env.VOIDBOX_API_URL}/process', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.VOIDBOX_API_KEY}`
        },
        body: JSON.stringify({
          image: processedImage,
          operations: voidboxOps,
          userId: user?.id
        })
      });

      const voidboxResult = await voidboxResponse.json();
      
      metadata.voidbox = {
        jobId: voidboxResult.jobId,
        estimatedTime: voidboxResult.estimatedTime,
        operations: voidboxOps.map(op => op.type)
      };
    }

    res.status(200).json({
      success: true,
      metadata,
      immediate: hextraOps.length > 0,
      pending: voidboxOps.length > 0,
      result: processedImage
    });
  } catch (error) {
    console.error('Bridge processing error:', error);
    res.status(500).json({ error: 'Processing failed' });
  }
}
