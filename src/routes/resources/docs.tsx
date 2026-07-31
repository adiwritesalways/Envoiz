import { createFileRoute } from "@tanstack/react-router";
import { ChevronDown, Search } from "lucide-react";

import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { brandName } from "@/lib/envoiz";

type DocTable = {
  headers: string[];
  rows: string[][];
};

type DocSection = {
  id: string;
  group: string;
  title: string;
  paragraphs: [string, string, string?];
  codeLabel: string;
  code: string;
  table?: DocTable;
};

const docsNav = [
  {
    title: "Getting Started",
    items: [
      { label: "Introduction", href: "#introduction" },
      { label: "Quick Start", href: "#quick-start" },
    ],
  },
  {
    title: "Invoices",
    items: [
      { label: "Creating an Invoice", href: "#creating-an-invoice" },
      { label: "Invoice Fields Reference", href: "#invoice-fields-reference" },
      { label: "Invoice Templates", href: "#invoice-templates" },
      { label: "PDF Export", href: "#pdf-export" },
    ],
  },
  {
    title: "Customers",
    items: [
      { label: "Managing Customers", href: "#managing-customers" },
      { label: "Invoice History", href: "#invoice-history" },
    ],
  },
  {
    title: "Account & Billing",
    items: [
      { label: "Managing Your Account", href: "#managing-your-account" },
      { label: "Plans & Limits", href: "#plans-limits" },
      { label: "Billing FAQ", href: "#billing-faq" },
    ],
  },
] as const;

const sections: DocSection[] = [
  {
    id: "introduction",
    group: "Getting Started",
    title: "Introduction",
    paragraphs: [
      `${brandName} is designed to make invoicing feel effortless. You can create invoices, deliver PDFs, and track payment states directly from your dashboard without any extra tools or integrations.`,
      "This guide walks through the core concepts and minimum setup required to start creating invoices. The examples use realistic data so you can understand each field and apply it directly to your workflow.",
    ],
    codeLabel: "Your first invoice",
    code: `1. Sign up at envoiz.com
2. Complete the onboarding wizard with your company name
3. Go to Invoices → fill in client details and line items
4. Click "Save Invoice" to generate your PDF`,
  },
  {
    id: "quick-start",
    group: "Getting Started",
    title: "Quick Start",
    paragraphs: [
      "Most users can go from signup to a finished invoice in under five minutes. Fill in your company details during onboarding, then head to the Invoices page to create your first one.",
      "Start with a single client and a couple of line items. Once the preview looks right, save the invoice to generate the PDF — you can download, print, or share it straight from that screen.",
    ],
    codeLabel: "Invoice checklist",
    code: `✓ Company name and address (set in Settings or Onboarding)
✓ Client name and email
✓ At least one line item with a description and price
✓ Issue date and due date
✓ Currency and optional tax rate`,
  },
  {
    id: "creating-an-invoice",
    group: "Invoices",
    title: "Creating an Invoice",
    paragraphs: [
      "An invoice is created by filling in client details and adding line items on the Invoices page. The preview updates in real time so you can see exactly how the PDF will look before saving.",
      "You can add as many line items as needed, apply a discount, and set a tax rate. The total is calculated automatically. Once you save, the invoice is stored and a PDF is available for download.",
    ],
    codeLabel: "Invoice summary",
    code: `Client:     Avery Johnson <avery@studio.co>
Issue date: 2026-07-08
Due date:   2026-07-22

Items:
  Brand strategy  ×2  @ $180  =  $360

Subtotal:  $360
Tax (10%): $36
Total:     $396`,
    table: {
      headers: ["Field", "Type", "Notes"],
      rows: [
        ["Client name", "text", "Displayed on the invoice and PDF"],
        ["Items", "list", "At least one line item is required"],
        ["Due date", "date", "Optional — displayed in the PDF header"],
        ["Tax rate", "percent", "Applied to the subtotal after discount"],
      ],
    },
  },
  {
    id: "invoice-fields-reference",
    group: "Invoices",
    title: "Invoice Fields Reference",
    paragraphs: [
      "The invoice form is intentionally concise, but each field is flexible enough to cover freelancers, agencies, and recurring billing. Required fields are limited to the values needed to calculate totals and render a usable document.",
      "If you need to pass additional context to a client, use the Notes field. It renders in the footer area of the PDF and supports free-form text.",
    ],
    codeLabel: "Field overview",
    code: `Client Name     — required, shown on invoice header
Client Email    — required, used for customer directory
Billing Address — optional, shown below client name
Issue Date      — defaults to today
Due Date        — defaults to 14 days from today
Currency        — ISO code, e.g. USD, EUR, GBP
Discount        — flat amount deducted from subtotal
Tax Rate        — percentage applied after discount
Notes           — free-form footer text`,
    table: {
      headers: ["Field", "Required", "Description"],
      rows: [
        ["Client name", "Yes", "Invoice recipient"],
        ["Currency", "Yes", "ISO currency code"],
        ["Tax rate", "No", "Applied after subtotal"],
        ["Notes", "No", "Rendered in the PDF footer area"],
      ],
    },
  },
  {
    id: "invoice-templates",
    group: "Invoices",
    title: "Invoice Templates",
    paragraphs: [
      "The invoice template is a clean black-and-white layout designed to look professional across all clients. It includes your company name, address, client details, line items table, and a totals block.",
      "Your company details are pulled from Settings automatically. Update your company name and address there once and all new invoices will reflect the change immediately.",
    ],
    codeLabel: "Template structure",
    code: `Header
  ├── Company name + address      (top-left)
  └── Invoice number + status     (top-right)

Client block
  ├── Billed To: name, email
  └── Due Date

Line items table
  ├── Item name
  ├── Quantity × unit price
  └── Row total

Totals
  ├── Subtotal
  ├── Discount (if set)
  ├── Tax (if set)
  └── Grand total

Footer
  └── Notes + Powered by Envoiz`,
  },
  {
    id: "pdf-export",
    group: "Invoices",
    title: "PDF Export",
    paragraphs: [
      "PDF export is available for every saved invoice. The file always reflects the current totals, tax calculations, and layout — saving again regenerates it with the latest values.",
      "You can also download a PNG version from the Download menu. Both formats are suitable for emailing to clients or attaching to accounting records.",
    ],
    codeLabel: "Download options",
    code: `From the Invoices page → Download menu:

PDF
  Vector output via @react-pdf/renderer.
  File: Invoice-ENV-000042.pdf

PNG
  High-resolution image at 2× pixel ratio.
  File: Invoice-ENV-000042.png`,
    table: {
      headers: ["Format", "Use case", "Quality"],
      rows: [
        ["PDF", "Client delivery, accounting records", "Vector — scales to any size"],
        ["PNG", "Email previews, screenshots", "2× pixel ratio — 1190px wide"],
      ],
    },
  },
  {
    id: "managing-customers",
    group: "Customers",
    title: "Managing Customers",
    paragraphs: [
      "Customers in Envoiz are created automatically when you save your first invoice for a new client email. There is no separate step required — the directory stays in sync with your invoice activity.",
      "You can browse all customers from the Customers page, see a full invoice history per client, and track total amounts invoiced. This gives you a quick overview of your most active relationships.",
    ],
    codeLabel: "Customer profile",
    code: `Name:            Avery Johnson
Email:           avery@studio.co
Total invoiced:  $12,840
Invoice count:   9
Last invoice:    2026-07-08`,
  },
  {
    id: "invoice-history",
    group: "Customers",
    title: "Invoice History",
    paragraphs: [
      "The invoice history view lists every invoice tied to a customer, sorted by date. You can click any invoice to open it for editing, downloading, or status updates.",
      "Total amounts shown in the customer detail are summed from all their invoices regardless of status. Filtering by Paid, Pending, or Overdue lets you quickly identify what is still outstanding.",
    ],
    codeLabel: "History example",
    code: `Customer: Avery Johnson
─────────────────────────────
ENV-000042  $4,800   Paid
ENV-000038  $2,400   Paid
ENV-000031  $1,200   Overdue
─────────────────────────────
Total invoiced: $8,400`,
  },
  {
    id: "managing-your-account",
    group: "Account & Billing",
    title: "Managing Your Account",
    paragraphs: [
      "Account settings control your company profile, notification preferences, and security options. Most teams update these values once during onboarding and only revisit them when company details change.",
      "Your company name and address set in Settings appear on every new invoice automatically. Update them under Settings → Preferences and save to apply the change going forward.",
    ],
    codeLabel: "Settings overview",
    code: `Settings → Preferences
  ├── Default currency
  ├── Company name
  └── Company address

Settings → Change Password
  └── Sends a secure reset link to your email

Settings → Change Email
  └── Sends a confirmation link to the new address`,
  },
  {
    id: "plans-limits",
    group: "Account & Billing",
    title: "Plans & Limits",
    paragraphs: [
      "Plans are built around invoice volume and collaboration needs. Solo operators can stay on the free tier, while growing teams can move to a higher plan for unlimited invoices, analytics, and custom branding.",
      "Limits are visible in the dashboard so you can forecast usage before hitting a threshold. That makes it easier to decide when to upgrade.",
    ],
    codeLabel: "Plan comparison",
    code: `Starter (free)
  ├── 100 invoices / month
  ├── Basic templates
  └── PDF export

Pro ($19/mo)
  ├── Unlimited invoices
  ├── Advanced analytics
  ├── Custom branding
  └── Team members & roles

Business ($49/mo)
  ├── Everything in Pro
  ├── Priority PDF processing
  ├── SOC 2 & audit logs
  └── Dedicated account manager`,
    table: {
      headers: ["Plan area", "Included", "Limit"],
      rows: [
        ["Invoices", "Yes", "Varies by plan"],
        ["PDF export", "Yes", "All plans"],
        ["Team seats", "Pro+", "Admin controlled"],
      ],
    },
  },
  {
    id: "billing-faq",
    group: "Account & Billing",
    title: "Billing FAQ",
    paragraphs: [
      "Billing questions usually fall into one of three areas: subscription changes, invoice disputes, or payment method updates. The support team can resolve most issues quickly if you include your account email and the date range involved.",
      "For refunds or plan changes, the billing cycle is tied to the organization rather than the individual user account. That helps keep access consistent when a team member leaves or changes roles.",
    ],
    codeLabel: "Common question",
    code: `Can I switch plans mid-cycle?
Yes. Changes take effect immediately, and prorated
adjustments appear on the next billing statement.`,
  },
];

const groupColors: Record<string, string> = {
  "Getting Started": "bg-white/5 text-[#aaaaaa] border-white/10",
  Invoices: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  Customers: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  "Account & Billing": "bg-amber-500/10 text-amber-400 border-amber-500/20",
};

export const Route = createFileRoute("/resources/docs")({
  head: () => ({
    meta: [{ title: `Docs - ${brandName}` }, { name: "description", content: "Envoiz docs" }],
  }),
  component: DocsPage,
});

function DocsPage() {
  return (
    <div className="min-h-screen bg-[#050505] text-[#F5F5F5]">
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-[#111111] px-6 pb-12 pt-12 md:pb-16 md:pt-16">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute left-1/2 top-0 h-[300px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-500/[0.05] blur-[100px]" />
        </div>
        <div className="relative mx-auto max-w-7xl">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-[#555555]">
                Documentation
              </p>
              <h1 className="mt-3 text-3xl font-extrabold tracking-[-0.03em] text-white md:text-5xl">
                Help and user reference
              </h1>
            </div>
            <div className="w-full lg:max-w-md">
              <div className="relative">
                <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#555555]" />
                <input
                  type="search"
                  placeholder="Search documentation..."
                  className="h-11 w-full rounded-full border border-[#2A2A2A] bg-[#0D0D0D] pl-10 pr-4 text-[13.5px] text-white placeholder:text-[#555555] focus:border-[#555555] focus:outline-none"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-6 py-10 md:py-14">
        {/* Mobile nav */}
        <Collapsible className="mb-6 lg:hidden">
          <div className="rounded-2xl border border-[#1A1A1A] bg-[#0D0D0D]">
            <CollapsibleTrigger asChild>
              <button
                type="button"
                className="flex w-full items-center justify-between px-5 py-4 text-left"
              >
                <span className="text-sm font-medium text-white">Browse sections</span>
                <ChevronDown className="h-4 w-4 text-[#555555]" />
              </button>
            </CollapsibleTrigger>
            <CollapsibleContent className="border-t border-[#1A1A1A] p-4">
              <div className="grid gap-4">
                {docsNav.map((group) => (
                  <div key={group.title}>
                    <div className="text-[11px] uppercase tracking-[0.18em] text-[#555555]">
                      {group.title}
                    </div>
                    <div className="mt-2 grid gap-1">
                      {group.items.map((item) => (
                        <a
                          key={item.label}
                          href={item.href}
                          className="rounded-lg px-2 py-1.5 text-[13px] text-[#888888] transition-colors hover:bg-[#111111] hover:text-white"
                        >
                          {item.label}
                        </a>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CollapsibleContent>
          </div>
        </Collapsible>

        <div className="grid gap-10 lg:grid-cols-[280px_minmax(0,1fr)]">
          {/* Sidebar */}
          <aside className="hidden lg:block">
            <div className="sticky top-24 space-y-6 rounded-2xl border border-[#1A1A1A] bg-[#0D0D0D] p-5">
              {docsNav.map((group) => (
                <div key={group.title}>
                  <div className="text-[11px] uppercase tracking-[0.18em] text-[#555555]">
                    {group.title}
                  </div>
                  <div className="mt-3 grid gap-1">
                    {group.items.map((item) => (
                      <a
                        key={item.label}
                        href={item.href}
                        className="rounded-xl px-3 py-2 text-[13px] text-[#888888] transition-colors hover:bg-[#111111] hover:text-white"
                      >
                        {item.label}
                      </a>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </aside>

          {/* Content */}
          <div className="space-y-6">
            {sections.map((section) => (
              <article
                key={section.id}
                id={section.id}
                className="scroll-mt-24 rounded-2xl border border-[#1A1A1A] bg-[#0D0D0D] p-6 md:p-8"
              >
                <div className="flex items-center gap-2">
                  <span
                    className={`inline-flex items-center rounded-full border px-3 py-1 text-[11px] font-medium ${groupColors[section.group] ?? "border-[#2A2A2A] bg-[#111111] text-[#888888]"}`}
                  >
                    {section.group}
                  </span>
                </div>
                <h2 className="mt-4 text-2xl font-bold tracking-[-0.03em] text-white">
                  {section.title}
                </h2>
                <div className="mt-4 space-y-4 text-[15px] leading-relaxed text-[#888888]">
                  {section.paragraphs.map((paragraph) => (
                    <p key={paragraph}>{paragraph}</p>
                  ))}
                </div>

                {/* Code block */}
                <div className="mt-6 overflow-hidden rounded-xl border border-[#1A1A1A] bg-[#060606]">
                  <div className="flex items-center gap-2 border-b border-[#1A1A1A] px-4 py-2.5">
                    <span className="h-2.5 w-2.5 rounded-full bg-[#1A1A1A]" />
                    <span className="h-2.5 w-2.5 rounded-full bg-[#1A1A1A]" />
                    <span className="h-2.5 w-2.5 rounded-full bg-[#1A1A1A]" />
                    <span className="ml-2 text-[11px] uppercase tracking-[0.18em] text-[#555555]">
                      {section.codeLabel}
                    </span>
                  </div>
                  <pre className="overflow-x-auto p-4 font-mono text-[12px] leading-relaxed text-[#aaaaaa]/90">
                    <code>{section.code}</code>
                  </pre>
                </div>

                {/* Table */}
                {section.table && (
                  <div className="mt-6 overflow-hidden rounded-xl border border-[#1A1A1A]">
                    <table className="w-full text-[13px]">
                      <thead className="border-b border-[#1A1A1A] bg-[#060606]">
                        <tr>
                          {section.table.headers.map((header) => (
                            <th
                              key={header}
                              className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-widest text-[#555555]"
                            >
                              {header}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {section.table.rows.map((row, rowIndex) => (
                          <tr
                            key={`${section.id}-${rowIndex}`}
                            className="border-b border-[#111111] last:border-0"
                          >
                            {row.map((cell, cellIndex) => (
                              <td
                                key={cell}
                                className={`px-4 py-3 ${cellIndex === 0 ? "font-medium text-white" : "text-[#888888]"}`}
                              >
                                {cell}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </article>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
