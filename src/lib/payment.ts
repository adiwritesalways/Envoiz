/**
 * Payment Gateway Integration
 * Supports Stripe, bKash, and Nagad for $7 USD Pro plan subscription
 */

import { supabase } from "./supabase";

export const PRICE_USD = 7.0;
export const PRICE_BDT = 850; // Approximate conversion for Bangladeshi gateways

export type PaymentGateway = "stripe" | "bkash" | "nagad";

export interface PaymentSession {
  gateway: PaymentGateway;
  sessionId: string;
  amount: number;
  currency: string;
  userId: string;
  status: "pending" | "completed" | "failed";
}

/**
 * Create a payment session record in Supabase
 */
export async function createPaymentSession(
  userId: string,
  gateway: PaymentGateway,
  amount: number,
  currency: string
): Promise<{ data: any; error: any }> {
  return await supabase.from("payment_sessions").insert({
    user_id: userId,
    gateway,
    amount,
    currency,
    status: "pending",
    created_at: new Date().toISOString(),
  }).select().single();
}

/**
 * Update payment session status
 */
export async function updatePaymentSession(
  sessionId: string,
  status: "completed" | "failed",
  metadata?: any
): Promise<{ data: any; error: any }> {
  return await supabase
    .from("payment_sessions")
    .update({
      status,
      metadata,
      updated_at: new Date().toISOString(),
    })
    .eq("id", sessionId);
}

/**
 * Upgrade user to Pro after successful payment
 * Server-side only: this requires an admin-capable Supabase client.
 */
export async function upgradeUserToPro(userId: string): Promise<{ success: boolean; error?: any }> {
  try {
    // Update user metadata
    const { error: updateError } = await supabase.auth.admin.updateUserById(userId, {
      user_metadata: {
        is_pro: true,
        pro_since: new Date().toISOString(),
      },
    });

    if (updateError) throw updateError;

    // Record in payments table
    const { error: insertError } = await supabase.from("payments").insert({
      user_id: userId,
      amount: PRICE_USD,
      currency: "USD",
      status: "completed",
      created_at: new Date().toISOString(),
    });

    if (insertError) throw insertError;

    return { success: true };
  } catch (error) {
    console.error("Error upgrading user to Pro:", error);
    return { success: false, error };
  }
}

/**
 * Check if user is Pro (extended check)
 */
export function checkIsProFromMetadata(user: any): boolean {
  if (!user) return false;
  return user.user_metadata?.is_pro === true || user.app_metadata?.is_pro === true;
}
