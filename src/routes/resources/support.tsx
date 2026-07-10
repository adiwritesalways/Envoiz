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

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
  { title: "API & Integrations", articles: 9, icon: MessageSquare },
  { title: "PDF & Exports", articles: 5, icon: Wrench },
  { title: "Troubleshooting", articles: 7, icon: ShieldQuestion },
];

const popularArticles = [
  "How to resend an invoice without changing the due date",
  "Why your PDF export might be slower in peak hours",
  "How to update tax settings for a new client region",
  "What to do when a webhook delivery fails twice",
  "How to confirm that a payment was recorded correctly",
] as const;

export const Route = createFileRoute("/resources/support")({
  head: () => ({
    meta: [{ title: `Support - ${brandName}` }, { name: "description", content: "Envoiz support" }],
  }),
  component: SupportPage,
});

function SupportPage() {
  return (
    <div className="mx-auto max-w-7xl px-6 py-10 md:py-14">
      <section className="mx-auto flex max-w-3xl flex-col items-center text-center">
        <p className="text-[12px] uppercase tracking-[0.18em] text-muted-foreground">Help center</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-[-0.04em] md:text-6xl">
          How can we help?
        </h1>
        <p className="mt-4 text-[16px] leading-relaxed text-muted-foreground md:text-[17px]">
          Browse topics below or search for anything.
        </p>

        <div className="relative mt-8 w-full max-w-2xl">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search help articles..."
            className="h-12 rounded-full border-hairline bg-white pl-10 text-[14px]"
          />
        </div>
      </section>

      <section className="mt-12">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {categoryCards.map((card) => {
            const Icon = card.icon;
            return (
              <a key={card.title} href="#" className="group block">
                <Card className="h-full border-hairline bg-white/80 transition-transform group-hover:-translate-y-0.5">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="grid h-12 w-12 place-items-center rounded-2xl bg-black text-white">
                        <Icon className="h-5 w-5" />
                      </div>
                      <span className="rounded-full border border-hairline px-2.5 py-1 text-[12px] text-muted-foreground">
                        {card.articles} articles
                      </span>
                    </div>
                    <h2 className="mt-5 text-xl font-semibold tracking-[-0.03em]">{card.title}</h2>
                    <p className="mt-2 text-[14px] leading-relaxed text-muted-foreground">
                      Find quick answers and practical steps for common questions in this area.
                    </p>
                  </CardContent>
                </Card>
              </a>
            );
          })}
        </div>
      </section>

      <section className="mt-14 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <Card className="border-hairline bg-white/80">
          <CardHeader className="p-6 pb-3">
            <CardTitle className="text-xl">Popular articles</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <ul className="divide-y divide-hairline">
              {popularArticles.map((title, index) => (
                <li key={title}>
                  <a
                    href="#"
                    className="flex items-center justify-between gap-4 px-6 py-4 transition-colors hover:bg-secondary"
                  >
                    <div>
                      <div className="text-[14px] font-medium">{title}</div>
                      <div className="mt-1 text-[12px] text-muted-foreground">
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
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  </a>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card className="border-hairline bg-white/80">
          <CardHeader className="p-6 pb-3">
            <CardTitle className="text-xl">Contact support</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 p-6 pt-0">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl border border-hairline bg-white p-5">
                <div className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4 text-muted-foreground" />
                  <h3 className="text-[15px] font-semibold">Send us a message</h3>
                </div>
                <form className="mt-4 space-y-3" onSubmit={(event) => event.preventDefault()}>
                  <Input placeholder="Name" />
                  <Input type="email" placeholder="Email" />
                  <Input placeholder="Subject" />
                  <Textarea rows={4} placeholder="Tell us what happened..." />
                  <Button className="w-full" type="submit">
                    Submit
                  </Button>
                </form>
              </div>

              <div className="rounded-2xl border border-hairline bg-secondary/50 p-5">
                <div className="flex items-center gap-2">
                  <Headphones className="h-4 w-4 text-muted-foreground" />
                  <h3 className="text-[15px] font-semibold">Live chat</h3>
                </div>
                <p className="mt-3 text-[14px] leading-relaxed text-muted-foreground">
                  Chat with the support team for account questions, delivery issues, and quick
                  troubleshooting.
                </p>
                <Button variant="outline" className="mt-5 w-full" type="button">
                  Open live chat
                </Button>
                <p className="mt-3 text-[12px] text-muted-foreground">
                  Available Monday-Friday, 9am-6pm UTC
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
