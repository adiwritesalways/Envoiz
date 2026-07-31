import { createFileRoute } from "@tanstack/react-router";

import { SiteShell } from "@/components/envoiz/SiteShell";
import { brandName } from "@/lib/envoiz";
import { Shield, Lock, Activity, Mail } from "lucide-react";

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
    <SiteShell dark>
      <div className="relative min-h-screen bg-[#050505] text-[#F5F5F5]">
        {/* Page-level ambient glow — sits at absolute top, bleeds through header */}
        <div className="pointer-events-none fixed inset-x-0 top-0 z-0 flex justify-center overflow-hidden">
          <div className="h-[500px] w-[900px] -translate-y-1/3 rounded-full bg-white/[0.03] blur-[140px]" />
        </div>

        {/* Hero */}
        <section className="relative border-b border-[#111111] px-6 pb-20 pt-16 md:pb-28 md:pt-24">
          <div className="relative mx-auto max-w-5xl">
            <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-[#555555]">
              Security
            </p>
            <h1 className="mt-4 text-4xl font-extrabold tracking-[-0.04em] text-white md:text-6xl lg:text-7xl">
              Security built for<br className="hidden md:block" />{" "}
              <span className="text-[#999999]">financial workflows.</span>
            </h1>
            <p className="mt-6 max-w-2xl text-[16px] leading-relaxed text-[#888888] md:text-[18px]">
              {brandName} is designed to protect invoice data, customer details,
              and access to your account with practical, layered safeguards.
            </p>
          </div>
        </section>

        {/* Feature Cards */}
        <section className="mx-auto max-w-5xl px-6 py-16">
          <div className="grid gap-4 md:grid-cols-3">
            {[
              {
                icon: Lock,
                title: "Access controls",
                body: "Role-based access and authenticated sessions help limit who can make changes to your account and invoices.",
              },
              {
                icon: Shield,
                title: "Transport security",
                body: "All requests are served over HTTPS so invoice and account data stays encrypted in transit, always.",
              },
              {
                icon: Activity,
                title: "Monitoring",
                body: "Operational monitoring and service health checks help the team catch and resolve issues quickly.",
              },
            ].map(({ icon: Icon, title, body }) => (
              <div
                key={title}
                className="group rounded-2xl border border-[#1A1A1A] bg-[#0D0D0D] p-6 transition-colors hover:border-[#2A2A2A]"
              >
                <div className="mb-5 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[#111111] text-[#777777]">
                  <Icon className="h-5 w-5" />
                </div>
                <p className="text-[11px] font-bold uppercase tracking-widest text-[#555555]">
                  {title}
                </p>
                <p className="mt-3 text-[14px] leading-relaxed text-[#888888]">
                  {body}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Divider */}
        <div className="border-t border-[#111111]" />

        {/* Info Cards */}
        <section className="mx-auto max-w-5xl px-6 py-16">
          <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
            {/* Reporting issues */}
            <div className="rounded-2xl border border-[#1A1A1A] bg-[#0D0D0D] p-6 md:p-8">
              <div className="flex items-center gap-3">
                <div className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-[#111111] text-[#888888]">
                  <Mail className="h-4 w-4" />
                </div>
                <p className="text-[11px] font-bold uppercase tracking-widest text-[#555555]">
                  Reporting issues
                </p>
              </div>
              <p className="mt-5 text-[15px] leading-relaxed text-[#888888]">
                If you discover a security issue, please contact{" "}
                <a
                  href="mailto:security@envoiz.com"
                  className="text-[#aaaaaa] underline underline-offset-2 transition-opacity hover:opacity-80"
                >
                  security@envoiz.com
                </a>{" "}
                with as much detail as possible, including the affected route,
                the expected behavior, and any reproduction steps.
              </p>
            </div>

            {/* Security Practices */}
            <div className="rounded-2xl border border-[#1A1A1A] bg-[#0D0D0D] p-6 md:p-8">
              <p className="text-[11px] font-bold uppercase tracking-widest text-[#555555]">
                Security practices
              </p>
              <ul className="mt-5 space-y-3 text-[14px] leading-relaxed text-[#888888]">
                {[
                  "We encourage strong, unique passwords and regular rotation.",
                  "Delivery logs can be verified for every dispatched invoice.",
                  "Least-privilege access is recommended for team members.",
                  "Sensitive account actions should be reviewed before release to production.",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2.5">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#555555]" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* CTA Banner */}
        <section className="border-t border-[#111111] px-6 py-20">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-3xl font-extrabold tracking-[-0.03em] text-white md:text-4xl">
              Have a security concern?
            </h2>
            <p className="mt-4 text-[15px] leading-relaxed text-[#888888]">
              Our team takes every report seriously and will respond promptly to
              any verified security issues.
            </p>
            <a
              href="mailto:security@envoiz.com"
              className="mt-8 inline-flex h-12 items-center gap-2 rounded-md bg-white px-8 text-sm font-bold text-black transition-all hover:bg-[#e0e0e0]"
            >
              Contact Security Team
            </a>
          </div>
        </section>
      </div>
    </SiteShell>
  );
}
