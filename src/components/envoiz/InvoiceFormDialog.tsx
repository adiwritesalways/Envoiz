import * as React from "react";
import { ChevronDown, Plus, Trash2, X, Download, CalendarDays } from "lucide-react";
import { toast } from "sonner";
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
import { currencyOptions, defaultCurrency, type CurrencyCode } from "@/lib/envoiz";

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
  open: controlledOpen,
  onOpenChange,
  invoiceId,
  onSaved,
}: {
  trigger?: React.ReactNode;
  defaultOpen?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  invoiceId?: string | null;
  onSaved?: () => void;
}) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isSaving, setIsSaving] = React.useState(false);
  const [showSuccess, setShowSuccess] = React.useState(false);
  const [isUpdateSuccess, setIsUpdateSuccess] = React.useState(false);
  const [savedInvoiceNumber, setSavedInvoiceNumber] = React.useState("");
  const captureRef = React.useRef<HTMLDivElement>(null);

  const [internalOpen, setInternalOpen] = React.useState(!!defaultOpen);
  const open = controlledOpen ?? internalOpen;
  const setOpen = onOpenChange ?? setInternalOpen;

  const today = React.useMemo(() => new Date(), []);
  const defaultDueDate = React.useMemo(() => {
    const date = new Date(today);
    date.setDate(date.getDate() + 14);
    return date;
  }, [today]);

  const [clientName, setClientName] = React.useState("");
  const [clientEmail, setClientEmail] = React.useState("");
  const [billingAddress, setBillingAddress] = React.useState("");
  const [currency, setCurrency] = React.useState<CurrencyCode>(defaultCurrency);
  const [paymentStatus, setPaymentStatus] = React.useState<"Draft" | "Paid" | "Due" | "Overdue">(
    "Due",
  );
  const [issueDate, setIssueDate] = React.useState(toDateInputValue(today));
  const [dueDate, setDueDate] = React.useState(toDateInputValue(defaultDueDate));
  const [companyName, setCompanyName] = React.useState("Envoiz Studio");
  const [companyAddress, setCompanyAddress] = React.useState("Dhanmondi, Dhaka, Bangladesh");
  const [companyEmail, setCompanyEmail] = React.useState("");
  const [discount, setDiscount] = React.useState(0);
  const [notes, setNotes] = React.useState("");
  const [items, setItems] = React.useState<InvoiceItem[]>([
    { id: 1, product: "Brand identity refresh", quantity: 1, unitPrice: 1200 },
  ]);

  React.useEffect(() => {
    const metadata = user?.user_metadata || {};
    const isGithub = user?.app_metadata?.provider === "github";
    setCurrency(String(metadata.default_currency || defaultCurrency) as CurrencyCode);
    setCompanyName(String(metadata.company_name || metadata.full_name || ""));
    setCompanyAddress(String(metadata.company_address || ""));
    setCompanyEmail(String(isGithub ? metadata.company_email || "" : user?.email || ""));
  }, [user]);

  React.useEffect(() => {
    if (!open || !invoiceId || !user?.id) return;
    let active = true;
    const loadInvoice = async () => {
      const { data, error } = await supabase
        .from("envoiz_invoices")
        .select(
          "id, invoice_number, client_name, client_email, billing_address, issue_date, due_date, currency, payment_status, discount, notes, company_name, company_address, envoiz_invoice_items(product, quantity, unit_price)",
        )
        .eq("id", invoiceId)
        .eq("user_id", user.id)
        .single();
      if (error) {
        console.error("Unable to load invoice for editing", error);
        if (active) toast.error("Unable to open this invoice for editing.");
        return;
      }
      if (!active) return;
      setInvoiceNumber(String(data.invoice_number || ""));
      setClientName(String(data.client_name || ""));
      setClientEmail(String(data.client_email || ""));
      setBillingAddress(String(data.billing_address || ""));
      setIssueDate(String(data.issue_date || toDateInputValue(today)));
      setDueDate(String(data.due_date || toDateInputValue(defaultDueDate)));
      setCurrency(String(data.currency || defaultCurrency) as CurrencyCode);
      setPaymentStatus(data.payment_status === "Pending" ? "Due" : data.payment_status || "Due");
      setDiscount(Number(data.discount) || 0);
      setNotes(String(data.notes || ""));
      setCompanyName(String(data.company_name || ""));
      setCompanyAddress(String(data.company_address || ""));
      const rows = (data.envoiz_invoice_items || []).map((row: any, index: number) => ({
        id: Date.now() + index,
        product: String(row.product || ""),
        quantity: Number(row.quantity) || 1,
        unitPrice: Number(row.unit_price) || 0,
      }));
      setItems(rows.length ? rows : [{ id: Date.now(), product: "", quantity: 1, unitPrice: 0 }]);
    };
    void loadInvoice();
    return () => {
      active = false;
    };
  }, [defaultDueDate, invoiceId, open, today, user?.id]);

  React.useEffect(() => {
    if (!open || invoiceId) return;
    setClientName("");
    setClientEmail("");
    setBillingAddress("");
    setIssueDate(toDateInputValue(today));
    setDueDate(toDateInputValue(defaultDueDate));
    setPaymentStatus("Due");
    const metadata = user?.user_metadata || {};
    const isGithub = user?.app_metadata?.provider === "github";
    setCurrency(String(metadata.default_currency || defaultCurrency) as CurrencyCode);
    setDiscount(0);
    setNotes("");
    setItems([{ id: Date.now(), product: "", quantity: 1, unitPrice: 0 }]);
    setCompanyName(String(metadata.company_name || metadata.full_name || ""));
    setCompanyAddress(String(metadata.company_address || ""));
    setCompanyEmail(String(isGithub ? metadata.company_email || "" : user?.email || ""));
  }, [defaultDueDate, invoiceId, open, today, user]);

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

  const [invoiceNumber, setInvoiceNumber] = React.useState("Assigned when saved");

  const getExchangeRateToUsd = async () => {
    if (currency === "USD") return 1;
    try {
      const response = await fetch(
        `https://open.er-api.com/v6/latest/${encodeURIComponent(currency)}`,
      );
      if (!response.ok) return null;
      const data = await response.json();
      const rate = Number(data?.rates?.USD);
      return data?.result === "success" && Number.isFinite(rate) && rate > 0 ? rate : null;
    } catch {
      return null;
    }
  };

  const handleSave = async () => {
    if (!user) {
      toast.error("You must be logged in to save an invoice.");
      return;
    }
    if (!clientName.trim()) {
      toast.error("Add a client name before saving this invoice.");
      return;
    }
    if (
      !items.length ||
      items.some((item) => !item.product.trim() || item.quantity <= 0 || item.unitPrice < 0)
    ) {
      toast.error("Add a product name, positive quantity, and valid unit price to every row.");
      return;
    }

    setIsSaving(true);
    try {
      const exchangeRateToUsd = await getExchangeRateToUsd();
      const { data, error } = await supabase.rpc("save_envoiz_invoice", {
        p_invoice_id: invoiceId || null,
        p_client_name: clientName.trim(),
        p_client_email: clientEmail.trim() || null,
        p_billing_address: billingAddress.trim() || null,
        p_issue_date: issueDate,
        p_due_date: dueDate,
        p_payment_status: paymentStatus,
        p_currency: currency,
        p_exchange_rate_to_usd: exchangeRateToUsd,
        p_discount: safeDiscount,
        p_notes: notes || null,
        p_company_name: companyName.trim() || null,
        p_company_address: companyAddress.trim() || null,
        p_items: items.map((item) => ({
          product: item.product.trim(),
          quantity: item.quantity,
          unit_price: item.unitPrice,
        })),
      });
      if (error) throw error;
      const saved = data as { id: string; invoice_number: string };
      const savedNumber = String(saved.invoice_number);
      setInvoiceNumber(savedNumber);

      await queryClient.invalidateQueries({ queryKey: ["invoices"] });

      toast.success(`Invoice ${invoiceId ? "updated" : "saved"} as ${savedNumber}.`);
      onSaved?.();
      setSavedInvoiceNumber(savedNumber);
      setOpen(false);
      setShowSuccess(true);
      setIsUpdateSuccess(Boolean(invoiceId));
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
    if (!invoiceId) {
      toast.error("Save the invoice before downloading it.");
      return;
    }

    try {
      const { toPng, toJpeg, toCanvas } = await import("html-to-image");
      if (format === "png") {
        const dataUrl = await toPng(captureRef.current, { pixelRatio: 2, cacheBust: true });
        const link = document.createElement("a");
        link.download = `Invoice-${invoiceNumber}.png`;
        link.href = dataUrl;
        link.click();
        toast.success("Invoice downloaded as PNG.");
      } else {
        const { jsPDF } = await import("jspdf");
        const dataUrl = await toJpeg(captureRef.current, {
          quality: 1.0,
          pixelRatio: 2,
          cacheBust: true,
        });
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
            "max-w-[1360px] gap-0 overflow-hidden border-[#e2e6dc] p-0 shadow-[0_32px_100px_rgba(28,34,23,.2)]",
            "h-[94vh] rounded-[26px] bg-[#f5f6f2] [&>button]:hidden",
          )}
        >
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#e7e9e2] bg-white px-5 py-4 sm:px-7">
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-[13px] bg-[#1d2119] text-sm font-semibold text-white">
                E
              </div>
              <div>
                <div className="text-[15px] font-semibold tracking-[-0.02em] text-[#1d2119]">
                  {invoiceId ? "Edit invoice" : "Create invoice"}
                </div>
                <div className="text-xs text-[#7b8175]">
                  Add the details, check the preview, then save or download.
                </div>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={handleSave}
                disabled={isSaving}
                className="inline-flex h-10 items-center gap-2 rounded-xl bg-[#1d2119] px-4 text-[13px] font-medium text-white transition hover:bg-[#343a2d] disabled:opacity-50"
              >
                {isSaving ? "Saving..." : "Save Invoice"}
              </button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    disabled={!invoiceId}
                    className="flex h-10 items-center gap-2 rounded-xl border border-[#dfe3d9] bg-white px-4 text-[13px] font-medium text-[#24291f] transition hover:bg-[#f8f9f6] disabled:cursor-not-allowed disabled:opacity-45"
                  >
                    <Download className="h-4 w-4" /> Download
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
                <button
                  aria-label="Close invoice editor"
                  className="grid h-10 w-10 place-items-center rounded-xl text-[#777e70] transition hover:bg-[#f0f2ec] hover:text-[#22271e]"
                >
                  <X className="h-4 w-4" />
                </button>
              </DialogClose>
            </div>
          </div>

          <div className="h-[calc(94vh-73px)] overflow-y-auto overflow-x-hidden p-4 sm:p-6">
            <div className="grid gap-5 xl:grid-cols-[minmax(0,1.05fr)_minmax(400px,.95fr)] xl:items-start 2xl:gap-7">
              <Panel
                title="Invoice Details"
                description="A structured draft area for client details and unlimited line items."
                className="min-w-0 space-y-6 rounded-[22px] border-[#e5e8df] bg-white shadow-[0_8px_28px_rgba(33,40,27,.035)] xl:p-7"
              >
                <div className="grid gap-5 sm:grid-cols-2">
                  <Field
                    label="Client Name"
                    value={clientName}
                    onChange={setClientName}
                    placeholder="Nova Studio"
                    required
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
                </div>

                <div className="min-w-0">
                  <label htmlFor="invoice-status" className="text-[12px] text-muted-foreground">
                    Invoice status
                  </label>
                  <div className="relative mt-1.5">
                    <select
                      id="invoice-status"
                      value={paymentStatus}
                      onChange={(event) =>
                        setPaymentStatus(event.target.value as typeof paymentStatus)
                      }
                      className="h-11 w-full appearance-none rounded-2xl border border-hairline bg-white pl-3 pr-10 text-[14px] outline-none transition focus:border-foreground/20"
                    >
                      <option value="Paid">Paid</option>
                      <option value="Due">Due</option>
                      <option value="Overdue">Overdue</option>
                      <option value="Draft">Draft</option>
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  </div>
                </div>

                <div className="rounded-[18px] border border-[#e8ebe4] bg-[#fafbf9] p-4 sm:p-5">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="text-[14px] font-medium">Items Details</h3>
                      <p className="mt-1 text-[12.5px] text-muted-foreground">
                        Add as many products or services as you need.
                      </p>
                    </div>
                    <button
                      onClick={addRow}
                      className="inline-flex h-9 shrink-0 items-center gap-2 rounded-xl border border-[#e2e6dc] bg-white px-3 text-[12px] font-medium text-[#30372a] transition hover:bg-[#f7f8f4]"
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

                <div className="grid gap-5 md:grid-cols-2">
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
                  <article
                    ref={captureRef}
                    className="mx-auto min-h-[620px] max-w-[570px] bg-white px-6 py-7 text-[#20231e] shadow-[0_12px_36px_rgba(25,30,20,.08)] sm:px-9 sm:py-9"
                    style={{ fontFamily: "Arial, sans-serif" }}
                  >
                    <header className="flex items-start justify-between gap-5 border-b border-[#e7e8e4] pb-6">
                      <div className="min-w-0">
                        <p className="text-[17px] font-semibold tracking-[-0.04em]">
                          {companyName || "Your company"}
                        </p>
                        {companyAddress && (
                          <p className="mt-2 whitespace-pre-line text-[10px] leading-[1.7] text-[#72766f]">
                            {companyAddress}
                          </p>
                        )}
                        {companyEmail && (
                          <p className="mt-1 text-[10px] text-[#72766f]">{companyEmail}</p>
                        )}
                      </div>
                      <div className="shrink-0 text-right">
                        <h3 className="text-[27px] font-semibold tracking-[-0.06em] sm:text-[34px]">
                          INVOICE
                        </h3>
                        <p className="mt-1 font-mono text-[10px] tracking-wide text-[#777b74]">
                          {invoiceNumber}
                        </p>
                      </div>
                    </header>

                    <section className="grid grid-cols-2 gap-5 py-6">
                      <div>
                        <p className="text-[9px] font-semibold uppercase tracking-[.16em] text-[#888c84]">
                          Bill to
                        </p>
                        <p className="mt-2 text-[12px] font-semibold">
                          {clientName || "Client name"}
                        </p>
                        {clientEmail && (
                          <p className="mt-1 break-all text-[10px] text-[#72766f]">{clientEmail}</p>
                        )}
                        {billingAddress && (
                          <p className="mt-1 whitespace-pre-line text-[10px] leading-[1.6] text-[#72766f]">
                            {billingAddress}
                          </p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="text-[9px] font-semibold uppercase tracking-[.16em] text-[#888c84]">
                          Invoice details
                        </p>
                        <div className="mt-2 space-y-1 text-[10px]">
                          <p>
                            <span className="text-[#888c84]">Issued </span>
                            {formatDateLabel(issueDate)}
                          </p>
                          <p>
                            <span className="text-[#888c84]">Due </span>
                            {formatDateLabel(dueDate)}
                          </p>
                        </div>
                      </div>
                    </section>

                    <table className="w-full border-collapse text-left text-[10px]">
                      <thead>
                        <tr className="border-y border-[#20231e] text-[8px] font-semibold uppercase tracking-[.12em] text-[#70746d]">
                          <th className="py-3 pr-2 font-semibold">Description</th>
                          <th className="w-[42px] py-3 text-center font-semibold">Qty</th>
                          <th className="w-[86px] py-3 text-right font-semibold">Rate</th>
                          <th className="w-[92px] py-3 pl-2 text-right font-semibold">Amount</th>
                        </tr>
                      </thead>
                      <tbody>
                        {items.map((item) => (
                          <tr key={item.id} className="border-b border-[#e7e8e4] align-top">
                            <td className="py-3 pr-2 font-medium">
                              {item.product || "Item description"}
                            </td>
                            <td className="py-3 text-center tabular-nums">{item.quantity}</td>
                            <td className="py-3 text-right tabular-nums">
                              {money(item.unitPrice, currency)}
                            </td>
                            <td className="py-3 pl-2 text-right font-medium tabular-nums">
                              {money(item.quantity * item.unitPrice, currency)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>

                    <section className="ml-auto mt-5 w-full max-w-[220px] space-y-2 text-[10px]">
                      <div className="flex justify-between text-[#777b74]">
                        <span>Subtotal</span>
                        <span className="tabular-nums">{money(subtotal, currency)}</span>
                      </div>
                      {safeDiscount > 0 && (
                        <div className="flex justify-between text-[#777b74]">
                          <span>Discount</span>
                          <span className="tabular-nums">−{money(safeDiscount, currency)}</span>
                        </div>
                      )}
                      <div className="flex items-baseline justify-between border-t border-[#20231e] pt-3">
                        <span className="font-semibold">Total</span>
                        <span className="text-[18px] font-semibold tracking-[-.04em] tabular-nums">
                          {money(grandTotal, currency)}
                        </span>
                      </div>
                    </section>

                    {notes && (
                      <section className="mt-7 border-t border-[#e7e8e4] pt-4">
                        <p className="text-[8px] font-semibold uppercase tracking-[.14em] text-[#888c84]">
                          Note
                        </p>
                        <p className="mt-2 whitespace-pre-line text-[10px] leading-[1.7] text-[#656a61]">
                          {notes}
                        </p>
                      </section>
                    )}

                    <footer className="mt-10 border-t border-[#e7e8e4] pt-3 text-[8px] text-[#92968f]">
                      Thank you for your business.
                    </footer>
                  </article>
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
        isUpdate={isUpdateSuccess}
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
  required,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  placeholder: string;
  optional?: boolean;
  required?: boolean;
}) {
  return (
    <div className="min-w-0">
      <label className="text-[12px] text-muted-foreground">
        {label} {optional && <span className="text-muted-foreground/60">(optional)</span>}
      </label>
      <input
        type={type}
        required={required}
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
