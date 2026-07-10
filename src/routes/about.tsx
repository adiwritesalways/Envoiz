import { createFileRoute } from "@tanstack/react-router";

import { SiteShell } from "@/components/envoiz/SiteShell";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { brandName, slogan } from "@/lib/envoiz";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [{ title: `About - ${brandName}` }, { name: "description", content: slogan }],
  }),
  component: AboutPage,
});

function AboutPage() {
  return (
    <SiteShell>
      <div className="mx-auto max-w-5xl px-6 py-10 md:py-14">
        <section className="max-w-3xl">
          <p className="text-[12px] uppercase tracking-[0.18em] text-muted-foreground">Company</p>
          <h1 className="mt-3 text-4xl font-semibold tracking-[-0.04em] md:text-6xl">
            Built to make invoicing feel effortless.
          </h1>
          <p className="mt-4 text-[16px] leading-relaxed text-muted-foreground md:text-[17px]">
            {brandName} helps freelancers and small businesses create, send, and track invoices
            without needing a stack of disconnected tools.
          </p>
        </section>

        <section className="mt-10 grid gap-4 md:grid-cols-3">
          {[
            ["Faster billing", "Clear workflows and polished PDFs that reduce friction."],
            ["Less admin", "One place to manage customers, payments, and exports."],
            ["Developer-friendly", "An API and webhooks that fit clean product teams."],
          ].map(([title, description]) => (
            <Card key={title} className="border-hairline bg-white/80">
              <CardContent className="p-6">
                <Badge variant="secondary">{title}</Badge>
                <p className="mt-4 text-[14px] leading-relaxed text-muted-foreground">
                  {description}
                </p>
              </CardContent>
            </Card>
          ))}
        </section>

        <section className="mt-10 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <Card className="border-hairline bg-white/80">
            <CardContent className="p-6 md:p-8">
              <p className="text-[12px] uppercase tracking-[0.18em] text-muted-foreground">
                Our mission
              </p>
              <h2 className="mt-3 text-2xl font-semibold tracking-[-0.03em]">
                Keep the invoice lifecycle simple enough to trust.
              </h2>
              <p className="mt-4 text-[15px] leading-relaxed text-muted-foreground">
                We believe invoicing should be a small, reliable part of running a business. That
                means clear status updates, predictable automation, and documents that look polished
                the first time they are sent.
              </p>
            </CardContent>
          </Card>

          <Card className="border-hairline bg-white/80">
            <CardContent className="p-6 md:p-8">
              <p className="text-[12px] uppercase tracking-[0.18em] text-muted-foreground">
                What we value
              </p>
              <ul className="mt-4 space-y-3 text-[14px] leading-relaxed text-muted-foreground">
                <li>- Clarity over complexity</li>
                <li>- Reliable automation over manual follow-up</li>
                <li>- Strong defaults with room to customize</li>
                <li>- Premium quality in every touchpoint</li>
              </ul>
            </CardContent>
          </Card>
        </section>
      </div>
    </SiteShell>
  );
}
