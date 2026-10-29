import { createFileRoute } from "@tanstack/react-router";
import { DashboardApp } from "@/components/envoiz/DashboardApp";

export const Route = createFileRoute("/dashboard/customers")({
  head: () => ({
    meta: [
      { title: "Clients — Envoiz" },
      {
        name: "description",
        content: "A clear view of the people you work with.",
      },
    ],
  }),
  component: DashboardCustomersPage,
});

function DashboardCustomersPage() {
  return <DashboardApp initialSection="clients" />;
}
