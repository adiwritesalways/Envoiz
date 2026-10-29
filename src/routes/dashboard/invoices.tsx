import { createFileRoute } from "@tanstack/react-router";
import { DashboardApp } from "@/components/envoiz/DashboardApp";

const formatDateLabel = (value: string | null | undefined) => {
  if (!value) return "—";
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
};

const formatDateShort = (value: string | null | undefined) => {
  if (!value) return "—";
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
};

const toDateInputValue = (date: Date) => date.toISOString().slice(0, 10);

const statusColors: Record<PaymentStatus, string> = {
  Paid: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20",
  Pending: "bg-amber-500/10 text-amber-400 border border-amber-500/20",
  Overdue: "bg-red-500/10 text-red-400 border border-red-500/20",
};

function computeListTotal(inv: StoredInvoiceRow) {
  const items = inv.envoiz_invoice_items ?? [];
  const sub = items.reduce((s, it) => s + it.quantity * it.unit_price, 0);
  const disc = Math.min(Math.max(0, inv.discount ?? 0), sub);
  const taxable = sub - disc;
  const tax = taxable * ((inv.tax_rate ?? 0) / 100);
  return taxable + tax;
}

type InvoiceExportData = {
  companyName: string;
  companyAddress: string;
  clientName: string;
  clientEmail: string;
  billingAddress: string;
  invoiceNumber: string;
  issueDate: string;
  dueDate: string;
  paymentStatus: PaymentStatus;
  items: InvoiceItem[];
  subtotal: number;
  discount: number;
  grandTotal: number;
  currency: CurrencyCode;
  notes: string;
  taxRate: number;
  isPro: boolean;
  brandLogo?: string;
  invoiceTemplate?: string;
  paymentInstructions?: string;
  contactEmail?: string;
  contactPhone?: string;
};

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

/** Removes near-white pixels from a logo image and returns a transparent-background PNG data URL. */
async function removeWhiteBackground(src: string, threshold = 240): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.naturalWidth || img.width;
      canvas.height = img.naturalHeight || img.height;
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(img, 0, 0);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i],
          g = data[i + 1],
          b = data[i + 2];
        if (r >= threshold && g >= threshold && b >= threshold) {
          data[i + 3] = 0; // make transparent
        }
      }
      ctx.putImageData(imageData, 0, 0);
      resolve(canvas.toDataURL("image/png"));
    };
    img.onerror = () => resolve(src); // fallback: return original if load fails
    img.src = src;
  });
}

function buildTemplate1InvoiceHtml(invoice: InvoiceExportData) {
  const fmt = (n: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: invoice.currency,
      maximumFractionDigits: 2,
    }).format(n || 0);

  const fmtDate = (v: string) => {
    if (!v) return "—";
    const d = new Date(`${v}T00:00:00`);
    return Number.isNaN(d.getTime())
      ? "—"
      : d.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
  };

  const itemRowsHtml = invoice.items
    .map(
      (item) => `
        <tr>
          <td style="padding:6px 0;font-size:9px;">${escapeHtml(item.product || "Item")}</td>
          <td style="padding:6px 0;font-size:9px;text-align:center;">${item.quantity}</td>
          <td style="padding:6px 0;font-size:9px;text-align:right;">${fmt(item.unitPrice)}</td>
          <td style="padding:6px 0;font-size:9px;text-align:right;">${fmt(item.quantity * item.unitPrice)}</td>
        </tr>`,
    )
    .join("");

  const discountRowHtml =
    invoice.discount > 0
      ? `<tr><td style="padding:5px 0;font-size:9px;color:#555;">Discount</td><td style="padding:5px 0;font-size:9px;text-align:right;">-${fmt(invoice.discount)}</td></tr>`
      : "";

  const taxRowHtml =
    invoice.taxRate > 0
      ? `<tr><td style="padding:5px 0;font-size:9px;color:#555;">Tax (${invoice.taxRate}%)</td><td style="padding:5px 0;font-size:9px;text-align:right;">${fmt((invoice.subtotal - Math.min(invoice.discount, invoice.subtotal)) * (invoice.taxRate / 100))}</td></tr>`
      : "";

  return `
    <div style="font-family:Helvetica,Arial,sans-serif;background:#ffffff;color:#000000;width:595px;box-sizing:border-box;padding:40px;font-size:10px;line-height:1.4;">
      <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:30px;">
        <div>
          <div style="font-size:32px;font-weight:700;letter-spacing:2px;">INVOICE</div>
        </div>
        <div style="text-align:right;">
          ${invoice.brandLogo ? `<img src="${invoice.brandLogo}" alt="Logo" style="max-width:140px;max-height:50px;object-fit:contain;margin-bottom:8px;" />` : `<div style="font-size:16px;font-weight:700;">${escapeHtml(invoice.companyName.toUpperCase())}</div>`}
        </div>
      </div>

      <div style="display:flex;justify-content:space-between;margin-bottom:30px;">
        <div style="gap:4px;">
          <div><strong>INVOICE NUMBER:</strong> ${escapeHtml(invoice.invoiceNumber)}</div>
          <div><strong>DATE:</strong> ${fmtDate(invoice.issueDate)}</div>
          <div><strong>DUE DATE:</strong> ${fmtDate(invoice.dueDate)}</div>
        </div>
        <div style="text-align:right;color:#555;">
          ${escapeHtml(invoice.companyAddress).replaceAll("\n", "<br />")}
        </div>
      </div>

      <div style="display:flex;justify-content:space-between;margin-bottom:30px;">
        <div>
          <div style="font-size:12px;font-weight:700;margin-bottom:8px;">Bill To:</div>
          <div style="font-weight:700;color:#000;">${escapeHtml(invoice.clientName)}</div>
          ${invoice.billingAddress ? `<div style="color:#555;">${escapeHtml(invoice.billingAddress).replaceAll("\n", "<br />")}</div>` : ""}
          ${invoice.clientEmail ? `<div style="color:#555;">${escapeHtml(invoice.clientEmail)}</div>` : ""}
        </div>
        ${
          invoice.paymentInstructions
            ? `
          <div style="text-align:right;">
            <div style="font-size:12px;font-weight:700;margin-bottom:8px;">Payment Method</div>
            <div style="color:#555;">${escapeHtml(invoice.paymentInstructions).replaceAll("\n", "<br />")}</div>
          </div>
        `
            : ""
        }
      </div>

      <table style="width:100%;border-collapse:collapse;margin-bottom:30px;">
        <thead>
          <tr style="border-bottom:1pt solid #000;">
            <th style="text-align:left;padding:0 0 8px;font-size:9px;font-weight:700;">DESCRIPTION</th>
            <th style="text-align:center;padding:0 0 8px;font-size:9px;font-weight:700;">QTY</th>
            <th style="text-align:right;padding:0 0 8px;font-size:9px;font-weight:700;">PRICE</th>
            <th style="text-align:right;padding:0 0 8px;font-size:9px;font-weight:700;">SUBTOTAL</th>
          </tr>
        </thead>
        <tbody>
          ${itemRowsHtml}
        </tbody>
      </table>

      <div style="display:flex;justify-content:flex-end;margin-bottom:24px;">
        <div style="width:220px;">
          <table style="width:100%;border-collapse:collapse;">
            <tr>
              <td style="padding:5px 0;font-size:9px;color:#555;">Subtotal</td>
              <td style="padding:5px 0;font-size:9px;text-align:right;">${fmt(invoice.subtotal)}</td>
            </tr>
            ${discountRowHtml}
            ${taxRowHtml}
            <tr>
              <td style="padding:10px 0 0;border-top:1pt solid #000;font-size:11px;font-weight:700;">GRAND TOTAL</td>
              <td style="padding:10px 0 0;border-top:1pt solid #000;font-size:11px;font-weight:700;text-align:right;">${fmt(invoice.grandTotal)}</td>
            </tr>
          </table>
        </div>
      </div>

      ${
        invoice.notes
          ? `
        <div style="border-top:1pt solid #000;padding-top:24px;margin-top:0;">
          <div style="font-size:9px;font-weight:700;margin-bottom:10px;">TERM &amp; CONDITION</div>
          <div style="white-space:pre-line;color:#333;">${escapeHtml(invoice.notes)}</div>
        </div>
      `
          : ""
      }

      ${
        !invoice.isPro
          ? `
        <div style="margin-top:48px;text-align:center;">
          <div style="font-size:8.5px;color:#a3a3a3;text-transform:uppercase;letter-spacing:1.5px;">
            Powered by <span style="color:#737373;font-weight:700;">Envoiz</span>
          </div>
        </div>
      `
          : ""
      }
    </div>
  `;
}

void buildTemplate1InvoiceHtml;

export const Route = createFileRoute("/dashboard/invoices")({
  head: () => ({
    meta: [
      { title: "Invoices — Envoiz" },
      {
        name: "description",
        content: "Create, track, and follow up on every invoice.",
      },
    ],
  }),
  component: DashboardInvoicesPage,
});

function DashboardInvoicesPage() {
  return <DashboardApp initialSection="invoices" />;
}

function PaymentStatusPill({ status }: { status: PaymentStatus }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-medium",
        statusColors[status],
      )}
    >
      {status}
    </span>
  );
}
