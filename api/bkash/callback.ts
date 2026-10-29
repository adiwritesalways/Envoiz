/**
 * bKash Payment Callback
 * Handles bKash payment verification and user upgrade
 */

import axios from "axios";
import { createClient } from "@supabase/supabase-js";

const BKASH_BASE_URL = process.env.BKASH_BASE_URL || "https://tokenized.sandbox.bka.sh/v1.2.0-beta";
const APP_KEY = process.env.BKASH_APP_KEY;

const supabase = createClient(
  process.env.VITE_SUPABASE_URL || "",
  process.env.SUPABASE_SERVICE_ROLE_KEY || ""
);

async function getAccessToken(): Promise<string> {
  const response = await axios.post(
    `${BKASH_BASE_URL}/tokenized/checkout/token/grant`,
    {
      app_key: process.env.BKASH_APP_KEY,
      app_secret: process.env.BKASH_APP_SECRET,
    },
    {
      headers: {
        "Content-Type": "application/json",
        username: process.env.BKASH_USERNAME,
        password: process.env.BKASH_PASSWORD,
      },
    }
  );
  return response.data.id_token;
}

export default async function handler(req: any, res: any) {
  const { paymentID, status } = req.query;

  if (status === "cancel" || status === "failure") {
    return res.redirect(`${process.env.VITE_APP_URL}/payment/cancelled`);
  }

  try {
    const token = await getAccessToken();

    // Execute payment
    const executeResponse = await axios.post(
      `${BKASH_BASE_URL}/tokenized/checkout/execute`,
      { paymentID },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: token,
          "X-APP-Key": APP_KEY,
        },
      }
    );

    if (executeResponse.data.statusCode === "0000" && executeResponse.data.transactionStatus === "Completed") {
      const userId = executeResponse.data.payerReference;

      // Upgrade user to Pro
      await supabase.auth.admin.updateUserById(userId, {
        user_metadata: {
          is_pro: true,
          pro_since: new Date().toISOString(),
        },
      });

      // Record payment
      await supabase.from("payments").insert({
        user_id: userId,
        gateway: "bkash",
        amount: parseFloat(executeResponse.data.amount),
        currency: "BDT",
        status: "completed",
        transaction_id: executeResponse.data.trxID,
        metadata: executeResponse.data,
      });

      console.log(`User ${userId} upgraded to Pro via bKash`);
      return res.redirect(`${process.env.VITE_APP_URL}/payment/success`);
    } else {
      return res.redirect(`${process.env.VITE_APP_URL}/payment/failed`);
    }
  } catch (error: any) {
    console.error("bKash callback error:", error.response?.data || error.message);
    return res.redirect(`${process.env.VITE_APP_URL}/payment/failed`);
  }
}
