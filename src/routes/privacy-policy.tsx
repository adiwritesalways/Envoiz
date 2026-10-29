import { createFileRoute } from "@tanstack/react-router";

import { SiteShell } from "@/components/envoiz/SiteShell";
import { Card, CardContent } from "@/components/ui/card";
import { brandName } from "@/lib/envoiz";

export const Route = createFileRoute("/privacy-policy")({
  head: () => ({
    meta: [
      { title: `Privacy Policy - ${brandName}` },
      { name: "description", content: "Privacy policy for Envoiz" },
    ],
  }),
  component: PrivacyPolicyPage,
});

function PrivacyPolicyPage() {
  return (
    <SiteShell>
      <div className="mx-auto max-w-4xl px-6 py-10 md:py-14">
        <section>
          <p className="text-[12px] uppercase tracking-[0.18em] text-muted-foreground">Legal</p>
          <h1 className="mt-3 text-4xl font-semibold tracking-[-0.04em] md:text-6xl">
            Privacy Policy
          </h1>
          <p className="mt-4 text-[16px] leading-relaxed text-muted-foreground">
            This summary explains how {brandName} handles information in a way that supports the
            invoicing workflow while keeping account data protected.
          </p>
        </section>

        <div className="mt-10 space-y-4">
          {[
            [
              "Information we collect",
              "We collect the account details, invoice data, and support messages you provide when using the product. We may also retain basic usage telemetry needed to keep the service stable.",
            ],
            [
              "How we use information",
              "Data is used to render invoices, deliver PDFs, authenticate users, and respond to support requests. We do not sell your invoice content or customer records.",
            ],
            [
              "Data retention",
              "We keep account data for as long as the workspace is active and remove or anonymize it after deletion, subject to legal and operational requirements.",
            ],
            ["Contact", "Questions about this policy can be sent to privacy@envoiz.com."],
          ].map(([title, body]) => (
            <Card key={title} className="border-hairline bg-white/80">
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold tracking-[-0.03em]">{title}</h2>
                <p className="mt-3 text-[15px] leading-relaxed text-muted-foreground">{body}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </SiteShell>
  );
}
