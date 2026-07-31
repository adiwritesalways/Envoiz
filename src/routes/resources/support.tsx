import type { ComponentType, SVGProps } from "react";

import { createFileRoute } from "@tanstack/react-router";
import {
  ArrowRight,
  BookOpen,
  Headphones,
  LifeBuoy,
  MessageSquare,
  Search,
  ShieldQuestion,
  Sparkles,
  Wrench,
} from "lucide-react";

import { brandName } from "@/lib/envoiz";

type CategoryCard = {
  title: string;
  articles: number;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
};

const categoryCards: CategoryCard[] = [
  { title: "Getting Started", articles: 8, icon: Sparkles },
  { title: "Invoices & Payments", articles: 12, icon: BookOpen },
  { title: "Account & Billing", articles: 6, icon: LifeBuoy },
  { title: "PDF & Printing", articles: 9, icon: Wrench },
  { title: "Exports & Reports", articles: 5, icon: Wrench },
  { title: "Troubleshooting", articles: 7, icon: ShieldQuestion },
];

const popularArticles = [
  "How to resend an invoice without changing the due date",
  "Why your PDF export might be slower in peak hours",
  "How to update tax settings for a new client region",
  "How to apply a discount or tax rate to an existing invoice",
  "How to confirm that a payment was recorded correctly",
] as const;

const iconColors = [
  "text-[#888888]",
  "text-blue-400",
  "text-amber-400",
  "text-purple-400",
  "text-rose-400",
  "text-cyan-400",
];

export const Route = createFileRoute("/resources/support")({
  head: () => ({
    meta: [
      { title: `Support - ${brandName}` },
      { name: "description", content: "Envoiz support" },
    ],
  }),
  component: SupportPage,
});

function SupportPage() {
  return (
    <div className="relative min-h-screen bg-[#050505] text-[#F5F5F5]">
      {/* Page-level ambient glow */}
      <div className="pointer-events-none fixed inset-x-0 top-0 z-0 flex justify-center overflow-hidden">
        <div className="h-[500px] w-[900px] -translate-y-1/3 rounded-full bg-white/[0.03] blur-[140px]" />
      </div>
      {/* Hero */}
      <section className="relative border-b border-[#111111] px-6 pb-16 pt-12 md:pb-20 md:pt-16">
        <div className="relative mx-auto flex max-w-3xl flex-col items-center text-center">
          <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-[#555555]">
            Help center
          </p>
          <h1 className="mt-4 text-4xl font-extrabold tracking-[-0.04em] text-white md:text-6xl">
            How can we <span className="text-[#999999]">help?</span>
          </h1>
          <p className="mt-4 text-[16px] leading-relaxed text-[#888888] md:text-[17px]">
            Browse topics below or search for anything.
          </p>

          <div className="relative mt-8 w-full max-w-2xl">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#555555]" />
            <input
              type="search"
              placeholder="Search help articles..."
              className="h-12 w-full rounded-full border border-[#2A2A2A] bg-[#0D0D0D] pl-11 pr-4 text-[14px] text-white placeholder:text-[#555555] focus:border-[#555555] focus:outline-none"
            />
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-6 py-12">
        {/* Category Cards */}
        <section className="mb-14">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {categoryCards.map((card, index) => {
              const Icon = card.icon;
              return (
                <a key={card.title} href="#" className="group block">
                  <div className="flex h-full flex-col rounded-2xl border border-[#1A1A1A] bg-[#0D0D0D] p-6 transition-all hover:border-[#2A2A2A] hover:-translate-y-0.5">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#111111]">
                        <Icon
                          className={`h-5 w-5 ${iconColors[index % iconColors.length]}`}
                        />
                      </div>
                      <span className="rounded-full border border-[#2A2A2A] bg-[#111111] px-2.5 py-1 text-[11.5px] text-[#555555]">
                        {card.articles} articles
                      </span>
                    </div>
                    <h2 className="mt-5 text-xl font-bold tracking-[-0.03em] text-white">
                      {card.title}
                    </h2>
                    <p className="mt-2 text-[14px] leading-relaxed text-[#888888]">
                      Find quick answers and practical steps for common questions in this area.
                    </p>
                  </div>
                </a>
              );
            })}
          </div>
        </section>

        {/* Popular + Contact */}
        <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          {/* Popular articles */}
          <div className="rounded-2xl border border-[#1A1A1A] bg-[#0D0D0D] overflow-hidden">
            <div className="border-b border-[#1A1A1A] px-6 py-5">
              <h2 className="text-xl font-bold text-white">Popular articles</h2>
            </div>
            <ul className="divide-y divide-[#111111]">
              {popularArticles.map((title, index) => (
                <li key={title}>
                  <a
                    href="#"
                    className="flex items-center justify-between gap-4 px-6 py-4 transition-colors hover:bg-[#111111]"
                  >
                    <div>
                      <div className="text-[14px] font-medium text-white">{title}</div>
                      <div className="mt-1 text-[12px] text-[#555555]">
                        Last updated{" "}
                        {index === 0
                          ? "2 days ago"
                          : index === 1
                            ? "5 days ago"
                            : index === 2
                              ? "1 week ago"
                              : index === 3
                                ? "2 weeks ago"
                                : "3 weeks ago"}
                      </div>
                    </div>
                    <ArrowRight className="h-4 w-4 shrink-0 text-[#555555]" />
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact support */}
          <div className="rounded-2xl border border-[#1A1A1A] bg-[#0D0D0D] overflow-hidden">
            <div className="border-b border-[#1A1A1A] px-6 py-5">
              <h2 className="text-xl font-bold text-white">Contact support</h2>
            </div>
            <div className="space-y-4 p-6">
              {/* Send message */}
              <div className="rounded-xl border border-[#1A1A1A] bg-[#080808] p-5">
                <div className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4 text-[#555555]" />
                  <h3 className="text-[15px] font-semibold text-white">Send us a message</h3>
                </div>
                <form className="mt-4 space-y-3" onSubmit={(event) => event.preventDefault()}>
                  <input
                    placeholder="Name"
                    className="h-9 w-full rounded-lg border border-[#2A2A2A] bg-[#0D0D0D] px-3 text-[13px] text-white placeholder:text-[#555555] focus:border-[#555555] focus:outline-none"
                  />
                  <input
                    type="email"
                    placeholder="Email"
                    className="h-9 w-full rounded-lg border border-[#2A2A2A] bg-[#0D0D0D] px-3 text-[13px] text-white placeholder:text-[#555555] focus:border-[#555555] focus:outline-none"
                  />
                  <input
                    placeholder="Subject"
                    className="h-9 w-full rounded-lg border border-[#2A2A2A] bg-[#0D0D0D] px-3 text-[13px] text-white placeholder:text-[#555555] focus:border-[#555555] focus:outline-none"
                  />
                  <textarea
                    rows={3}
                    placeholder="Tell us what happened..."
                    className="w-full rounded-lg border border-[#2A2A2A] bg-[#0D0D0D] px-3 py-2 text-[13px] text-white placeholder:text-[#555555] focus:border-[#555555] focus:outline-none resize-none"
                  />
                  <button
                    type="submit"
                    className="w-full rounded-lg bg-white py-2.5 text-[13px] font-bold text-black transition-all hover:bg-[#e0e0e0]"
                  >
                    Submit
                  </button>
                </form>
              </div>

              {/* Live chat */}
              <div className="rounded-xl border border-[#1A1A1A] bg-[#080808] p-5">
                <div className="flex items-center gap-2">
                  <Headphones className="h-4 w-4 text-[#555555]" />
                  <h3 className="text-[15px] font-semibold text-white">Live chat</h3>
                </div>
                <p className="mt-3 text-[14px] leading-relaxed text-[#888888]">
                  Chat with the support team for account questions, delivery issues, and quick
                  troubleshooting.
                </p>
                <button
                  type="button"
                  className="mt-5 w-full rounded-lg border border-[#2A2A2A] py-2.5 text-[13px] font-medium text-white transition-all hover:border-[#555555] hover:text-white"
                >
                  Open live chat
                </button>
                <p className="mt-3 text-[12px] text-[#555555]">
                  Available Monday–Friday, 9am–6pm UTC
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
