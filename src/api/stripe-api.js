// Stripe API endpoints
const BASE_URL = 'https://hextra-3.vercel.app';

export const createCheckoutSession = async (userId, priceId, email) => {
  const response = await fetch(`${BASE_URL}/api/create-checkout-session`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-kinde-user-id': userId
    },
    body: JSON.stringify({
      priceId,
      email
    })
  });
  return response.json();
};

export const checkSubscription = async (userId) => {
  const response = await fetch(`${BASE_URL}/api/check-subscription`, {
    headers: {
      'x-kinde-user-id': userId
    }
  });
  return response.json();
};
