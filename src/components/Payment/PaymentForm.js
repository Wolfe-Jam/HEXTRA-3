import React, { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import {
  PaymentElement,
  Elements,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import styled from 'styled-components';

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY);

const PaymentFormContainer = styled.div`
  max-width: 500px;
  margin: 0 auto;
  padding: 20px;
`;

const Button = styled.button`
  background-color: #5469d4;
  color: #ffffff;
  padding: 12px 16px;
  border: none;
  border-radius: 4px;
  font-weight: 600;
  cursor: pointer;
  width: 100%;
  margin-top: 24px;

  &:disabled {
    background-color: #e0e0e0;
    cursor: not-allowed;
  }
`;

const ErrorMessage = styled.div`
  color: #df1b41;
  margin-top: 16px;
  text-align: center;
`;

function CheckoutForm() {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    
    if (!stripe || !elements) {
      return;
    }

    setLoading(true);
    setError(null);

    const { error: submitError } = await elements.submit();
    if (submitError) {
      setError(submitError.message);
      setLoading(false);
      return;
    }

    const { error: paymentError } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/payment-success`,
      },
    });

    if (paymentError) {
      setError(paymentError.message);
    }

    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit}>
      <PaymentElement />
      <Button disabled={!stripe || loading}>
        {loading ? 'Processing...' : 'Pay now'}
      </Button>
      {error && <ErrorMessage>{error}</ErrorMessage>}
    </form>
  );
}

export function PaymentForm({ clientSecret }) {
  const options = {
    clientSecret,
    appearance: {
      theme: 'stripe',
      variables: {
        colorPrimary: '#5469d4',
      },
    },
  };

  return (
    <PaymentFormContainer>
      {clientSecret && (
        <Elements stripe={stripePromise} options={options}>
          <CheckoutForm />
        </Elements>
      )}
    </PaymentFormContainer>
  );
}
