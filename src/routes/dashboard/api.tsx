import { createFileRoute } from "@tanstack/react-router";
import { Copy, RefreshCw, FileCode2, Server } from "lucide-react";

import { DashboardPage, Panel } from "@/components/envoiz/DashboardUI";
import { brandName } from "@/lib/envoiz";

export const Route = createFileRoute("/dashboard/api")({
  head: () => ({
    meta: [
      { title: `API - ${brandName}` },
      {
        name: "description",
        content: "Manage your Envoiz API key and usage from a polished placeholder UI.",
      },
    ],
  }),
  component: ApiPage,
});

function ApiPage() {
  return (
    <DashboardPage
      eyebrow="API"
      title="Developer access, presented cleanly."
      description="Backend logic is not implemented here yet, so this page stays UI-only with placeholder values."
      actions={
        <a
          href="/#api"
          className="inline-flex items-center gap-2 rounded-full bg-foreground px-4 py-2 text-[13px] font-medium text-background transition-colors hover:opacity-90"
        >
          View API Documentation
        </a>
      }
    >
      <div className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
        <Panel title="API Key" description="A masked key card with copy and regenerate actions.">
          <div className="rounded-3xl border border-hairline bg-surface/60 p-5">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                  Live key
                </p>
                <div className="mt-3 font-mono text-[15px] tracking-[0.18em]">
                  ••••••••••••••••••••••••••
                </div>
              </div>
              <Server className="h-5 w-5 text-muted-foreground" />
            </div>
            <div className="mt-5 flex flex-wrap gap-2">
              <ActionButton icon={Copy} label="Copy" />
              <ActionButton icon={RefreshCw} label="Regenerate" />
            </div>
          </div>
        </Panel>

        <Panel
          title="Usage"
          description="Placeholder statistics only, no fake backend implementation."
        >
          <div className="grid gap-3 sm:grid-cols-2">
            {[
              ["Requests today", "12,480"],
              ["Requests this month", "284,910"],
              ["Error rate", "0.18%"],
              ["Avg latency", "38 ms"],
            ].map(([label, value]) => (
              <div key={label} className="rounded-3xl bg-surface/70 p-4">
                <p className="text-[12px] text-muted-foreground">{label}</p>
                <div className="mt-2 text-2xl font-semibold tabular-nums">{value}</div>
              </div>
            ))}
          </div>
        </Panel>
      </div>

      <Panel
        title="SDK-ready response preview"
        description="Illustrative only, so developers can visualize the shape of the API."
      >
        <div className="rounded-3xl bg-foreground p-5 text-background">
          <div className="mb-4 flex items-center gap-2 text-[12px] text-background/60">
            <FileCode2 className="h-4 w-4" />
            <span>POST /api/v1/invoices</span>
          </div>
          <pre className="overflow-x-auto text-[12.5px] leading-relaxed text-background/90">
            {`{
  "invoice_id": "ENV-000001",
  "status": "created",
  "pdf_url": "https://cdn.envoiz.io/invoices/ENV-000001.pdf"
}`}
          </pre>
        </div>
      </Panel>
    </DashboardPage>
  );
}

function ActionButton({ icon: Icon, label }: { icon: typeof Copy; label: string }) {
  return (
    <button className="inline-flex items-center gap-2 rounded-full border border-hairline bg-white px-4 py-2 text-[13px] font-medium transition-colors hover:bg-secondary">
      <Icon className="h-3.5 w-3.5" />
      {label}
    </button>
  );
}
