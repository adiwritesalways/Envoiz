import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Clock3, FileText, UserRound } from "lucide-react";

import {
  DashboardPage,
  MetricCard,
  MiniChart,
  Panel,
  StatusPill,
} from "@/components/envoiz/DashboardUI";
import { brandName, dashboardMetrics, sampleCustomers, sampleInvoices } from "@/lib/envoiz";

export const Route = createFileRoute("/dashboard/")({
  head: () => ({
    meta: [
      { title: `Overview - ${brandName}` },
      {
        name: "description",
        content: "Track invoices, revenue, and customer activity in the Envoiz dashboard.",
      },
    ],
  }),
  component: OverviewPage,
});

function OverviewPage() {
  return (
    <DashboardPage
      eyebrow="Overview"
      title="A calm view of your billing operations."
      description="See what has been paid, what is pending, and who needs attention next."
      actions={
        <>
          <Link
            to="/dashboard/invoices"
            className="inline-flex items-center gap-2 rounded-full bg-foreground px-4 py-2 text-[13px] font-medium text-background transition-colors hover:opacity-90"
          >
            Create invoice <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </>
      }
    >
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {dashboardMetrics.map((metric) => (
          <MetricCard
            key={metric.label}
            label={metric.label}
            value={metric.value}
            delta={metric.delta}
          />
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.35fr_0.95fr]">
        <Panel
          title="Revenue trend"
          description="A steady, readable snapshot of recent billing activity."
          actions={
            <span className="rounded-full bg-secondary px-3 py-1 text-[11px] font-medium text-muted-foreground">
              Last 30 days
            </span>
          }
          className="overflow-hidden"
        >
          <MiniChart values={[12, 18, 15, 24, 20, 28, 26, 34, 31, 42, 40, 46]} />
          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl bg-surface/70 p-4">
              <p className="text-[12px] text-muted-foreground">Average invoice value</p>
              <div className="mt-2 text-2xl font-semibold tabular-nums">$376</div>
            </div>
            <div className="rounded-2xl bg-surface/70 p-4">
              <p className="text-[12px] text-muted-foreground">Paid rate</p>
              <div className="mt-2 text-2xl font-semibold tabular-nums">86%</div>
            </div>
            <div className="rounded-2xl bg-surface/70 p-4">
              <p className="text-[12px] text-muted-foreground">Open invoices</p>
              <div className="mt-2 text-2xl font-semibold tabular-nums">176</div>
            </div>
          </div>
        </Panel>

        <Panel title="Recent customers" description="A compact list ready for future expansion.">
          <div className="space-y-3">
            {sampleCustomers.slice(0, 4).map((customer) => (
              <div
                key={customer.email}
                className="flex items-center gap-3 rounded-2xl bg-surface/70 px-4 py-3"
              >
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-foreground text-[13px] font-medium text-background">
                  {customer.name.slice(0, 1)}
                </div>
                <div className="min-w-0">
                  <div className="truncate text-[14px] font-medium">{customer.name}</div>
                  <div className="truncate text-[12.5px] text-muted-foreground">
                    {customer.email}
                  </div>
                </div>
                <UserRound className="ml-auto h-4 w-4 text-muted-foreground" />
              </div>
            ))}
          </div>
        </Panel>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <Panel title="Recent invoices" description="What just moved through the pipeline.">
          <div className="space-y-3">
            {sampleInvoices.slice(0, 3).map((invoice) => (
              <div
                key={invoice.id}
                className="flex items-center gap-4 rounded-2xl border border-hairline bg-white px-4 py-3"
              >
                <div className="grid h-10 w-10 place-items-center rounded-2xl bg-secondary">
                  <FileText className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <div className="text-[14px] font-medium">{invoice.id}</div>
                  <div className="text-[12.5px] text-muted-foreground">{invoice.customer}</div>
                </div>
                <div className="ml-auto text-right">
                  <div className="text-[14px] font-medium tabular-nums">{invoice.amount}</div>
                  <div className="mt-1 flex items-center justify-end gap-2">
                    <StatusPill status={invoice.status === "Paid" ? "Paid" : "Pending"} />
                    <span className="text-[12px] text-muted-foreground">{invoice.date}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Panel>

        <Panel title="Activity" description="Recent operational highlights.">
          <div className="space-y-4">
            {[
              { label: "Invoices sent today", value: "24", icon: Clock3 },
              { label: "Paid this week", value: "$12,480", icon: FileText },
              { label: "New customers", value: "8", icon: UserRound },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.label}
                  className="flex items-center gap-3 rounded-2xl bg-surface/70 px-4 py-3"
                >
                  <div className="grid h-10 w-10 place-items-center rounded-2xl bg-white shadow-sm">
                    <Icon className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="text-[12px] text-muted-foreground">{item.label}</div>
                    <div className="mt-1 text-[20px] font-semibold tabular-nums">{item.value}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </Panel>
      </div>
    </DashboardPage>
  );
}
