/**
 * Subscription gates are intentionally isolated from invoice persistence.
 * Invoice reads and writes go through the validated Supabase RPC used by the
 * dashboard, so no legacy client-side CRUD path can bypass its checks.
 */
export function checkIsPro(user: { user_metadata?: Record<string, unknown> } | null | undefined) {
  const plan = String(
    user?.user_metadata?.plan ?? user?.user_metadata?.subscription_plan ?? "",
  ).toLowerCase();

  return plan === "pro" || plan === "business";
}
