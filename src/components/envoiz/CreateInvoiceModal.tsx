import { useState, useCallback, type ReactNode } from "react";
import { Plus, Trash2, X, Building2 } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { StatusPill } from "./DashboardUI";
import { currencyOptions, type CurrencyCode } from "@/lib/envoiz";
import { cn } from "@/lib/utils";

// ─────────────────────────────────────────────────────────────────────────────

type InvoiceStatus = "Draft" | "Pending" | "Paid";

type LineItem = {
  id: string;
  description: string;
  qty: string;
  unitPrice: string;
};

type FormState = {
  clientName: string;
  company: string;
  email: string;
  address: string;
  invoiceNumber: string;
  issueDate: string;
  dueDate: string;
  currency: CurrencyCode;
  status: InvoiceStatus;
  lineItems: LineItem[];
  notes: string;
  paymentTerms: string;
  taxRate: string;
  discountRate: string;
};

function defaultForm(): FormState {
  const today = new Date();
  const due = new Date(today);
  due.setDate(due.getDate() + 30);
  const fmt = (d: Date) => d.toISOString().split("T")[0];
  return {
    clientName: "",
    company: "",
    email: "",
    address: "",
    invoiceNumber: "ENV-000129",
    issueDate: fmt(today),
    dueDate: fmt(due),
    currency: "USD",
    status: "Pending",
    lineItems: [{ id: "1", description: "", qty: "1", unitPrice: "" }],
    notes: "",
    paymentTerms: "Net 30",
    taxRate: "0",
    discountRate: "0",
  };
}

function parseNum(s: string): number {
  const n = parseFloat(s);
  return isNaN(n) ? 0 : n;
}

function fmtCurrency(amount: number, currency: CurrencyCode): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  }).format(amount);
}

function fmtDate(dateStr: string): string {
  if (!dateStr) return "—";
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

type Props = { open: boolean; onOpenChange: (open: boolean) => void };

export function CreateInvoiceModal({ open, onOpenChange }: Props) {
  const [form, setForm] = useState<FormState>(defaultForm);

  const update = useCallback(<K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  }, []);

  const updateItem = useCallback((id: string, field: keyof LineItem, value: string) => {
    setForm((prev) => ({
      ...prev,
      lineItems: prev.lineItems.map((item) =>
        item.id === id ? { ...item, [field]: value } : item,
      ),
    }));
  }, []);

  const addItem = useCallback(() => {
    setForm((prev) => ({
      ...prev,
      lineItems: [
        ...prev.lineItems,
        { id: Date.now().toString(), description: "", qty: "1", unitPrice: "" },
      ],
    }));
  }, []);

  const removeItem = useCallback((id: string) => {
    setForm((prev) => ({
      ...prev,
      lineItems: prev.lineItems.filter((item) => item.id !== id),
    }));
  }, []);

  const subtotal = form.lineItems.reduce(
    (s, item) => s + parseNum(item.qty) * parseNum(item.unitPrice),
    0,
  );
  const discount = subtotal * (parseNum(form.discountRate) / 100);
  const taxable = subtotal - discount;
  const tax = taxable * (parseNum(form.taxRate) / 100);
  const total = taxable + tax;

  function handleClose() {
    onOpenChange(false);
    setTimeout(() => setForm(defaultForm()), 300);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          "w-[95vw] max-w-[1180px] p-0 gap-0 overflow-hidden",
          "rounded-3xl border-hairline",
          "shadow-[0_8px_80px_rgba(0,0,0,0.20),0_1px_2px_rgba(0,0,0,0.06)]",
          "[&>button]:hidden",
        )}
      >
        <div className="flex h-[90vh] max-h-[840px] flex-col">
          <div className="flex shrink-0 items-center justify-between border-b border-hairline px-6 py-4">
            <div>
              <DialogTitle className="text-[15px] font-semibold tracking-[-0.02em]">
                New Invoice
              </DialogTitle>
              <p className="mt-0.5 font-mono text-[11px] text-muted-foreground">
                {form.invoiceNumber}
              </p>
            </div>
            <button
              onClick={handleClose}
              className="grid h-8 w-8 place-items-center rounded-xl text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </button>
          </div>

          <div className="flex min-h-0 flex-1">
            <div className="flex-[1.7] space-y-7 overflow-y-auto px-6 py-6">
              <FormSection label="Client">
                <div className="grid gap-3 sm:grid-cols-2">
                  <FormField label="Client name">
                    <Input
                      value={form.clientName}
                      onChange={(e) => update("clientName", e.target.value)}
                      placeholder="Jane Smith"
                    />
                  </FormField>
                  <FormField label="Company">
                    <Input
                      value={form.company}
                      onChange={(e) => update("company", e.target.value)}
                      placeholder="Acme Inc."
                    />
                  </FormField>
                  <FormField label="Email">
                    <Input
                      type="email"
                      value={form.email}
                      onChange={(e) => update("email", e.target.value)}
                      placeholder="jane@acme.com"
                    />
                  </FormField>
                  <FormField label="Address">
                    <Input
                      value={form.address}
                      onChange={(e) => update("address", e.target.value)}
                      placeholder="123 Main St, New York, NY"
                    />
                  </FormField>
                </div>
              </FormSection>

              <FormSection label="Invoice details">
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  <FormField label="Invoice number">
                    <Input
                      value={form.invoiceNumber}
                      onChange={(e) => update("invoiceNumber", e.target.value)}
                    />
                  </FormField>
                  <FormField label="Issue date">
                    <Input
                      type="date"
                      value={form.issueDate}
                      onChange={(e) => update("issueDate", e.target.value)}
                    />
                  </FormField>
                  <FormField label="Due date">
                    <Input
                      type="date"
                      value={form.dueDate}
                      onChange={(e) => update("dueDate", e.target.value)}
                    />
                  </FormField>
                  <FormField label="Currency">
                    <Select
                      value={form.currency}
                      onValueChange={(v) => update("currency", v as CurrencyCode)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {currencyOptions.map((c) => (
                          <SelectItem key={c.code} value={c.code}>
                            {c.code} — {c.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormField>
                  <FormField label="Status">
                    <Select
                      value={form.status}
                      onValueChange={(v) => update("status", v as InvoiceStatus)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Draft">Draft</SelectItem>
                        <SelectItem value="Pending">Pending</SelectItem>
                        <SelectItem value="Paid">Paid</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormField>
                  <FormField label="Payment terms">
                    <Select
                      value={form.paymentTerms}
                      onValueChange={(v) => update("paymentTerms", v)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Due on receipt">Due on receipt</SelectItem>
                        <SelectItem value="Net 15">Net 15</SelectItem>
                        <SelectItem value="Net 30">Net 30</SelectItem>
                        <SelectItem value="Net 60">Net 60</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormField>
                </div>
              </FormSection>

              <FormSection label="Line items">
                <div className="space-y-2.5">
                  <div className="grid grid-cols-[1fr_60px_100px_88px_32px] gap-2 px-0.5">
                    {["Description", "Qty", "Unit price", "Total", ""].map((h) => (
                      <span
                        key={h}
                        className={cn(
                          "text-[10.5px] uppercase tracking-[0.16em] text-muted-foreground",
                          h === "Total" && "text-right",
                          h === "Qty" && "text-center",
                          h === "Unit price" && "text-right",
                        )}
                      >
                        {h}
                      </span>
                    ))}
                  </div>

                  {form.lineItems.map((item) => {
                    const lineTotal = parseNum(item.qty) * parseNum(item.unitPrice);
                    return (
                      <div
                        key={item.id}
                        className="grid grid-cols-[1fr_60px_100px_88px_32px] items-center gap-2"
                      >
                        <Input
                          value={item.description}
                          onChange={(e) => updateItem(item.id, "description", e.target.value)}
                          placeholder="Service description"
                          className="text-[13px]"
                        />
                        <Input
                          value={item.qty}
                          onChange={(e) => updateItem(item.id, "qty", e.target.value)}
                          type="number"
                          min="1"
                          className="text-center text-[13px]"
                        />
                        <Input
                          value={item.unitPrice}
                          onChange={(e) => updateItem(item.id, "unitPrice", e.target.value)}
                          placeholder="0.00"
                          type="number"
                          min="0"
                          step="0.01"
                          className="text-right text-[13px]"
                        />
                        <div className="truncate pr-1 text-right text-[13px] font-medium tabular-nums text-muted-foreground">
                          {lineTotal > 0 ? fmtCurrency(lineTotal, form.currency) : "—"}
                        </div>
                        <button
                          onClick={() => removeItem(item.id)}
                          disabled={form.lineItems.length === 1}
                          className="grid h-8 w-8 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground disabled:cursor-not-allowed disabled:opacity-30"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    );
                  })}

                  <button
                    onClick={addItem}
                    className="mt-1 flex w-full items-center gap-2 rounded-xl border border-dashed border-border px-3 py-2.5 text-[13px] text-muted-foreground transition-all hover:border-foreground/30 hover:bg-secondary/60 hover:text-foreground"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Add item
                  </button>
                </div>
              </FormSection>

              <FormSection label="Tax & discount">
                <div className="grid gap-3 sm:grid-cols-2">
                  <FormField label="Tax rate (%)">
                    <Input
                      type="number"
                      value={form.taxRate}
                      onChange={(e) => update("taxRate", e.target.value)}
                      placeholder="0"
                      min="0"
                      max="100"
                    />
                  </FormField>
                  <FormField label="Discount (%)">
                    <Input
                      type="number"
                      value={form.discountRate}
                      onChange={(e) => update("discountRate", e.target.value)}
                      placeholder="0"
                      min="0"
                      max="100"
                    />
                  </FormField>
                </div>
              </FormSection>

              <FormSection label="Notes">
                <Textarea
                  value={form.notes}
                  onChange={(e) => update("notes", e.target.value)}
                  placeholder="Payment instructions, terms, or anything else the client should know."
                  className="min-h-[80px] resize-none text-[13px]"
                />
              </FormSection>
            </div>

            <div className="hidden w-px shrink-0 bg-hairline lg:block" />

            <div className="hidden flex-1 flex-col overflow-y-auto bg-[oklch(0.975_0_0)] px-6 py-6 lg:flex">
              <p className="mb-4 text-[10.5px] uppercase tracking-[0.2em] text-muted-foreground">
                Preview
              </p>
              <InvoicePreview
                form={form}
                subtotal={subtotal}
                discount={discount}
                tax={tax}
                total={total}
              />
            </div>
          </div>

          <div className="flex shrink-0 items-center justify-between border-t border-hairline px-6 py-4">
            <button
              onClick={handleClose}
              className="rounded-xl px-4 py-2 text-[13px] font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            >
              Cancel
            </button>
            <div className="flex items-center gap-2">
              <button className="rounded-xl border border-hairline bg-background px-4 py-2 text-[13px] font-medium transition-colors hover:bg-secondary">
                Save as draft
              </button>
              <button className="rounded-xl bg-foreground px-5 py-2 text-[13px] font-medium text-background transition-opacity hover:opacity-90">
                Send invoice
              </button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function FormSection({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="space-y-3">
      <h3 className="text-[10.5px] uppercase tracking-[0.2em] text-muted-foreground">{label}</h3>
      {children}
    </div>
  );
}

function FormField({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-[12px] font-medium text-muted-foreground">{label}</Label>
      {children}
    </div>
  );
}

type PreviewProps = {
  form: FormState;
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
};

function InvoicePreview({ form, subtotal, discount, tax, total }: PreviewProps) {
  const hasContent = form.lineItems.some(
    (item) => item.description || parseNum(item.unitPrice) > 0,
  );

  return (
    <div className="rounded-2xl border border-hairline bg-white shadow-[0_1px_2px_rgba(0,0,0,0.04),0_12px_40px_rgba(0,0,0,0.07)] overflow-hidden">
      <div className="flex items-start justify-between px-6 pt-6 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-foreground">
              <Building2 className="h-3.5 w-3.5 text-background" />
            </div>
            <span className="text-[13px] font-semibold tracking-[-0.02em]">Envoiz Studio</span>
          </div>
          <p className="mt-2 text-[11px] leading-relaxed text-muted-foreground">
            hello@envoiz.com
            <br />
            123 Business Ave, Suite 100
          </p>
        </div>
        <div className="text-right">
          <p className="text-[17px] font-bold tracking-[-0.03em] text-foreground">INVOICE</p>
          <p className="mt-1 font-mono text-[10.5px] text-muted-foreground">
            {form.invoiceNumber || "ENV-000129"}
          </p>
          <div className="mt-2">
            <StatusPill status={form.status} />
          </div>
        </div>
      </div>

      <div className="mx-6 h-px bg-hairline" />

      <div className="flex gap-4 px-6 py-5">
        <div className="flex-1">
          <p className="mb-1.5 text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
            Bill to
          </p>
          {form.clientName || form.company ? (
            <div className="space-y-0.5">
              {form.clientName && <p className="text-[13px] font-medium">{form.clientName}</p>}
              {form.company && <p className="text-[12px] text-muted-foreground">{form.company}</p>}
              {form.email && <p className="text-[11px] text-muted-foreground">{form.email}</p>}
              {form.address && <p className="text-[11px] text-muted-foreground">{form.address}</p>}
            </div>
          ) : (
            <p className="text-[12px] italic text-muted-foreground">Client details</p>
          )}
        </div>
        <div className="shrink-0 space-y-2 text-right">
          <div>
            <p className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground">Issued</p>
            <p className="text-[12px] font-medium">{fmtDate(form.issueDate)}</p>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground">Due</p>
            <p className="text-[12px] font-medium">{fmtDate(form.dueDate)}</p>
          </div>
        </div>
      </div>

      <div className="mx-6 h-px bg-hairline" />

      <div className="px-6 py-4">
        <div className="mb-2 grid grid-cols-[1fr_36px_76px] gap-2">
          {["Item", "Qty", "Total"].map((h, i) => (
            <span
              key={h}
              className={cn(
                "text-[10px] uppercase tracking-[0.16em] text-muted-foreground",
                i === 1 && "text-center",
                i === 2 && "text-right",
              )}
            >
              {h}
            </span>
          ))}
        </div>

        {hasContent ? (
          <div className="divide-y divide-hairline">
            {form.lineItems.map((item) => {
              const lt = parseNum(item.qty) * parseNum(item.unitPrice);
              if (!item.description && lt === 0) return null;
              return (
                <div key={item.id} className="grid grid-cols-[1fr_36px_76px] gap-2 py-2">
                  <span className="text-[12px]">
                    {item.description || (
                      <span className="italic text-muted-foreground">Untitled</span>
                    )}
                  </span>
                  <span className="text-center text-[12px] text-muted-foreground">{item.qty}</span>
                  <span className="text-right text-[12px] font-medium tabular-nums">
                    {lt > 0 ? fmtCurrency(lt, form.currency) : "—"}
                  </span>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="py-5 text-center text-[12px] italic text-muted-foreground">
            No items added yet
          </p>
        )}
      </div>

      <div className="mx-6 h-px bg-hairline" />

      <div className="space-y-1.5 px-6 py-4">
        <div className="flex justify-between text-[12px] text-muted-foreground">
          <span>Subtotal</span>
          <span className="tabular-nums">{fmtCurrency(subtotal, form.currency)}</span>
        </div>
        {parseNum(form.discountRate) > 0 && (
          <div className="flex justify-between text-[12px] text-muted-foreground">
            <span>Discount ({form.discountRate}%)</span>
            <span className="tabular-nums text-red-500">
              —{fmtCurrency(discount, form.currency)}
            </span>
          </div>
        )}
        {parseNum(form.taxRate) > 0 && (
          <div className="flex justify-between text-[12px] text-muted-foreground">
            <span>Tax ({form.taxRate}%)</span>
            <span className="tabular-nums">{fmtCurrency(tax, form.currency)}</span>
          </div>
        )}
        <div className="flex items-center justify-between border-t border-hairline pt-2.5">
          <span className="text-[13px] font-semibold tracking-[-0.02em]">Total due</span>
          <span className="text-[15px] font-bold tabular-nums tracking-[-0.03em]">
            {fmtCurrency(total, form.currency)}
          </span>
        </div>
      </div>

      <div className="flex items-center justify-between bg-surface/60 px-6 py-3.5">
        <span className="text-[11px] text-muted-foreground">{form.paymentTerms}</span>
        {form.notes && (
          <span className="max-w-[160px] truncate text-[11px] italic text-muted-foreground">
            {form.notes}
          </span>
        )}
      </div>
    </div>
  );
}
