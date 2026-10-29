/**
 * Nagad Payment Callback
 */

import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.VITE_SUPABASE_URL || "",
  process.env.SUPABASE_SERVICE_ROLE_KEY || ""
);

export default async function handler(req: any, res: any) {
  const { payment_ref_id, status } = req.query;

  if (status === "Cancel") {
    return res.redirect(`${process.env.VITE_APP_URL}/payment/cancelled`);
  }

  if (status === "Failure") {
    return res.redirect(`${process.env.VITE_APP_URL}/payment/failed`);
  }

  try {
    // For sandbox: assume success if payment_ref_id exists
    // In production, verify with Nagad API
    if (payment_ref_id && status === "Success") {
      const { data: session } = await supabase
        .from("payment_sessions")
        .select("*")
        .eq("session_data->payment_ref_id", payment_ref_id)
        .single();

      if (session) {
        const userId = session.user_id;

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
          gateway: "nagad",
          amount: session.amount,
          currency: "BDT",
          status: "completed",
          transaction_id: payment_ref_id,
        });

        console.log(`User ${userId} upgraded to Pro via Nagad`);
        return res.redirect(`${process.env.VITE_APP_URL}/payment/success`);
      }
    }

    return res.redirect(`${process.env.VITE_APP_URL}/payment/failed`);
  } catch (error: any) {
    console.error("Nagad callback error:", error);
    return res.redirect(`${process.env.VITE_APP_URL}/payment/failed`);
  }
}
