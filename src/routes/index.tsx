import { createFileRoute } from "@tanstack/react-router";
import {
  ArrowRight,
  BarChart3,
  Check,
  ChevronDown,
  Code2,
  Command,
  FileText,
  Github,
  Linkedin,
  Mail,
  Plus,
  Printer,
  Search,
  Sparkles,
  Users,
  Webhook,
  Zap,
  Shield,
} from "lucide-react";
import { useState, type ComponentType, type SVGProps } from "react";

import { BrandLogo } from "@/components/BrandLogo";
import { SiteShell } from "@/components/envoiz/SiteShell";
import { brandName, slogan } from "@/lib/envoiz";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: `${brandName} - ${slogan}` },
      {
        name: "description",
        content:
          "Generate, print, and automate invoices with a premium Envoiz experience for freelancers and businesses.",
      },
      { property: "og:title", content: `${brandName} - Beautiful invoices. Zero complexity.` },
      { property: "og:description", content: slogan },
    ],
  }),
  component: Landing,
});

function Landing() {
  return (
    <SiteShell>
      <main>
        <Hero />
        <TrustedBy />
        <Features />
        <DashboardPreview />
        <HowItWorks />
        <DeveloperAPI />
        <Pricing />
        <Testimonials />
        <FAQ />
        <Contact />
      </main>
    </SiteShell>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 grid-bg pointer-events-none" />
      <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-6 pb-24 pt-20 lg:grid-cols-12 md:pb-32 md:pt-28">
        <div className="animate-fade-up lg:col-span-6">
          <div className="inline-flex h-7 items-center gap-2 rounded-full border border-hairline bg-white px-3 text-[12px] text-muted-foreground">
            <span className="h-1.5 w-1.5 rounded-full bg-black" /> Now with API v1
          </div>
          <h1 className="mt-6 text-[44px] font-semibold leading-[1.02] tracking-[-0.04em] sm:text-6xl md:text-7xl">
            Beautiful invoices.
            <br />
            <span className="text-muted-foreground">Zero complexity.</span>
          </h1>
          <p className="mt-6 max-w-xl text-[17px] leading-relaxed text-muted-foreground">
            Generate, print, and automate invoices with a premium workflow for freelancers, small
            businesses, agencies, and API-driven teams.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <a
              href="#pricing"
              className="inline-flex h-11 items-center gap-2 rounded-full bg-black px-5 text-[14px] font-medium text-white shadow-[0_8px_24px_rgba(0,0,0,0.18)] transition-colors hover:bg-black/85"
            >
              Start Free <ArrowRight className="h-4 w-4" />
            </a>
            <a
              href="#api"
              className="inline-flex h-11 items-center gap-2 rounded-full border border-hairline bg-white px-5 text-[14px] font-medium transition-colors hover:bg-secondary"
            >
              View API Docs
            </a>
          </div>
          <div className="mt-8 flex flex-wrap gap-6 text-[12.5px] text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <Check className="h-3.5 w-3.5" /> No credit card
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Check className="h-3.5 w-3.5" /> 50 invoices free
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Check className="h-3.5 w-3.5" /> Cancel anytime
            </span>
          </div>
        </div>

        <div className="animate-fade-up lg:col-span-6">
          <HeroDashboard />
        </div>
      </div>
    </section>
  );
}

function HeroDashboard() {
  const recentInvoices = [
    ["ENV-0231", "Acme Inc.", "$1,240", "Paid"],
    ["ENV-0230", "Northwind", "$820", "Pending"],
    ["ENV-0229", "Globex", "$3,100", "Paid"],
  ] as const;

  return (
    <div className="relative">
      <div className="absolute -inset-10 bg-[radial-gradient(ellipse_at_center,rgba(0,0,0,0.08),transparent_60%)]" />
      <div className="relative animate-float rounded-2xl border border-hairline bg-white/75 p-5 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_20px_60px_rgba(0,0,0,0.08)] backdrop-blur-xl">
        <div className="flex items-center justify-between border-b border-hairline pb-4">
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-black/10" />
            <span className="h-2.5 w-2.5 rounded-full bg-black/10" />
            <span className="h-2.5 w-2.5 rounded-full bg-black/10" />
          </div>
          <div className="font-mono text-[11px] text-muted-foreground">app.envoiz.io</div>
          <div className="w-10" />
        </div>

        <div className="mt-4 grid grid-cols-3 gap-3">
          <Stat label="Revenue" value="$48,290" delta="+12.4%" />
          <Stat label="Invoices" value="1,284" delta="+8.1%" />
          <Stat label="Customers" value="342" delta="+3.6%" />
        </div>

        <div className="mt-4 rounded-xl border border-hairline p-4">
          <div className="mb-3 flex items-center justify-between">
            <div className="text-[12.5px] font-medium">Revenue</div>
            <div className="font-mono text-[11px] text-muted-foreground">Last 30 days</div>
          </div>
          <SparkChart />
        </div>

        <div className="mt-4 rounded-xl border border-hairline">
          <div className="flex items-center justify-between border-b border-hairline px-4 py-3">
            <div className="text-[12.5px] font-medium">Recent invoices</div>
            <div className="text-[11px] text-muted-foreground">View all</div>
          </div>
          <ul className="divide-y divide-hairline">
            {recentInvoices.map(([id, customer, amount, status]) => (
              <li key={id} className="flex items-center justify-between px-4 py-2.5 text-[12.5px]">
                <span className="font-mono text-muted-foreground">{id}</span>
                <span className="ml-4 flex-1">{customer}</span>
                <span className="mr-3 tabular-nums">{amount}</span>
                <span
                  className={`rounded-full border px-2 py-0.5 text-[10.5px] ${status === "Paid" ? "border-black/20 bg-black text-white" : "border-hairline text-muted-foreground"}`}
                >
                  {status}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div
        className="hidden animate-float items-center gap-2 rounded-xl bg-white px-3 py-2 text-[12px] shadow-[0_1px_2px_rgba(0,0,0,0.03),0_18px_50px_rgba(0,0,0,0.08)] sm:absolute sm:-left-6 sm:top-8 sm:flex"
        style={{ animationDelay: "0.6s" }}
      >
        <Printer className="h-3.5 w-3.5" /> Printed ENV-0228
      </div>
      <div
        className="hidden animate-float items-center gap-2 rounded-xl bg-white px-3 py-2 text-[12px] shadow-[0_1px_2px_rgba(0,0,0,0.03),0_18px_50px_rgba(0,0,0,0.08)] sm:absolute sm:-right-6 sm:bottom-10 sm:flex"
        style={{ animationDelay: "1.2s" }}
      >
        <Zap className="h-3.5 w-3.5" /> API • 12ms
      </div>
    </div>
  );
}

function Stat({ label, value, delta }: { label: string; value: string; delta: string }) {
  return (
    <div className="rounded-xl border border-hairline p-3">
      <div className="text-[11px] text-muted-foreground">{label}</div>
      <div className="mt-1 text-[18px] font-semibold tracking-tight tabular-nums">{value}</div>
      <div className="mt-0.5 text-[10.5px] text-muted-foreground">{delta}</div>
    </div>
  );
}

function SparkChart() {
  const points = [12, 18, 14, 22, 19, 28, 24, 33, 30, 38, 34, 42, 47, 44, 52];
  const max = Math.max(...points);
  const path = points
    .map((point, index) => {
      const x = (index / (points.length - 1)) * 100;
      const y = 100 - (point / max) * 90;
      return `${index === 0 ? "M" : "L"}${x},${y}`;
    })
    .join(" ");

  return (
    <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="h-24 w-full">
      <defs>
        <linearGradient id="envoiz-chart" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="black" stopOpacity="0.18" />
          <stop offset="100%" stopColor="black" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={`${path} L100,100 L0,100 Z`} fill="url(#envoiz-chart)" />
      <path d={path} fill="none" stroke="black" strokeWidth="1.2" />
    </svg>
  );
}

function TrustedBy() {
  const logos = ["Nova", "Vertex", "Pulse", "Zenith", "Astra", "Horizon"];
  return (
    <section className="border-y border-hairline bg-surface/60 py-12">
      <div className="mx-auto max-w-7xl px-6">
        <p className="text-center text-[12px] uppercase tracking-[0.18em] text-muted-foreground">
          Trusted by teams building the future
        </p>
        <div className="mt-6 grid grid-cols-3 items-center gap-6 md:grid-cols-6">
          {logos.map((name) => (
            <div
              key={name}
              className="text-center text-[18px] font-semibold tracking-tight text-foreground/70 transition-colors hover:text-foreground"
            >
              {name}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Features() {
  const items: [string, string, ComponentType<SVGProps<SVGSVGElement>>][] = [
    ["Unlimited invoices", "Send as many as you need, every month.", FileText],
    ["PDF generation", "Pixel-perfect, brandable PDFs in milliseconds.", FileText],
    ["Direct printing", "Print straight from the browser, no plugins.", Printer],
    ["Customer management", "Searchable directory with full history.", Users],
    ["Templates", "Beautiful presets, fully customizable.", Sparkles],
    ["Analytics", "Real-time revenue and growth metrics.", BarChart3],
    ["API access", "Modern REST API with versioning.", Code2],
    ["Webhooks", "Event-driven workflows in your stack.", Webhook],
    ["CSV export", "Bring data anywhere you need it.", FileText],
    ["Email sending", "Deliver invoices with tracked opens.", Mail],
  ];

  return (
    <section id="features" className="border-t border-hairline py-28">
      <div className="mx-auto max-w-7xl px-6">
        <SectionHeader eyebrow="Features" title="Built for invoice teams that move fast." />
        <div className="mt-14 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {items.map(([title, description, Icon]) => (
            <div
              key={title}
              className="group rounded-2xl border border-hairline bg-white/80 p-5 shadow-[0_1px_2px_rgba(0,0,0,0.03),0_12px_30px_rgba(0,0,0,0.04)] transition-transform hover:-translate-y-0.5"
            >
              <div className="grid h-9 w-9 place-items-center rounded-lg bg-black text-white">
                <Icon className="h-4 w-4" />
              </div>
              <div className="mt-4 text-[14.5px] font-medium tracking-tight">{title}</div>
              <div className="mt-1 text-[13px] leading-relaxed text-muted-foreground">
                {description}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function SectionHeader({ eyebrow, title, sub }: { eyebrow: string; title: string; sub?: string }) {
  return (
    <div className="max-w-2xl">
      <p className="text-[12px] uppercase tracking-[0.18em] text-muted-foreground">{eyebrow}</p>
      <h2 className="mt-3 text-3xl font-semibold tracking-[-0.03em] md:text-5xl">{title}</h2>
      {sub && <p className="mt-4 text-[16px] leading-relaxed text-muted-foreground">{sub}</p>}
    </div>
  );
}

function DashboardPreview() {
  return (
    <section className="border-y border-hairline bg-surface/60 py-28">
      <div className="mx-auto max-w-7xl px-6">
        <SectionHeader
          eyebrow="Dashboard"
          title="A control room for your billing."
          sub="Track revenue, manage invoices, and act on what matters without context switching."
        />
        <div className="mt-14 overflow-hidden rounded-3xl border border-hairline bg-white/80 shadow-[0_1px_2px_rgba(0,0,0,0.03),0_24px_80px_rgba(0,0,0,0.08)]">
          <div className="grid grid-cols-12">
            <aside className="col-span-3 hidden border-r border-hairline p-4 md:flex md:flex-col">
              <BrandLogo className="h-8 w-auto max-w-[150px] -ml-3" />
              <div className="mt-3 flex items-center gap-2 rounded-lg border border-hairline bg-white px-3 py-2 text-[12.5px] text-muted-foreground">
                <Search className="h-3.5 w-3.5" /> Search
                <span className="ml-auto inline-flex items-center gap-1 font-mono text-[10.5px]">
                  <Command className="h-3 w-3" />K
                </span>
              </div>
              <nav className="mt-3 space-y-0.5 text-[13px]">
                {["Overview", "Invoices", "Customers", "API", "Webhooks", "Settings"].map(
                  (item, index) => (
                    <div
                      key={item}
                      className={`rounded-md px-3 py-1.5 ${index === 0 ? "bg-black text-white" : "text-muted-foreground hover:bg-secondary hover:text-foreground"}`}
                    >
                      {item}
                    </div>
                  ),
                )}
              </nav>
            </aside>

            <div className="col-span-12 p-6 md:col-span-9">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-[12px] text-muted-foreground">Overview</div>
                  <div className="mt-1 text-2xl font-semibold tracking-tight">
                    Good morning, Alex
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button className="inline-flex h-9 items-center gap-2 rounded-full border border-hairline bg-white px-3 text-[12.5px]">
                    <Printer className="h-3.5 w-3.5" /> Print
                  </button>
                  <button className="inline-flex h-9 items-center gap-2 rounded-full bg-black px-3 text-[12.5px] text-white">
                    <Plus className="h-3.5 w-3.5" /> Create invoice
                  </button>
                </div>
              </div>

              <div className="mt-6 grid gap-3 grid-cols-2 lg:grid-cols-4">
                <Stat label="Monthly revenue" value="$48,290" delta="+12.4%" />
                <Stat label="Paid" value="1,108" delta="+9.2%" />
                <Stat label="Pending" value="176" delta="-2.1%" />
                <Stat label="API requests" value="284,910" delta="+24.0%" />
              </div>

              <div className="mt-3 grid gap-3 lg:grid-cols-3">
                <div className="rounded-xl border border-hairline bg-white p-4 lg:col-span-2">
                  <div className="mb-2 flex items-center justify-between">
                    <div className="text-[13px] font-medium">Revenue</div>
                    <div className="font-mono text-[11px] text-muted-foreground">YTD</div>
                  </div>
                  <SparkChart />
                </div>
                <div className="rounded-xl border border-hairline bg-white p-4">
                  <div className="text-[13px] font-medium">Customers</div>
                  <ul className="mt-3 space-y-2.5 text-[12.5px]">
                    {[
                      ["Acme Inc.", "$9,120"],
                      ["Globex", "$5,840"],
                      ["Soylent", "$3,210"],
                      ["Initech", "$1,980"],
                    ].map(([customer, amount]) => (
                      <li key={customer} className="flex items-center gap-2.5">
                        <span className="grid h-6 w-6 place-items-center rounded-full bg-black/5 text-[10px]">
                          {customer[0]}
                        </span>
                        <span>{customer}</span>
                        <span className="ml-auto tabular-nums text-muted-foreground">{amount}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function HowItWorks() {
  const steps = [
    ["01", "Create Invoice", "Add products and customer information in seconds.", FileText],
    ["02", "Generate PDF", "Instantly produce a beautiful, branded invoice.", Sparkles],
    ["03", "Print or Automate", "Print directly or integrate through our API.", Code2],
  ] as const;

  return (
    <section id="how" className="border-t border-hairline py-28">
      <div className="mx-auto max-w-7xl px-6">
        <SectionHeader eyebrow="How it works" title="From draft to delivered in three steps." />
        <div className="mt-14 grid gap-3 md:grid-cols-3">
          {steps.map(([number, title, description, Icon]) => (
            <div
              key={number}
              className="rounded-3xl border border-hairline bg-white/80 p-7 shadow-[0_1px_2px_rgba(0,0,0,0.03),0_18px_50px_rgba(0,0,0,0.05)]"
            >
              <div className="flex items-center justify-between">
                <span className="text-[12px] uppercase tracking-[0.18em] text-muted-foreground">
                  {number}
                </span>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="mt-8 text-xl font-semibold tracking-tight">{title}</div>
              <div className="mt-2 text-[13.5px] leading-relaxed text-muted-foreground">
                {description}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function DeveloperAPI() {
  const req = `POST /api/v1/invoices
Authorization: Bearer sk_live_••••

{
  "customer": "John Doe",
  "items": [
    { "name": "Product A", "price": 120 }
  ]
}`;
  const res = `{
  "invoice_id": "ENV-000001",
  "pdf_url": "https://cdn.envoiz.io/ENV-000001.pdf",
  "status": "created"
}`;
  const apiFeatures: [string, ComponentType<SVGProps<SVGSVGElement>>][] = [
    ["REST API", Code2],
    ["Webhooks", Webhook],
    ["Authentication", Shield],
    ["SDKs", Sparkles],
    ["Versioning", FileText],
    ["Rate limits", Zap],
  ];

  return (
    <section id="api" className="overflow-hidden bg-black py-20 text-white md:py-28">
      <div className="mx-auto grid max-w-7xl gap-10 px-6 lg:grid-cols-12 lg:gap-12">
        <div className="min-w-0 lg:col-span-5">
          <p className="text-[12px] uppercase tracking-[0.18em] text-white/60">For developers</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-[-0.03em] sm:text-4xl md:text-5xl">
            An API your engineers will love.
          </h2>
          <p className="mt-4 text-[15px] leading-relaxed text-white/70">
            REST endpoints, signed webhooks, idiomatic SDKs, predictable errors, and clear
            versioning. Ship invoicing in an afternoon.
          </p>
          <ul className="mt-8 grid grid-cols-2 gap-2 text-[12.5px] sm:gap-3 sm:text-[13px]">
            {apiFeatures.map(([label, Icon]) => (
              <li
                key={label}
                className="flex min-w-0 items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2"
              >
                <Icon className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate">{label}</span>
              </li>
            ))}
          </ul>
          <div className="mt-8 flex flex-wrap gap-3">
            <a
              href="#pricing"
              className="inline-flex h-11 items-center gap-2 rounded-full bg-white px-5 text-[14px] font-medium text-black"
            >
              Read Docs <ArrowRight className="h-4 w-4" />
            </a>
            <a
              href="#api"
              className="inline-flex h-11 items-center gap-2 rounded-full border border-white/15 px-5 text-[14px]"
            >
              Get API Key
            </a>
          </div>
        </div>

        <div className="min-w-0 w-full lg:col-span-7">
          <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03]">
            <div className="flex h-10 items-center justify-between border-b border-white/10 px-4">
              <div className="flex gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
                <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
                <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
              </div>
              <div className="font-mono text-[11px] text-white/50">request.http</div>
              <div className="w-10" />
            </div>
            <pre className="overflow-x-auto whitespace-pre p-4 font-mono text-[11.5px] leading-relaxed text-white/90 sm:p-5 sm:text-[12.5px]">
              {req}
            </pre>
            <div className="border-y border-white/10 bg-white/[0.02] px-4 py-2 font-mono text-[11px] text-white/50">
              200 OK · 38ms
            </div>
            <pre className="overflow-x-auto whitespace-pre p-4 font-mono text-[11.5px] leading-relaxed text-white/80 sm:p-5 sm:text-[12.5px]">
              {res}
            </pre>
          </div>
        </div>
      </div>
    </section>
  );
}

function Pricing() {
  const [yearly, setYearly] = useState(false);
  const plans = [
    {
      name: "Starter",
      tagline: "For solo shops getting started.",
      monthly: 0,
      yearly: 0,
      cta: "Start free",
      featured: false,
      features: ["100 invoices / month", "Basic templates", "PDF export", "Email support"],
    },
    {
      name: "Pro",
      tagline: "For growing teams that ship daily.",
      monthly: 19,
      yearly: 15,
      cta: "Start 14-day trial",
      featured: true,
      features: [
        "Unlimited invoices",
        "Full REST API access",
        "Analytics & insights",
        "Team members & roles",
        "Custom branding",
      ],
    },
    {
      name: "Business",
      tagline: "For scale, security, and SLAs.",
      monthly: 49,
      yearly: 39,
      cta: "Talk to sales",
      featured: false,
      features: [
        "Everything in Pro",
        "Signed webhooks",
        "Priority support",
        "SOC 2 & audit logs",
        "Unlimited API volume",
      ],
    },
  ] as const;

  return (
    <section id="pricing" className="relative overflow-hidden border-t border-hairline py-28">
      <div className="absolute inset-0 grid-bg pointer-events-none opacity-40" />
      <div className="relative mx-auto max-w-7xl px-6">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-[12px] uppercase tracking-[0.18em] text-muted-foreground">Pricing</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-[-0.03em] md:text-5xl">
            Simple pricing. No surprises.
          </h2>
          <p className="mt-4 text-[15.5px] text-muted-foreground">
            Start free, upgrade when you scale. Cancel anytime.
          </p>

          <div className="mt-8 inline-flex items-center rounded-full border border-hairline bg-white p-1 text-[12.5px]">
            <button
              onClick={() => setYearly(false)}
              className={`h-8 rounded-full px-4 transition-colors ${!yearly ? "bg-black text-white" : "text-muted-foreground"}`}
            >
              Monthly
            </button>
            <button
              onClick={() => setYearly(true)}
              className={`inline-flex h-8 items-center gap-1.5 rounded-full px-4 transition-colors ${yearly ? "bg-black text-white" : "text-muted-foreground"}`}
            >
              Yearly
              <span
                className={`rounded-full px-1.5 py-0.5 text-[10px] ${yearly ? "bg-white/15 text-white" : "bg-black/5 text-foreground/70"}`}
              >
                âˆ’20%
              </span>
            </button>
          </div>
        </div>

        <div className="mt-14 grid gap-4 md:grid-cols-3 md:gap-5">
          {plans.map((plan) => {
            const price = yearly ? plan.yearly : plan.monthly;
            const suffix =
              plan.monthly === 0 ? "forever" : yearly ? "/mo, billed yearly" : "/month";
            return (
              <div
                key={plan.name}
                className={`relative flex flex-col rounded-3xl p-7 ${
                  plan.featured
                    ? "bg-black text-white ring-1 ring-black/80 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.45)] md:-translate-y-2"
                    : "border border-hairline bg-white"
                }`}
              >
                {plan.featured && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full border border-hairline bg-white px-3 h-6 inline-flex items-center gap-1 text-[10.5px] font-medium text-black shadow-sm">
                    <Sparkles className="h-3 w-3" /> Most popular
                  </div>
                )}
                <div className="flex items-baseline justify-between">
                  <div className="text-[14px] font-medium">{plan.name}</div>
                  {yearly && plan.monthly > 0 && (
                    <div
                      className={`rounded-full px-2 py-0.5 text-[10.5px] ${plan.featured ? "bg-white/10 text-white/80" : "bg-black/5 text-foreground/70"}`}
                    >
                      Save ${(plan.monthly - plan.yearly) * 12}/yr
                    </div>
                  )}
                </div>
                <p
                  className={`mt-1 text-[12.5px] ${plan.featured ? "text-white/60" : "text-muted-foreground"}`}
                >
                  {plan.tagline}
                </p>

                <div className="mt-6 flex items-baseline gap-1.5">
                  <span className="text-[15px] opacity-60">$</span>
                  <span className="text-6xl font-semibold tracking-[-0.05em] tabular-nums">
                    {price}
                  </span>
                  <span
                    className={`text-[12.5px] ${plan.featured ? "text-white/60" : "text-muted-foreground"}`}
                  >
                    {suffix}
                  </span>
                </div>

                <a
                  href="#"
                  className={`mt-7 inline-flex h-11 w-full items-center justify-center gap-1.5 rounded-full text-[13.5px] font-medium transition-colors ${
                    plan.featured
                      ? "bg-white text-black hover:bg-white/90"
                      : "bg-black text-white hover:bg-black/85"
                  }`}
                >
                  {plan.cta} <ArrowRight className="h-3.5 w-3.5" />
                </a>

                <div
                  className={`mt-7 border-t pt-7 ${plan.featured ? "border-white/10" : "border-hairline"}`}
                >
                  <div
                    className={`mb-4 text-[11px] uppercase tracking-[0.16em] ${plan.featured ? "text-white/50" : "text-muted-foreground"}`}
                  >
                    What&apos;s included
                  </div>
                  <ul className="space-y-3 text-[13.5px]">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2.5">
                        <span
                          className={`mt-0.5 grid h-4 w-4 shrink-0 place-items-center rounded-full ${plan.featured ? "bg-white text-black" : "bg-black text-white"}`}
                        >
                          <Check className="h-2.5 w-2.5" strokeWidth={3} />
                        </span>
                        <span className={plan.featured ? "text-white/90" : "text-foreground/85"}>
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            );
          })}
        </div>

        <p className="mt-10 text-center text-[12.5px] text-muted-foreground">
          All plans include unlimited customers, PDF generation, and direct printing. The free plan
          includes up to 50 invoices per month. Need something custom?{" "}
          <a href="#contact" className="underline underline-offset-4 text-foreground">
            Talk to sales
          </a>
          .
        </p>
      </div>
    </section>
  );
}

function Testimonials() {
  const items = [
    {
      name: "Michael Anderson",
      role: "CTO, Northstar",
      q: "We replaced three internal tools with Envoiz. The API alone is worth it.",
    },
    {
      name: "Sarah Lee",
      role: "Ops, Lumen",
      q: "Our finance team ships in minutes what used to take days. It's that clean.",
    },
    {
      name: "James Wilson",
      role: "Founder, Parallel",
      q: "The most thoughtful invoicing product I've used. It feels like Linear for billing.",
    },
    {
      name: "David Carter",
      role: "Eng, Forge",
      q: "Webhooks and SDKs that actually work. Integration was a single afternoon.",
    },
  ] as const;

  return (
    <section id="testimonials" className="border-t border-hairline bg-surface/60 py-28">
      <div className="mx-auto max-w-7xl px-6">
        <SectionHeader eyebrow="Testimonials" title="Loved by operators and engineers." />
        <div className="mt-14 grid gap-3 md:grid-cols-2 lg:grid-cols-4">
          {items.map((item) => (
            <figure
              key={item.name}
              className="flex flex-col rounded-2xl border border-hairline bg-white/80 p-6"
            >
              <blockquote className="text-[14.5px] leading-relaxed">"{item.q}"</blockquote>
              <figcaption className="mt-6 flex items-center gap-3">
                <div className="grid h-9 w-9 place-items-center rounded-full bg-black text-[12px] font-medium text-white">
                  {item.name
                    .split(" ")
                    .map((part) => part[0])
                    .join("")}
                </div>
                <div>
                  <div className="text-[13px] font-medium">{item.name}</div>
                  <div className="text-[11.5px] text-muted-foreground">{item.role}</div>
                </div>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}

function FAQ() {
  const questions = [
    [
      "Can I print invoices directly?",
      "Yes. Print directly from any modern browser. No plugins or extensions required.",
    ],
    [
      "Can I integrate with my ERP?",
      "Use the REST API or webhooks to sync invoices, customers, and payments with any system.",
    ],
    [
      "Do you provide API access?",
      "Every paid plan includes the full REST API with versioning, signed webhooks, and SDKs.",
    ],
    [
      "Can I export PDFs?",
      "Every invoice is a one-click PDF, plus bulk export for any date range.",
    ],
    [
      "Can I add team members?",
      "Yes, on Pro and Business plans with granular roles and audit logs.",
    ],
    ["Is there a free plan?", "Yes. Starter is free forever with up to 100 invoices per month."],
  ] as const;

  const [open, setOpen] = useState<number | null>(0);

  return (
    <section id="faq" className="py-28">
      <div className="mx-auto max-w-3xl px-6">
        <div className="text-center">
          <p className="text-[12px] uppercase tracking-[0.18em] text-muted-foreground">FAQ</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-[-0.03em] md:text-5xl">
            Questions, answered.
          </h2>
        </div>
        <div className="mt-12 divide-y divide-hairline border-y border-hairline">
          {questions.map(([question, answer], index) => (
            <button
              key={question}
              onClick={() => setOpen(open === index ? null : index)}
              className="group w-full py-5 text-left"
            >
              <div className="flex items-center justify-between gap-6">
                <span className="text-[15.5px] font-medium">{question}</span>
                <ChevronDown
                  className={`h-4 w-4 text-muted-foreground transition-transform ${open === index ? "rotate-180" : ""}`}
                />
              </div>
              <div
                className={`grid transition-all duration-300 ${open === index ? "mt-2 grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}
              >
                <div className="overflow-hidden pr-10 text-[14px] leading-relaxed text-muted-foreground">
                  {answer}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

function Contact() {
  return (
    <section id="contact" className="border-t border-hairline py-28">
      <div className="mx-auto grid max-w-5xl gap-10 px-6 md:grid-cols-2">
        <div>
          <p className="text-[12px] uppercase tracking-[0.18em] text-muted-foreground">Contact</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-[-0.03em] md:text-5xl">
            Talk to our team.
          </h2>
          <p className="mt-4 max-w-md text-[15.5px] text-muted-foreground">
            Tell us a bit about your business and we&apos;ll get back within one business day.
          </p>
        </div>
        <form
          onSubmit={(event) => event.preventDefault()}
          className="space-y-3 rounded-2xl border border-hairline bg-white/80 p-6 shadow-[0_1px_2px_rgba(0,0,0,0.03),0_18px_50px_rgba(0,0,0,0.05)]"
        >
          <Field label="Name" placeholder="Jane Cooper" />
          <Field label="Email" type="email" placeholder="jane@company.com" />
          <Field label="Company" placeholder="Acme Inc." />
          <div>
            <label className="text-[12px] text-muted-foreground">Message</label>
            <textarea
              rows={4}
              placeholder="How can we help?"
              className="mt-1.5 w-full resize-none rounded-lg border border-hairline bg-white px-3 py-2.5 text-[14px] outline-none focus:border-black/40"
            />
          </div>
          <button className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-full bg-black text-[14px] font-medium text-white transition-colors hover:bg-black/85">
            Send message <ArrowRight className="h-4 w-4" />
          </button>
        </form>
      </div>
    </section>
  );
}

function Field({
  label,
  type = "text",
  placeholder,
}: {
  label: string;
  type?: string;
  placeholder: string;
}) {
  return (
    <div>
      <label className="text-[12px] text-muted-foreground">{label}</label>
      <input
        type={type}
        placeholder={placeholder}
        className="mt-1.5 h-11 w-full rounded-lg border border-hairline bg-white px-3 text-[14px] outline-none focus:border-black/40"
      />
    </div>
  );
}
