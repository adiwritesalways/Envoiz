import * as React from "react";
import { cn } from "@/lib/utils";

export type InvoiceLineItem = {
  id: string;
  description: string;
  quantity: number;
  rate: number;
};

export type InvoiceData = {
  number: string;
  issueDate: string;
  dueDate: string;
  status?: "Paid" | "Pending" | "Overdue" | "Draft";
  from: {
    name: string;
    email?: string;
    address?: string;
  };
  to: {
    name: string;
    email?: string;
    address?: string;
  };
  items: InvoiceLineItem[];
  taxRate?: number; // percent, e.g. 10 for 10%
  notes?: string;
  currency?: string;
};

const formatCurrency = (n: number, currency = "USD") =>
  new Intl.NumberFormat("en-US", { style: "currency", currency }).format(
    Number.isFinite(n) ? n : 0,
  );

export function calcTotals(data: InvoiceData) {
  const subtotal = data.items.reduce(
    (acc, it) => acc + (Number(it.quantity) || 0) * (Number(it.rate) || 0),
    0,
  );
  const tax = (subtotal * (data.taxRate ?? 0)) / 100;
  const total = subtotal + tax;
  return { subtotal, tax, total };
}

/**
 * Black & white invoice template.
 * Designed to read like premium stationery: tight type, hairline rules,
 * generous negative space, monospace numerals.
 */
export function InvoiceTemplate({
  data,
  className,
  compact = false,
}: {
  data: InvoiceData;
  className?: string;
  compact?: boolean;
}) {
  const { subtotal, tax, total } = calcTotals(data);
  const currency = data.currency ?? "USD";

  return (
    <div
      className={cn(
        "relative w-full overflow-hidden rounded-2xl border border-border bg-background text-foreground",
        "shadow-[0_1px_0_0_var(--color-border)]",
        className,
      )}
    >
      {/* Top band */}
      <div className="flex items-start justify-between gap-6 border-b border-border px-8 pb-6 pt-8">
        <div className="flex items-center gap-3">
          <div className="grid h-9 w-9 place-items-center rounded-md bg-foreground text-background">
            <span className="text-sm font-semibold tracking-tight">E</span>
          </div>
          <div className="leading-tight">
            <div className="text-sm font-semibold tracking-tight">Envoiz</div>
            <div className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
              Invoice
            </div>
          </div>
        </div>

        <div className="text-right">
          <div className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
            Invoice No.
          </div>
          <div className="font-mono text-sm tabular-nums">{data.number || "—"}</div>
          {data.status ? (
            <span className="mt-2 inline-flex items-center rounded-full border border-border px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-foreground">
              {data.status}
            </span>
          ) : null}
        </div>
      </div>

      {/* Parties + dates */}
      <div className="grid grid-cols-1 gap-6 px-8 py-6 sm:grid-cols-3">
        <Field label="Billed To">
          <div className="font-medium">{data.to.name || "—"}</div>
          {data.to.email ? <div className="text-muted-foreground">{data.to.email}</div> : null}
          {data.to.address ? (
            <div className="whitespace-pre-line text-muted-foreground">{data.to.address}</div>
          ) : null}
        </Field>

        <Field label="From">
          <div className="font-medium">{data.from.name || "—"}</div>
          {data.from.email ? <div className="text-muted-foreground">{data.from.email}</div> : null}
          {data.from.address ? (
            <div className="whitespace-pre-line text-muted-foreground">{data.from.address}</div>
          ) : null}
        </Field>

        <div className="space-y-3">
          <Field label="Issue Date">
            <span className="font-mono tabular-nums">{data.issueDate || "—"}</span>
          </Field>
          <Field label="Due Date">
            <span className="font-mono tabular-nums">{data.dueDate || "—"}</span>
          </Field>
        </div>
      </div>

      {/* Items */}
      <div className="px-8">
        <div className="grid grid-cols-12 border-y border-border py-2 text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
          <div className="col-span-6">Description</div>
          <div className="col-span-2 text-right">Qty</div>
          <div className="col-span-2 text-right">Rate</div>
          <div className="col-span-2 text-right">Amount</div>
        </div>

        <div className="divide-y divide-border">
          {data.items.length === 0 ? (
            <div className="py-6 text-center text-sm text-muted-foreground">No line items yet.</div>
          ) : (
            data.items.map((it) => {
              const amount = (Number(it.quantity) || 0) * (Number(it.rate) || 0);
              return (
                <div
                  key={it.id}
                  className={cn("grid grid-cols-12 items-baseline py-3 text-sm", compact && "py-2")}
                >
                  <div className="col-span-6 pr-4 text-foreground">
                    {it.description || <span className="text-muted-foreground">Untitled item</span>}
                  </div>
                  <div className="col-span-2 text-right font-mono tabular-nums text-muted-foreground">
                    {it.quantity || 0}
                  </div>
                  <div className="col-span-2 text-right font-mono tabular-nums text-muted-foreground">
                    {formatCurrency(it.rate || 0, currency)}
                  </div>
                  <div className="col-span-2 text-right font-mono tabular-nums text-foreground">
                    {formatCurrency(amount, currency)}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Totals */}
      <div className="flex justify-end px-8 pb-8 pt-6">
        <dl className="w-full max-w-xs space-y-2 text-sm">
          <Row label="Subtotal" value={formatCurrency(subtotal, currency)} />
          {data.taxRate ? (
            <Row label={`Tax (${data.taxRate}%)`} value={formatCurrency(tax, currency)} />
          ) : null}
          <div className="mt-3 flex items-center justify-between border-t border-border pt-3">
            <dt className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
              Total Due
            </dt>
            <dd className="font-mono text-lg font-semibold tabular-nums">
              {formatCurrency(total, currency)}
            </dd>
          </div>
        </dl>
      </div>

      {data.notes ? (
        <div className="border-t border-border px-8 py-5">
          <div className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Notes</div>
          <p className="mt-1 whitespace-pre-line text-sm text-foreground/80">{data.notes}</p>
        </div>
      ) : null}

      {/* Footer mark */}
      <div className="flex items-center justify-between border-t border-border px-8 py-4 text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
        <span>Thank you for your business</span>
        <span className="font-mono">envoiz.app</span>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1 text-sm">
      <div className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">{label}</div>
      <div>{children}</div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="font-mono tabular-nums">{value}</dd>
    </div>
  );
}
