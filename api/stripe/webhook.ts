/**
 * Stripe Webhook Handler
 * Listens for payment events and upgrades user to Pro
 */

import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2024-12-18.acacia",
});

const supabase = createClient(
  process.env.VITE_SUPABASE_URL || "",
  process.env.SUPABASE_SERVICE_ROLE_KEY || ""
);

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const sig = req.headers["stripe-signature"];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!sig || !webhookSecret) {
    return res.status(400).json({ error: "Missing signature or webhook secret" });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
  } catch (err: any) {
    console.error("Webhook signature verification failed:", err.message);
    return res.status(400).json({ error: `Webhook Error: ${err.message}` });
  }

  // Handle the event
  switch (event.type) {
    case "checkout.session.completed":
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = session.client_reference_id || session.metadata?.userId;

      if (userId) {
        // Upgrade user to Pro
        const { error: updateError } = await supabase.auth.admin.updateUserById(userId, {
          user_metadata: {
            is_pro: true,
            pro_since: new Date().toISOString(),
            stripe_customer_id: session.customer,
            stripe_subscription_id: session.subscription,
          },
        });

        if (updateError) {
          console.error("Failed to upgrade user:", updateError);
          return res.status(500).json({ error: "Failed to upgrade user" });
        }

        // Record payment
        await supabase.from("payments").insert({
          user_id: userId,
          gateway: "stripe",
          amount: 7.0,
          currency: "USD",
          status: "completed",
          transaction_id: session.id,
          metadata: {
            customer_id: session.customer,
            subscription_id: session.subscription,
          },
        });

        console.log(`User ${userId} upgraded to Pro via Stripe`);
      }
      break;

    case "customer.subscription.deleted":
      // Handle subscription cancellation
      const subscription = event.data.object as Stripe.Subscription;
      const customerId = subscription.customer as string;

      // Find user by customer ID and downgrade
      const { data: users } = await supabase
        .from("users")
        .select("id")
        .eq("stripe_customer_id", customerId)
        .single();

      if (users) {
        await supabase.auth.admin.updateUserById(users.id, {
          user_metadata: {
            is_pro: false,
          },
        });
        console.log(`User ${users.id} downgraded from Pro (subscription cancelled)`);
      }
      break;

    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  return res.status(200).json({ received: true });
}
