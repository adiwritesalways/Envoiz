import { createFileRoute } from "@tanstack/react-router";
import { ChevronDown, Search } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
      { label: "Authentication", href: "#authentication" },
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
    title: "API Reference",
    items: [
      { label: "Overview", href: "#overview" },
      { label: "Endpoints", href: "#endpoints" },
      { label: "Request & Response", href: "#request-response" },
      { label: "Error Codes", href: "#error-codes" },
      { label: "Rate Limits", href: "#rate-limits" },
    ],
  },
  {
    title: "Webhooks",
    items: [
      { label: "Setup", href: "#setup" },
      { label: "Event Types", href: "#event-types" },
      { label: "Payload Reference", href: "#payload-reference" },
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
      `The ${brandName} API is designed to make invoicing feel like a product feature instead of a separate system. You can create invoices, deliver PDFs, and track payment states from the same workflow your team already uses.`,
      "This guide walks through the core concepts, naming conventions, and the minimum setup required before you start calling the API in production. The examples below use realistic invoice data so you can copy the shape directly into your own integration.",
      "If you only need to verify a flow in staging, start with the quick start section and the sample key shown there. You can expand into webhooks, templates, and billing controls once the basic invoice lifecycle is working.",
    ],
    codeLabel: "Create your first invoice",
    code: `curl -X POST https://api.envoiz.com/v1/invoices \\
  -H "Authorization: Bearer sk_test_your_key" \\
  -H "Content-Type: application/json" \\
  -d '{
    "customer_name": "Avery Johnson",
    "currency": "USD",
    "items": [
      { "description": "Invoice design", "quantity": 1, "unit_price": 250 }
    ]
  }'`,
  },
  {
    id: "quick-start",
    group: "Getting Started",
    title: "Quick Start",
    paragraphs: [
      "Most teams can go from account creation to a working invoice in under ten minutes. The first step is to create an API key, then send one authenticated request from your app or a tool like cURL.",
      "We recommend testing with a single invoice, confirming the PDF URL, and then adding webhook handling for payment and delivery events. That sequence keeps the integration small and easy to debug.",
    ],
    codeLabel: "Node.js request",
    code: `const response = await fetch("https://api.envoiz.com/v1/invoices", {
  method: "POST",
  headers: {
    Authorization: "Bearer sk_test_your_key",
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    customer_name: "Avery Johnson",
    items: [{ description: "Invoice design", quantity: 1, unit_price: 250 }],
  }),
});`,
  },
  {
    id: "authentication",
    group: "Getting Started",
    title: "Authentication",
    paragraphs: [
      "All API requests must include a bearer token in the Authorization header. Test keys work only in non-production environments, while live keys are restricted to the organization that created them.",
      "Rotate keys whenever a teammate leaves the project or a deployment pipeline is refreshed. If a request is rejected, check the token scope first, then confirm that your request is targeting the correct environment.",
    ],
    codeLabel: "Authorization header",
    code: `Authorization: Bearer sk_live_************************`,
    table: {
      headers: ["Token type", "Use case", "Environment"],
      rows: [
        ["sk_test", "Local development and QA", "Staging"],
        ["sk_live", "Production invoice delivery", "Live"],
        ["Webhook secret", "Signature verification", "Both"],
      ],
    },
  },
  {
    id: "creating-an-invoice",
    group: "Invoices",
    title: "Creating an Invoice",
    paragraphs: [
      "An invoice is created by sending line items, customer details, and optional billing metadata to the invoices endpoint. The API returns a stable invoice identifier, a PDF link, and a current status.",
      "You can create drafts first, then finalize them once the billable amount or tax rules are confirmed. That makes it easy to support review workflows without changing the invoice schema later.",
    ],
    codeLabel: "POST /v1/invoices",
    code: `POST /v1/invoices
{
  "customer_name": "Avery Johnson",
  "issue_date": "2026-07-08",
  "due_date": "2026-07-22",
  "items": [
    { "description": "Brand strategy", "quantity": 2, "unit_price": 180 }
  ]
}`,
    table: {
      headers: ["Field", "Type", "Notes"],
      rows: [
        ["customer_name", "string", "Displayed on the invoice and PDF"],
        ["items", "array", "At least one line item is required"],
        ["due_date", "string", "Optional, ISO 8601 date"],
      ],
    },
  },
  {
    id: "invoice-fields-reference",
    group: "Invoices",
    title: "Invoice Fields Reference",
    paragraphs: [
      "The invoice payload is intentionally small, but each field is flexible enough to cover freelancers, agencies, and subscription-style billing. Required fields are limited to the values needed to calculate totals and render a usable document.",
      "If you need richer metadata, use the notes and custom fields sections rather than overloading the core schema. That keeps reporting reliable and avoids surprises when you export invoices to another system.",
    ],
    codeLabel: "Payload example",
    code: `{
  "customer_name": "Avery Johnson",
  "currency": "USD",
  "tax_rate": 0.2,
  "notes": "Thanks for the quick turnaround.",
  "custom_fields": [{ "label": "Project", "value": "Spring launch" }]
}`,
    table: {
      headers: ["Field", "Type", "Required", "Description"],
      rows: [
        ["customer_name", "string", "Yes", "Invoice recipient"],
        ["currency", "string", "Yes", "ISO currency code"],
        ["tax_rate", "number", "No", "Applied after subtotal"],
        ["notes", "string", "No", "Rendered in the footer area"],
      ],
    },
  },
  {
    id: "invoice-templates",
    group: "Invoices",
    title: "Invoice Templates",
    paragraphs: [
      "Templates let you standardize the look and structure of invoices across clients without rebuilding the document each time. You can choose a default layout, then override the logo, accent, or footer copy when needed.",
      "Most teams create one template for client services and another for recurring retainers. That keeps the PDF output familiar while still leaving room for branding differences between business lines.",
    ],
    codeLabel: "Template reference",
    code: `{
  "template_id": "tpl_minimal",
  "layout": "minimal",
  "accent": "brand",
  "show_payment_instructions": true
}`,
  },
  {
    id: "pdf-export",
    group: "Invoices",
    title: "PDF Export",
    paragraphs: [
      "PDF export happens after the invoice is rendered and validated, which means the file always reflects the final totals and tax calculations. The export endpoint is safe to call more than once if you need multiple delivery channels.",
      "If your integration sends PDFs to both the customer and an archive, use the same invoice identifier and keep the returned file URL rather than generating duplicate documents.",
    ],
    codeLabel: "Download PDF",
    code: `GET /v1/invoices/inv_01H8Y/pdf`,
    table: {
      headers: ["Response", "Meaning", "Action"],
      rows: [
        ["200", "PDF ready", "Download or email"],
        ["404", "Invoice not found", "Check the identifier"],
        ["409", "Invoice not finalized", "Finalize first"],
      ],
    },
  },
  {
    id: "overview",
    group: "API Reference",
    title: "Overview",
    paragraphs: [
      "The public API is organized around invoices, customers, and delivery events. Every response uses predictable JSON shapes so you can log, validate, and replay requests without a custom parser for each endpoint.",
      "For production usage, keep your request IDs and webhook event IDs in your logs. That makes support investigations much faster if a payment or PDF delivery needs to be traced end to end.",
    ],
    codeLabel: "Base URL",
    code: `https://api.envoiz.com/v1`,
  },
  {
    id: "endpoints",
    group: "API Reference",
    title: "Endpoints",
    paragraphs: [
      "Most integrations only need a handful of endpoints to manage the invoice lifecycle. You can create, update, finalize, and export invoices without maintaining separate flows for each document type.",
      "The endpoint table below focuses on the most common invoice operations. Use it as a starting point when mapping your application services to the API surface.",
    ],
    codeLabel: "Common routes",
    code: `GET /v1/invoices
POST /v1/invoices
GET /v1/invoices/{id}
POST /v1/invoices/{id}/finalize`,
    table: {
      headers: ["Method", "Path", "Purpose"],
      rows: [
        ["GET", "/v1/invoices", "List invoices"],
        ["POST", "/v1/invoices", "Create invoice"],
        ["POST", "/v1/invoices/{id}/finalize", "Lock totals and render PDF"],
      ],
    },
  },
  {
    id: "request-response",
    group: "API Reference",
    title: "Request & Response",
    paragraphs: [
      "Requests should be sent as JSON with an explicit content type. Responses always include the invoice identifier and status so your UI can update immediately without polling a separate system.",
      "When an operation fails, the API returns a machine-readable error code and a message that can be shown to support staff. Keep the raw error payload in your logs even if the UI displays a simplified version.",
    ],
    codeLabel: "Successful response",
    code: `{
  "id": "inv_01H8Y",
  "status": "draft",
  "pdf_url": "https://cdn.envoiz.com/inv_01H8Y.pdf"
}`,
  },
  {
    id: "error-codes",
    group: "API Reference",
    title: "Error Codes",
    paragraphs: [
      "Error handling is intentionally explicit so your team can distinguish validation issues from permission or service problems. Most failures can be resolved without contacting support once you know which category the code belongs to.",
      "If you see repeated 429 responses, back off exponentially rather than retrying immediately. That gives your integration room to recover while preserving throughput for other requests.",
    ],
    codeLabel: "Error payload",
    code: `{
  "error": {
    "code": "invalid_invoice_total",
    "message": "The sum of items does not match the invoice total."
  }
}`,
    table: {
      headers: ["Code", "Meaning", "Typical fix"],
      rows: [
        ["invalid_invoice_total", "Totals do not balance", "Recalculate line items"],
        ["unauthorized", "Missing or expired token", "Refresh the API key"],
        ["rate_limited", "Too many requests", "Retry after the reset window"],
      ],
    },
  },
  {
    id: "rate-limits",
    group: "API Reference",
    title: "Rate Limits",
    paragraphs: [
      "Rate limits are applied per token so one busy integration cannot starve another. The safest pattern is to batch invoice creation during sync jobs and keep user-triggered requests small and immediate.",
      "If your application needs higher throughput, contact support with a short description of the workload and the endpoints you plan to call most often.",
    ],
    codeLabel: "Limit headers",
    code: `X-RateLimit-Limit: 120
X-RateLimit-Remaining: 84
X-RateLimit-Reset: 1710000123`,
    table: {
      headers: ["Window", "Limit", "Notes"],
      rows: [
        ["1 minute", "120 requests", "General API usage"],
        ["1 hour", "2,000 requests", "Burst protection"],
        ["24 hours", "50,000 requests", "Organization aggregate"],
      ],
    },
  },
  {
    id: "setup",
    group: "Webhooks",
    title: "Setup",
    paragraphs: [
      "Webhooks are the preferred way to react to invoice state changes, payment events, and PDF generation updates. Register an HTTPS endpoint, then store the webhook secret so you can validate signatures on every call.",
      "Keep the handler fast. Acknowledge the event, queue any expensive work, and process the payload asynchronously so retries stay predictable.",
    ],
    codeLabel: "Signature check",
    code: `const isValid = verifyWebhookSignature(
  rawBody,
  headers["x-envoiz-signature"],
  process.env.ENVOIZ_WEBHOOK_SECRET
);`,
  },
  {
    id: "event-types",
    group: "Webhooks",
    title: "Event Types",
    paragraphs: [
      "Each event maps to a specific invoice lifecycle milestone, which keeps downstream automation easy to reason about. Most teams start with invoice creation and payment events, then add PDF and customer updates later.",
      "You can safely subscribe to more events than you currently use. Unhandled events can be logged and ignored until your workflow needs them.",
    ],
    codeLabel: "Example events",
    code: `invoice.created
invoice.finalized
invoice.paid
pdf.generated`,
    table: {
      headers: ["Event", "When it fires", "Recommended action"],
      rows: [
        ["invoice.created", "Draft saved", "Queue review workflow"],
        ["invoice.paid", "Payment confirmed", "Mark revenue recognized"],
        ["pdf.generated", "Document ready", "Email the file to the client"],
      ],
    },
  },
  {
    id: "payload-reference",
    group: "Webhooks",
    title: "Payload Reference",
    paragraphs: [
      "Webhook payloads include the event type, timestamp, invoice object, and a request identifier you can correlate with API logs. The invoice snapshot is intentionally complete so your app does not need to make a follow-up fetch for common actions.",
      "Treat the payload as immutable input. If you need the latest invoice state, call the API again rather than mutating the webhook body directly.",
    ],
    codeLabel: "Payload sample",
    code: `{
  "type": "invoice.paid",
  "created_at": "2026-07-08T08:15:00Z",
  "invoice": { "id": "inv_01H8Y", "status": "paid" }
}`,
  },
  {
    id: "managing-your-account",
    group: "Account & Billing",
    title: "Managing Your Account",
    paragraphs: [
      "Account settings control your organization profile, notification preferences, and team access. Most billing teams update these values once during onboarding and then only revisit them when company details change.",
      "If you operate multiple client projects, use separate workspaces or named environments so invoice templates and support contacts stay organized.",
    ],
    codeLabel: "Workspace update",
    code: `PATCH /v1/account
{
  "company_name": "Northstar Studio",
  "support_email": "billing@northstar.studio"
}`,
  },
  {
    id: "plans-limits",
    group: "Account & Billing",
    title: "Plans & Limits",
    paragraphs: [
      "Plans are built around invoice volume, API access, and collaboration needs. Solo operators can stay on a lightweight tier, while teams that automate delivery and reporting can move to a higher plan without reworking the product setup.",
      "Limits are visible in the dashboard so you can forecast usage before you hit a threshold. That makes it easier to decide when to upgrade rather than learning about a limit from a failed request.",
    ],
    codeLabel: "Usage snapshot",
    code: `{
  "plan": "Pro",
  "monthly_invoices": 182,
  "api_requests_remaining": 1480
}`,
    table: {
      headers: ["Plan area", "Included", "Limit"],
      rows: [
        ["Invoices", "Yes", "Varies by plan"],
        ["API access", "Yes", "Token based"],
        ["Team seats", "Yes", "Admin controlled"],
      ],
    },
  },
  {
    id: "billing-faq",
    group: "Account & Billing",
    title: "Billing FAQ",
    paragraphs: [
      "Billing questions usually fall into one of three buckets: subscription changes, invoice disputes, or payment method updates. The support team can resolve most issues quickly if you include the invoice ID and the date range involved.",
      "For refunds or plan changes, keep in mind that the billing cycle is tied to the organization rather than the individual user account. That helps keep access consistent when a team member leaves or changes roles.",
    ],
    codeLabel: "Common question",
    code: `Can I switch plans mid-cycle?
Yes. Changes take effect immediately, and prorated adjustments appear on the next billing statement.`,
  },
];

export const Route = createFileRoute("/resources/docs")({
  head: () => ({
    meta: [{ title: `Docs - ${brandName}` }, { name: "description", content: "Envoiz docs" }],
  }),
  component: DocsPage,
});

function DocsPage() {
  return (
    <div className="mx-auto max-w-7xl px-6 py-10 md:py-14">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-[12px] uppercase tracking-[0.18em] text-muted-foreground">
              Documentation
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-[-0.03em] md:text-5xl">
              Developer and user reference
            </h1>
          </div>
          <div className="w-full lg:max-w-md">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search documentation..."
                className="h-11 rounded-full pl-9"
              />
            </div>
          </div>
        </div>

        <Collapsible className="lg:hidden">
          <Card className="border-hairline bg-white/80">
            <CollapsibleTrigger asChild>
              <Button
                variant="ghost"
                className="flex w-full items-center justify-between px-4 py-3 text-left"
              >
                <span className="text-sm font-medium">Browse sections</span>
                <ChevronDown className="h-4 w-4" />
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="border-t border-hairline p-4">
              <div className="grid gap-4">
                {docsNav.map((group) => (
                  <div key={group.title}>
                    <div className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                      {group.title}
                    </div>
                    <div className="mt-2 grid gap-1">
                      {group.items.map((item) => (
                        <a
                          key={item.label}
                          href={item.href}
                          className="rounded-lg px-2 py-1.5 text-[13px] text-foreground/80 transition-colors hover:bg-secondary hover:text-foreground"
                        >
                          {item.label}
                        </a>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CollapsibleContent>
          </Card>
        </Collapsible>

        <div className="grid gap-10 lg:grid-cols-[280px_minmax(0,1fr)]">
          <aside className="hidden lg:block">
            <div className="sticky top-24 space-y-6 rounded-3xl border border-hairline bg-white/80 p-5 shadow-[0_1px_2px_rgba(0,0,0,0.03),0_18px_50px_rgba(0,0,0,0.05)]">
              {docsNav.map((group) => (
                <div key={group.title}>
                  <div className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                    {group.title}
                  </div>
                  <div className="mt-3 grid gap-1">
                    {group.items.map((item) => (
                      <a
                        key={item.label}
                        href={item.href}
                        className="rounded-xl px-3 py-2 text-[13px] text-foreground/75 transition-colors hover:bg-secondary hover:text-foreground"
                      >
                        {item.label}
                      </a>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </aside>

          <div className="space-y-8">
            {sections.map((section) => (
              <article
                key={section.id}
                id={section.id}
                className="scroll-mt-24 rounded-3xl border border-hairline bg-white/80 p-6 shadow-[0_1px_2px_rgba(0,0,0,0.03),0_18px_50px_rgba(0,0,0,0.05)] md:p-8"
              >
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">{section.group}</Badge>
                </div>
                <h2 className="mt-4 text-2xl font-semibold tracking-[-0.03em]">{section.title}</h2>
                <div className="mt-4 space-y-4 text-[15px] leading-relaxed text-muted-foreground">
                  {section.paragraphs.map((paragraph) => (
                    <p key={paragraph}>{paragraph}</p>
                  ))}
                </div>

                <div className="mt-6 rounded-2xl border border-hairline bg-black p-4 text-white shadow-[0_20px_60px_rgba(0,0,0,0.18)]">
                  <div className="mb-3 text-[11px] uppercase tracking-[0.18em] text-white/60">
                    {section.codeLabel}
                  </div>
                  <pre className="overflow-x-auto whitespace-pre-wrap font-mono text-[12px] leading-relaxed text-white/90">
                    <code>{section.code}</code>
                  </pre>
                </div>

                {section.table && (
                  <div className="mt-6">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          {section.table.headers.map((header) => (
                            <TableHead key={header}>{header}</TableHead>
                          ))}
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {section.table.rows.map((row, rowIndex) => (
                          <TableRow key={`${section.id}-${rowIndex}`}>
                            {row.map((cell) => (
                              <TableCell key={cell}>{cell}</TableCell>
                            ))}
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
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
