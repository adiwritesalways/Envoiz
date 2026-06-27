import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  ArrowRight, Check, ChevronDown, Printer, FileText, Code2,
  Zap, Shield, Users, BarChart3, Webhook, Globe, Sparkles, Mail, Github,
  Twitter, Linkedin, Command, Plus, Search,
} from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Receiptly — Modern Invoicing for Modern Businesses" },
      { name: "description", content: "Generate, print, and automate invoices with a developer-friendly platform designed for modern businesses." },
      { property: "og:title", content: "Receiptly — Beautiful Invoices. Zero Complexity." },
      { property: "og:description", content: "Generate, print, and automate invoices via a powerful REST API." },
    ],
  }),
  component: Landing,
});

function Landing() {
  return (
    <div className="min-h-screen bg-background text-foreground font-sans antialiased">
      <Navbar />
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
      <Footer />
    </div>
  );
}

/* ───────────────── Navbar ───────────────── */
function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll(); window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  const links = [
    ["Features", "#features"], ["How it Works", "#how"],
    ["API", "#api"], ["Pricing", "#pricing"],
    ["Testimonials", "#testimonials"], ["FAQ", "#faq"],
  ];
  return (
    <header className={`sticky top-0 z-50 transition-all ${scrolled ? "backdrop-blur-xl bg-white/70 border-b border-hairline" : "bg-transparent"}`}>
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <a href="#" className="flex items-center gap-2 font-semibold tracking-tight">
          <LogoMark />
          <span>Receiptly</span>
        </a>
        <nav className="hidden md:flex items-center gap-8 text-[13.5px] text-muted-foreground">
          {links.map(([l, h]) => (
            <a key={l} href={h} className="hover:text-foreground transition-colors">{l}</a>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <Link to="/login" className="hidden sm:inline-flex h-9 items-center px-3 text-[13.5px] text-muted-foreground hover:text-foreground transition-colors">Login</Link>
          <Link to="/signup" className="inline-flex h-9 items-center gap-1.5 px-4 rounded-full bg-black text-white text-[13px] font-medium hover:bg-black/85 transition-colors">
            Get Started <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </header>
  );
}

function LogoMark() {
  return (
    <div className="h-7 w-7 rounded-[8px] bg-black text-white grid place-items-center">
      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
        <path d="M5 4h10l4 4v12H5z" />
        <path d="M9 10h6M9 14h6M9 18h4" />
      </svg>
    </div>
  );
}

/* ───────────────── Hero ───────────────── */
function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 grid-bg pointer-events-none" />
      <div className="max-w-7xl mx-auto px-6 pt-20 pb-24 md:pt-28 md:pb-32 grid lg:grid-cols-12 gap-12 items-center relative">
        <div className="lg:col-span-6 animate-fade-up">
          <div className="inline-flex items-center gap-2 h-7 px-3 rounded-full hairline glass-soft text-[12px] text-muted-foreground">
            <span className="h-1.5 w-1.5 rounded-full bg-black" /> Now with API v1
          </div>
          <h1 className="mt-6 text-[44px] sm:text-6xl md:text-7xl font-semibold leading-[1.02] tracking-[-0.04em]">
            Beautiful Invoices.<br />
            <span className="text-muted-foreground">Zero Complexity.</span>
          </h1>
          <p className="mt-6 text-[17px] leading-relaxed text-muted-foreground max-w-xl">
            Generate, print, and automate invoices with a developer-friendly platform
            designed for modern businesses.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <a href="#" className="inline-flex h-11 items-center gap-2 px-5 rounded-full bg-black text-white text-[14px] font-medium hover:bg-black/85 transition-colors shadow-[0_8px_24px_rgba(0,0,0,0.18)]">
              Start Free <ArrowRight className="h-4 w-4" />
            </a>
            <a href="#api" className="inline-flex h-11 items-center gap-2 px-5 rounded-full hairline bg-white text-[14px] font-medium hover:bg-secondary transition-colors">
              View API Docs
            </a>
          </div>
          <div className="mt-8 flex items-center gap-6 text-[12.5px] text-muted-foreground">
            <span className="inline-flex items-center gap-1.5"><Check className="h-3.5 w-3.5" /> No credit card</span>
            <span className="inline-flex items-center gap-1.5"><Check className="h-3.5 w-3.5" /> 100 invoices free</span>
            <span className="inline-flex items-center gap-1.5"><Check className="h-3.5 w-3.5" /> Cancel anytime</span>
          </div>
        </div>

        <div className="lg:col-span-6 relative animate-fade-up">
          <HeroDashboard />
        </div>
      </div>
    </section>
  );
}

function HeroDashboard() {
  return (
    <div className="relative">
      <div className="absolute -inset-10 bg-[radial-gradient(ellipse_at_center,rgba(0,0,0,0.08),transparent_60%)]" />
      <div className="relative glass rounded-2xl p-5 animate-float">
        <div className="flex items-center justify-between pb-4 border-b border-hairline">
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-black/10" />
            <span className="h-2.5 w-2.5 rounded-full bg-black/10" />
            <span className="h-2.5 w-2.5 rounded-full bg-black/10" />
          </div>
          <div className="text-[11px] text-muted-foreground font-mono">app.receiptly.io</div>
          <div className="w-10" />
        </div>
        <div className="grid grid-cols-3 gap-3 mt-4">
          <Stat label="Revenue" value="$48,290" delta="+12.4%" />
          <Stat label="Invoices" value="1,284" delta="+8.1%" />
          <Stat label="Customers" value="342" delta="+3.6%" />
        </div>
        <div className="mt-4 rounded-xl border border-hairline p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="text-[12.5px] font-medium">Revenue</div>
            <div className="text-[11px] text-muted-foreground font-mono">Last 30 days</div>
          </div>
          <SparkChart />
        </div>
        <div className="mt-4 rounded-xl border border-hairline">
          <div className="flex items-center justify-between px-4 py-3 border-b border-hairline">
            <div className="text-[12.5px] font-medium">Recent invoices</div>
            <div className="text-[11px] text-muted-foreground">View all</div>
          </div>
          <ul className="divide-y divide-hairline">
            {[
              ["INV-0231", "Acme Inc.", "$1,240", "Paid"],
              ["INV-0230", "Northwind", "$820", "Pending"],
              ["INV-0229", "Globex", "$3,100", "Paid"],
            ].map(([id, c, amt, st]) => (
              <li key={id} className="flex items-center justify-between px-4 py-2.5 text-[12.5px]">
                <span className="font-mono text-muted-foreground">{id}</span>
                <span className="flex-1 ml-4">{c}</span>
                <span className="mr-3 tabular-nums">{amt}</span>
                <span className={`text-[10.5px] px-2 py-0.5 rounded-full border ${st === "Paid" ? "border-black/20 bg-black text-white" : "border-hairline text-muted-foreground"}`}>{st}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* floating chips */}
      <div className="hidden sm:flex absolute -left-6 top-8 glass rounded-xl px-3 py-2 items-center gap-2 text-[12px] animate-float" style={{ animationDelay: "0.6s" }}>
        <Printer className="h-3.5 w-3.5" /> Printed INV-0228
      </div>
      <div className="hidden sm:flex absolute -right-6 bottom-10 glass rounded-xl px-3 py-2 items-center gap-2 text-[12px] animate-float" style={{ animationDelay: "1.2s" }}>
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
      <div className="text-[10.5px] text-muted-foreground mt-0.5">{delta}</div>
    </div>
  );
}

function SparkChart() {
  const pts = [12, 18, 14, 22, 19, 28, 24, 33, 30, 38, 34, 42, 47, 44, 52];
  const max = Math.max(...pts);
  const path = pts.map((p, i) => {
    const x = (i / (pts.length - 1)) * 100;
    const y = 100 - (p / max) * 90;
    return `${i === 0 ? "M" : "L"}${x},${y}`;
  }).join(" ");
  return (
    <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-24">
      <defs>
        <linearGradient id="g" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="black" stopOpacity="0.18" />
          <stop offset="100%" stopColor="black" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={`${path} L100,100 L0,100 Z`} fill="url(#g)" />
      <path d={path} fill="none" stroke="black" strokeWidth="1.2" />
    </svg>
  );
}

/* ───────────────── Trusted ───────────────── */
function TrustedBy() {
  const logos = ["Nova", "Vertex", "Pulse", "Zenith", "Astra", "Horizon"];
  return (
    <section className="py-12 border-y border-hairline bg-surface/60">
      <div className="max-w-7xl mx-auto px-6">
        <p className="text-center text-[12px] uppercase tracking-[0.18em] text-muted-foreground">
          Trusted by teams building the future
        </p>
        <div className="mt-6 grid grid-cols-3 md:grid-cols-6 gap-6 items-center">
          {logos.map((n) => (
            <div key={n} className="text-center text-[18px] font-semibold tracking-tight text-foreground/70 hover:text-foreground transition-colors">
              {n}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}


/* ───────────────── Features ───────────────── */
function Features() {
  const items: [string, string, React.ComponentType<any>][] = [
    ["Unlimited invoices", "Send as many as you need, every month.", FileText],
    ["PDF generation", "Pixel-perfect, brandable PDFs in milliseconds.", FileText],
    ["Direct printing", "Print straight from the browser, no plugins.", Printer],
    ["Customer management", "Searchable directory with full history.", Users],
    ["Templates", "Beautiful presets, fully customizable.", Sparkles],
    ["Taxes & VAT", "Multi-region tax handling out of the box.", Globe],
    ["Recurring", "Set it and forget it — billed on schedule.", Zap],
    ["Analytics", "Real-time revenue and growth metrics.", BarChart3],
    ["API access", "Modern REST API with versioning.", Code2],
    ["Webhooks", "Event-driven workflows in your stack.", Webhook],
    ["Team members", "Roles, permissions, and audit logs.", Users],
    ["CSV export", "Bring data anywhere you need it.", FileText],
    ["Dark mode", "Easy on the eyes, day or night.", Sparkles],
    ["Email sending", "Deliver invoices with tracked opens.", Mail],
  ];
  return (
    <section id="features" className="py-28 border-t border-hairline">
      <div className="max-w-7xl mx-auto px-6">
        <SectionHeader eyebrow="Features" title="Built for invoice teams that move fast." />
        <div className="mt-14 grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {items.map(([t, d, Icon]) => (
            <div key={t} className="group rounded-2xl glass p-5 hover:-translate-y-0.5 transition-transform">
              <div className="h-9 w-9 rounded-lg bg-black text-white grid place-items-center">
                <Icon className="h-4 w-4" />
              </div>
              <div className="mt-4 text-[14.5px] font-medium tracking-tight">{t}</div>
              <div className="mt-1 text-[13px] text-muted-foreground leading-relaxed">{d}</div>
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
      <h2 className="mt-3 text-3xl md:text-5xl font-semibold tracking-[-0.03em]">{title}</h2>
      {sub && <p className="mt-4 text-[16px] text-muted-foreground leading-relaxed">{sub}</p>}
    </div>
  );
}

/* ───────────────── Dashboard preview ───────────────── */
function DashboardPreview() {
  return (
    <section className="py-28 bg-surface/60 border-y border-hairline">
      <div className="max-w-7xl mx-auto px-6">
        <SectionHeader
          eyebrow="Dashboard"
          title="A control room for your billing."
          sub="Track revenue, manage invoices, and act on what matters — without context switching."
        />
        <div className="mt-14 rounded-3xl glass overflow-hidden">
          <div className="grid grid-cols-12">
            <aside className="col-span-3 hidden md:flex flex-col gap-1 border-r border-hairline p-4">
              <div className="flex items-center gap-2 px-2 py-2">
                <LogoMark /> <span className="text-[13px] font-medium">Receiptly</span>
              </div>
              <div className="mt-3 flex items-center gap-2 px-3 py-2 rounded-lg hairline bg-white text-[12.5px] text-muted-foreground">
                <Search className="h-3.5 w-3.5" /> Search
                <span className="ml-auto inline-flex items-center gap-1 text-[10.5px] font-mono"><Command className="h-3 w-3" />K</span>
              </div>
              <nav className="mt-3 space-y-0.5 text-[13px]">
                {["Overview","Invoices","Customers","Products","Analytics","API Keys","Webhooks","Settings"].map((l, i) => (
                  <div key={l} className={`px-3 py-1.5 rounded-md ${i===0?"bg-black text-white":"text-muted-foreground hover:text-foreground hover:bg-secondary"}`}>{l}</div>
                ))}
              </nav>
            </aside>

            <div className="col-span-12 md:col-span-9 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-[12px] text-muted-foreground">Overview</div>
                  <div className="text-2xl font-semibold tracking-tight mt-1">Good morning, Alex</div>
                </div>
                <div className="flex items-center gap-2">
                  <button className="inline-flex h-9 items-center gap-2 px-3 rounded-full hairline bg-white text-[12.5px]"><Printer className="h-3.5 w-3.5" /> Print</button>
                  <button className="inline-flex h-9 items-center gap-2 px-3 rounded-full bg-black text-white text-[12.5px]"><Plus className="h-3.5 w-3.5" /> Create invoice</button>
                </div>
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-6">
                <Stat label="Monthly revenue" value="$48,290" delta="+12.4%" />
                <Stat label="Paid" value="1,108" delta="+9.2%" />
                <Stat label="Pending" value="176" delta="-2.1%" />
                <Stat label="API requests" value="284,910" delta="+24.0%" />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 mt-3">
                <div className="lg:col-span-2 rounded-xl border border-hairline p-4 bg-white">
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-[13px] font-medium">Revenue</div>
                    <div className="text-[11px] text-muted-foreground font-mono">YTD</div>
                  </div>
                  <SparkChart />
                </div>
                <div className="rounded-xl border border-hairline p-4 bg-white">
                  <div className="text-[13px] font-medium">Customers</div>
                  <ul className="mt-3 space-y-2.5 text-[12.5px]">
                    {["Acme Inc.", "Globex", "Soylent", "Initech"].map((c) => (
                      <li key={c} className="flex items-center gap-2.5">
                        <span className="h-6 w-6 rounded-full bg-black/5 grid place-items-center text-[10px]">{c[0]}</span>
                        <span>{c}</span>
                        <span className="ml-auto text-muted-foreground tabular-nums">${(Math.random()*9000|0).toLocaleString()}</span>
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

/* ───────────────── How it works ───────────────── */
function HowItWorks() {
  const steps = [
    ["01", "Create Invoice", "Add products and customer information in seconds.", FileText],
    ["02", "Generate PDF", "Instantly produce a beautiful, branded invoice.", Sparkles],
    ["03", "Print or Automate", "Print directly or integrate through our API.", Code2],
  ] as const;
  return (
    <section id="how" className="py-28 border-t border-hairline">
      <div className="max-w-7xl mx-auto px-6">
        <SectionHeader eyebrow="How it works" title="From draft to delivered in three steps." />
        <div className="mt-14 grid md:grid-cols-3 gap-3">
          {steps.map(([n, t, d, Icon]) => (
            <div key={n} className="rounded-2xl glass p-6">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[12px] text-muted-foreground">{n}</span>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="mt-8 text-xl font-semibold tracking-tight">{t}</div>
              <div className="mt-2 text-[13.5px] text-muted-foreground leading-relaxed">{d}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ───────────────── Developer API ───────────────── */
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
  "invoice_id": "INV-0001",
  "pdf_url": "https://cdn.receiptly.io/INV-0001.pdf",
  "status": "created"
}`;
  return (
    <section id="api" className="py-20 md:py-28 bg-black text-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-12 gap-10 lg:gap-12 items-start">
        <div className="lg:col-span-5 min-w-0">
          <p className="text-[12px] uppercase tracking-[0.18em] text-white/60">For developers</p>
          <h2 className="mt-3 text-3xl sm:text-4xl md:text-5xl font-semibold tracking-[-0.03em]">
            An API your engineers will love.
          </h2>
          <p className="mt-4 text-[15px] sm:text-[15.5px] text-white/70 leading-relaxed">
            REST endpoints, signed webhooks, idiomatic SDKs, predictable errors,
            and clear versioning. Ship invoicing in an afternoon.
          </p>
          <ul className="mt-8 grid grid-cols-2 gap-2 sm:gap-3 text-[12.5px] sm:text-[13px]">
            {[
              ["REST API", Code2], ["Webhooks", Webhook],
              ["Authentication", Shield], ["SDKs", Sparkles],
              ["Versioning", FileText], ["Rate limits", Zap],
            ].map(([l, I]: any) => (
              <li key={l} className="flex items-center gap-2 px-3 py-2 rounded-lg border border-white/10 bg-white/5 min-w-0">
                <I className="h-3.5 w-3.5 shrink-0" /> <span className="truncate">{l}</span>
              </li>
            ))}
          </ul>
          <div className="mt-8 flex flex-wrap gap-3">
            <a href="#" className="inline-flex h-11 items-center gap-2 px-5 rounded-full bg-white text-black text-[14px] font-medium">Read Docs <ArrowRight className="h-4 w-4" /></a>
            <a href="#" className="inline-flex h-11 items-center gap-2 px-5 rounded-full border border-white/15 text-[14px]">Get API Key</a>
          </div>
        </div>

        <div className="lg:col-span-7 min-w-0 w-full">
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] overflow-hidden">
            <div className="flex items-center justify-between px-4 h-10 border-b border-white/10">
              <div className="flex gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
                <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
                <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
              </div>
              <div className="text-[11px] font-mono text-white/50">request.http</div>
              <div className="w-10" />
            </div>
            <pre className="font-mono text-[11.5px] sm:text-[12.5px] leading-relaxed p-4 sm:p-5 overflow-x-auto whitespace-pre text-white/90">{req}</pre>
            <div className="px-4 py-2 text-[11px] font-mono text-white/50 border-y border-white/10 bg-white/[0.02]">200 OK · 38ms</div>
            <pre className="font-mono text-[11.5px] sm:text-[12.5px] leading-relaxed p-4 sm:p-5 overflow-x-auto whitespace-pre text-white/80">{res}</pre>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ───────────────── Pricing ───────────────── */
function Pricing() {
  const [yearly, setYearly] = useState(false);
  const plans = [
    {
      name: "Starter",
      tagline: "For solo shops getting started.",
      monthly: 0, yearly: 0,
      cta: "Start free",
      featured: false,
      features: [
        "100 invoices / month",
        "Basic templates",
        "PDF export",
        "Email support",
      ],
    },
    {
      name: "Pro",
      tagline: "For growing teams that ship daily.",
      monthly: 19, yearly: 15,
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
      monthly: 49, yearly: 39,
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
  ];
  return (
    <section id="pricing" className="py-28 border-t border-hairline relative overflow-hidden">
      <div className="absolute inset-0 grid-bg opacity-40 pointer-events-none" />
      <div className="max-w-7xl mx-auto px-6 relative">
        <div className="text-center max-w-2xl mx-auto">
          <p className="text-[12px] uppercase tracking-[0.18em] text-muted-foreground">Pricing</p>
          <h2 className="mt-3 text-3xl md:text-5xl font-semibold tracking-[-0.03em]">
            Simple pricing. No surprises.
          </h2>
          <p className="mt-4 text-[15.5px] text-muted-foreground">
            Start free, upgrade when you scale. Cancel anytime.
          </p>

          <div className="mt-8 inline-flex items-center p-1 rounded-full hairline bg-white text-[12.5px]">
            <button
              onClick={() => setYearly(false)}
              className={`h-8 px-4 rounded-full transition-colors ${!yearly ? "bg-black text-white" : "text-muted-foreground"}`}
            >
              Monthly
            </button>
            <button
              onClick={() => setYearly(true)}
              className={`h-8 px-4 rounded-full inline-flex items-center gap-1.5 transition-colors ${yearly ? "bg-black text-white" : "text-muted-foreground"}`}
            >
              Yearly
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${yearly ? "bg-white/15 text-white" : "bg-black/5 text-foreground/70"}`}>
                −20%
              </span>
            </button>
          </div>
        </div>

        <div className="mt-14 grid md:grid-cols-3 gap-4 md:gap-5 items-stretch">
          {plans.map((p) => {
            const price = yearly ? p.yearly : p.monthly;
            const per = p.monthly === 0 ? "forever" : yearly ? "/mo, billed yearly" : "/month";
            return (
              <div
                key={p.name}
                className={`relative rounded-3xl p-7 flex flex-col ${
                  p.featured
                    ? "bg-black text-white shadow-[0_30px_80px_-20px_rgba(0,0,0,0.45)] md:-translate-y-2 ring-1 ring-black/80"
                    : "bg-white hairline"
                }`}
              >
                {p.featured && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 h-6 inline-flex items-center gap-1 rounded-full bg-white text-black text-[10.5px] font-medium border border-hairline shadow-sm">
                    <Sparkles className="h-3 w-3" /> Most popular
                  </div>
                )}
                <div className="flex items-baseline justify-between">
                  <div className="text-[14px] font-medium">{p.name}</div>
                  {yearly && p.monthly > 0 && (
                    <div className={`text-[10.5px] px-2 py-0.5 rounded-full ${p.featured ? "bg-white/10 text-white/80" : "bg-black/5 text-foreground/70"}`}>
                      Save ${(p.monthly - p.yearly) * 12}/yr
                    </div>
                  )}
                </div>
                <p className={`mt-1 text-[12.5px] ${p.featured ? "text-white/60" : "text-muted-foreground"}`}>
                  {p.tagline}
                </p>

                <div className="mt-6 flex items-baseline gap-1.5">
                  <span className="text-[15px] opacity-60">$</span>
                  <span className="text-6xl font-semibold tracking-[-0.05em] tabular-nums">{price}</span>
                  <span className={`text-[12.5px] ${p.featured ? "text-white/60" : "text-muted-foreground"}`}>{per}</span>
                </div>

                <a
                  href="#"
                  className={`mt-7 inline-flex h-11 w-full items-center justify-center gap-1.5 rounded-full text-[13.5px] font-medium transition-colors ${
                    p.featured
                      ? "bg-white text-black hover:bg-white/90"
                      : "bg-black text-white hover:bg-black/85"
                  }`}
                >
                  {p.cta} <ArrowRight className="h-3.5 w-3.5" />
                </a>

                <div className={`mt-7 pt-7 border-t ${p.featured ? "border-white/10" : "border-hairline"}`}>
                  <div className={`text-[11px] uppercase tracking-[0.16em] mb-4 ${p.featured ? "text-white/50" : "text-muted-foreground"}`}>
                    What's included
                  </div>
                  <ul className="space-y-3 text-[13.5px]">
                    {p.features.map((f) => (
                      <li key={f} className="flex items-start gap-2.5">
                        <span
                          className={`mt-0.5 h-4 w-4 rounded-full grid place-items-center shrink-0 ${
                            p.featured ? "bg-white text-black" : "bg-black text-white"
                          }`}
                        >
                          <Check className="h-2.5 w-2.5" strokeWidth={3} />
                        </span>
                        <span className={p.featured ? "text-white/90" : "text-foreground/85"}>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            );
          })}
        </div>

        <p className="mt-10 text-center text-[12.5px] text-muted-foreground">
          All plans include unlimited customers, PDF generation, and direct printing. Need something custom?{" "}
          <a href="#contact" className="underline underline-offset-4 text-foreground">Talk to sales</a>.
        </p>
      </div>
    </section>
  );
}

/* ───────────────── Testimonials ───────────────── */
function Testimonials() {
  const items = [
    { name: "Michael Anderson", role: "CTO, Northstar", q: "We replaced three internal tools with Receiptly. The API alone is worth it." },
    { name: "Sarah Lee", role: "Ops, Lumen", q: "Our finance team ships in minutes what used to take days. It's that clean." },
    { name: "James Wilson", role: "Founder, Parallel", q: "The most thoughtful invoicing product I've used. It feels like Linear for billing." },
    { name: "David Carter", role: "Eng, Forge", q: "Webhooks and SDKs that actually work. Integration was a single afternoon." },
  ];
  return (
    <section id="testimonials" className="py-28 border-t border-hairline bg-surface/60">
      <div className="max-w-7xl mx-auto px-6">
        <SectionHeader eyebrow="Testimonials" title="Loved by operators and engineers." />
        <div className="mt-14 grid md:grid-cols-2 lg:grid-cols-4 gap-3">
          {items.map((t) => (
            <figure key={t.name} className="rounded-2xl glass p-6 flex flex-col">
              <blockquote className="text-[14.5px] leading-relaxed">"{t.q}"</blockquote>
              <figcaption className="mt-6 flex items-center gap-3">
                <div className="h-9 w-9 rounded-full bg-black text-white grid place-items-center text-[12px] font-medium">{t.name.split(" ").map(n=>n[0]).join("")}</div>
                <div>
                  <div className="text-[13px] font-medium">{t.name}</div>
                  <div className="text-[11.5px] text-muted-foreground">{t.role}</div>
                </div>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ───────────────── FAQ ───────────────── */
function FAQ() {
  const qs = [
    ["Can I print invoices directly?", "Yes — print directly from any modern browser. No plugins or extensions required."],
    ["Can I integrate with my ERP?", "Use our REST API or webhooks to sync invoices, customers, and payments with any system."],
    ["Do you provide API access?", "Every paid plan includes the full REST API with versioning, signed webhooks, and SDKs."],
    ["Can I export PDFs?", "Every invoice is a one-click PDF, plus bulk export for any date range."],
    ["Can I add team members?", "Yes, on Pro and Business plans with granular roles and audit logs."],
    ["Is there a free plan?", "Yes. Starter is free forever with up to 100 invoices per month."],
  ];
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section id="faq" className="py-28">
      <div className="max-w-3xl mx-auto px-6">
        <div className="text-center">
          <p className="text-[12px] uppercase tracking-[0.18em] text-muted-foreground">FAQ</p>
          <h2 className="mt-3 text-3xl md:text-5xl font-semibold tracking-[-0.03em]">Questions, answered.</h2>
        </div>
        <div className="mt-12 divide-y divide-hairline border-y border-hairline">
          {qs.map(([q, a], i) => (
            <button key={q} onClick={() => setOpen(open === i ? null : i)} className="w-full text-left py-5 group">
              <div className="flex items-center justify-between gap-6">
                <span className="text-[15.5px] font-medium">{q}</span>
                <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${open === i ? "rotate-180" : ""}`} />
              </div>
              <div className={`grid transition-all duration-300 ${open === i ? "grid-rows-[1fr] opacity-100 mt-2" : "grid-rows-[0fr] opacity-0"}`}>
                <div className="overflow-hidden text-[14px] text-muted-foreground leading-relaxed pr-10">{a}</div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ───────────────── Contact ───────────────── */
function Contact() {
  return (
    <section id="contact" className="py-28 border-t border-hairline">
      <div className="max-w-5xl mx-auto px-6 grid md:grid-cols-2 gap-10 items-center">
        <div>
          <p className="text-[12px] uppercase tracking-[0.18em] text-muted-foreground">Contact</p>
          <h2 className="mt-3 text-3xl md:text-5xl font-semibold tracking-[-0.03em]">Talk to our team.</h2>
          <p className="mt-4 text-[15.5px] text-muted-foreground max-w-md">
            Tell us a bit about your business and we'll get back within one business day.
          </p>
        </div>
        <form className="glass rounded-2xl p-6 space-y-3" onSubmit={(e)=>e.preventDefault()}>
          <Field label="Name" placeholder="Jane Cooper" />
          <Field label="Email" type="email" placeholder="jane@company.com" />
          <Field label="Company" placeholder="Acme Inc." />
          <div>
            <label className="text-[12px] text-muted-foreground">Message</label>
            <textarea rows={4} placeholder="How can we help?" className="mt-1.5 w-full rounded-lg border border-hairline bg-white px-3 py-2.5 text-[14px] outline-none focus:border-black/40 resize-none" />
          </div>
          <button className="w-full h-11 rounded-full bg-black text-white text-[14px] font-medium hover:bg-black/85 transition-colors inline-flex items-center justify-center gap-2">
            Send message <ArrowRight className="h-4 w-4" />
          </button>
        </form>
      </div>
    </section>
  );
}

function Field({ label, type = "text", placeholder }: { label: string; type?: string; placeholder: string }) {
  return (
    <div>
      <label className="text-[12px] text-muted-foreground">{label}</label>
      <input type={type} placeholder={placeholder} className="mt-1.5 w-full h-11 rounded-lg border border-hairline bg-white px-3 text-[14px] outline-none focus:border-black/40" />
    </div>
  );
}

/* ───────────────── Footer ───────────────── */
function Footer() {
  const cols = [
    ["Product", ["Features", "Pricing", "API", "Roadmap"]],
    ["Resources", ["Docs", "Blog", "Support", "Status"]],
    ["Company", ["About", "Privacy Policy", "Terms", "Security"]],
  ] as const;
  return (
    <footer className="border-t border-hairline bg-surface/60">
      <div className="max-w-7xl mx-auto px-6 py-16 grid md:grid-cols-5 gap-10">
        <div className="md:col-span-2">
          <div className="flex items-center gap-2 font-semibold tracking-tight">
            <LogoMark /> Receiptly
          </div>
          <p className="mt-4 text-[13.5px] text-muted-foreground max-w-xs leading-relaxed">
            Modern invoicing for modern businesses. Built with care in San Francisco.
          </p>
          <div className="mt-5 flex items-center gap-2">
            {[Github, Twitter, Linkedin].map((I, i) => (
              <a key={i} href="#" className="h-9 w-9 grid place-items-center rounded-full hairline bg-white hover:bg-secondary transition-colors">
                <I className="h-4 w-4" />
              </a>
            ))}
          </div>
        </div>
        {cols.map(([title, links]) => (
          <div key={title}>
            <div className="text-[12px] uppercase tracking-[0.18em] text-muted-foreground">{title}</div>
            <ul className="mt-4 space-y-2.5 text-[13.5px]">
              {links.map((l) => (
                <li key={l}><a href="#" className="hover:text-foreground text-foreground/80 transition-colors">{l}</a></li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-hairline">
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between text-[12px] text-muted-foreground">
          <span>© {new Date().getFullYear()} Receiptly, Inc.</span>
          <span>All systems normal</span>
        </div>
      </div>
    </footer>
  );
}
