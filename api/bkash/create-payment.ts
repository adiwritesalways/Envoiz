/**
 * bKash Payment API
 * Creates a bKash payment request
 */

import axios from "axios";

const BKASH_BASE_URL = process.env.BKASH_BASE_URL || "https://tokenized.sandbox.bka.sh/v1.2.0-beta";
const APP_KEY = process.env.BKASH_APP_KEY;
const APP_SECRET = process.env.BKASH_APP_SECRET;
const USERNAME = process.env.BKASH_USERNAME;
const PASSWORD = process.env.BKASH_PASSWORD;

let accessToken: string | null = null;
let tokenExpiry: number = 0;

/**
 * Get bKash access token
 */
async function getAccessToken(): Promise<string> {
  // Return cached token if still valid
  if (accessToken && Date.now() < tokenExpiry) {
    return accessToken;
  }

  try {
    const response = await axios.post(
      `${BKASH_BASE_URL}/tokenized/checkout/token/grant`,
      {
        app_key: APP_KEY,
        app_secret: APP_SECRET,
      },
      {
        headers: {
          "Content-Type": "application/json",
          username: USERNAME,
          password: PASSWORD,
        },
      }
    );

    accessToken = response.data.id_token;
    tokenExpiry = Date.now() + 3600 * 1000; // 1 hour
    return accessToken!;
  } catch (error: any) {
    console.error("bKash token error:", error.response?.data || error.message);
    throw new Error("Failed to get bKash token");
  }
}

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { userId, amount } = req.body;

  if (!userId || !amount) {
    return res.status(400).json({ error: "User ID and amount are required" });
  }

  try {
    const token = await getAccessToken();

    // Create bKash payment
    const response = await axios.post(
      `${BKASH_BASE_URL}/tokenized/checkout/create`,
      {
        mode: "0011",
        payerReference: userId,
        callbackURL: `${process.env.VITE_APP_URL || "http://localhost:5173"}/api/bkash/callback`,
        amount: amount.toString(),
        currency: "BDT",
        intent: "sale",
        merchantInvoiceNumber: `ENZ${Date.now()}`,
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: token,
          "X-APP-Key": APP_KEY,
        },
      }
    );

    if (response.data.statusCode === "0000") {
      return res.status(200).json({
        bkashURL: response.data.bkashURL,
        paymentID: response.data.paymentID,
      });
    } else {
      return res.status(400).json({
        error: response.data.statusMessage || "Failed to create bKash payment",
      });
    }
  } catch (error: any) {
    console.error("bKash payment creation error:", error.response?.data || error.message);
    return res.status(500).json({
      error: error.response?.data?.statusMessage || "Failed to create bKash payment",
    });
  }
}
