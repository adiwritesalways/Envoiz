import { createFileRoute } from "@tanstack/react-router";
import { DashboardApp } from "@/components/envoiz/DashboardApp";

export const Route = createFileRoute("/dashboard/invoices")({
  head: () => ({
    meta: [
      { title: "Invoices — Envoiz" },
      {
        name: "description",
        content: "Create, track, and follow up on every invoice.",
      },
    ],
  }),
  component: DashboardInvoicesPage,
});

function DashboardInvoicesPage() {
  return <DashboardApp initialSection="invoices" />;
}
