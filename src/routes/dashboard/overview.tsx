import { createFileRoute } from "@tanstack/react-router";
import { DashboardApp } from "@/components/envoiz/DashboardApp";

export const Route = createFileRoute("/dashboard/overview")({
  head: () => ({
    meta: [
      { title: "Dashboard — Envoiz" },
      { name: "description", content: "See your invoicing activity and business performance." },
    ],
  }),
  component: DashboardOverviewAlias,
});

function DashboardOverviewAlias() {
  return <DashboardApp initialSection="overview" />;
}
