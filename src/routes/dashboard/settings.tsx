import { createFileRoute } from "@tanstack/react-router";
import { DashboardApp } from "@/components/envoiz/DashboardApp";

export const Route = createFileRoute("/dashboard/settings")({
  head: () => ({
    meta: [
      { title: "Settings — Envoiz" },
      {
        name: "description",
        content: "Make Envoiz work the way your business does.",
      },
    ],
  }),
  component: DashboardSettingsPage,
});

function DashboardSettingsPage() {
  return <DashboardApp initialSection="settings" />;
}
