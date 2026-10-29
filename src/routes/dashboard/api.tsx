import { createFileRoute, redirect } from "@tanstack/react-router";

/** API access is deliberately not part of Envoiz's invoice-only product. */
export const Route = createFileRoute("/dashboard/api")({
  beforeLoad: () => {
    throw redirect({ to: "/dashboard/invoices" });
  },
  component: () => null,
});
