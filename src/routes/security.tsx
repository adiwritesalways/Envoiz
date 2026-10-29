import { createFileRoute } from "@tanstack/react-router";

import { SiteShell } from "@/components/envoiz/SiteShell";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { brandName } from "@/lib/envoiz";

export const Route = createFileRoute("/security")({
  head: () => ({
    meta: [
      { title: `Security - ${brandName}` },
      { name: "description", content: "Security overview for Envoiz" },
    ],
  }),
  component: SecurityPage,
});

function SecurityPage() {
  return (
    <SiteShell>
      <div className="mx-auto max-w-5xl px-6 py-10 md:py-14">
        <section className="max-w-3xl">
          <p className="text-[12px] uppercase tracking-[0.18em] text-muted-foreground">Security</p>
          <h1 className="mt-3 text-4xl font-semibold tracking-[-0.04em] md:text-6xl">
            Security built for financial workflows.
          </h1>
          <p className="mt-4 text-[16px] leading-relaxed text-muted-foreground md:text-[17px]">
            {brandName} is designed to protect invoice data, customer details, and access to your
            account with practical, layered safeguards.
          </p>
        </section>

        <section className="mt-10 grid gap-4 md:grid-cols-3">
          {[
            [
              "Access controls",
              "Role-based access and authenticated sessions help limit who can make changes.",
            ],
            [
              "Transport security",
              "Requests are served over HTTPS so invoice and account data stays encrypted in transit.",
            ],
            [
              "Monitoring",
              "Operational monitoring and service health checks help the team catch issues quickly.",
            ],
          ].map(([title, body]) => (
            <Card key={title} className="border-hairline bg-white/80">
              <CardContent className="p-6">
                <Badge variant="secondary">{title}</Badge>
                <p className="mt-4 text-[14px] leading-relaxed text-muted-foreground">{body}</p>
              </CardContent>
            </Card>
          ))}
        </section>

        <section className="mt-10 grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
          <Card className="border-hairline bg-white/80">
            <CardContent className="p-6 md:p-8">
              <p className="text-[12px] uppercase tracking-[0.18em] text-muted-foreground">
                Reporting issues
              </p>
              <p className="mt-4 text-[15px] leading-relaxed text-muted-foreground">
                If you discover a security issue, please contact security@envoiz.com with as much
                detail as possible, including the affected route, the expected behavior, and any
                reproduction steps.
              </p>
            </CardContent>
          </Card>

          <Card className="border-hairline bg-white/80">
            <CardContent className="p-6 md:p-8">
              <p className="text-[12px] uppercase tracking-[0.18em] text-muted-foreground">
                Security practices
              </p>
              <ul className="mt-4 space-y-3 text-[14px] leading-relaxed text-muted-foreground">
                <li>- We encourage strong, unique API keys and regular rotation.</li>
                <li>- Webhook signatures can be verified for every delivered event.</li>
                <li>- Least-privilege access is recommended for team members.</li>
                <li>
                  - Sensitive account actions should be reviewed before release to production.
                </li>
              </ul>
            </CardContent>
          </Card>
        </section>
      </div>
    </SiteShell>
  );
}
