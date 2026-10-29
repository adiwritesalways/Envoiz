import { createFileRoute, redirect } from "@tanstack/react-router";

/** Webhook delivery is not offered by Envoiz. Keep old URLs safe and useful. */
export const Route = createFileRoute("/dashboard/webhooks")({
  beforeLoad: () => {
    throw redirect({ to: "/dashboard/invoices" });
  },
  component: () => null,
});
