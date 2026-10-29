import { createFileRoute } from "@tanstack/react-router";
import { DashboardApp } from "@/components/envoiz/DashboardApp";

export const Route = createFileRoute("/dashboard/clients")({
  head: () => ({
    meta: [
      { title: "Clients — Envoiz" },
      {
        name: "description",
        content: "A clear view of the people you work with.",
      },
    ],
  }),
  component: DashboardClientsPage,
});

function DashboardClientsPage() {
  return <DashboardApp initialSection="clients" />;
}
