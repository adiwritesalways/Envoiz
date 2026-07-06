import { createFileRoute, Outlet, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";

import { useAuth } from "@/components/auth/auth-context";
import { DashboardShell } from "@/components/envoiz/DashboardShell";
import { brandName, slogan } from "@/lib/envoiz";

export const Route = createFileRoute("/dashboard/_layout")({
  head: () => ({
    meta: [{ title: `${brandName} Dashboard` }, { name: "description", content: slogan }],
  }),
  component: DashboardLayout,
});

function DashboardLayout() {
  const { session, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !session) {
      void navigate({ to: "/login" });
    }
  }, [loading, navigate, session]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <div className="rounded-3xl border border-hairline bg-white px-5 py-4 text-[13px] text-muted-foreground shadow-[0_18px_50px_rgba(0,0,0,0.06)]">
          Restoring your session...
        </div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <DashboardShell>
      <Outlet />
    </DashboardShell>
  );
}
