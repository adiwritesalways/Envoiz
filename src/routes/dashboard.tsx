import { createFileRoute, Outlet, useLocation } from "@tanstack/react-router";

import { useAuth } from "@/components/auth/auth-context";
import { DashboardShell } from "@/components/envoiz/DashboardShell";
import { brandName, slogan } from "@/lib/envoiz";
import { isDemoMode, DEMO_USER } from "@/lib/demo-mode";
import { AuthContext } from "@/components/auth/auth-context";
import { type ReactNode } from "react";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [{ title: `${brandName} Dashboard` }, { name: "description", content: slogan }],
  }),
  component: DashboardLayout,
});

/**
 * Wraps children in a synthetic AuthContext when running in demo mode.
 * This lets all child components call useAuth() safely without a real session.
 */
function DemoAuthWrapper({ children }: { children: ReactNode }) {
  return (
    <AuthContext.Provider
      value={{
        session: null,
        user: DEMO_USER,
        loading: false,
        refreshSession: async () => {},
        signOut: async () => {},
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

function DashboardLayout() {
  const { session, loading } = useAuth();
  const { pathname } = useLocation();
  const isDemo = isDemoMode(session, loading);

  // DashboardApp owns the full workspace shell (sidebar, header, and content
  // area). Wrapping these routes in DashboardShell as well creates two
  // sidebars and squeezes the workspace into the right side of the viewport.
  const usesStandaloneWorkspace = [
    "/dashboard",
    "/dashboard/",
    "/dashboard/overview",
    "/dashboard/invoices",
    "/dashboard/clients",
    "/dashboard/customers",
    "/dashboard/reports",
    "/dashboard/settings",
  ].includes(pathname);

  const content = usesStandaloneWorkspace ? (
    <Outlet />
  ) : (
    <DashboardShell>
      <Outlet />
    </DashboardShell>
  );

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <div className="rounded-3xl border border-border bg-background px-5 py-4 text-[13px] text-muted-foreground">
          Restoring your session...
        </div>
      </div>
    );
  }

  // Demo mode: no real session — wrap with fake auth context so child pages work.
  if (isDemo) {
    return (
      <DemoAuthWrapper>
        {usesStandaloneWorkspace ? (
          <Outlet />
        ) : (
          <DashboardShell>
            <Outlet />
          </DashboardShell>
        )}
      </DemoAuthWrapper>
    );
  }

  // Real authenticated session.
  return content;
}
