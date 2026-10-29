import { createFileRoute } from "@tanstack/react-router";
import { DashboardApp } from "@/components/envoiz/DashboardApp";

export const Route = createFileRoute("/dashboard/reports")({
  head: () => ({
    meta: [
      { title: "Reports — Envoiz" },
      { name: "description", content: "Understand your cash flow and invoicing momentum." },
    ],
  }),
  component: DashboardReportsPage,
});

function DashboardReportsPage() {
  return <DashboardApp initialSection="reports" />;
}
