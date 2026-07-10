import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { brandName } from "@/lib/envoiz";

type Category = "All" | "Product Updates" | "Guides" | "Finance Tips" | "News";

type Post = {
  title: string;
  category: Exclude<Category, "All">;
  excerpt: string;
  author: string;
  date: string;
  readTime: string;
};

const posts: Post[] = [
  {
    title: "How to Write a Professional Invoice That Gets Paid Faster",
    category: "Guides",
    excerpt:
      "Use clear payment terms, concise line items, and a visible due date to reduce back-and-forth. Small formatting choices can make the invoice easier to approve and pay on time.",
    author: "Maya Chen",
    date: "July 2, 2026",
    readTime: "6 min read",
  },
  {
    title: "Envoiz v1.2 - What's New",
    category: "Product Updates",
    excerpt:
      "This release focuses on faster PDF generation, smoother invoice editing, and sharper webhook logs. It also introduces a few quality-of-life improvements across the dashboard.",
    author: "Envoiz Team",
    date: "June 28, 2026",
    readTime: "4 min read",
  },
  {
    title: "Invoice vs Receipt: What's the Difference and Why It Matters",
    category: "Guides",
    excerpt:
      "Invoices request payment, while receipts confirm it. Knowing when to send each document helps you keep accounting clean and avoids confusing clients during the payment cycle.",
    author: "Jordan Lee",
    date: "June 22, 2026",
    readTime: "5 min read",
  },
  {
    title: "5 Common Invoicing Mistakes Freelancers Make",
    category: "Finance Tips",
    excerpt:
      "Late sending, missing tax details, and vague descriptions are still the biggest reasons invoices get delayed. Fixing those habits can shorten your payment cycle significantly.",
    author: "Rina Patel",
    date: "June 18, 2026",
    readTime: "7 min read",
  },
  {
    title: "How Envoiz Handles Tax Calculations Across Currencies",
    category: "Product Updates",
    excerpt:
      "Tax logic is applied after currency normalization so totals remain consistent across regions. That gives finance teams a single source of truth for multi-market invoicing.",
    author: "Envoiz Team",
    date: "June 12, 2026",
    readTime: "4 min read",
  },
  {
    title: "Getting Paid on Time: A Practical Guide for Small Businesses",
    category: "Finance Tips",
    excerpt:
      "A good reminder schedule is often more effective than aggressive follow-up. Pair it with shorter terms, clear contact details, and a simple payment flow.",
    author: "Alicia Grant",
    date: "June 8, 2026",
    readTime: "6 min read",
  },
] as const;

const categories: Category[] = ["All", "Product Updates", "Guides", "Finance Tips", "News"];

export const Route = createFileRoute("/resources/blog")({
  head: () => ({
    meta: [{ title: `Blog - ${brandName}` }, { name: "description", content: "Envoiz blog" }],
  }),
  component: BlogPage,
});

function BlogPage() {
  const [category, setCategory] = useState<Category>("All");
  const featured = posts[0];
  const visiblePosts =
    category === "All" ? posts : posts.filter((post) => post.category === category);

  return (
    <div className="mx-auto max-w-7xl px-6 py-10 md:py-14">
      <section className="max-w-3xl">
        <p className="text-[12px] uppercase tracking-[0.18em] text-muted-foreground">
          Insights and updates
        </p>
        <h1 className="mt-3 text-4xl font-semibold tracking-[-0.04em] md:text-6xl">Envoiz Blog</h1>
        <p className="mt-4 text-[16px] leading-relaxed text-muted-foreground md:text-[17px]">
          Tips, updates, and insights for freelancers and small businesses.
        </p>
      </section>

      <section className="mt-10">
        <Card className="overflow-hidden border-hairline bg-white/80 shadow-[0_1px_2px_rgba(0,0,0,0.03),0_18px_50px_rgba(0,0,0,0.05)]">
          <div className="grid gap-0 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="relative min-h-[260px] bg-[linear-gradient(135deg,#111827_0%,#374151_45%,#d1d5db_100%)] p-6 text-white md:p-8">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.22),transparent_42%)]" />
              <div className="relative flex h-full flex-col justify-between">
                <Badge className="w-fit bg-white/15 text-white hover:bg-white/15">
                  {featured.category}
                </Badge>
                <div>
                  <p className="text-[12px] uppercase tracking-[0.18em] text-white/70">
                    Featured post
                  </p>
                  <h2 className="mt-3 max-w-xl text-3xl font-semibold tracking-[-0.04em] md:text-5xl">
                    {featured.title}
                  </h2>
                  <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-white/80">
                    {featured.excerpt}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-col justify-between gap-6 p-6 md:p-8">
              <div className="space-y-4">
                <div className="inline-flex items-center gap-2 rounded-full border border-hairline bg-secondary px-3 py-1 text-[12px] text-muted-foreground">
                  <span className="h-1.5 w-1.5 rounded-full bg-black" />
                  Latest article
                </div>
                <div>
                  <h3 className="text-2xl font-semibold tracking-[-0.03em]">
                    Write invoices that feel simple to approve.
                  </h3>
                  <p className="mt-3 text-[15px] leading-relaxed text-muted-foreground">
                    A clean invoice is a tiny product experience. These writing and formatting
                    patterns help clients understand the bill immediately.
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-3 text-[12.5px] text-muted-foreground">
                <span>{featured.author}</span>
                <span>•</span>
                <span>{featured.date}</span>
                <span>•</span>
                <span>{featured.readTime}</span>
              </div>

              <a
                href="#"
                className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-black px-5 text-[13.5px] font-medium text-white transition-colors hover:bg-black/85"
              >
                Read featured article <ArrowRight className="h-4 w-4" />
              </a>
            </div>
          </div>
        </Card>
      </section>

      <section className="mt-10">
        <Tabs value={category} onValueChange={(value) => setCategory(value as Category)}>
          <TabsList className="h-auto flex-wrap gap-2 bg-transparent p-0">
            {categories.map((item) => (
              <TabsTrigger
                key={item}
                value={item}
                className="rounded-full border border-hairline bg-white px-4 py-2 text-[12.5px] data-[state=active]:border-black data-[state=active]:bg-black data-[state=active]:text-white"
              >
                {item}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {visiblePosts.map((post) => (
            <a key={post.title} href="#" className="group block">
              <Card className="h-full border-hairline bg-white/80 transition-transform group-hover:-translate-y-0.5">
                <div className="h-44 bg-[linear-gradient(135deg,#0f172a_0%,#334155_45%,#cbd5e1_100%)]" />
                <div className="p-5">
                  <Badge variant="secondary" className="mb-3">
                    {post.category}
                  </Badge>
                  <h3 className="text-[18px] font-semibold tracking-[-0.03em]">{post.title}</h3>
                  <p className="mt-3 text-[14px] leading-relaxed text-muted-foreground">
                    {post.excerpt}
                  </p>
                  <div className="mt-5 flex flex-wrap gap-2 text-[12px] text-muted-foreground">
                    <span>{post.author}</span>
                    <span>•</span>
                    <span>{post.date}</span>
                    <span>•</span>
                    <span>{post.readTime}</span>
                  </div>
                </div>
              </Card>
            </a>
          ))}
        </div>
      </section>
    </div>
  );
}
