import * as React from "react";
import { ChevronDown, Plus, Trash2, X, ArrowRight, CalendarDays } from "lucide-react";
import { toast } from "sonner";
import { toPng, toJpeg, toCanvas } from "html-to-image";
// jsPDF types or module may not be available in all environments; ignore if missing
// @ts-ignore: Could not find module 'jspdf' or its type declarations
import { jsPDF } from "jspdf";
import { useAuth } from "@/components/auth/auth-context";
import { supabase } from "@/lib/supabase";
import { useQueryClient } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogClose, DialogTrigger } from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { Panel } from "@/components/envoiz/DashboardUI";
import { InvoiceSuccessDialog } from "@/components/envoiz/InvoiceSuccessDialog";
import {
  currencyOptions,
  defaultCurrency,
  formatInvoiceNumber,
  readUserStorageValue,
  settingsStorageKeys,
  type CurrencyCode,
} from "@/lib/envoiz";

type InvoiceItem = {
  id: number;
  product: string;
  quantity: number;
  unitPrice: number;
};

type StoredInvoiceItemRow = {
  product: string;
  quantity: number;
  unit_price: number;
};

type PaymentStatus = "Pending" | "Paid" | "Overdue";
const paymentStatusOptions: PaymentStatus[] = ["Pending", "Paid", "Overdue"];

const money = (value: number, currency: CurrencyCode) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency, maximumFractionDigits: 2 }).format(
    value || 0,
  );

const formatDateLabel = (value: string) => {
  if (!value) return "—";
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
};

const toDateInputValue = (date: Date) => date.toISOString().slice(0, 10);

export function InvoiceFormDialog({
  trigger,
  defaultOpen,
}: {
  trigger?: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isSaving, setIsSaving] = React.useState(false);
  const [showSuccess, setShowSuccess] = React.useState(false);
  const [savedInvoiceNumber, setSavedInvoiceNumber] = React.useState("");
  const captureRef = React.useRef<HTMLDivElement>(null);

  const [open, setOpen] = React.useState(!!defaultOpen);

  const today = React.useMemo(() => new Date(2026, 5, 27), []);
  const defaultDueDate = React.useMemo(() => {
    const date = new Date(today);
    date.setDate(date.getDate() + 14);
    return date;
  }, [today]);

  const [clientName, setClientName] = React.useState("");
  const [clientEmail, setClientEmail] = React.useState("");
  const [billingAddress, setBillingAddress] = React.useState("");
  const [currency, setCurrency] = React.useState<CurrencyCode>(defaultCurrency);
  const [paymentStatus, setPaymentStatus] = React.useState<PaymentStatus>("Pending");
  const [issueDate, setIssueDate] = React.useState(toDateInputValue(today));
  const [dueDate, setDueDate] = React.useState(toDateInputValue(defaultDueDate));
  const [companyName, setCompanyName] = React.useState("Envoiz Studio");
  const [companyAddress, setCompanyAddress] = React.useState("Dhanmondi, Dhaka, Bangladesh");
  const [discount, setDiscount] = React.useState(0);
  const [notes, setNotes] = React.useState("");
  const [items, setItems] = React.useState<InvoiceItem[]>([
    { id: 1, product: "Brand identity refresh", quantity: 1, unitPrice: 1200 },
  ]);

  React.useEffect(() => {
    setCurrency(
      readUserStorageValue(user?.id, settingsStorageKeys.defaultCurrency, defaultCurrency) as CurrencyCode,
    );
    setCompanyName(readUserStorageValue(user?.id, settingsStorageKeys.companyName, "Envoiz Studio"));
    setCompanyAddress(
      readUserStorageValue(user?.id, settingsStorageKeys.companyAddress, "Dhanmondi, Dhaka, Bangladesh"),
    );
  }, [user?.id]);

  const subtotal = React.useMemo(
    () =>
      items.reduce(
        (sum, item) => sum + Math.max(0, item.quantity) * Math.max(0, item.unitPrice),
        0,
      ),
    [items],
  );

  const safeDiscount = Math.min(Math.max(0, discount), subtotal);
  const grandTotal = Math.max(0, subtotal - safeDiscount);

  const [invoiceNumber, setInvoiceNumber] = React.useState(formatInvoiceNumber(1));

  React.useEffect(() => {
    async function fetchNextInvoiceNumber() {
      if (!user || !open) return;
      const { count } = await supabase
        .from("envoiz_invoices")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id);
      setInvoiceNumber(formatInvoiceNumber((count || 0) + 1));
    }
    fetchNextInvoiceNumber();
  }, [user, open]);

  const handleSave = async () => {
    if (!user) {
      toast.error("You must be logged in to save an invoice.");
      return;
    }

    setIsSaving(true);
    try {
      const { data: invoiceData, error: invoiceError } = await supabase
        .from("envoiz_invoices")
        .insert({
          user_id: user.id,
          invoice_number: invoiceNumber,
          client_name: clientName,
          client_email: clientEmail,
          billing_address: billingAddress,
          issue_date: issueDate,
          due_date: dueDate,
          payment_status: paymentStatus,
          currency: currency,
          discount: discount,
          notes: notes,
          company_name: companyName,
          company_address: companyAddress,
        })
        .select()
        .single();

      if (invoiceError) throw invoiceError;

      const itemsToInsert = items.map((item) => ({
        invoice_id: invoiceData.id,
        product: item.product,
        quantity: item.quantity,
        unit_price: item.unitPrice,
      }));

      if (itemsToInsert.length > 0) {
        const { error: itemsError } = await supabase
          .from("envoiz_invoice_items")
          .insert(itemsToInsert);

        if (itemsError) throw itemsError;
      }

      await queryClient.invalidateQueries({ queryKey: ["invoices"] });

      toast.success(`Invoice saved successfully as ${invoiceNumber}.`);
      setSavedInvoiceNumber(invoiceNumber);
      setOpen(false);
      setShowSuccess(true);
    } catch (error: unknown) {
      console.error("Save invoice error:", error);
      const message =
        error instanceof Error
          ? error.message
          : typeof error === "object" && error !== null
            ? "message" in error && typeof error.message === "string"
              ? error.message
              : "details" in error && typeof error.details === "string"
                ? error.details
                : "Unknown error"
            : "Unknown error";
      toast.error(`Failed to save: ${message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDownload = async (format: "pdf" | "png") => {
    if (!captureRef.current) return;

    try {
      if (format === "png") {
        const dataUrl = await toPng(captureRef.current, { pixelRatio: 2, cacheBust: true });
        const link = document.createElement("a");
        link.download = `Invoice-${invoiceNumber}.png`;
        link.href = dataUrl;
        link.click();
        toast.success("Invoice downloaded as PNG.");
      } else {
        const dataUrl = await toJpeg(captureRef.current, { quality: 1.0, pixelRatio: 2, cacheBust: true });
        const canvas = await toCanvas(captureRef.current, { pixelRatio: 2, cacheBust: true });
        const pdf = new jsPDF("p", "pt", "a4");
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

        pdf.addImage(dataUrl, "JPEG", 0, 0, pdfWidth, pdfHeight);
        pdf.save(`Invoice-${invoiceNumber}.pdf`);
        toast.success("Invoice downloaded as PDF.");
      }
    } catch (error: unknown) {
      console.error("Download error:", error);
      toast.error(`Download failed: ${error instanceof Error ? error.message : "Check console"}`);
    }
  };

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
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        {trigger ? <DialogTrigger asChild>{trigger}</DialogTrigger> : null}

        <DialogContent
          className={cn(
            "max-w-[1200px] gap-0 overflow-hidden p-0 border-border",
            "h-[96vh] sm:rounded-2xl bg-white [&>button]:hidden",
          )}
        >
          <div className="flex items-center justify-between border-b border-border bg-background px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="grid h-8 w-8 place-items-center rounded-md bg-foreground text-background text-xs font-semibold">
                E
              </div>
              <div>
                <div className="text-sm font-semibold tracking-tight">Create invoice</div>
                <div className="text-xs text-muted-foreground">
                  Draft, preview and send — all in one place.
                </div>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="inline-flex items-center gap-2 rounded-full bg-foreground px-4 py-2 text-[13px] font-medium text-background transition-colors hover:opacity-90 disabled:opacity-50"
              >
                {isSaving ? "Saving..." : "Save Invoice"}
              </button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-2 rounded-full bg-foreground px-4 py-2 text-[13px] font-medium text-background transition-colors hover:opacity-90">
                    Download Invoice <ArrowRight className="h-4 w-4" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => handleDownload("pdf")}>
                    Download PDF
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleDownload("png")}>
                    Download PNG
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <DialogClose asChild>
                <button className="inline-flex items-center gap-2 rounded-full bg-[#eeeeee] px-4 py-2 text-[13px] font-medium text-foreground transition-colors hover:bg-[#e0e0e0]">
                  Cancel <X className="h-3.5 w-3.5" />
                </button>
              </DialogClose>
            </div>
          </div>

          <div className="overflow-y-auto overflow-x-hidden p-6 h-[calc(96vh-73px)]">
            <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr] xl:gap-8 xl:items-start 2xl:grid-cols-[1.05fr_0.95fr]">
              <Panel
                title="Invoice Details"
                description="A structured draft area for client details and unlimited line items."
                className="min-w-0 space-y-6 xl:p-7"
              >
                <div className="grid gap-5 sm:grid-cols-2">
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

                <Field
                  label="Billing Address"
                  optional
                  value={billingAddress}
                  onChange={setBillingAddress}
                  placeholder="Street, city, state, postal code, country"
                />

                <div className="grid gap-5 md:grid-cols-3">
                  <DateField label="Issue Date" value={issueDate} onChange={setIssueDate} />
                  <DateField label="Due Date" value={dueDate} onChange={setDueDate} />
                  <div className="min-w-0">
                    <label className="text-[12px] text-muted-foreground">Payment Status</label>
                    <div className="relative mt-1.5">
                      <select
                        value={paymentStatus}
                        onChange={(event) => setPaymentStatus(event.target.value as PaymentStatus)}
                        className="h-11 w-full appearance-none rounded-2xl border border-hairline bg-white pl-3 pr-10 text-[14px] outline-none transition focus:border-foreground/20"
                      >
                        {paymentStatusOptions.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    </div>
                  </div>
                </div>

                <div className="rounded-3xl border border-hairline bg-surface/50 p-5">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="text-[14px] font-medium">Items Details</h3>
                      <p className="mt-1 text-[12.5px] text-muted-foreground">
                        Add as many products or services as you need.
                      </p>
                    </div>
                    <button
                      onClick={addRow}
                      className="inline-flex shrink-0 items-center gap-2 rounded-full bg-foreground px-3 py-2 text-[12px] font-medium text-background transition-colors hover:opacity-90"
                    >
                      <Plus className="h-3.5 w-3.5" /> Add Item
                    </button>
                  </div>

                  <div className="mt-5 space-y-3">
                    <div className="hidden gap-x-4 gap-y-2 rounded-2xl bg-white px-4 py-3 text-[12px] uppercase tracking-[0.16em] text-muted-foreground lg:grid lg:grid-cols-[minmax(0,2.2fr)_minmax(72px,0.75fr)_minmax(96px,1.05fr)_minmax(96px,1.05fr)_2.75rem] lg:items-center xl:hidden 2xl:grid">
                      <span>Item</span>
                      <span>QTY</span>
                      <span>Cost</span>
                      <span className="text-right">Amount</span>
                      <span />
                    </div>
                    {items.map((item) => {
                      const total = item.quantity * item.unitPrice;
                      return (
                        <div
                          key={item.id}
                          className="grid gap-4 rounded-2xl border border-hairline bg-white p-4 sm:grid-cols-2 sm:gap-x-4 sm:gap-y-3 lg:grid-cols-[minmax(0,2.2fr)_minmax(72px,0.75fr)_minmax(96px,1.05fr)_minmax(96px,1.05fr)_2.75rem] lg:items-center lg:gap-x-4 lg:gap-y-0 xl:grid-cols-2 xl:gap-y-3 2xl:grid-cols-[minmax(0,2.2fr)_minmax(72px,0.75fr)_minmax(96px,1.05fr)_minmax(96px,1.05fr)_2.75rem] 2xl:items-center 2xl:gap-x-4 2xl:gap-y-0"
                        >
                          <div className="min-w-0 sm:col-span-2 lg:col-span-1 xl:col-span-2 2xl:col-span-1">
                            <span className="mb-1.5 block text-[11px] text-muted-foreground lg:hidden xl:block 2xl:hidden">
                              Item
                            </span>
                            <InputField
                              value={item.product}
                              onChange={(value) => updateItem(item.id, "product", value)}
                              placeholder="Consulting session"
                            />
                          </div>
                          <div className="min-w-0">
                            <span className="mb-1.5 block text-[11px] text-muted-foreground lg:hidden xl:block 2xl:hidden">
                              Quantity
                            </span>
                            <InputField
                              value={String(item.quantity)}
                              onChange={(value) =>
                                updateItem(item.id, "quantity", value.replace(/[^0-9]/g, ""))
                              }
                              type="number"
                              min={1}
                              placeholder="1"
                              inputMode="numeric"
                            />
                          </div>
                          <div className="min-w-0">
                            <span className="mb-1.5 block text-[11px] text-muted-foreground lg:hidden xl:block 2xl:hidden">
                              Cost
                            </span>
                            <CurrencyField
                              currency={currency}
                              value={item.unitPrice}
                              onChange={(value) => updateItem(item.id, "unitPrice", value)}
                            />
                          </div>
                          <div className="min-w-0">
                            <span className="mb-1.5 block text-[11px] text-muted-foreground lg:hidden xl:block 2xl:hidden">
                              Amount
                            </span>
                            <div className="flex h-11 items-center justify-end rounded-2xl bg-surface/70 px-4 text-[14px] font-medium tabular-nums">
                              {money(total, currency)}
                            </div>
                          </div>
                          <div className="flex items-center justify-end sm:col-span-2 lg:col-span-1 lg:justify-center xl:col-span-2 xl:justify-end 2xl:col-span-1 2xl:justify-center">
                            <button
                              type="button"
                              onClick={() => removeRow(item.id)}
                              className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                            >
                              <Trash2 className="h-4 w-4" />
                              <span className="sr-only">Remove item</span>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="grid gap-5 md:grid-cols-3">
                  <div className="min-w-0">
                    <label className="text-[12px] text-muted-foreground">
                      Discount <span className="text-muted-foreground/60">(optional)</span>
                    </label>
                    <CurrencyField
                      currency={currency}
                      value={discount}
                      onChange={setDiscount}
                      wrapperClassName="mt-1.5"
                    />
                  </div>
                  <div className="min-w-0">
                    <label className="text-[12px] text-muted-foreground">Currency</label>
                    <div className="relative mt-1.5">
                      <select
                        value={currency}
                        onChange={(event) => setCurrency(event.target.value as CurrencyCode)}
                        className="h-11 w-full appearance-none rounded-2xl border border-hairline bg-white pl-3 pr-10 text-[14px] outline-none transition focus:border-foreground/20"
                      >
                        {currencyOptions.map((option) => (
                          <option key={option.code} value={option.code}>
                            {option.code} - {option.label}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    </div>
                  </div>
                  <div className="min-w-0">
                    <label className="text-[12px] text-muted-foreground">Total</label>
                    <div className="mt-1.5 flex h-11 w-full items-center rounded-2xl border border-hairline bg-surface/70 px-3 text-[14px] font-medium tabular-nums">
                      {money(grandTotal, currency)}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-[12px] text-muted-foreground">
                    Notes to Customer <span className="text-muted-foreground/60">(optional)</span>
                  </label>
                  <textarea
                    value={notes}
                    onChange={(event) => setNotes(event.target.value)}
                    rows={3}
                    placeholder="e.g. Thanks for the opportunity to work together — happy to answer any questions."
                    className="mt-1.5 w-full resize-none rounded-2xl border border-hairline bg-white px-3 py-3 text-[14px] leading-relaxed outline-none transition placeholder:text-muted-foreground/60 focus:border-foreground/20"
                  />
                </div>

                <div className="flex flex-wrap items-center gap-3 rounded-3xl bg-surface/60 p-4 text-[13px] text-muted-foreground">
                  <span className="rounded-full bg-white px-3 py-1 font-medium text-foreground">
                    {invoiceNumber}
                  </span>
                  <span>{currency}</span>
                  <span>No tax</span>
                </div>
              </Panel>

              <div className="space-y-4 min-w-0">
                <Panel
                  title="Preview"
                  description="A clean printable invoice, ready for download or browser printing."
                  className="overflow-hidden"
                >
                  <div
                    ref={captureRef}
                    className="rounded-[2rem] border border-hairline bg-white p-5 shadow-[0_20px_70px_rgba(0,0,0,0.08)] sm:p-8 md:p-10 relative"
                  >
                    <div className="flex flex-col gap-6 border-b border-hairline pb-6 sm:flex-row sm:items-start sm:justify-between">
                      <div className="max-w-xs">
                        <h3 className="text-[22px] font-semibold tracking-[-0.04em] sm:text-[26px]">
                          {companyName}
                        </h3>
                        <p className="mt-2 text-[13px] leading-relaxed text-muted-foreground">
                          {companyAddress}
                        </p>
                      </div>
                      <div className="sm:text-right">
                        <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                          Invoice
                        </p>
                        <span className="mt-2 inline-flex rounded-full border border-hairline px-3 py-1 text-[13px] font-medium tabular-nums">
                          {invoiceNumber}
                        </span>
                        <div className="mt-3 flex items-center gap-2 sm:justify-end">
                          <span className="text-[12px] text-muted-foreground">
                            Issued {formatDateLabel(issueDate)}
                          </span>
                          <PaymentStatusPill status={paymentStatus} />
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 overflow-hidden rounded-2xl border border-hairline">
                      <div className="grid grid-cols-1 divide-y divide-hairline sm:grid-cols-2 sm:divide-x sm:divide-y-0">
                        <div className="p-5">
                          <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                            Billed to
                          </p>
                          <div className="mt-2 text-[14px] font-medium">
                            {clientName || "Client name"}
                          </div>
                          {clientEmail && (
                            <div className="mt-1 text-[13px] text-muted-foreground">
                              {clientEmail}
                            </div>
                          )}
                        </div>
                        <div className="p-5">
                          <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                            Due date
                          </p>
                          <div className="mt-2 text-[14px] font-medium">
                            {formatDateLabel(dueDate)}
                          </div>
                        </div>
                      </div>
                      {billingAddress && (
                        <div className="border-t border-hairline p-5">
                          <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                            Address
                          </p>
                          <div className="mt-2 text-[13px] leading-relaxed text-muted-foreground">
                            {billingAddress}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="py-6">
                      <div className="overflow-hidden rounded-2xl border border-hairline">
                        <div className="flex items-center justify-between gap-4 bg-surface/70 px-5 py-3.5 text-[10.5px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
                          <span>Item</span>
                          <span>Amount</span>
                        </div>
                        <div className="divide-y divide-hairline">
                          {items.map((item) => {
                            const total = item.quantity * item.unitPrice;
                            return (
                              <div
                                key={item.id}
                                className="flex items-start justify-between gap-4 px-5 py-4 text-[13px]"
                              >
                                <div className="min-w-0 flex-1">
                                  <p className="font-medium break-words">
                                    {item.product || "Item"}
                                  </p>
                                  <p className="mt-1 break-words text-[12px] text-muted-foreground tabular-nums">
                                    {item.quantity} × {money(item.unitPrice, currency)}
                                  </p>
                                </div>
                                <span className="shrink-0 text-right font-medium tabular-nums">
                                  {money(total, currency)}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end pt-2">
                      <div className="w-full space-y-2.5 sm:max-w-[280px]">
                        <div className="flex items-center justify-between px-1 text-[13px] text-muted-foreground">
                          <span>Subtotal</span>
                          <span className="font-medium text-foreground tabular-nums">
                            {money(subtotal, currency)}
                          </span>
                        </div>
                        {safeDiscount > 0 && (
                          <div className="flex items-center justify-between px-1 text-[13px] text-muted-foreground">
                            <span>Discount</span>
                            <span className="font-medium text-foreground tabular-nums">
                              -{money(safeDiscount, currency)}
                            </span>
                          </div>
                        )}
                        <div className="flex items-baseline justify-between border-t border-hairline px-1 pt-3">
                          <span className="text-[13px] font-medium text-muted-foreground">
                            Total
                          </span>
                          <span className="text-[22px] font-semibold tracking-[-0.02em] tabular-nums">
                            {money(grandTotal, currency)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {notes && (
                      <div className="mt-6 border-t border-hairline pt-6">
                        <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                          Notes
                        </p>
                        <p className="mt-2 text-[13px] leading-relaxed text-muted-foreground">
                          {notes}
                        </p>
                      </div>
                    )}
                  </div>
                </Panel>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      <InvoiceSuccessDialog
        open={showSuccess}
        onOpenChange={setShowSuccess}
        invoiceNumber={savedInvoiceNumber}
      />
    </>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
  optional,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  placeholder: string;
  optional?: boolean;
}) {
  return (
    <div className="min-w-0">
      <label className="text-[12px] text-muted-foreground">
        {label} {optional && <span className="text-muted-foreground/60">(optional)</span>}
      </label>
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

function DateField({
  label,
  value,
  onChange,
  optional,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  optional?: boolean;
}) {
  return (
    <div className="min-w-0">
      <label className="text-[12px] text-muted-foreground">
        {label} {optional && <span className="text-muted-foreground/60">(optional)</span>}
      </label>
      <div className="relative mt-1.5">
        <input
          type="date"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="peer absolute inset-0 z-10 h-11 w-full cursor-pointer opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:inset-0 [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-0"
        />
        <div className="pointer-events-none flex h-11 w-full min-w-0 items-center justify-between gap-2 rounded-2xl border border-hairline bg-white px-3 text-[14px] transition peer-focus:border-foreground/20">
          <span className="truncate">{formatDateLabel(value)}</span>
          <CalendarDays className="h-4 w-4 shrink-0 text-muted-foreground" />
        </div>
      </div>
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
  inputMode,
}: {
  value: string;
  onChange: (value: string) => void;
  type?: string;
  placeholder: string;
  min?: number;
  step?: string;
  inputMode?: "numeric" | "decimal" | "text";
}) {
  return (
    <input
      value={value}
      onChange={(event) => onChange(event.target.value)}
      type={type}
      min={min}
      step={step}
      inputMode={inputMode}
      placeholder={placeholder}
      className="h-11 w-full min-w-0 rounded-2xl border border-hairline bg-white px-3 text-[14px] outline-none transition placeholder:text-muted-foreground/60 focus:border-foreground/20"
    />
  );
}

function CurrencyField({
  currency,
  value,
  onChange,
  wrapperClassName,
}: {
  currency: CurrencyCode;
  value: number;
  onChange: (value: number) => void;
  wrapperClassName?: string;
}) {
  return (
    <div
      className={cn(
        "flex h-11 min-w-0 items-center rounded-2xl border border-hairline bg-white pl-3 pr-2 transition focus-within:border-foreground/20",
        wrapperClassName,
      )}
    >
      <span className="text-[12px] font-medium text-muted-foreground">{currency}</span>
      <input
        type="number"
        min={0}
        step="0.01"
        value={value || ""}
        onChange={(event) => onChange(Number(event.target.value) || 0)}
        placeholder="0.00"
        className="h-full w-full min-w-0 bg-transparent px-2 text-right text-[14px] outline-none placeholder:text-muted-foreground/60"
      />
    </div>
  );
}

function PaymentStatusPill({ status }: { status: PaymentStatus }) {
  const classes: Record<PaymentStatus, string> = {
    Paid: "bg-[#dcfce7] text-[#15803d]",
    Pending: "bg-[#f1f1f1] text-[#525252]",
    Overdue: "bg-[#fee2e2] text-[#b91c1c]",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-medium",
        classes[status],
      )}
    >
      {status}
    </span>
  );
}
