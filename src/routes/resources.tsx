import { createFileRoute, Outlet } from "@tanstack/react-router";

import { SiteShell } from "@/components/envoiz/SiteShell";
import { brandName, slogan } from "@/lib/envoiz";

export const Route = createFileRoute("/resources")({
  head: () => ({
    meta: [{ title: `Resources - ${brandName}` }, { name: "description", content: slogan }],
  }),
  component: ResourcesLayout,
});

function ResourcesLayout() {
  return (
    <SiteShell>
      <Outlet />
    </SiteShell>
  );
}
