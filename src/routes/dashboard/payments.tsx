/**
 * /dashboard/payments
 *
 * Displays received invoice payments in demo mode (sample data).
 * Shows payment timeline, totals by currency, and per-invoice payment records.
 * All data is local — nothing is saved to a server.
 */
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowUpRight,
  CheckCircle2,
  Clock,
  AlertCircle,
  CreditCard,
  Download,
  TrendingUp,
} from "lucide-react";
import { useState, useMemo } from "react";
import { brandName } from "@/lib/envoiz";
import { DEMO_INVOICES, type DemoPayment } from "@/lib/demo-data";
import { useAuth } from "@/components/auth/auth-context";
import { isDemoMode } from "@/lib/demo-mode";

export const Route = createFileRoute("/dashboard/payments")({
  head: () => ({
    meta: [
      { title: `Payments — ${brandName}` },
      { name: "description", content: "Invoice payment history and received funds." },
    ],
  }),
  component: PaymentsPage,
});

// ---------- helpers ---------------------------------------------------------

const currencySymbols: Record<string, string> = {
  USD: "$", EUR: "€", GBP: "£", CAD: "CA$", AUD: "A$",
};

function money(amount: number, currency = "USD") {
  const sym = currencySymbols[currency] ?? `${currency} `;
  return `${sym}${amount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function shortDate(iso: string) {
  if (!iso) return "—";
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

// ---------- build payment records from demo invoices -----------------------

type PaymentRecord = {
  id: string;
  invoiceNumber: string;
  clientName: string;
  clientEmail: string;
  amount: number;
  currency: string;
  paidAt: string;
  status: "paid" | "pending" | "overdue";
};

function buildPaymentRecords(): PaymentRecord[] {
  return DEMO_INVOICES.map((inv) => ({
    id: inv.id,
    invoiceNumber: inv.number,
    clientName: inv.clientName,
    clientEmail: inv.clientEmail,
    amount: inv.total,
    currency: inv.currency ?? "USD",
    paidAt: inv.status === "Paid" ? inv.dueDate : inv.dueDate,
    status: inv.status === "Paid" ? "paid" : inv.status === "Overdue" ? "overdue" : "pending",
  }));
}

// ---------- sub-components --------------------------------------------------

function PageIntro({ eyebrow, title, copy }: { eyebrow: string; title: string; copy?: string }) {
  return (
    <div className="mb-10 flex flex-col justify-between gap-6 md:flex-row md:items-end">
      <div>
        <p className="label mb-3">{eyebrow}</p>
        <h1 className="display-title">{title}</h1>
        {copy && <p className="body-copy mt-3 max-w-lg">{copy}</p>}
      </div>
    </div>
  );
}

type StatusBadgeProps = { status: "paid" | "pending" | "overdue" };
function StatusBadge({ status }: StatusBadgeProps) {
  const map = {
    paid:    { label: "Received",  cls: "status-paid",    Icon: CheckCircle2  },
    pending: { label: "Pending",   cls: "status-sent",    Icon: Clock         },
    overdue: { label: "Overdue",   cls: "status-overdue", Icon: AlertCircle   },
  } as const;
  const { label, cls } = map[status];
  return <span className={`status-pill ${cls}`}>{label}</span>;
}

// ---------- main component --------------------------------------------------

function PaymentsPage() {
  const { session, loading } = useAuth();
  const isDemo = isDemoMode(session, loading);
  const allRecords = useMemo(() => buildPaymentRecords(), []);

  const [statusFilter, setStatusFilter] = useState<"all" | "paid" | "pending" | "overdue">("all");

  const filtered = useMemo(() => {
    if (statusFilter === "all") return allRecords;
    return allRecords.filter((r) => r.status === statusFilter);
  }, [allRecords, statusFilter]);

  // Summary stats
  const totalReceived = useMemo(
    () => allRecords.filter((r) => r.status === "paid").reduce((s, r) => s + r.amount, 0),
    [allRecords],
  );
  const totalPending = useMemo(
    () => allRecords.filter((r) => r.status === "pending").reduce((s, r) => s + r.amount, 0),
    [allRecords],
  );
  const totalOverdue = useMemo(
    () => allRecords.filter((r) => r.status === "overdue").reduce((s, r) => s + r.amount, 0),
    [allRecords],
  );

  const filters: { label: string; value: typeof statusFilter }[] = [
    { label: "All",     value: "all"     },
    { label: "Received",value: "paid"    },
    { label: "Pending", value: "pending" },
    { label: "Overdue", value: "overdue" },
  ];

  return (
    <>
      <PageIntro
        eyebrow="Workspace / Payments"
        title="Payments"
        copy="A clear view of every payment received, pending, and overdue."
      />

      {/* Summary cards */}
      <section
        className="mb-10 grid gap-px overflow-hidden rounded-lg border border-[#e3e3e2] bg-[#e3e3e2] sm:grid-cols-3"
        aria-label="Payment summary"
      >
        {[
          { label: "Total received",  value: totalReceived, currency: "USD", icon: CheckCircle2, accent: "#0c4243" },
          { label: "Awaiting payment",value: totalPending,  currency: "USD", icon: Clock,         accent: "#714cb6" },
          { label: "Overdue",         value: totalOverdue,  currency: "USD", icon: AlertCircle,  accent: "#421d24" },
        ].map(({ label, value, currency, icon: Icon, accent }) => (
          <div className="bg-white px-5 py-6" key={label}>
            <div className="mb-4 flex items-center justify-between">
              <p className="label">{label}</p>
              <Icon size={15} style={{ color: accent }} aria-hidden="true" />
            </div>
            <p className="metric-value tabular-nums">{money(value, currency)}</p>
          </div>
        ))}
      </section>

      {/* Filter bar */}
      <div
        className="mb-5 flex gap-1 border-b border-[#e3e3e2] pb-3"
        role="tablist"
        aria-label="Filter payments by status"
      >
        {filters.map(({ label, value }) => (
          <button
            key={value}
            type="button"
            role="tab"
            aria-selected={statusFilter === value}
            onClick={() => setStatusFilter(value)}
            className={`rounded-md px-3.5 py-1.5 text-xs font-medium transition-colors ${
              statusFilter === value
                ? "bg-[#e8e6df] text-[#292827]"
                : "text-[#666] hover:text-[#292827]"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Payment list */}
      {filtered.length === 0 ? (
        <div className="surface flex flex-col items-center justify-center px-6 py-16 text-center">
          <span className="mb-4 flex h-11 w-11 items-center justify-center rounded-lg bg-[#d4c7ff] text-[#421d24]">
            <CreditCard size={19} />
          </span>
          <p className="font-medium">No payments match this filter</p>
        </div>
      ) : (
        <div className="surface overflow-hidden">
          {/* Table header */}
          <div className="hidden grid-cols-[1.4fr_1.2fr_.9fr_auto_auto] gap-4 border-b border-[#e3e3e2] bg-[#faf9f6] px-5 py-3 md:grid">
            <p className="label">Invoice</p>
            <p className="label">Client</p>
            <p className="label text-right">Amount</p>
            <p className="label">Due date</p>
            <p className="label text-right">Status</p>
          </div>

          {/* Rows */}
          <div>
            {filtered.map((record) => (
              <div
                key={record.id}
                className="group grid min-h-[70px] grid-cols-[1fr_auto] items-center gap-4 border-b border-[#e3e3e2] px-5 py-3 last:border-b-0 md:grid-cols-[1.4fr_1.2fr_.9fr_auto_auto]"
                data-testid={`payment-row-${record.id}`}
              >
                {/* Invoice number + mobile client name */}
                <div>
                  <p className="tabular-nums text-sm font-medium text-[#292827]">
                    {record.invoiceNumber}
                  </p>
                  <p className="mt-1 text-xs text-[#666] md:hidden">{record.clientName}</p>
                </div>

                {/* Client (desktop) */}
                <div className="hidden min-w-0 md:block">
                  <p className="truncate text-sm text-[#292827]">{record.clientName}</p>
                  <p className="mt-1 truncate text-xs text-[#666]">{record.clientEmail}</p>
                </div>

                {/* Amount */}
                <p className="tabular-nums text-right text-sm font-medium text-[#292827]">
                  {money(record.amount, record.currency)}
                </p>

                {/* Date */}
                <p className="hidden text-sm text-[#666] md:block">{shortDate(record.paidAt)}</p>

                {/* Status + mobile layout */}
                <div className="col-span-2 flex items-center justify-between md:col-span-1 md:justify-end md:gap-3">
                  <StatusBadge status={record.status} />
                  {record.status === "paid" && (
                    <button
                      type="button"
                      className="quiet-link inline-flex items-center gap-1 text-xs font-medium"
                      aria-label={`Download receipt for ${record.invoiceNumber}`}
                      onClick={() => {
                        // Demo: no real receipt to download
                        alert("Demo mode — receipts are not available for sample data.");
                      }}
                    >
                      <Download size={13} aria-hidden="true" /> Receipt
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Demo note */}
      {isDemo && (
        <p className="mt-8 text-center text-xs text-[#666]">
          Sample payments only — no real transactions are recorded.{" "}
          <Link to="/signup" className="quiet-link font-medium">
            Create an account
          </Link>{" "}
          to track real payments.
        </p>
      )}
    </>
  );
}
