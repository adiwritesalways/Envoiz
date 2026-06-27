import { Link, useRouterState } from "@tanstack/react-router";
import {
  Menu,
  LayoutDashboard,
  FileText,
  Users,
  Code2,
  Webhook,
  Settings,
  ChevronRight,
} from "lucide-react";
import { type ReactNode } from "react";

import { BrandLogo } from "@/components/BrandLogo";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { brandName, slogan } from "@/lib/envoiz";
import { cn } from "@/lib/utils";

const navItems = [
  { label: "Overview", to: "/dashboard", icon: LayoutDashboard },
  { label: "Invoices", to: "/dashboard/invoices", icon: FileText },
  { label: "Customers", to: "/dashboard/customers", icon: Users },
  { label: "API", to: "/dashboard/api", icon: Code2 },
  { label: "Webhooks", to: "/dashboard/webhooks", icon: Webhook },
  { label: "Settings", to: "/dashboard/settings", icon: Settings },
] as const;

export function DashboardShell({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (state) => state.location.pathname });

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(0,0,0,0.05),transparent_24%),linear-gradient(to_bottom,var(--surface),var(--background))] text-foreground">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-72 flex-col border-r border-hairline bg-white/90 px-5 py-6 backdrop-blur-xl lg:flex">
        <div className="flex items-center gap-3 px-1">
          <BrandLogo className="h-9 w-auto" />
        </div>
        <p className="mt-3 px-1 text-[12.5px] leading-relaxed text-muted-foreground">{slogan}</p>

        <nav className="mt-8 space-y-1">
          {navItems.map((item) => {
            const active = pathname === item.to;
            const Icon = item.icon;
            return (
              <Link
                key={item.to}
                to={item.to}
                activeOptions={{ exact: item.to === "/dashboard" }}
                className={cn(
                  "flex items-center gap-3 rounded-2xl px-3 py-2.5 text-[14px] font-medium transition-colors",
                  active
                    ? "bg-foreground text-background shadow-[0_10px_28px_rgba(0,0,0,0.18)]"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground",
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span>{item.label}</span>
                <ChevronRight className="ml-auto h-4 w-4 opacity-50" />
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto rounded-3xl border border-hairline bg-surface/70 p-4">
          <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Workspace</p>
          <div className="mt-3 text-[13px] font-medium">{brandName} Studio</div>
          <p className="mt-1 text-[12.5px] leading-relaxed text-muted-foreground">
            Premium invoicing, API access, and customer management in one calm workspace.
          </p>
        </div>
      </aside>

      <div className="lg:pl-72">
        <header className="sticky top-0 z-20 border-b border-hairline bg-white/80 backdrop-blur-xl">
          <div className="flex h-16 items-center justify-between gap-4 px-4 sm:px-6">
            <div className="flex items-center gap-3">
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="lg:hidden rounded-full">
                    <Menu className="h-5 w-5" />
                    <span className="sr-only">Open navigation</span>
                  </Button>
                </SheetTrigger>
                <SheetContent
                  side="left"
                  className="w-[18rem] border-r border-hairline bg-white p-0"
                >
                  <SheetHeader className="border-b border-hairline px-5 py-5 text-left">
                    <SheetTitle className="sr-only">Dashboard navigation</SheetTitle>
                    <BrandLogo className="h-9 w-auto" />
                    <p className="text-[12px] text-muted-foreground">{slogan}</p>
                  </SheetHeader>
                  <div className="p-4">
                    <nav className="space-y-1">
                      {navItems.map((item) => {
                        const active = pathname === item.to;
                        const Icon = item.icon;
                        return (
                          <Link
                            key={item.to}
                            to={item.to}
                            activeOptions={{ exact: item.to === "/dashboard" }}
                            className={cn(
                              "flex items-center gap-3 rounded-2xl px-3 py-2.5 text-[14px] font-medium transition-colors",
                              active
                                ? "bg-foreground text-background"
                                : "text-muted-foreground hover:bg-secondary hover:text-foreground",
                            )}
                          >
                            <Icon className="h-4 w-4 shrink-0" />
                            {item.label}
                          </Link>
                        );
                      })}
                    </nav>
                  </div>
                </SheetContent>
              </Sheet>

              <div className="lg:hidden">
                <BrandLogo className="h-8 w-auto" />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Link
                to="/"
                className="hidden rounded-full border border-hairline bg-white px-4 py-2 text-[13px] font-medium text-foreground transition-colors hover:bg-secondary sm:inline-flex"
              >
                Home
              </Link>
              <Link
                to="/dashboard/invoices"
                className="inline-flex items-center gap-2 rounded-full bg-foreground px-4 py-2 text-[13px] font-medium text-background transition-colors hover:opacity-90"
              >
                New invoice
              </Link>
            </div>
          </div>
        </header>

        <main className="px-4 py-6 sm:px-6 lg:px-8">
          <div className="mx-auto w-full max-w-7xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
