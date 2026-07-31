import { createFileRoute } from "@tanstack/react-router";

import { SiteShell } from "@/components/envoiz/SiteShell";
import { brandName } from "@/lib/envoiz";

export const Route = createFileRoute("/privacy-policy")({
  head: () => ({
    meta: [
      { title: `Privacy Policy - ${brandName}` },
      {
        name: "description",
        content:
          "Read the Envoiz privacy policy to understand how we collect, use, and protect your data when you use our invoicing platform.",
      },
      { name: "robots", content: "index, follow" },
    ],
    links: [{ rel: "canonical", href: "https://envoiz.app/privacy-policy" }],
  }),
  component: PrivacyPolicyPage,
});

function PrivacyPolicyPage() {
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
              Privacy Policy
            </h1>
            <p className="mt-6 max-w-2xl text-[16px] leading-relaxed text-[#888888] md:text-[18px]">
              This summary explains how {brandName} handles information in a way that supports the
              invoicing workflow while keeping account data protected.
            </p>
          </div>
        </section>

        {/* Content Cards */}
        <section className="mx-auto max-w-4xl px-6 py-16">
          <div className="space-y-4">
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
