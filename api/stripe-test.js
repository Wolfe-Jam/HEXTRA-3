export default async function handler(req, res) {
  try {
    // Simple test to check if environment variables are set
    const hasPublishableKey = !!process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY;
    const hasSecretKey = !!process.env.STRIPE_SECRET_KEY;

    res.status(200).json({ 
      success: true, 
      message: 'Stripe environment variables check',
      hasPublishableKey,
      hasSecretKey
    });
  } catch (error) {
    console.error('Stripe test error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to check Stripe setup',
      error: error.message
    });
  }
}
