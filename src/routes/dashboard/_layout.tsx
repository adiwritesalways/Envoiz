import { createFileRoute, Outlet } from "@tanstack/react-router";

import { DashboardShell } from "@/components/envoiz/DashboardShell";
import { brandName, slogan } from "@/lib/envoiz";

export const Route = createFileRoute("/dashboard/_layout")({
  head: () => ({
    meta: [{ title: `${brandName} Dashboard` }, { name: "description", content: slogan }],
  }),
  component: DashboardLayout,
});

function DashboardLayout() {
  return (
    <DashboardShell>
      <Outlet />
    </DashboardShell>
  );
}
