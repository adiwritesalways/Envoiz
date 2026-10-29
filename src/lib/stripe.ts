/**
 * Stripe Payment Integration
 */

/**
 * Create Stripe Checkout Session
 */
export async function createStripeCheckoutSession(userId: string): Promise<{ url?: string; error?: string }> {
  try {
    const response = await fetch("/api/stripe/create-checkout-session", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userId,
        priceId: "price_pro_monthly", // You'll need to create this in Stripe Dashboard
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to create checkout session");
    }

    const { url } = await response.json();
    return { url };
  } catch (error) {
    console.error("Stripe checkout error:", error);
    return { error: "Failed to initialize payment" };
  }
}
