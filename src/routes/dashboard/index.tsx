import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";
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
import { InvoiceFormDialog } from "@/components/envoiz/InvoiceFormDialog";
import { Button } from "@/components/ui/button";
import { RecentInvoicesList } from "@/components/envoiz/RecentInvoicesList";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";

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

const revenueData = [
  { m: "Jan", current: 12400, previous: 9800 },
  { m: "Feb", current: 14800, previous: 11200 },
  { m: "Mar", current: 13200, previous: 12500 },
  { m: "Apr", current: 17600, previous: 14100 },
  { m: "May", current: 21400, previous: 15800 },
  { m: "Jun", current: 19800, previous: 17200 },
  { m: "Jul", current: 24600, previous: 18900 },
  { m: "Aug", current: 28100, previous: 21300 },
  { m: "Sep", current: 26500, previous: 22800 },
  { m: "Oct", current: 31200, previous: 24100 },
  { m: "Nov", current: 34800, previous: 25600 },
  { m: "Dec", current: 38900, previous: 27400 },
];

const metrics = [
  { label: "Total revenue", value: "$284,520", delta: 12.4, up: true },
  { label: "Invoices sent", value: "1,284", delta: 8.1, up: true },
  { label: "Paid", value: "$219,840", delta: 4.2, up: true },
  { label: "Outstanding", value: "$64,680", delta: 2.3, up: false },
];

const recent = [
  { id: "INV-2026-0184", client: "Northwind Studios", amount: 4800, status: "Paid" },
  { id: "INV-2026-0183", client: "Patagonia Labs", amount: 1240, status: "Pending" },
  { id: "INV-2026-0182", client: "Helios Robotics", amount: 9600, status: "Paid" },
  { id: "INV-2026-0181", client: "Mercer & Co.", amount: 2150, status: "Overdue" },
  { id: "INV-2026-0180", client: "Atlas Foundry", amount: 720, status: "Draft" },
];

function DashboardOverview() {
  const { user } = useAuth();

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
              Here's how Envoiz is doing today.
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
            <InvoiceFormDialog
              trigger={
                <Button size="sm">
                  <Plus className="h-3.5 w-3.5" /> Create invoice
                </Button>
              }
            />
          </div>
        </header>

        {/* Metric cards */}
        <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {metrics.map((m) => (
            <Card key={m.label} className="border-border bg-card p-5 shadow-none">
              <div className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                {m.label}
              </div>
              <div className="mt-2 flex items-end justify-between gap-2">
                <div className="font-mono text-2xl font-semibold tabular-nums tracking-tight">
                  {m.value}
                </div>
                <span
                  className={cn(
                    "inline-flex items-center gap-0.5 rounded-full border border-border px-1.5 py-0.5 text-[10px] font-medium",
                    m.up ? "text-foreground" : "text-muted-foreground",
                  )}
                >
                  {m.up ? (
                    <ArrowUpRight className="h-3 w-3" />
                  ) : (
                    <ArrowDownRight className="h-3 w-3" />
                  )}
                  {m.delta}%
                </span>
              </div>
            </Card>
          ))}
        </section>

        {/* Chart */}
        <RevenueChart />

        {/* Bottom row */}
        <section className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <RecentInvoicesList
            user={user}
            title="Recent invoices"
            description="The latest invoices across all customers."
            viewAllHref="/dashboard/invoices"
          />

          <Card className="border-border bg-card p-5 shadow-none">
            <h3 className="text-sm font-semibold tracking-tight">Top customers</h3>
            <p className="text-xs text-muted-foreground">By revenue this year</p>
            <div className="mt-4 space-y-3">
              {[
                { name: "Helios Robotics", amount: 48200 },
                { name: "Northwind Studios", amount: 39400 },
                { name: "Patagonia Labs", amount: 22150 },
                { name: "Mercer & Co.", amount: 18900 },
              ].map((c) => (
                <div key={c.name} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span>{c.name}</span>
                    <span className="font-mono tabular-nums">${c.amount.toLocaleString()}</span>
                  </div>
                  <div className="h-1 w-full overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full bg-foreground"
                      style={{ width: `${(c.amount / 48200) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </section>
      </div>
    </DashboardShell>
  );
}

function RevenueChart() {
  const [range, setRange] = React.useState<"3M" | "6M" | "12M" | "YTD">("12M");

  const total = revenueData.reduce((a, b) => a + b.current, 0);

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
            <span className="inline-flex items-center gap-0.5 rounded-full border border-border px-1.5 py-0.5 text-[10px] font-medium">
              <ArrowUpRight className="h-3 w-3" /> 18.2%
            </span>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            Compared to ${revenueData.reduce((a, b) => a + b.previous, 0).toLocaleString()} previous
            period
          </p>
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
            <Line type="monotone" dataKey="current" stroke="transparent" dot={false} />
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

function StatusPill({ status }: { status: string }) {
  const dot =
    status === "Paid"
      ? "bg-foreground"
      : status === "Overdue"
        ? "bg-foreground"
        : "bg-muted-foreground";
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-border px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider">
      <span className={cn("h-1.5 w-1.5 rounded-full", dot)} />
      {status}
    </span>
  );
}
