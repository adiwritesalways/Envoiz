import * as React from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ArrowDownRight, ArrowUpRight, Calendar, ChevronDown, Download, Plus } from "lucide-react";
import { useAuth } from "@/components/auth/auth-context";
import { DashboardShell } from "@/components/envoiz/DashboardShell";
import { Button } from "@/components/ui/button";
import { RecentInvoicesList } from "@/components/envoiz/RecentInvoicesList";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { fetchInvoices } from "@/lib/invoices";
import { readUserStorageValue, settingsStorageKeys } from "@/lib/envoiz";

export const Route = createFileRoute("/dashboard/")({
  head: () => ({
    meta: [
      { title: "Overview — Envoiz" },
      {
        name: "description",
        content: "Envoiz dashboard overview with revenue, invoices and customer insights.",
      },
    ],
  }),
  component: DashboardOverview,
});

function generateRevenueData(invoices: any[]) {
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const currentYear = new Date().getFullYear();
  
  const data = months.map(m => ({ m, current: 0, previous: 0 }));
  
  invoices.forEach(inv => {
    if (inv.status !== "Paid") return;
    const date = new Date(inv.createdAt);
    if (date.getFullYear() === currentYear) {
      const monthIndex = date.getMonth();
      data[monthIndex].current += inv.total;
    } else if (date.getFullYear() === currentYear - 1) {
      const monthIndex = date.getMonth();
      data[monthIndex].previous += inv.total;
    }
  });
  
  return data;
}

function DashboardOverview() {
  const { user } = useAuth();
  
  // Read directly from Supabase user metadata — no localStorage, no effect needed.
  // Falls back to localStorage (legacy) then to the generic placeholder.
  const companyName =
    user?.user_metadata?.company_name ||
    readUserStorageValue(user?.id, settingsStorageKeys.companyName, "your business");
  
  const invoicesQuery = useQuery({
    queryKey: ["invoices", user?.id],
    queryFn: () => fetchInvoices(user?.id ?? ""),
    enabled: Boolean(user?.id),
  });

  const invoices = invoicesQuery.data ?? [];
  const revenueData = React.useMemo(() => generateRevenueData(invoices), [invoices]);
  
  const totalRevenue = invoices.reduce((sum, inv) => sum + (inv.status === "Paid" ? inv.total : 0), 0);
  const totalOutstanding = invoices.reduce((sum, inv) => sum + (inv.status === "Pending" ? inv.total : 0), 0);
  const uniqueClients = new Set(invoices.map((inv: any) => inv.clientEmail)).size;
  
  const dynamicMetrics = [
    { label: "Total revenue", value: `$${totalRevenue.toLocaleString()}` },
    { label: "Pending", value: `$${totalOutstanding.toLocaleString()}` },
    { label: "Invoices", value: invoices.length.toLocaleString() },
    { label: "Clients", value: uniqueClients.toLocaleString() },
  ];

  return (
    <DashboardShell>
      <div className="space-y-6">
        {/* Greeting */}
        <header className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
              Good morning
            </p>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight">
              Here's how {companyName} is doing today.
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Calendar className="h-3.5 w-3.5" /> Last 12 months
              <ChevronDown className="h-3.5 w-3.5" />
            </Button>
            <Button variant="outline" size="sm">
              <Download className="h-3.5 w-3.5" /> Export
            </Button>
            <Button asChild size="sm">
              <Link to="/dashboard/invoices">
                <Plus className="h-3.5 w-3.5" /> Create invoice
              </Link>
            </Button>
          </div>
        </header>

        {/* Metric cards */}
        <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {dynamicMetrics.map((m) => (
            <Card key={m.label} className="border-border bg-card p-5 shadow-none flex flex-col justify-between">
              <div className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                {m.label}
              </div>
              <div className="mt-2 font-mono text-2xl font-semibold tabular-nums tracking-tight">
                {m.value}
              </div>
            </Card>
          ))}
        </section>

        {/* Chart */}
        <RevenueChart revenueData={revenueData} />

        {/* Bottom row */}
        <section className="grid grid-cols-1 gap-4">
          <RecentInvoicesList
            user={user}
            title="Recent invoices"
            description="The latest invoices across all customers."
            viewAllHref="/dashboard/invoices"
          />
        </section>
      </div>
    </DashboardShell>
  );
}

function RevenueChart({ revenueData }: { revenueData: any[] }) {
  const [range, setRange] = React.useState<"3M" | "6M" | "12M" | "YTD">("12M");

  const total = revenueData.reduce((a, b) => a + b.current, 0);
  const totalPrevious = revenueData.reduce((a, b) => a + b.previous, 0);

  return (
    <Card className="border-border bg-card p-5 shadow-none">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
            Revenue
          </div>
          <div className="mt-1 flex items-baseline gap-3">
            <div className="font-mono text-3xl font-semibold tabular-nums tracking-tight">
              ${total.toLocaleString()}
            </div>
            {totalPrevious > 0 && (
              <span className="inline-flex items-center gap-0.5 rounded-full border border-border px-1.5 py-0.5 text-[10px] font-medium">
                {total >= totalPrevious ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                {(((total - totalPrevious) / totalPrevious) * 100).toFixed(1)}%
              </span>
            )}
          </div>
          {totalPrevious > 0 && (
            <p className="mt-1 text-xs text-muted-foreground">
              Compared to ${totalPrevious.toLocaleString()} previous period
            </p>
          )}
        </div>

        <div className="inline-flex items-center rounded-md border border-border p-0.5">
          {(["3M", "6M", "12M", "YTD"] as const).map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={cn(
                "rounded-[6px] px-2.5 py-1 text-xs font-medium transition-colors",
                range === r
                  ? "bg-foreground text-background"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-6 h-[280px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={revenueData} margin={{ top: 10, right: 8, left: -16, bottom: 0 }}>
            <defs>
              <linearGradient id="revFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--color-foreground)" stopOpacity={0.18} />
                <stop offset="100%" stopColor="var(--color-foreground)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="var(--color-border)" strokeDasharray="2 4" vertical={false} />
            <XAxis
              dataKey="m"
              stroke="var(--color-muted-foreground)"
              tickLine={false}
              axisLine={false}
              fontSize={11}
            />
            <YAxis
              stroke="var(--color-muted-foreground)"
              tickLine={false}
              axisLine={false}
              fontSize={11}
              tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
            />
            <Tooltip
              cursor={{
                stroke: "var(--color-foreground)",
                strokeDasharray: "2 4",
              }}
              content={<ChartTooltip />}
            />
            <Area
              type="monotone"
              dataKey="previous"
              stroke="var(--color-muted-foreground)"
              strokeWidth={1}
              strokeDasharray="3 3"
              fill="transparent"
              dot={false}
            />
            <Area
              type="monotone"
              dataKey="current"
              stroke="var(--color-foreground)"
              strokeWidth={2}
              fill="url(#revFill)"
              dot={false}
              activeDot={{
                r: 4,
                stroke: "var(--color-background)",
                strokeWidth: 2,
                fill: "var(--color-foreground)",
              }}
            />
            <Line type="monotone" dataKey="current" stroke="var(--color-foreground)" dot={false} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-3 flex items-center gap-4 text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
        <span className="inline-flex items-center gap-1.5">
          <span className="h-[2px] w-4 bg-foreground" /> This year
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-[2px] w-4 border-t border-dashed border-muted-foreground" /> Previous
        </span>
      </div>
    </Card>
  );
}

function ChartTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ value: number; dataKey: string }>;
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  const current = payload.find((p) => p.dataKey === "current")?.value ?? 0;
  const previous = payload.find((p) => p.dataKey === "previous")?.value ?? 0;
  return (
    <div className="rounded-md border border-border bg-background px-3 py-2 text-xs shadow-md">
      <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">{label}</div>
      <div className="mt-1 flex items-center justify-between gap-6">
        <span className="text-muted-foreground">This year</span>
        <span className="font-mono tabular-nums">${current.toLocaleString()}</span>
      </div>
      <div className="flex items-center justify-between gap-6">
        <span className="text-muted-foreground">Previous</span>
        <span className="font-mono tabular-nums">${previous.toLocaleString()}</span>
      </div>
    </div>
  );
}
