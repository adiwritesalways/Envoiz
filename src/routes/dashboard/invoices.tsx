import { createFileRoute, Link } from "@tanstack/react-router";
import { Plus, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { BrandLogo } from "@/components/BrandLogo";
import { DashboardPage, Panel, StatusPill } from "@/components/envoiz/DashboardUI";
import {
  brandName,
  currencyOptions,
  defaultCurrency,
  formatInvoiceNumber,
  readStorageValue,
  settingsStorageKeys,
  type CurrencyCode,
} from "@/lib/envoiz";

type InvoiceItem = {
  id: number;
  product: string;
  quantity: number;
  unitPrice: number;
};

const money = (value: number, currency: CurrencyCode) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency, maximumFractionDigits: 2 }).format(
    value || 0,
  );

export const Route = createFileRoute("/dashboard/invoices")({
  head: () => ({
    meta: [
      { title: `Invoices - ${brandName}` },
      {
        name: "description",
        content:
          "Create professional invoices with automatic totals and a printable Envoiz template.",
      },
    ],
  }),
  component: InvoicesPage,
});

function InvoicesPage() {
  const [clientName, setClientName] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [currency, setCurrency] = useState<CurrencyCode>(defaultCurrency);
  const [status, setStatus] = useState<"Pending" | "Paid">("Pending");
  const [companyName, setCompanyName] = useState("Envoiz Studio");
  const [companyAddress, setCompanyAddress] = useState("Dhanmondi, Dhaka, Bangladesh");
  const [items, setItems] = useState<InvoiceItem[]>([
    { id: 1, product: "Brand identity refresh", quantity: 1, unitPrice: 1200 },
  ]);

  useEffect(() => {
    setCurrency(
      readStorageValue(settingsStorageKeys.defaultCurrency, defaultCurrency) as CurrencyCode,
    );
    setCompanyName(readStorageValue(settingsStorageKeys.companyName, "Envoiz Studio"));
    setCompanyAddress(
      readStorageValue(settingsStorageKeys.companyAddress, "Dhanmondi, Dhaka, Bangladesh"),
    );
  }, []);

  const subtotal = useMemo(
    () =>
      items.reduce(
        (sum, item) => sum + Math.max(0, item.quantity) * Math.max(0, item.unitPrice),
        0,
      ),
    [items],
  );

  const invoiceNumber = formatInvoiceNumber(1);
  const createdAt = new Date(2026, 5, 27).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  const updateItem = (id: number, field: keyof InvoiceItem, value: string | number) => {
    setItems((current) =>
      current.map((item) => {
        if (item.id !== id) return item;
        return {
          ...item,
          [field]: field === "quantity" || field === "unitPrice" ? Number(value) || 0 : value,
        };
      }),
    );
  };

  const addRow = () => {
    setItems((current) => [...current, { id: Date.now(), product: "", quantity: 1, unitPrice: 0 }]);
  };

  const removeRow = (id: number) => {
    setItems((current) =>
      current.length === 1 ? current : current.filter((item) => item.id !== id),
    );
  };

  return (
    <DashboardPage
      eyebrow="Invoices"
      title="Create a premium invoice without friction."
      description="Invoice items update totals instantly, with no VAT, no tax, and no discount logic added."
      actions={
        <>
          <Link
            to="/dashboard/settings"
            className="inline-flex items-center gap-2 rounded-full border border-hairline bg-white px-4 py-2 text-[13px] font-medium transition-colors hover:bg-secondary"
          >
            Settings
          </Link>
          <button className="inline-flex items-center gap-2 rounded-full bg-foreground px-4 py-2 text-[13px] font-medium text-background transition-colors hover:opacity-90">
            Save draft
          </button>
        </>
      }
    >
      <div className="grid gap-4 xl:grid-cols-[1.08fr_0.92fr]">
        <Panel
          title="Invoice editor"
          description="A structured draft area for client details and unlimited line items."
          className="space-y-6"
        >
          <div className="grid gap-4 md:grid-cols-2">
            <Field
              label="Client Name"
              value={clientName}
              onChange={setClientName}
              placeholder="Nova Studio"
            />
            <Field
              label="Client Email"
              value={clientEmail}
              onChange={setClientEmail}
              type="email"
              placeholder="billing@novastudio.com"
            />
          </div>

          <div className="rounded-3xl border border-hairline bg-surface/50 p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h3 className="text-[14px] font-medium">Invoice Items</h3>
                <p className="mt-1 text-[12.5px] text-muted-foreground">
                  Add as many products or services as you need.
                </p>
              </div>
              <button
                onClick={addRow}
                className="inline-flex items-center gap-2 rounded-full bg-foreground px-3 py-2 text-[12px] font-medium text-background transition-colors hover:opacity-90"
              >
                <Plus className="h-3.5 w-3.5" /> Add row
              </button>
            </div>

            <div className="mt-4 space-y-3">
              <div className="hidden gap-3 rounded-2xl bg-white px-4 py-3 text-[12px] uppercase tracking-[0.16em] text-muted-foreground md:grid md:grid-cols-[1.6fr_0.6fr_0.8fr_0.8fr_0.3fr]">
                <span>Product / Service</span>
                <span>Quantity</span>
                <span>Unit Price</span>
                <span>Row Total</span>
                <span />
              </div>
              {items.map((item) => {
                const total = item.quantity * item.unitPrice;
                return (
                  <div
                    key={item.id}
                    className="grid gap-3 rounded-2xl border border-hairline bg-white p-4 md:grid-cols-[1.6fr_0.6fr_0.8fr_0.8fr_0.3fr] md:items-center"
                  >
                    <InputField
                      value={item.product}
                      onChange={(value) => updateItem(item.id, "product", value)}
                      placeholder="Consulting session"
                    />
                    <InputField
                      value={String(item.quantity)}
                      onChange={(value) => updateItem(item.id, "quantity", value)}
                      type="number"
                      min={1}
                      placeholder="1"
                    />
                    <InputField
                      value={String(item.unitPrice)}
                      onChange={(value) => updateItem(item.id, "unitPrice", value)}
                      type="number"
                      min={0}
                      step="0.01"
                      placeholder="0.00"
                    />
                    <div className="rounded-2xl bg-surface/70 px-4 py-3 text-[14px] font-medium tabular-nums">
                      {money(total, currency)}
                    </div>
                    <button
                      type="button"
                      onClick={() => removeRow(item.id)}
                      className="inline-flex h-10 w-10 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-[12px] text-muted-foreground">Currency</label>
              <select
                value={currency}
                onChange={(event) => setCurrency(event.target.value as CurrencyCode)}
                className="mt-1.5 h-11 w-full rounded-2xl border border-hairline bg-white px-3 text-[14px] outline-none transition focus:border-foreground/20"
              >
                {currencyOptions.map((option) => (
                  <option key={option.code} value={option.code}>
                    {option.code} - {option.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-[12px] text-muted-foreground">Status</label>
              <select
                value={status}
                onChange={(event) => setStatus(event.target.value as "Pending" | "Paid")}
                className="mt-1.5 h-11 w-full rounded-2xl border border-hairline bg-white px-3 text-[14px] outline-none transition focus:border-foreground/20"
              >
                <option value="Pending">Pending</option>
                <option value="Paid">Paid</option>
              </select>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 rounded-3xl bg-surface/60 p-4 text-[13px] text-muted-foreground">
            <span className="rounded-full bg-white px-3 py-1 font-medium text-foreground">
              ENV-000001
            </span>
            <span>No VAT</span>
            <span>No tax</span>
            <span>No discount</span>
          </div>
        </Panel>

        <div className="space-y-4">
          <Panel
            title="Template preview"
            description="A clean printable invoice, ready for download or browser printing."
            className="overflow-hidden"
          >
            <div className="rounded-[2rem] border border-hairline bg-white p-6 shadow-[0_20px_70px_rgba(0,0,0,0.08)]">
              <div className="flex items-start justify-between gap-6 border-b border-hairline pb-5">
                <div className="max-w-xs">
                  <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                    Company
                  </p>
                  <h3 className="mt-2 text-2xl font-semibold tracking-[-0.04em]">{companyName}</h3>
                  <p className="mt-2 text-[13px] leading-relaxed text-muted-foreground">
                    {companyAddress}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                    Invoice
                  </p>
                  <div className="mt-2 text-2xl font-semibold tracking-[-0.04em]">
                    {invoiceNumber}
                  </div>
                  <div className="mt-2 flex items-center justify-end gap-2">
                    <StatusPill status={status} />
                    <span className="text-[12px] text-muted-foreground">{createdAt}</span>
                  </div>
                </div>
              </div>

              <div className="grid gap-6 border-b border-hairline py-5 md:grid-cols-2">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                    Bill to
                  </p>
                  <div className="mt-2 text-[14px] font-medium">{clientName || "Client name"}</div>
                  <div className="mt-1 text-[13px] text-muted-foreground">
                    {clientEmail || "client@email.com"}
                  </div>
                </div>
                <div className="md:text-right">
                  <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                    Status
                  </p>
                  <div className="mt-2 text-[14px] font-medium">{status}</div>
                  <p className="mt-1 text-[13px] text-muted-foreground">Currency: {currency}</p>
                </div>
              </div>

              <div className="py-5">
                <div className="grid grid-cols-[1.6fr_0.5fr_0.7fr_0.7fr] gap-3 border-b border-hairline pb-3 text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
                  <span>Product</span>
                  <span className="text-right">Qty</span>
                  <span className="text-right">Unit Price</span>
                  <span className="text-right">Total</span>
                </div>
                <div className="space-y-3 py-4">
                  {items.map((item) => {
                    const total = item.quantity * item.unitPrice;
                    return (
                      <div
                        key={item.id}
                        className="grid grid-cols-[1.6fr_0.5fr_0.7fr_0.7fr] gap-3 text-[13px]"
                      >
                        <span className="font-medium">{item.product || "Product / service"}</span>
                        <span className="text-right tabular-nums">{item.quantity}</span>
                        <span className="text-right tabular-nums">
                          {money(item.unitPrice, currency)}
                        </span>
                        <span className="text-right font-medium tabular-nums">
                          {money(total, currency)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-hairline pt-5">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                    Generated by
                  </p>
                  <div className="mt-3">
                    <BrandLogo className="h-8 w-auto" />
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                    Grand total
                  </p>
                  <div className="mt-2 text-3xl font-semibold tracking-[-0.04em] tabular-nums">
                    {money(subtotal, currency)}
                  </div>
                </div>
              </div>
            </div>
          </Panel>

          <Panel title="Totals" description="Everything here updates live as you edit the draft.">
            <div className="space-y-3 text-[13px]">
              <Row label="Subtotal" value={money(subtotal, currency)} />
              <Row label="Tax" value="None" />
              <Row label="VAT" value="None" />
              <Row label="Grand Total" value={money(subtotal, currency)} emphasized />
            </div>
          </Panel>
        </div>
      </div>
    </DashboardPage>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  placeholder: string;
}) {
  return (
    <div>
      <label className="text-[12px] text-muted-foreground">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="mt-1.5 h-11 w-full rounded-2xl border border-hairline bg-white px-3 text-[14px] outline-none transition placeholder:text-muted-foreground/60 focus:border-foreground/20"
      />
    </div>
  );
}

function InputField({
  value,
  onChange,
  type = "text",
  placeholder,
  min,
  step,
}: {
  value: string;
  onChange: (value: string) => void;
  type?: string;
  placeholder: string;
  min?: number;
  step?: string;
}) {
  return (
    <input
      value={value}
      onChange={(event) => onChange(event.target.value)}
      type={type}
      min={min}
      step={step}
      placeholder={placeholder}
      className="h-11 rounded-2xl border border-hairline bg-white px-3 text-[14px] outline-none transition placeholder:text-muted-foreground/60 focus:border-foreground/20"
    />
  );
}

function Row({ label, value, emphasized }: { label: string; value: string; emphasized?: boolean }) {
  return (
    <div className="flex items-center justify-between rounded-2xl bg-surface/70 px-4 py-3">
      <span className={emphasized ? "font-medium text-foreground" : "text-muted-foreground"}>
        {label}
      </span>
      <span
        className={emphasized ? "text-lg font-semibold tabular-nums" : "font-medium tabular-nums"}
      >
        {value}
      </span>
    </div>
  );
}
