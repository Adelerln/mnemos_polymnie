import { NextResponse } from "next/server";
import Stripe from "stripe";

import { getStripeClient, getStripeWebhookSecret } from "@/lib/stripe";

export const runtime = "nodejs";

const handlerErrorResponse = (message: string, status = 400) =>
  NextResponse.json({ error: message }, { status });

const parseStripeEvent = (
  body: ArrayBuffer,
  signature: string,
): Stripe.Event => {
  const stripe = getStripeClient();
  const webhookSecret = getStripeWebhookSecret();

  try {
    const payload = Buffer.from(body);
    return stripe.webhooks.constructEvent(payload, signature, webhookSecret);
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Erreur de vérification Stripe: ${error.message}`);
    }

    throw new Error("Erreur de vérification Stripe: inconnue");
  }
};

export async function POST(request: Request) {
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return handlerErrorResponse(
      "En-tête stripe-signature manquant. Vérifiez la configuration du webhook.",
    );
  }

  let event: Stripe.Event;

  try {
    const arrayBuffer = await request.arrayBuffer();
    event = parseStripeEvent(arrayBuffer, signature);
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Échec de la vérification de la signature Stripe.";

    return handlerErrorResponse(message);
  }

  switch (event.type) {
    case "checkout.session.completed": {
      // Ajoutez ici la logique métier à exécuter quand une session est payée.
      break;
    }

    case "customer.created":
    case "customer.updated": {
      // Exemples de traitements supplémentaires.
      break;
    }

    default: {
      // Les autres évènements peuvent être gérés plus tard.
      break;
    }
  }

  return NextResponse.json({ received: true }, { status: 200 });
}
