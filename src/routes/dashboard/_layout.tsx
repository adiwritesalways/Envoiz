import { createFileRoute, Outlet, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useAuth } from "@/components/auth/auth-context";

export const Route = createFileRoute("/dashboard/_layout")({
  head: () => ({
    meta: [
      { title: "Envoiz — Invoicing Workspace" },
      { name: "description", content: "Your business, at a glance." },
    ],
  }),
  component: DashboardLayout,
});

function DashboardLayout() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) void navigate({ to: "/login", replace: true });
  }, [loading, user, navigate]);

  if (loading || !user) {
    return (
      <main className="grid min-h-screen place-items-center text-sm text-muted-foreground">
        Loading your workspace…
      </main>
    );
  }
  return <Outlet />;
}
