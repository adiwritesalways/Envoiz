/**
 * Stripe Checkout Session API
 * Creates a Stripe Checkout session for Pro plan subscription
 */

import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2024-12-18.acacia",
});

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { userId } = req.body;

  if (!userId) {
    return res.status(400).json({ error: "User ID is required" });
  }

  try {
    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: "Envoiz Pro Plan",
              description: "Unlimited invoices, premium templates, custom branding",
            },
            unit_amount: 700, // $7.00 in cents
            recurring: {
              interval: "month",
            },
          },
          quantity: 1,
        },
      ],
      success_url: `${process.env.VITE_APP_URL || "http://localhost:5173"}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.VITE_APP_URL || "http://localhost:5173"}/payment/cancelled`,
      client_reference_id: userId,
      metadata: {
        userId,
        plan: "pro",
      },
    });

    return res.status(200).json({ url: session.url });
  } catch (error: any) {
    console.error("Stripe session creation error:", error);
    return res.status(500).json({ error: error.message || "Failed to create checkout session" });
  }
}
