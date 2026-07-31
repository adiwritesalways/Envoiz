import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, BookOpen, Clock, User } from "lucide-react";

import { brandName } from "@/lib/envoiz";

type Category = "All" | "Product Updates" | "Guides" | "Finance Tips" | "News";

type Post = {
  title: string;
  category: Exclude<Category, "All">;
  excerpt: string;
  author: string;
  date: string;
  readTime: string;
  slug: string;
};

export const posts: Post[] = [
  {
    title: "How to Write a Professional Invoice That Gets Paid Faster",
    category: "Guides",
    excerpt:
      "Use clear payment terms, concise line items, and a visible due date to reduce back-and-forth. Small formatting choices can make the invoice easier to approve and pay on time.",
    author: "Maya Chen",
    date: "July 2, 2026",
    readTime: "6 min read",
    slug: "write-professional-invoice",
  },
  {
    title: "Envoiz v1.2 - What's New",
    category: "Product Updates",
    excerpt:
      "This release focuses on faster PDF generation, smoother invoice editing, and sharper delivery logs. It also introduces a few quality-of-life improvements across the dashboard.",
    author: "Envoiz Team",
    date: "June 28, 2026",
    readTime: "4 min read",
    slug: "envoiz-v1-2-whats-new",
  },
  {
    title: "Invoice vs Receipt: What's the Difference and Why It Matters",
    category: "Guides",
    excerpt:
      "Invoices request payment, while receipts confirm it. Knowing when to send each document helps you keep accounting clean and avoids confusing clients during the payment cycle.",
    author: "Jordan Lee",
    date: "June 22, 2026",
    readTime: "5 min read",
    slug: "invoice-vs-receipt",
  },
  {
    title: "5 Common Invoicing Mistakes Freelancers Make",
    category: "Finance Tips",
    excerpt:
      "Late sending, missing tax details, and vague descriptions are still the biggest reasons invoices get delayed. Fixing those habits can shorten your payment cycle significantly.",
    author: "Rina Patel",
    date: "June 18, 2026",
    readTime: "7 min read",
    slug: "5-common-invoicing-mistakes",
  },
  {
    title: "How Envoiz Handles Tax Calculations Across Currencies",
    category: "Product Updates",
    excerpt:
      "Tax logic is applied after currency normalization so totals remain consistent across regions. That gives finance teams a single source of truth for multi-market invoicing.",
    author: "Envoiz Team",
    date: "June 12, 2026",
    readTime: "4 min read",
    slug: "tax-calculations-currencies",
  },
  {
    title: "Getting Paid on Time: A Practical Guide for Small Businesses",
    category: "Finance Tips",
    excerpt:
      "A good reminder schedule is often more effective than aggressive follow-up. Pair it with shorter terms, clear contact details, and a simple payment flow.",
    author: "Alicia Grant",
    date: "June 8, 2026",
    readTime: "6 min read",
    slug: "getting-paid-on-time",
  },
] as const;

const categories: Category[] = ["All", "Product Updates", "Guides", "Finance Tips", "News"];

const categoryColors: Record<string, string> = {
  "Product Updates": "bg-blue-500/10 text-blue-400 border-blue-500/20",
  Guides: "bg-white/5 text-[#aaaaaa] border-white/10",
  "Finance Tips": "bg-amber-500/10 text-amber-400 border-amber-500/20",
  News: "bg-purple-500/10 text-purple-400 border-purple-500/20",
};

export const Route = createFileRoute("/resources/blog/")({
  component: BlogPage,
  head: () => ({
    meta: [
      { title: `Blog - ${brandName}` },
      {
        name: "description",
        content: "Tips and resources for better invoicing and getting paid faster.",
      },
    ],
  }),
});

function BlogPage() {
  const [category, setCategory] = useState<Category>("All");
  const featured = posts[0];
  const visiblePosts =
    category === "All" ? posts : posts.filter((post) => post.category === category);

  return (
    <div className="relative min-h-screen bg-[#050505] text-[#F5F5F5]">
      {/* Page-level ambient glow */}
      <div className="pointer-events-none fixed inset-x-0 top-0 z-0 flex justify-center overflow-hidden">
        <div className="h-[500px] w-[900px] -translate-y-1/3 rounded-full bg-white/[0.03] blur-[140px]" />
      </div>
      {/* Hero */}
      <section className="relative border-b border-[#111111] px-6 pb-16 pt-12 md:pb-20 md:pt-16">
        <div className="relative mx-auto max-w-7xl">
          <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-[#555555]">
            Insights and updates
          </p>
          <h1 className="mt-4 text-4xl font-extrabold tracking-[-0.04em] text-white md:text-6xl">
            Envoiz <span className="text-[#999999]">Blog</span>
          </h1>
          <p className="mt-4 max-w-xl text-[16px] leading-relaxed text-[#888888]">
            Tips, updates, and insights for freelancers and small businesses.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-6 py-12">
        {/* Featured Post */}
        <section className="mb-12">
          <Link
            to="/resources/blog/$slug"
            params={{ slug: featured.slug }}
            className="group block overflow-hidden rounded-2xl border border-[#1A1A1A] bg-[#0D0D0D] transition-colors hover:border-[#2A2A2A]"
          >
            <div className="grid gap-0 lg:grid-cols-[1.1fr_0.9fr]">
              {/* Visual side */}
              <div className="relative min-h-[260px] bg-[linear-gradient(135deg,#0B1120_0%,#0D2040_45%,#1A3A60_100%)] p-6 md:p-10">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.05),transparent_50%)]" />
                <div className="relative flex h-full flex-col justify-end">
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-widest text-white/50">
                      Featured post
                    </p>
                    <h2 className="mt-3 text-3xl font-extrabold tracking-[-0.03em] text-white md:text-4xl">
                      {featured.title}
                    </h2>
                    <p className="mt-4 max-w-lg text-[15px] leading-relaxed text-white/60">
                      {featured.excerpt}
                    </p>
                  </div>
                </div>
              </div>

              {/* Text side */}
              <div className="flex flex-col justify-between gap-6 border-t border-[#1A1A1A] p-6 lg:border-l lg:border-t-0 md:p-8">
                <div className="space-y-4">
                  <div className="inline-flex items-center gap-2 rounded-full border border-[#2A2A2A] bg-[#111111] px-3 py-1 text-[11px] text-[#888888]">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#555555]" />
                    Latest article
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold tracking-[-0.03em] text-white">
                      Write invoices that feel simple to approve.
                    </h3>
                    <p className="mt-3 text-[15px] leading-relaxed text-[#888888]">
                      A clean invoice is a tiny product experience. These writing and formatting
                      patterns help clients understand the bill immediately.
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex flex-wrap gap-3 text-[12px] text-[#555555]">
                    <span className="flex items-center gap-1.5">
                      <User className="h-3 w-3" /> {featured.author}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1.5">
                      <Clock className="h-3 w-3" /> {featured.readTime}
                    </span>
                    <span>•</span>
                    <span>{featured.date}</span>
                  </div>

                  <span className="inline-flex items-center gap-2 rounded-md bg-white px-5 py-2.5 text-[13px] font-bold text-black transition-all hover:bg-[#e0e0e0]">
                    Read featured article <ArrowRight className="h-4 w-4" />
                  </span>
                </div>
              </div>
            </div>
          </Link>
        </section>

        {/* Category Filter */}
        <section>
          <div className="mb-6 flex flex-wrap gap-2">
            {categories.map((item) => (
              <button
                key={item}
                onClick={() => setCategory(item)}
                className={`rounded-full border px-4 py-2 text-[12.5px] font-medium transition-all ${
                  category === item
                    ? "border-white bg-white text-black"
                    : "border-[#2A2A2A] bg-[#0D0D0D] text-[#888888] hover:border-[#3A3A3A] hover:text-white"
                }`}
              >
                {item}
              </button>
            ))}
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {visiblePosts.map((post) => (
              <Link key={post.title} to="/resources/blog/$slug" params={{ slug: post.slug }} className="group block">
                <div className="flex h-full flex-col rounded-2xl border border-[#1A1A1A] bg-[#0D0D0D] overflow-hidden transition-all hover:border-[#2A2A2A] hover:-translate-y-0.5">
                  {/* Gradient thumbnail */}
                  <div className="h-44 bg-[linear-gradient(135deg,#0a0f1e_0%,#112240_45%,#1d3d72_100%)] relative overflow-hidden">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,rgba(255,255,255,0.04),transparent_55%)]" />
                    <div className="absolute bottom-4 left-4">
                      <span
                        className={`inline-flex items-center rounded-full border px-3 py-1 text-[11px] font-medium ${categoryColors[post.category] ?? "border-[#2A2A2A] bg-[#111111] text-[#888888]"}`}
                      >
                        {post.category}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-1 flex-col p-5">
                    <h3 className="text-[17px] font-bold tracking-[-0.025em] text-white group-hover:text-[#cccccc] transition-colors">
                      {post.title}
                    </h3>
                    <p className="mt-3 flex-1 text-[13.5px] leading-relaxed text-[#888888]">
                      {post.excerpt}
                    </p>
                    <div className="mt-5 flex flex-wrap gap-2 text-[11.5px] text-[#555555]">
                      <span>{post.author}</span>
                      <span>•</span>
                      <span>{post.date}</span>
                      <span>•</span>
                      <span>{post.readTime}</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Newsletter CTA */}
        <section className="mt-20 rounded-2xl border border-[#1A1A1A] bg-[#0D0D0D] p-8 text-center md:p-12">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-[#111111] text-[#777777]">
            <BookOpen className="h-6 w-6" />
          </div>
          <h2 className="mt-5 text-2xl font-extrabold tracking-[-0.03em] text-white">
            Never miss an update
          </h2>
          <p className="mt-2 text-[14px] text-[#888888]">
            Get the latest invoicing tips and product news delivered to your inbox.
          </p>
          <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <input
              type="email"
              placeholder="you@company.com"
              className="h-11 w-full max-w-sm rounded-md border border-[#2A2A2A] bg-[#111111] px-4 text-[13.5px] text-white placeholder:text-[#555555] focus:border-[#555555] focus:outline-none sm:w-auto"
            />
            <button className="h-11 rounded-md bg-white px-6 text-[13px] font-bold text-black transition-all hover:bg-[#e0e0e0]">
              Subscribe
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
