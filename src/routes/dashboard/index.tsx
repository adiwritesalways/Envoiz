import { createFileRoute } from "@tanstack/react-router";
import { DashboardApp } from "@/components/envoiz/DashboardApp";

export const Route = createFileRoute("/dashboard/")({
  head: () => ({
    meta: [
      { title: "Dashboard — Envoiz" },
      {
        name: "description",
        content: "Good morning, Jordan. Here’s where your business stands today.",
      },
    ],
  }),
  component: DashboardOverviewPage,
});

function DashboardOverviewPage() {
  return <DashboardApp initialSection="overview" />;
}
