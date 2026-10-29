/** Creates a PayPal subscription approval URL. Configure PAYPAL_* in production. */
const paypalBaseUrl = process.env.PAYPAL_BASE_URL || "https://api-m.sandbox.paypal.com";

async function getAccessToken() {
  const credentials = Buffer.from(`${process.env.PAYPAL_CLIENT_ID || ""}:${process.env.PAYPAL_CLIENT_SECRET || ""}`).toString("base64");
  const response = await fetch(`${paypalBaseUrl}/v1/oauth2/token`, {
    method: "POST",
    headers: { Authorization: `Basic ${credentials}`, "Content-Type": "application/x-www-form-urlencoded" },
    body: "grant_type=client_credentials",
  });
  if (!response.ok) throw new Error("PayPal credentials are not configured.");
  return (await response.json()).access_token as string;
}

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  const { userId } = req.body || {};
  const planId = process.env.PAYPAL_PLAN_ID;
  if (!userId || !planId) return res.status(400).json({ error: "PayPal is not configured yet." });

  try {
    const accessToken = await getAccessToken();
    const response = await fetch(`${paypalBaseUrl}/v1/billing/subscriptions`, {
      method: "POST",
      headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        plan_id: planId,
        custom_id: userId,
        application_context: {
          brand_name: "Envoiz",
          user_action: "SUBSCRIBE_NOW",
          return_url: `${process.env.VITE_APP_URL || "http://localhost:5173"}/payment/success`,
          cancel_url: `${process.env.VITE_APP_URL || "http://localhost:5173"}/payment/cancelled`,
        },
      }),
    });
    const result = await response.json();
    if (!response.ok) return res.status(response.status).json({ error: result.message || "Failed to create PayPal subscription." });
    const approval = result.links?.find((link: any) => link.rel === "approve");
    return res.status(200).json({ url: approval?.href });
  } catch (error: any) {
    console.error("PayPal subscription error:", error);
    return res.status(500).json({ error: error.message || "Failed to initialize PayPal." });
  }
}
