import { createFileRoute } from "@tanstack/react-router";
import { RefreshCw, Link2, ShieldCheck } from "lucide-react";

import { DashboardPage, Panel, StatusPill } from "@/components/envoiz/DashboardUI";
import { brandName, sampleRecentDeliveries } from "@/lib/envoiz";

export const Route = createFileRoute("/dashboard/webhooks")({
  head: () => ({
    meta: [
      { title: `Webhooks - ${brandName}` },
      {
        name: "description",
        content:
          "Monitor webhook configuration and recent deliveries from the Envoiz dashboard UI.",
      },
    ],
  }),
  component: WebhooksPage,
});

function WebhooksPage() {
  return (
    <DashboardPage
      eyebrow="Webhooks"
      title="Webhook operations, without backend logic."
      description="Keep the UI crisp and useful while the integration surface is still being built."
    >
      <div className="grid gap-4 xl:grid-cols-[0.95fr_1.05fr]">
        <Panel title="Webhook URL" description="A polished configuration card with current status.">
          <div className="space-y-4">
            <div className="rounded-3xl border border-hairline bg-surface/60 p-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                    Endpoint
                  </p>
                  <div className="mt-3 font-mono text-[13px]">
                    https://api.envoiz.io/webhooks/billing
                  </div>
                </div>
                <Link2 className="h-5 w-5 text-muted-foreground" />
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <StatusPill status="Delivered" />
              <span className="text-[13px] text-muted-foreground">
                Healthy connection with recent successful deliveries.
              </span>
            </div>

            <div className="flex flex-wrap gap-2">
              <button className="inline-flex items-center gap-2 rounded-full bg-foreground px-4 py-2 text-[13px] font-medium text-background transition-colors hover:opacity-90">
                <ShieldCheck className="h-3.5 w-3.5" />
                Verify
              </button>
              <button className="inline-flex items-center gap-2 rounded-full border border-hairline bg-white px-4 py-2 text-[13px] font-medium transition-colors hover:bg-secondary">
                <RefreshCw className="h-3.5 w-3.5" />
                Retry
              </button>
            </div>
          </div>
        </Panel>

        <Panel title="Recent deliveries" description="Retry controls are UI-only here.">
          <div className="space-y-3">
            {sampleRecentDeliveries.map((delivery) => (
              <div
                key={`${delivery.event}-${delivery.time}`}
                className="flex items-center gap-4 rounded-3xl bg-surface/70 px-4 py-4"
              >
                <div className="grid h-10 w-10 place-items-center rounded-2xl bg-white">
                  <Link2 className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <div className="text-[14px] font-medium">{delivery.event}</div>
                  <div className="text-[12.5px] text-muted-foreground">{delivery.target}</div>
                </div>
                <div className="ml-auto text-right">
                  <StatusPill status={delivery.status === "Delivered" ? "Delivered" : "Retrying"} />
                  <div className="mt-2 text-[12px] text-muted-foreground">{delivery.time}</div>
                </div>
              </div>
            ))}
          </div>
        </Panel>
      </div>
    </DashboardPage>
  );
}
