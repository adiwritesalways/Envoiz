import { createFileRoute } from "@tanstack/react-router";

import { SiteShell } from "@/components/envoiz/SiteShell";
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
    <SiteShell dark>
      <div className="relative min-h-screen bg-[#050505] text-[#F5F5F5]">
        {/* Page-level ambient glow */}
        <div className="pointer-events-none fixed inset-x-0 top-0 z-0 flex justify-center overflow-hidden">
          <div className="h-[500px] w-[900px] -translate-y-1/3 rounded-full bg-white/[0.03] blur-[140px]" />
        </div>

        {/* Hero Section */}
        <section className="relative border-b border-[#111111] px-6 pb-20 pt-16 md:pb-28 md:pt-24">
          <div className="relative mx-auto max-w-4xl">
            <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-[#555555]">
              Legal
            </p>
            <h1 className="mt-4 text-4xl font-extrabold tracking-[-0.04em] text-white md:text-6xl">
              Terms of Service
            </h1>
            <p className="mt-6 max-w-2xl text-[16px] leading-relaxed text-[#888888] md:text-[18px]">
              These terms describe how you can use {brandName} and what we expect from customers using
              the platform for invoicing, PDFs, and automation.
            </p>
          </div>
        </section>

        {/* Content Cards */}
        <section className="mx-auto max-w-4xl px-6 py-16">
          <div className="space-y-4">
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
              <div key={title} className="rounded-2xl border border-[#1A1A1A] bg-[#0D0D0D] p-6 md:p-8 transition-colors hover:border-[#2A2A2A]">
                <h2 className="text-xl font-bold tracking-[-0.03em] text-white">{title}</h2>
                <p className="mt-3 text-[15px] leading-relaxed text-[#888888]">{body}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </SiteShell>
  );
}
