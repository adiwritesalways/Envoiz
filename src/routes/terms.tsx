import { createFileRoute } from "@tanstack/react-router";

import { SiteShell } from "@/components/envoiz/SiteShell";
import { Card, CardContent } from "@/components/ui/card";
import { brandName } from "@/lib/envoiz";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: `Terms - ${brandName}` },
      { name: "description", content: "Terms of service for Envoiz" },
    ],
  }),
  component: TermsPage,
});

function TermsPage() {
  return (
    <SiteShell>
      <div className="mx-auto max-w-4xl px-6 py-10 md:py-14">
        <section>
          <p className="text-[12px] uppercase tracking-[0.18em] text-muted-foreground">Legal</p>
          <h1 className="mt-3 text-4xl font-semibold tracking-[-0.04em] md:text-6xl">
            Terms of Service
          </h1>
          <p className="mt-4 text-[16px] leading-relaxed text-muted-foreground">
            These terms describe how you can use {brandName} and what we expect from customers using
            the platform for invoicing, PDFs, and automation.
          </p>
        </section>

        <div className="mt-10 space-y-4">
          {[
            [
              "Acceptable use",
              "Use the service only for lawful business activities and do not attempt to disrupt the platform, abuse rate limits, or access another workspace without permission.",
            ],
            [
              "Accounts and billing",
              "You are responsible for the accuracy of the information tied to your account and for reviewing billing changes associated with your chosen plan.",
            ],
            [
              "Service availability",
              "We work to keep the product available and healthy, but maintenance windows and external dependencies can occasionally affect access.",
            ],
            ["Contact", "Questions about these terms can be sent to legal@envoiz.com."],
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
