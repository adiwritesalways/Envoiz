import { createFileRoute } from "@tanstack/react-router";

import { SiteShell } from "@/components/envoiz/SiteShell";
import { brandName } from "@/lib/envoiz";

export const Route = createFileRoute("/resources/docs")({
  head: () => ({
    meta: [
      { title: `Product guide - ${brandName}` },
      { name: "description", content: "Guidance for using Envoiz invoices." },
    ],
  }),
  component: ProductGuidePage,
});

function ProductGuidePage() {
  return (
    <SiteShell>
      <main className="mx-auto max-w-3xl px-6 py-14 md:py-20">
        <p className="text-[12px] uppercase tracking-[0.18em] text-muted-foreground">
          Product guide
        </p>
        <h1 className="mt-3 text-4xl font-semibold tracking-[-0.04em] md:text-6xl">
          Create clear invoices, without a payment layer.
        </h1>
        <div className="mt-8 space-y-6 text-[16px] leading-relaxed text-muted-foreground">
          <p>
            Add your company details once, create an invoice with line items and a client, then save
            it to your workspace. You can reopen any saved invoice to edit it or download a PDF or
            PNG.
          </p>
          <p>
            Invoice statuses are manual labels for your records. Envoiz does not collect, process,
            or confirm payments.
          </p>
          <p>
            Envoiz does not currently offer a public API or webhooks. Those references have been
            intentionally removed so the product guide reflects what is available today.
          </p>
        </div>
      </main>
    </SiteShell>
  );
}
