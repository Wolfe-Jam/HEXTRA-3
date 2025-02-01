// Stripe API endpoints
const BASE_URL = process.env.REACT_APP_API_URL || '';

export const createCheckoutSession = async (userId) => {
  const response = await fetch(`${BASE_URL}/api/create-checkout-session`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-kinde-user-id': userId
    }
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
