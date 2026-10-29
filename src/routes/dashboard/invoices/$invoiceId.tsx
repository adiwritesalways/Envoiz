import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Document, Page, StyleSheet, Text, View, pdf } from "@react-pdf/renderer";
import { toPng } from "html-to-image";
import {
  ArrowLeft,
  Check,
  Copy,
  CreditCard,
  Download,
  Edit3,
  ExternalLink,
  Mail,
  Printer,
  Trash2,
} from "lucide-react";
import { useRef } from "react";
import { toast } from "sonner";

import { useAuth } from "@/components/auth/auth-context";
import { InvoicePDFDocument, type InvoiceData } from "@/components/envoiz/InvoicePDFDocument";
import { supabase } from "@/lib/supabase";
import { brandName, defaultCurrency, type CurrencyCode } from "@/lib/envoiz";
import { cn } from "@/lib/utils";
import { DEMO_INVOICES } from "@/lib/demo-data";

type PaymentStatus = "Draft" | "Pending" | "Sent" | "Paid" | "Overdue";

type InvoiceRow = {
  id: string;
  invoice_number?: string | null;
  client_name?: string | null;
  client_email?: string | null;
  billing_address?: string | null;
  issue_date?: string | null;
  due_date?: string | null;
  payment_status?: PaymentStatus | null;
  currency?: CurrencyCode | null;
  company_name?: string | null;
  company_address?: string | null;
  discount?: number | null;
  tax_rate?: number | null;
  notes?: string | null;
  envoiz_invoice_items?: InvoiceItemRow[];
};

type InvoiceItemRow = {
  product: string;
  quantity: number;
  unit_price: number;
};

const statusOptions: PaymentStatus[] = ["Draft", "Sent", "Paid", "Overdue"];

export const Route = createFileRoute("/dashboard/invoices/$invoiceId")({
  head: () => ({
    meta: [
      { title: `Invoice - ${brandName}` },
      { name: "description", content: "Preview, print, and manage an Envoiz invoice." },
    ],
  }),
  component: InvoiceDetailPage,
});

const formatDate = (value?: string | null) => {
  if (!value) return "—";
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
};

const formatLongDate = (value?: string | null) => {
  if (!value) return "—";
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
};

const money = (value: number, currency: CurrencyCode) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency, maximumFractionDigits: 2 }).format(
    value || 0,
  );

function getTotals(invoice: InvoiceRow) {
  const items = invoice.envoiz_invoice_items ?? [];
  const subtotal = items.reduce((sum, item) => sum + item.quantity * item.unit_price, 0);
  const discount = Math.min(Math.max(0, invoice.discount ?? 0), subtotal);
  const taxable = subtotal - discount;
  const taxRate = Math.min(Math.max(0, invoice.tax_rate ?? 0), 100);
  const tax = taxable * (taxRate / 100);
  return { subtotal, discount, taxRate, tax, total: taxable + tax };
}

function toExportInvoice(invoice: InvoiceRow, totals: ReturnType<typeof getTotals>): InvoiceData {
  return {
    companyName: invoice.company_name || brandName,
    companyAddress: invoice.company_address || "",
    clientName: invoice.client_name || "Client",
    clientEmail: invoice.client_email || "",
    billingAddress: invoice.billing_address || "",
    invoiceNumber: invoice.invoice_number || "INV",
    issueDate: invoice.issue_date || "",
    dueDate: invoice.due_date || "",
    paymentStatus: invoice.payment_status || "Draft",
    items: (invoice.envoiz_invoice_items ?? []).map((item) => ({
      product: item.product,
      quantity: item.quantity,
      unitPrice: item.unit_price,
    })),
    subtotal: totals.subtotal,
    discount: totals.discount,
    grandTotal: totals.total,
    currency: invoice.currency || defaultCurrency,
    notes: invoice.notes || "",
    taxRate: totals.taxRate,
    isPro: true,
  };
}

function InvoiceDetailPage() {
  const { invoiceId } = Route.useParams();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const invoicePaperRef = useRef<HTMLElement>(null);

  const isDemo = !user || user.id.startsWith("demo-user") || invoiceId.startsWith("demo-");

  const invoiceQuery = useQuery({
    queryKey: ["invoiceDetail", invoiceId, user?.id],
    queryFn: async () => {
      if (isDemo) {
        const found =
          DEMO_INVOICES.find((i) => i.id === invoiceId || i.number === invoiceId) ||
          DEMO_INVOICES[0];
        return {
          id: found.id,
          invoice_number: found.number,
          client_name: found.clientName,
          client_email: found.clientEmail,
          billing_address: "Amsterdam, Netherlands",
          issue_date: found.createdAt?.slice(0, 10),
          due_date: found.dueDate?.slice(0, 10),
          payment_status: found.status as PaymentStatus,
          currency: (found.currency as CurrencyCode) || defaultCurrency,
          discount: 0,
          tax_rate: found.taxRate || 0,
          notes: "Thank you for partnering with Studio North.",
          company_name: "Studio North",
          company_address: "Prinsengracht 263, Amsterdam",
          envoiz_invoice_items: found.items.map((it) => ({
            product: it.product,
            quantity: it.quantity,
            unit_price: it.unitPrice,
          })),
        } as InvoiceRow;
      }
      const { data, error } = await supabase
        .from("envoiz_invoices")
        .select(
          "id, invoice_number, client_name, client_email, billing_address, issue_date, due_date, payment_status, currency, discount, tax_rate, notes, company_name, company_address, envoiz_invoice_items(product, quantity, unit_price)",
        )
        .eq("id", invoiceId)
        .eq("user_id", user!.id)
        .single();
      if (error) throw error;
      return data as InvoiceRow;
    },
    enabled: Boolean((user?.id || isDemo) && invoiceId),
  });

  const invoice = invoiceQuery.data;
  const currency = invoice?.currency || defaultCurrency;
  const totals = invoice ? getTotals(invoice) : null;
  const status = invoice?.payment_status || "Draft";

  const updateStatus = async (nextStatus: PaymentStatus) => {
    if (!invoice) return;
    if (isDemo) {
      toast.success(`Invoice marked as ${nextStatus.toLowerCase()} (Demo mode).`);
      return;
    }
    const { error } = await supabase
      .from("envoiz_invoices")
      .update({ payment_status: nextStatus })
      .eq("id", invoice.id);
    if (error) {
      toast.error(error.message);
      return;
    }
    await queryClient.invalidateQueries({ queryKey: ["invoiceDetail", invoiceId] });
    await queryClient.invalidateQueries({ queryKey: ["invoiceListRaw"] });
    await queryClient.invalidateQueries({ queryKey: ["recentInvoices"] });
    toast.success(`Invoice marked as ${nextStatus.toLowerCase()}.`);
  };

  const downloadPdf = async () => {
    if (!invoice || !totals) return;
    const blob = await pdf(
      <InvoicePDFDocument invoice={toExportInvoice(invoice, totals)} />,
    ).toBlob();
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${invoice.invoice_number || "invoice"}.pdf`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const downloadPng = async () => {
    if (!invoicePaperRef.current || !invoice) return;
    try {
      const image = await toPng(invoicePaperRef.current, {
        backgroundColor: "#ffffff",
        cacheBust: true,
        pixelRatio: 2,
      });
      const link = document.createElement("a");
      link.href = image;
      link.download = `${invoice.invoice_number || "invoice"}.png`;
      link.click();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not create the PNG.");
    }
  };

  if (invoiceQuery.isLoading) {
    return <div className="surface p-8 text-sm text-[#666]">Loading invoice...</div>;
  }

  if (invoiceQuery.isError || !invoice || !totals) {
    return (
      <div className="surface p-8">
        <p className="text-sm font-medium text-[#292827]">Invoice unavailable</p>
        <p className="mt-1 text-xs text-[#666]">We could not load this invoice.</p>
      </div>
    );
  }

  const items = invoice.envoiz_invoice_items ?? [];

  return (
    <div className="space-y-8">
      <Link
        to="/dashboard/invoices"
        className="quiet-link inline-flex items-center gap-2 px-2 py-1.5 text-sm"
      >
        <ArrowLeft size={15} /> Back to invoices
      </Link>

      <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <p className="label mb-3">Invoice / {invoice.invoice_number || invoice.id}</p>
          <h1 className="display-title text-[#292827]">{invoice.client_name || "Client"}</h1>
          <p className="body-copy mt-3">
            {invoice.client_email || "No email"} · due {formatDate(invoice.due_date)}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <StatusBadge status={status} />
          <button
            className="quiet-link inline-flex items-center gap-2 px-3 py-2 text-sm"
            onClick={() => window.print()}
          >
            <Printer size={15} /> Print
          </button>
          <button
            className="quiet-link inline-flex items-center gap-2 px-3 py-2 text-sm"
            onClick={downloadPdf}
          >
            <Download size={15} /> PDF
          </button>
          <button
            className="quiet-link inline-flex items-center gap-2 px-3 py-2 text-sm"
            onClick={downloadPng}
          >
            <Download size={15} /> PNG
          </button>
          {status !== "Paid" && (
            <button
              className="wine-button inline-flex items-center gap-1.5 px-4 py-2 text-sm"
              onClick={() => updateStatus("Paid")}
            >
              Mark as paid
            </button>
          )}
          {status !== "Sent" && (
            <button
              className="quiet-link border border-[#e3e3e2] inline-flex items-center gap-1.5 px-3 py-2 text-sm"
              onClick={() => updateStatus("Sent")}
            >
              Mark as sent
            </button>
          )}
          {status !== "Draft" && (
            <button
              className="quiet-link border border-[#e3e3e2] inline-flex items-center gap-1.5 px-3 py-2 text-sm"
              onClick={() => updateStatus("Draft")}
            >
              Mark as draft
            </button>
          )}
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_375px]">
        <article
          ref={invoicePaperRef}
          className="invoice-print rounded-lg border border-[#e3e3e2] bg-white px-8 py-10 text-[#292827] shadow-sm md:px-14 md:py-14"
        >
          <div className="flex flex-col gap-10 md:flex-row md:items-start md:justify-between">
            <div>
              <div className="mb-7 flex h-9 w-9 items-center justify-center rounded-lg bg-[#421d24] text-sm font-semibold text-white">
                e
              </div>
              <h2 className="text-[22px] font-semibold tracking-[-0.02em]">
                {invoice.company_name || brandName}
              </h2>
              {invoice.company_address ? (
                <p className="mt-4 whitespace-pre-line text-sm leading-7 text-[#666]">
                  {invoice.company_address}
                </p>
              ) : null}
            </div>
            <div className="md:text-right">
              <p className="label mb-4">Invoice</p>
              <p className="text-[30px] font-medium tracking-[-0.04em]">
                {invoice.invoice_number || "INV"}
              </p>
              <p className="mt-3 text-sm text-[#666]">
                Issued {formatLongDate(invoice.issue_date)}
              </p>
            </div>
          </div>

          <div className="my-16 border-t border-[#dedbd4]" />

          <div className="grid gap-10 md:grid-cols-2">
            <div>
              <p className="label mb-4">Billed to</p>
              <p className="text-[17px] font-medium">{invoice.client_name || "Client"}</p>
              {invoice.client_email ? (
                <p className="mt-2 text-sm text-[#666]">{invoice.client_email}</p>
              ) : null}
              {invoice.billing_address ? (
                <p className="mt-2 whitespace-pre-line text-sm leading-7 text-[#666]">
                  {invoice.billing_address}
                </p>
              ) : null}
            </div>
            <div className="md:text-right">
              <p className="label mb-4">Payment due</p>
              <p className="text-[17px] font-medium">{formatLongDate(invoice.due_date)}</p>
              <p className="mt-2 text-sm text-[#666]">
                {currency} · {status === "Paid" ? "Paid in full" : "Payment requested"}
              </p>
            </div>
          </div>

          <div className="my-12 border-t border-[#dedbd4]" />

          <div className="grid grid-cols-[minmax(0,1fr)_80px_120px_130px] gap-4 border-b border-[#292827] pb-4 text-sm text-[#666]">
            <span>Description</span>
            <span className="text-right">Qty</span>
            <span className="text-right">Rate</span>
            <span className="text-right">Amount</span>
          </div>
          <div className="divide-y divide-[#e3e3e2]">
            {items.map((item, index) => (
              <div
                key={`${item.product}-${index}`}
                className="grid grid-cols-[minmax(0,1fr)_80px_120px_130px] gap-4 py-5 text-sm"
              >
                <span className="font-medium">{item.product || "Item"}</span>
                <span className="text-right tabular-nums">{item.quantity}</span>
                <span className="text-right tabular-nums">{money(item.unit_price, currency)}</span>
                <span className="text-right font-medium tabular-nums">
                  {money(item.quantity * item.unit_price, currency)}
                </span>
              </div>
            ))}
          </div>

          <div className="mt-10 flex justify-end">
            <div className="w-full max-w-sm space-y-4">
              <TotalRow label="Subtotal" value={money(totals.subtotal, currency)} />
              {totals.discount > 0 ? (
                <TotalRow label="Discount" value={`-${money(totals.discount, currency)}`} />
              ) : null}
              <TotalRow
                label={totals.taxRate > 0 ? `Tax (${totals.taxRate}%)` : "Tax"}
                value={money(totals.tax, currency)}
              />
              <div className="flex items-center justify-between border-t border-[#292827] pt-5">
                <span className="text-[17px] font-medium">Total</span>
                <span className="text-[20px] font-semibold tabular-nums">
                  {money(totals.total, currency)}
                </span>
              </div>
            </div>
          </div>

          {invoice.notes ? (
            <div className="mt-16 max-w-xl border-t border-[#dedbd4] pt-8">
              <p className="whitespace-pre-line text-sm leading-7 text-[#666]">{invoice.notes}</p>
            </div>
          ) : null}
        </article>

        <aside className="space-y-5">
          <section className="surface p-5 md:p-6">
            <p className="label mb-6">Actions</p>
            <ActionRow label="Edit" icon={Edit3} />
            <ActionRow label="Send to client" icon={Mail} onClick={() => updateStatus("Sent")} />
            <ActionRow
              label="Record payment"
              icon={CreditCard}
              onClick={() => updateStatus("Paid")}
            />
            <ActionRow label="Duplicate" icon={Copy} />
            <ActionRow label="Delete" icon={Trash2} danger />
            <ActionRow label="Copy invoice link" icon={Copy} />
            <ActionRow label="Payment and branding" icon={ExternalLink} />
          </section>

          <section className="surface p-5 md:p-6">
            <p className="label mb-5">Status</p>
            <div className="space-y-2">
              {statusOptions.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => updateStatus(option)}
                  className={cn(
                    "flex w-full items-center justify-between rounded-lg px-4 py-3 text-left text-sm transition",
                    status === option
                      ? "bg-[#cdb9ff] text-[#421d24]"
                      : "text-[#666] hover:bg-[#f7f4ef] hover:text-[#292827]",
                  )}
                >
                  {option}
                  {status === option ? <Check size={16} /> : null}
                </button>
              ))}
            </div>
          </section>

          <section className="surface p-5 md:p-6">
            <p className="label mb-5">Activity</p>
            <div className="flex gap-3 text-sm">
              <span className="mt-1.5 h-2 w-2 rounded-full bg-[#714cb6]" />
              <div>
                <p className="font-medium text-[#292827]">Created</p>
                <p className="mt-1 text-xs text-[#666]">{formatLongDate(invoice.issue_date)}</p>
              </div>
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: PaymentStatus }) {
  return (
    <span className="rounded-full bg-[#f7f4ef] px-3 py-1.5 text-xs font-medium text-[#666]">
      {status}
    </span>
  );
}

function TotalRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between text-sm text-[#666]">
      <span>{label}</span>
      <span className="font-medium tabular-nums text-[#292827]">{value}</span>
    </div>
  );
}

function ActionRow({
  label,
  icon: Icon,
  danger,
  onClick,
}: {
  label: string;
  icon: typeof Edit3;
  danger?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex w-full items-center justify-between border-b border-[#e3e3e2] py-3 text-left text-sm transition last:border-b-0",
        danger ? "text-[#421d24] hover:text-red-700" : "text-[#292827] hover:text-[#714cb6]",
      )}
    >
      {label}
      <Icon size={17} className={danger ? "text-[#421d24]" : "text-[#714cb6]"} />
    </button>
  );
}

const pdfStyles = StyleSheet.create({
  page: { padding: 48, fontSize: 10, fontFamily: "Helvetica", color: "#292827" },
  row: { flexDirection: "row", justifyContent: "space-between", gap: 24 },
  label: { fontSize: 8, letterSpacing: 1.6, textTransform: "uppercase", color: "#666666" },
  title: { fontSize: 28, marginTop: 12 },
  line: { borderTopWidth: 1, borderTopColor: "#dedbd4", marginVertical: 34 },
  tableHead: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#292827",
    paddingBottom: 8,
    color: "#666666",
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#e3e3e2",
    paddingVertical: 12,
  },
});

function CleanInvoicePdf({
  invoice,
  totals,
}: {
  invoice: InvoiceRow;
  totals: ReturnType<typeof getTotals>;
}) {
  const currency = invoice.currency || defaultCurrency;
  const items = invoice.envoiz_invoice_items ?? [];
  return (
    <Document>
      <Page size="A4" style={pdfStyles.page}>
        <View style={pdfStyles.row}>
          <View>
            <Text style={{ fontSize: 18 }}>{invoice.company_name || brandName}</Text>
            <Text style={{ marginTop: 14, color: "#666666", lineHeight: 1.6 }}>
              {invoice.company_address || ""}
            </Text>
          </View>
          <View style={{ alignItems: "flex-end" }}>
            <Text style={pdfStyles.label}>Invoice</Text>
            <Text style={pdfStyles.title}>{invoice.invoice_number || "INV"}</Text>
            <Text style={{ marginTop: 8, color: "#666666" }}>
              Issued {formatLongDate(invoice.issue_date)}
            </Text>
          </View>
        </View>
        <View style={pdfStyles.line} />
        <View style={pdfStyles.row}>
          <View>
            <Text style={pdfStyles.label}>Billed to</Text>
            <Text style={{ marginTop: 12, fontSize: 13 }}>{invoice.client_name || "Client"}</Text>
            <Text style={{ marginTop: 6, color: "#666666" }}>{invoice.client_email || ""}</Text>
            <Text style={{ marginTop: 6, color: "#666666", lineHeight: 1.6 }}>
              {invoice.billing_address || ""}
            </Text>
          </View>
          <View style={{ alignItems: "flex-end" }}>
            <Text style={pdfStyles.label}>Payment due</Text>
            <Text style={{ marginTop: 12, fontSize: 13 }}>{formatLongDate(invoice.due_date)}</Text>
            <Text style={{ marginTop: 6, color: "#666666" }}>{currency} · Payment requested</Text>
          </View>
        </View>
        <View style={pdfStyles.line} />
        <View style={pdfStyles.tableHead}>
          <Text style={{ flex: 1 }}>Description</Text>
          <Text style={{ width: 45, textAlign: "right" }}>Qty</Text>
          <Text style={{ width: 90, textAlign: "right" }}>Rate</Text>
          <Text style={{ width: 90, textAlign: "right" }}>Amount</Text>
        </View>
        {items.map((item, index) => (
          <View key={`${item.product}-${index}`} style={pdfStyles.tableRow}>
            <Text style={{ flex: 1 }}>{item.product || "Item"}</Text>
            <Text style={{ width: 45, textAlign: "right" }}>{item.quantity}</Text>
            <Text style={{ width: 90, textAlign: "right" }}>
              {money(item.unit_price, currency)}
            </Text>
            <Text style={{ width: 90, textAlign: "right" }}>
              {money(item.quantity * item.unit_price, currency)}
            </Text>
          </View>
        ))}
        <View style={{ marginTop: 28, marginLeft: "auto", width: 220, gap: 10 }}>
          <PdfTotal label="Subtotal" value={money(totals.subtotal, currency)} />
          {totals.discount > 0 ? (
            <PdfTotal label="Discount" value={`-${money(totals.discount, currency)}`} />
          ) : null}
          <PdfTotal label="Tax" value={money(totals.tax, currency)} />
          <View style={{ borderTopWidth: 1, borderTopColor: "#292827", paddingTop: 12 }}>
            <PdfTotal label="Total" value={money(totals.total, currency)} strong />
          </View>
        </View>
        {invoice.notes ? (
          <Text
            style={{
              marginTop: 42,
              paddingTop: 20,
              borderTopWidth: 1,
              borderTopColor: "#dedbd4",
              color: "#666666",
              lineHeight: 1.7,
            }}
          >
            {invoice.notes}
          </Text>
        ) : null}
      </Page>
    </Document>
  );
}

function PdfTotal({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
      <Text style={{ color: strong ? "#292827" : "#666666", fontSize: strong ? 12 : 10 }}>
        {label}
      </Text>
      <Text style={{ fontSize: strong ? 12 : 10 }}>{value}</Text>
    </View>
  );
}
