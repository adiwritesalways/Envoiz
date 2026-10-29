import { createFileRoute } from "@tanstack/react-router";

import { SiteShell } from "@/components/envoiz/SiteShell";
import { brandName } from "@/lib/envoiz";

export const Route = createFileRoute("/resources/support")({
  head: () => ({
    meta: [
      { title: `Support - ${brandName}` },
      { name: "description", content: "Help using Envoiz invoices." },
    ],
  }),
  component: SupportPage,
});

function SupportPage() {
  return (
    <SiteShell>
      <main className="mx-auto max-w-3xl px-6 py-14 md:py-20">
        <p className="text-[12px] uppercase tracking-[0.18em] text-muted-foreground">Support</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-[-0.04em] md:text-6xl">
          Help for your invoice workspace.
        </h1>
        <div className="mt-8 space-y-5 text-[16px] leading-relaxed text-muted-foreground">
          <p>
            For common tasks, start with the product guide: profile details, invoice creation,
            editing, and exports.
          </p>
          <p>
            Envoiz does not process payments, provide API keys, or send webhook deliveries. Invoice
            statuses are managed manually in your workspace.
          </p>
        </div>
      </main>
    </SiteShell>
  );
}
