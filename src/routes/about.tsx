import { createFileRoute } from "@tanstack/react-router";

import { SiteShell } from "@/components/envoiz/SiteShell";
import { Badge } from "@/components/ui/badge";
import { brandName, slogan } from "@/lib/envoiz";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [{ title: `About - ${brandName}` }, { name: "description", content: slogan }],
  }),
  component: AboutPage,
});

function AboutPage() {
  return (
    <SiteShell dark>
      <div className="relative min-h-screen bg-[#050505] text-[#F5F5F5]">
        {/* Page-level ambient glow */}
        <div className="pointer-events-none fixed inset-x-0 top-0 z-0 flex justify-center overflow-hidden">
          <div className="h-[500px] w-[900px] -translate-y-1/3 rounded-full bg-white/[0.03] blur-[140px]" />
        </div>

        {/* Hero Section */}
        <section className="relative border-b border-[#111111] px-6 pb-20 pt-16 md:pb-28 md:pt-24">
          <div className="relative mx-auto max-w-5xl">
            <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-[#555555]">
              Company
            </p>
            <h1 className="mt-4 text-4xl font-extrabold tracking-[-0.04em] text-white md:text-6xl">
              Built to make invoicing<br className="hidden md:block" />{" "}
              <span className="text-[#999999]">feel effortless.</span>
            </h1>
            <p className="mt-6 max-w-2xl text-[16px] leading-relaxed text-[#888888] md:text-[18px]">
              {brandName} helps freelancers and small businesses create, send, and track invoices
              without needing a stack of disconnected tools.
            </p>
          </div>
        </section>

        {/* Features Row */}
        <section className="mx-auto max-w-5xl px-6 py-16">
          <div className="grid gap-4 md:grid-cols-3">
            {[
              ["Faster billing", "Clear workflows and polished PDFs that reduce friction."],
              ["Less admin", "One place to manage customers, payments, and exports."],
              ["Customizable", "Flexible settings that fit clean product teams."],
            ].map(([title, description]) => (
              <div key={title} className="group rounded-2xl border border-[#1A1A1A] bg-[#0D0D0D] p-6 transition-colors hover:border-[#2A2A2A]">
                <Badge variant="secondary" className="bg-[#111111] text-[#999999] hover:bg-[#111111] border border-[#222222]">{title}</Badge>
                <p className="mt-4 text-[14px] leading-relaxed text-[#888888]">
                  {description}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Divider */}
        <div className="border-t border-[#111111]" />

        {/* Mission & Values */}
        <section className="mx-auto max-w-5xl px-6 py-16">
          <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="rounded-2xl border border-[#1A1A1A] bg-[#0D0D0D] p-6 md:p-8">
              <p className="text-[11px] font-bold uppercase tracking-widest text-[#555555]">
                Our mission
              </p>
              <h2 className="mt-3 text-2xl font-semibold tracking-[-0.03em] text-white">
                Keep the invoice lifecycle simple enough to trust.
              </h2>
              <p className="mt-4 text-[15px] leading-relaxed text-[#888888]">
                We believe invoicing should be a small, reliable part of running a business. That
                means clear status updates, predictable automation, and documents that look polished
                the first time they are sent.
              </p>
            </div>

            <div className="rounded-2xl border border-[#1A1A1A] bg-[#0D0D0D] p-6 md:p-8">
              <p className="text-[11px] font-bold uppercase tracking-widest text-[#555555]">
                What we value
              </p>
              <ul className="mt-5 space-y-3 text-[14px] leading-relaxed text-[#888888]">
                {[
                  "Clarity over complexity",
                  "Reliable automation over manual follow-up",
                  "Strong defaults with room to customize",
                  "Premium quality in every touchpoint",
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
      </div>
    </SiteShell>
  );
}
