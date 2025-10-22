import Stripe from "stripe";

const API_VERSION: Stripe.LatestApiVersion = "2024-06-20";

let stripeClient: Stripe | null = null;

const createStripeClient = () => {
  const secretKey = process.env.STRIPE_SECRET_KEY;

  if (!secretKey) {
    throw new Error(
      "STRIPE_SECRET_KEY est absent. Ajoutez-le à vos variables d'environnement.",
    );
  }

  return new Stripe(secretKey, { apiVersion: API_VERSION });
};

/**
 * Retourne une instance Stripe unique sur l'ensemble du runtime.
 */
export const getStripeClient = () => {
  if (!stripeClient) {
    stripeClient = createStripeClient();
  }

  return stripeClient;
};

export const getStripeWebhookSecret = () => {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!secret) {
    throw new Error(
      "STRIPE_WEBHOOK_SECRET est absent. Ajoutez-le à vos variables d'environnement.",
    );
  }

  return secret;
};

