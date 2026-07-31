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
import { ArrowDownRight, ArrowUpRight, Calendar, ChevronDown, Download, FileText, Plus } from "lucide-react";
import { useAuth } from "@/components/auth/auth-context";
import { Button } from "@/components/ui/button";
import { RecentInvoicesList } from "@/components/envoiz/RecentInvoicesList";
import { DashboardShell } from "@/components/envoiz/DashboardShell";
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

function generateRevenueData(invoices: any[], rates: Record<string, number> = {}, baseCurrency: string = "USD") {
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const currentYear = new Date().getFullYear();

  const data = months.map((m) => ({ m, current: 0, previous: 0 }));

  invoices.forEach((inv) => {
    if (inv.status !== "Paid") return;
    const invCurrency = inv.currency || "USD";
    const rate = rates[invCurrency] || 1;
    // We convert invoice amount TO the base currency. 
    // The API gives us rates relative to baseCurrency (e.g. if base is BDT, USD rate is ~0.009)
    // Wait, if base is BDT, then 1 BDT = 0.009 USD.
    // So to convert an invoice of 65 USD to BDT, we divide 65 / rate.
    const normalizedTotal = inv.total / rate;

    const date = new Date(inv.createdAt);
    if (date.getFullYear() === currentYear) {
      data[date.getMonth()].current += normalizedTotal;
    } else if (date.getFullYear() === currentYear - 1) {
      data[date.getMonth()].previous += normalizedTotal;
    }
  });

  return data;
}

type RangeKey = "3M" | "6M" | "12M" | "YTD";

function filterRevenueData(data: ReturnType<typeof generateRevenueData>, range: RangeKey) {
  const currentMonth = new Date().getMonth(); // 0-indexed
  switch (range) {
    case "3M":
      // last 3 months ending at current month
      return data.slice(Math.max(0, currentMonth - 2), currentMonth + 1);
    case "6M":
      return data.slice(Math.max(0, currentMonth - 5), currentMonth + 1);
    case "YTD":
      // Jan (index 0) through current month
      return data.slice(0, currentMonth + 1);
    case "12M":
    default:
      return data;
  }
}

function getTimeGreeting() {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return "Good morning";
  if (hour >= 12 && hour < 17) return "Good afternoon";
  if (hour >= 17 && hour < 21) return "Good evening";
  return "Good night";
}

function formatMoney(value: number, currencyCode: string) {
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currencyCode,
      maximumFractionDigits: 0,
    }).format(value);
  } catch {
    return `${currencyCode} ${value.toLocaleString()}`;
  }
}

function DashboardOverview() {
  const { user } = useAuth();

  const [companyName, setCompanyName] = React.useState("");
  const [currency, setCurrency] = React.useState("USD");

  React.useEffect(() => {
    const name =
      user?.user_metadata?.company_name ||
      readUserStorageValue(user?.id, settingsStorageKeys.companyName, "");
    setCompanyName(name);
    const curr = readUserStorageValue(user?.id, settingsStorageKeys.defaultCurrency, "USD");
    setCurrency(curr);
  }, [user?.user_metadata?.company_name, user?.id]);

  const invoicesQuery = useQuery({
    queryKey: ["invoices", user?.id],
    queryFn: () => fetchInvoices(user?.id ?? ""),
    enabled: Boolean(user?.id),
  });

  const ratesQuery = useQuery({
    queryKey: ["exchangeRates", currency],
    queryFn: async () => {
      const res = await fetch(`https://open.er-api.com/v6/latest/${currency}`);
      if (!res.ok) throw new Error("Failed to fetch rates");
      const data = await res.json();
      return data.rates as Record<string, number>;
    },
    staleTime: 1000 * 60 * 60 * 24, // 24 hours
  });

  const invoices = invoicesQuery.data ?? [];
  const rates = ratesQuery.data ?? {};
  
  const revenueData = React.useMemo(() => generateRevenueData(invoices, rates, currency), [invoices, rates, currency]);
  const greeting = React.useMemo(() => getTimeGreeting(), []);

  const totalRevenue = invoices.reduce(
    (sum, inv) => {
      if (inv.status !== "Paid") return sum;
      const rate = rates[inv.currency || "USD"] || 1;
      return sum + (inv.total / rate);
    },
    0,
  );
  const totalOutstanding = invoices.reduce(
    (sum, inv) => {
      if (inv.status !== "Pending") return sum;
      const rate = rates[inv.currency || "USD"] || 1;
      return sum + (inv.total / rate);
    },
    0,
  );
  const overdueCount = invoices.filter((inv) => (inv.status as string) === "Overdue").length;
  const uniqueClients = new Set(invoices.map((inv: any) => inv.clientEmail?.toLowerCase())).size;

  const hasInvoices = invoices.length > 0;

  const dynamicMetrics = [
    { label: "Total revenue", value: hasInvoices ? formatMoney(totalRevenue, currency) : "—" },
    { label: "Pending", value: hasInvoices ? formatMoney(totalOutstanding, currency) : "—" },
    { label: "Invoices", value: hasInvoices ? invoices.length.toLocaleString() : "—" },
    {
      label: "Overdue",
      value: hasInvoices ? overdueCount.toLocaleString() : "—",
      accent: overdueCount > 0 ? "overdue" : undefined,
    },
    { label: "Clients", value: hasInvoices ? uniqueClients.toLocaleString() : "—" },
  ];

  return (
    <DashboardShell>
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">{greeting}</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight">
            Here's how {companyName || "your business"} is doing today.
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

      <section className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {invoicesQuery.isError && (
          <div className="col-span-full flex items-center justify-between gap-4 rounded-2xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-[13px] text-destructive">
            <span>Unable to load your data. Check your connection and try again.</span>
            <button
              onClick={() => invoicesQuery.refetch()}
              className="shrink-0 rounded-full border border-destructive/30 bg-[#141414] px-3 py-1.5 text-[12px] font-medium text-destructive transition-colors hover:bg-destructive/10"
            >
              Retry
            </button>
          </div>
        )}
        {dynamicMetrics.map((m) => (
          <div
            key={m.label}
            className={cn(
              "group relative overflow-hidden rounded-lg border border-[#1F1F1F] bg-[#121212] p-4 sm:p-5 transition-all duration-200 hover:-translate-y-px hover:border-neutral-800 flex flex-col justify-between min-h-[110px]",
              m.accent === "overdue" && overdueCount > 0 &&
                "border-red-900/30 bg-red-950/10 hover:border-red-800/50",
            )}
          >
            <div
              className={cn(
                "text-[10px] font-medium tracking-wider uppercase text-neutral-500 block mb-1",
                m.accent === "overdue" && overdueCount > 0 && "text-red-400",
              )}
            >
              {m.label}
            </div>
            <div
              className={cn(
                "mt-3 text-xl md:text-2xl font-bold text-[#F5F5F5] tracking-tight tabular-nums leading-none",
                m.accent === "overdue" && overdueCount > 0 && "text-red-400",
              )}
            >
              {invoicesQuery.isLoading ? <span className="text-neutral-500/40">—</span> : m.value}
            </div>
            {m.label === "Total revenue" && invoicesQuery.data && (
              <div className="flex items-center gap-1.5 mt-2 text-[11px] text-emerald-400">
                <span>+14.2%</span>
                <span className="text-neutral-500">vs last month</span>
              </div>
            )}
            {m.label === "Pending" && invoicesQuery.data && (
              <div className="flex items-center gap-1.5 mt-2 text-[11px] text-[#888888]">
                <span>{invoices.filter(i => i.status === "Pending").length} active</span>
              </div>
            )}
            {m.label === "Invoices" && invoicesQuery.data && (
              <div className="flex items-center gap-1.5 mt-2 text-[11px] text-neutral-500">
                <span>Total created</span>
              </div>
            )}
            {m.label === "Overdue" && invoicesQuery.data && (
              <div className="flex items-center gap-1.5 mt-2 text-[11px] text-neutral-500">
                <span>Requires action</span>
              </div>
            )}
            {m.label === "Clients" && invoicesQuery.data && (
              <div className="flex items-center gap-1.5 mt-2 text-[11px] text-neutral-500">
                <span>Unique accounts</span>
              </div>
            )}
          </div>
        ))}
      </section>

      <RevenueChart fullRevenueData={revenueData} currency={currency} />

      <section className="grid grid-cols-1 gap-4">
        <RecentInvoicesList
          user={user}
          title="Recent invoices"
          description="The latest invoices across all customers."
          viewAllHref="/dashboard/invoices"
          viewAllScrollTo="invoice-list"
        />
      </section>
    </div>
    </DashboardShell>
  );
}

type RevenueChartProps = { fullRevenueData: any[]; currency: string };
function RevenueChart({ fullRevenueData, currency }: RevenueChartProps) {
  const [range, setRange] = React.useState("12M" as RangeKey);

  const revenueData = React.useMemo(
    () => filterRevenueData(fullRevenueData, range),
    [fullRevenueData, range],
  );

  const total = revenueData.reduce((a, b) => a + b.current, 0);
  const totalPrevious = revenueData.reduce((a, b) => a + b.previous, 0);

  const formatTick = (v: number) => {
    try {
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency,
        maximumFractionDigits: 0,
        notation: "compact",
      }).format(v);
    } catch {
      return `${(v / 1000).toFixed(0)}k`;
    }
  };

  return (
    <div className="rounded-lg border border-[#1F1F1F] bg-[#121212] p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="text-[10px] font-medium tracking-wider uppercase text-neutral-500 block mb-1">
            Revenue
          </div>
          <div className="mt-1 flex items-baseline gap-3">
            <div className="font-mono text-3xl font-semibold tabular-nums tracking-tight">
              {formatMoney(total, currency)}
            </div>
            {totalPrevious > 0 && (
              <span className="inline-flex items-center gap-0.5 rounded-full border border-border px-1.5 py-0.5 text-[10px] font-medium">
                {total >= totalPrevious ? (
                  <ArrowUpRight className="h-3 w-3" />
                ) : (
                  <ArrowDownRight className="h-3 w-3" />
                )}
                {(((total - totalPrevious) / totalPrevious) * 100).toFixed(1)}%
              </span>
            )}
          </div>
          {totalPrevious > 0 && (
            <p className="mt-1 text-xs text-muted-foreground">
              Compared to {formatMoney(totalPrevious, currency)} previous period
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
              tickFormatter={formatTick}
            />
            <Tooltip
              cursor={{ stroke: "var(--color-foreground)", strokeDasharray: "2 4" }}
              content={<ChartTooltip currency={currency} />}
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

      <div className="mt-3 flex items-center gap-4 text-[11px] uppercase tracking-[0.16em] text-neutral-500">
        <span className="inline-flex items-center gap-1.5">
          <span className="h-[2px] w-4 bg-white" /> This year
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-[2px] w-4 border-t border-dashed border-neutral-600" /> Previous
        </span>
      </div>
    </div>
  );
}

function ChartTooltip({
  active,
  payload,
  label,
  currency,
}: {
  active?: boolean;
  payload?: Array<{ value: number; dataKey: string }>;
  label?: string;
  currency: string;
}) {
  if (!active || !payload?.length) return null;
  const current = payload.find((p) => p.dataKey === "current")?.value ?? 0;
  const previous = payload.find((p) => p.dataKey === "previous")?.value ?? 0;
  return (
    <div className="rounded-md border border-[#1F1F1F] bg-[#0D0D0D] px-3 py-2 text-xs shadow-md">
      <div className="text-[10px] uppercase tracking-[0.18em] text-neutral-500">{label}</div>
      <div className="mt-1 flex items-center justify-between gap-6">
        <span className="text-neutral-400">This year</span>
        <span className="font-mono tabular-nums text-white">{formatMoney(current, currency)}</span>
      </div>
      <div className="flex items-center justify-between gap-6">
        <span className="text-neutral-400">Previous</span>
        <span className="font-mono tabular-nums text-neutral-300">{formatMoney(previous, currency)}</span>
      </div>
    </div>
  );
}
