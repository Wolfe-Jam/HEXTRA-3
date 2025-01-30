// Simple Stripe environment test
export default async function handler(req, res) {
  res.status(200).json({ 
    message: 'Stripe test endpoint working' 
  });
}
