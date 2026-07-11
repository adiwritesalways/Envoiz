/*
 * MIGRATION NEEDED: ALTER TABLE envoiz_invoices ADD COLUMN IF NOT EXISTS tax_rate NUMERIC DEFAULT 0;
 */
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  CalendarDays,
  ChevronDown,
  Eye,
  FileText,
  Loader2,
  Pencil,
  Plus,
  Search,
  Trash2,
  ArrowRight,
  X,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import html2canvas from "html2canvas-pro";
import { pdf } from "@react-pdf/renderer";
import { InvoicePDFDocument } from "@/components/envoiz/InvoicePDFDocument";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import { DashboardPage, Panel } from "@/components/envoiz/DashboardUI";
import { InvoiceSuccessDialog } from "@/components/envoiz/InvoiceSuccessDialog";
import { useAuth } from "@/components/auth/auth-context";
import { supabase } from "@/lib/supabase";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import {
  brandName,
  currencyOptions,
  defaultCurrency,
  formatInvoiceNumber,
  readUserStorageValue,
  settingsStorageKeys,
  type CurrencyCode,
} from "@/lib/envoiz";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

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

type StoredInvoiceRow = {
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
  envoiz_invoice_items?: StoredInvoiceItemRow[];
};

type PaymentStatus = "Pending" | "Paid" | "Overdue";

const paymentStatusOptions: PaymentStatus[] = ["Pending", "Paid", "Overdue"];

const money = (value: number, currency: CurrencyCode) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency, maximumFractionDigits: 2 }).format(
    value || 0,
  );

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
  Paid: "bg-[#dcfce7] text-[#15803d]",
  Pending: "bg-[#f1f1f1] text-[#525252]",
  Overdue: "bg-[#fee2e2] text-[#b91c1c]",
};

function computeListTotal(inv: StoredInvoiceRow) {
  const items = inv.envoiz_invoice_items ?? [];
  const sub = items.reduce((s, it) => s + it.quantity * it.unit_price, 0);
  const disc = Math.min(Math.max(0, inv.discount ?? 0), sub);
  const taxable = sub - disc;
  const tax = taxable * ((inv.tax_rate ?? 0) / 100);
  return taxable + tax;
}

export const Route = createFileRoute("/dashboard/invoices")({
  head: () => ({
    meta: [
      { title: `Invoices - ${brandName}` },
      {
        name: "description",
        content:
          "Create and manage professional invoices with automatic totals and a printable Envoiz template.",
      },
    ],
  }),
  component: InvoicesPage,
});

function InvoicesPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editingInvoiceId, setEditingInvoiceId] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [savedInvoiceNumber, setSavedInvoiceNumber] = useState("");
  const [wasUpdate, setWasUpdate] = useState(false);
  const [showMobilePreview, setShowMobilePreview] = useState(false);
  const captureRef = useRef<HTMLDivElement>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | PaymentStatus>("all");

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{
    id: string;
    invoiceNumber: string;
    clientName: string;
  } | null>(null);

  const today = useMemo(() => new Date(), []);
  const defaultDueDate = useMemo(() => {
    const date = new Date(today);
    date.setDate(date.getDate() + 14);
    return date;
  }, [today]);

  const [clientName, setClientName] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [billingAddress, setBillingAddress] = useState("");
  const [currency, setCurrency] = useState<CurrencyCode>(defaultCurrency);
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>("Pending");
  const [issueDate, setIssueDate] = useState(toDateInputValue(today));
  const [dueDate, setDueDate] = useState(toDateInputValue(defaultDueDate));
  const [companyName, setCompanyName] = useState("");
  const [companyAddress, setCompanyAddress] = useState("");
  const [discount, setDiscount] = useState(0);
  const [taxRate, setTaxRate] = useState(0);
  const [notes, setNotes] = useState("");
  const [items, setItems] = useState<InvoiceItem[]>([
    { id: 1, product: "Brand identity refresh", quantity: 1, unitPrice: 1200 },
  ]);

  useEffect(() => {
    setCurrency(
      readUserStorageValue(
        user?.id,
        settingsStorageKeys.defaultCurrency,
        defaultCurrency,
      ) as CurrencyCode,
    );
    const savedName = user?.user_metadata?.company_name ||
      readUserStorageValue(user?.id, settingsStorageKeys.companyName, "");
    const savedAddress = user?.user_metadata?.company_address ||
      readUserStorageValue(user?.id, settingsStorageKeys.companyAddress, "");
    setCompanyName(savedName);
    setCompanyAddress(savedAddress);
  }, [user?.id, user?.user_metadata?.company_name, user?.user_metadata?.company_address]);

  const [invoiceNumber, setInvoiceNumber] = useState("");

  const loadNextInvoiceNumber = useCallback(async () => {
    if (!user?.id) return;
    try {
      const { count, error } = await supabase
        .from("envoiz_invoices")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id);
      if (error) throw error;
      setInvoiceNumber(formatInvoiceNumber((count ?? 0) + 1));
    } catch {
      setInvoiceNumber(formatInvoiceNumber(Date.now() % 1000000));
    }
  }, [user?.id]);

  useEffect(() => {
    if (!editingInvoiceId) {
      loadNextInvoiceNumber();
    }
  }, [user?.id, editingInvoiceId, loadNextInvoiceNumber]);

  const invoiceListQuery = useQuery({
    queryKey: ["invoiceListRaw", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("envoiz_invoices")
        .select(
          "id, invoice_number, client_name, client_email, issue_date, due_date, payment_status, currency, discount, tax_rate, notes, company_name, company_address, billing_address, envoiz_invoice_items(product, quantity, unit_price)",
        )
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as StoredInvoiceRow[];
    },
    enabled: Boolean(user?.id),
  });

  const filteredInvoices = useMemo(() => {
    const list = invoiceListQuery.data ?? [];
    return list.filter((inv) => {
      const q = searchQuery.toLowerCase();
      const matchSearch =
        !q ||
        (inv.client_name ?? "").toLowerCase().includes(q) ||
        (inv.invoice_number ?? "").toLowerCase().includes(q);
      const matchStatus =
        statusFilter === "all" || inv.payment_status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [invoiceListQuery.data, searchQuery, statusFilter]);

  const subtotal = useMemo(
    () =>
      items.reduce(
        (sum, item) => sum + Math.max(0, item.quantity) * Math.max(0, item.unitPrice),
        0,
      ),
    [items],
  );

  const safeDiscount = Math.min(Math.max(0, discount), subtotal);
  const safeTaxRate = Math.min(Math.max(0, taxRate), 100);
  const taxableAmount = subtotal - safeDiscount;
  const taxAmount = taxableAmount * (safeTaxRate / 100);
  const grandTotal = Math.max(0, taxableAmount + taxAmount);

  const resetForm = () => {
    setEditingInvoiceId(null);
    setClientName("");
    setClientEmail("");
    setBillingAddress("");
    setDiscount(0);
    setTaxRate(0);
    setNotes("");
    setPaymentStatus("Pending");
    setIssueDate(toDateInputValue(today));
    setDueDate(toDateInputValue(defaultDueDate));
    setItems([{ id: Math.random(), product: "", quantity: 1, unitPrice: 0 }]);
    loadNextInvoiceNumber();
  };

  const openNewForm = () => {
    resetForm();
    setIsFormOpen(true);
    setShowMobilePreview(false);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    resetForm();
    queryClient.invalidateQueries({ queryKey: ["invoiceListRaw", user?.id] });
  };

  const openDeleteDialog = (id: string, invNum: string, clientNm: string) => {
    setDeleteTarget({ id, invoiceNumber: invNum, clientName: clientNm });
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    try {
      setIsSaving(true);
      await supabase.from("envoiz_invoice_items").delete().eq("invoice_id", deleteTarget.id);
      const { error } = await supabase
        .from("envoiz_invoices")
        .delete()
        .eq("id", deleteTarget.id);
      if (error) throw error;

      await queryClient.invalidateQueries({ queryKey: ["invoices"] });
      await queryClient.invalidateQueries({ queryKey: ["invoiceListRaw"] });
      await queryClient.invalidateQueries({ queryKey: ["recentInvoices"] });
      toast.success("Invoice deleted successfully.");
      setDeleteDialogOpen(false);
      setDeleteTarget(null);

      if (editingInvoiceId === deleteTarget.id) {
        closeForm();
      }
    } catch (error: any) {
      toast.error(
        `Failed to delete invoice: ${error.message || "Make sure DELETE permissions are set in Supabase RLS policies."}`,
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleSave = async () => {
    if (!user) {
      toast.error("You must be logged in to save an invoice.");
      return;
    }

    setIsSaving(true);
    try {
      let invoiceData;
      if (editingInvoiceId) {
        const { data, error: invoiceError } = await supabase
          .from("envoiz_invoices")
          .update({
            invoice_number: invoiceNumber,
            client_name: clientName,
            client_email: clientEmail,
            billing_address: billingAddress,
            issue_date: issueDate,
            due_date: dueDate,
            payment_status: paymentStatus,
            currency,
            discount,
            tax_rate: taxRate,
            notes,
            company_name: companyName,
            company_address: companyAddress,
          })
          .eq("id", editingInvoiceId)
          .select()
          .single();

        if (invoiceError) throw invoiceError;
        invoiceData = data;

        const { error: deleteError } = await supabase
          .from("envoiz_invoice_items")
          .delete()
          .eq("invoice_id", editingInvoiceId);
        if (deleteError) {
          throw new Error(
            "Could not delete old items. Make sure DELETE permission is enabled in Supabase RLS policies for envoiz_invoice_items.",
          );
        }
      } else {
        const { data, error: invoiceError } = await supabase
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
            currency,
            discount,
            tax_rate: taxRate,
            notes,
            company_name: companyName,
            company_address: companyAddress,
          })
          .select()
          .single();

        if (invoiceError) throw invoiceError;
        invoiceData = data;
      }

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
      await queryClient.invalidateQueries({ queryKey: ["invoiceListRaw"] });
      await queryClient.invalidateQueries({ queryKey: ["recentInvoices"] });

      toast.success(
        `Invoice ${editingInvoiceId ? "updated" : "saved"} successfully as ${invoiceNumber}.`,
      );
      setWasUpdate(!!editingInvoiceId);
      setEditingInvoiceId(invoiceData.id);
      setSavedInvoiceNumber(invoiceNumber);
      setShowSuccess(true);
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : typeof error === "object" && error !== null && "message" in error
            ? String((error as any).message)
            : "Unknown error";
      toast.error(`Failed to save: ${message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDownload = async (format: "pdf" | "png") => {
    if (!captureRef.current) return;

    try {
      if (format === "pdf") {
        const invoiceData = {
          companyName,
          companyAddress,
          clientName,
          clientEmail,
          billingAddress,
          invoiceNumber,
          issueDate,
          dueDate,
          paymentStatus,
          items,
          subtotal,
          discount,
          grandTotal,
          currency,
          notes,
        };
        const blob = await pdf(<InvoicePDFDocument invoice={invoiceData} />).toBlob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `Invoice-${invoiceNumber}.pdf`;
        a.click();
        URL.revokeObjectURL(url);
        toast.success("Invoice downloaded as PDF.");
      } else {
        const el = captureRef.current;
        const allEls = Array.from(el.querySelectorAll("*")) as HTMLElement[];
        const targets = [el, ...allEls];

        const elPrevStyle = el.getAttribute("style") ?? "";
        el.style.width = "794px";
        el.style.minHeight = "1123px";

        const saved = targets.map((node) => {
          const cs = window.getComputedStyle(node);
          const prev = node.getAttribute("style") ?? "";
          node.style.color = cs.color;
          node.style.backgroundColor = cs.backgroundColor;
          node.style.borderColor = cs.borderColor;
          node.style.outlineColor = cs.outlineColor;
          node.style.boxShadow = cs.boxShadow;
          return { node, prev };
        });

        let canvas: HTMLCanvasElement;
        try {
          canvas = await html2canvas(el, { scale: 2, useCORS: true, logging: false });
        } finally {
          saved.forEach(({ node, prev }) => {
            if (node === el) return;
            node.setAttribute("style", prev);
            if (!prev) node.removeAttribute("style");
          });
          el.setAttribute("style", elPrevStyle);
          if (!elPrevStyle) el.removeAttribute("style");
        }

        const link = document.createElement("a");
        link.download = `Invoice-${invoiceNumber}.png`;
        link.href = canvas!.toDataURL("image/png");
        link.click();
        toast.success("Invoice downloaded as PNG.");
      }
    } catch (error: unknown) {
      toast.error(
        `Download failed: ${error instanceof Error ? error.message : "Check console"}`,
      );
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
    setItems((current) => [
      ...current,
      { id: Date.now(), product: "", quantity: 1, unitPrice: 0 },
    ]);
  };

  const removeRow = (id: number) => {
    setItems((current) =>
      current.length === 1 ? current : current.filter((item) => item.id !== id),
    );
  };

  const handleSelectInvoice = async (inv: StoredInvoiceRow) => {
    setEditingInvoiceId(inv.id);
    setInvoiceNumber(inv.invoice_number || "");
    setClientName(inv.client_name || "");
    setClientEmail(inv.client_email || "");
    setBillingAddress(inv.billing_address || "");
    setIssueDate(inv.issue_date || toDateInputValue(today));
    setDueDate(inv.due_date || toDateInputValue(defaultDueDate));
    setPaymentStatus(inv.payment_status || "Pending");
    setCurrency(inv.currency || defaultCurrency);
    setCompanyName(inv.company_name || companyName);
    setCompanyAddress(inv.company_address || companyAddress);
    setDiscount(inv.discount || 0);
    setTaxRate(inv.tax_rate || 0);
    setNotes(inv.notes || "");

    const { data: itemsData } = await supabase
      .from("envoiz_invoice_items")
      .select("*")
      .eq("invoice_id", inv.id);

    if (itemsData && itemsData.length > 0) {
      setItems(
        itemsData.map((item: StoredInvoiceItemRow) => ({
          id: Math.random(),
          product: item.product,
          quantity: item.quantity,
          unitPrice: item.unit_price,
        })),
      );
    } else {
      setItems([{ id: 1, product: "", quantity: 1, unitPrice: 0 }]);
    }

    setIsFormOpen(true);
    setShowMobilePreview(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (!isFormOpen) {
    return (
      <DashboardPage
        eyebrow="Invoices"
        title="Your invoices"
        description="Create, manage, and track all your invoices in one place."
        actions={
          <button
            onClick={openNewForm}
            className="inline-flex items-center gap-2 rounded-full bg-foreground px-4 py-2 text-[13px] font-medium text-background transition-colors hover:opacity-90"
          >
            <Plus className="h-3.5 w-3.5" /> New Invoice
          </button>
        }
      >
        <Panel>
          <div className="mb-5 flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by client or invoice #..."
                className="h-10 w-full rounded-2xl border border-hairline bg-white pl-9 pr-4 text-[13px] outline-none transition focus:border-foreground/20"
              />
            </div>
            <div className="flex items-center gap-1.5 rounded-2xl border border-hairline bg-white p-1">
              {(["all", "Pending", "Paid", "Overdue"] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  className={cn(
                    "rounded-xl px-3 py-1.5 text-[12px] font-medium transition-colors",
                    statusFilter === s
                      ? "bg-foreground text-background"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {s === "all" ? "All" : s}
                </button>
              ))}
            </div>
          </div>

          {invoiceListQuery.isLoading ? (
            <div className="flex items-center justify-center gap-2 py-16 text-[13px] text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" /> Loading invoices...
            </div>
          ) : filteredInvoices.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-16 text-center">
              <FileText className="h-9 w-9 text-muted-foreground/40" />
              <p className="text-[14px] font-medium">
                {(invoiceListQuery.data ?? []).length === 0
                  ? "No invoices yet."
                  : "No invoices match your filters."}
              </p>
              <p className="text-[13px] text-muted-foreground">
                {(invoiceListQuery.data ?? []).length === 0
                  ? "Create your first one to get started."
                  : "Try a different search or filter."}
              </p>
              {(invoiceListQuery.data ?? []).length === 0 && (
                <button
                  onClick={openNewForm}
                  className="mt-2 inline-flex items-center gap-2 rounded-full bg-foreground px-4 py-2 text-[13px] font-medium text-background hover:opacity-90 transition-colors"
                >
                  <Plus className="h-3.5 w-3.5" /> New Invoice
                </button>
              )}
            </div>
          ) : (
            <div className="overflow-hidden rounded-3xl border border-hairline">
              <div className="hidden sm:grid sm:grid-cols-[auto_1fr_auto_auto_auto_auto] items-center gap-4 bg-surface/70 px-4 py-3 text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
                <span>Invoice #</span>
                <span>Client</span>
                <span>Issue date</span>
                <span>Due date</span>
                <span>Amount</span>
                <span>Status</span>
              </div>
              <div className="divide-y divide-hairline bg-white">
                {filteredInvoices.map((inv) => {
                  const total = computeListTotal(inv);
                  const curr = (inv.currency as CurrencyCode) || "USD";
                  return (
                    <div
                      key={inv.id}
                      className="group flex flex-col gap-3 px-4 py-4 sm:grid sm:grid-cols-[auto_1fr_auto_auto_auto_auto] sm:items-center sm:gap-4 cursor-pointer hover:bg-surface/40 transition-colors"
                    >
                      <div
                        onClick={() => handleSelectInvoice(inv)}
                        className="font-mono text-[12px] font-medium text-muted-foreground"
                      >
                        {inv.invoice_number || "—"}
                      </div>
                      <div
                        onClick={() => handleSelectInvoice(inv)}
                        className="min-w-0"
                      >
                        <div className="truncate text-[14px] font-medium">
                          {inv.client_name || "Unknown"}
                        </div>
                        <div className="text-[12px] text-muted-foreground sm:hidden">
                          {inv.payment_status && (
                            <span
                              className={cn(
                                "inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium",
                                statusColors[inv.payment_status] ?? "bg-secondary text-foreground",
                              )}
                            >
                              {inv.payment_status}
                            </span>
                          )}
                        </div>
                      </div>
                      <div
                        onClick={() => handleSelectInvoice(inv)}
                        className="hidden sm:block text-[12px] text-muted-foreground whitespace-nowrap"
                      >
                        {formatDateShort(inv.issue_date)}
                      </div>
                      <div
                        onClick={() => handleSelectInvoice(inv)}
                        className="hidden sm:block text-[12px] text-muted-foreground whitespace-nowrap"
                      >
                        {formatDateShort(inv.due_date)}
                      </div>
                      <div
                        onClick={() => handleSelectInvoice(inv)}
                        className="text-[13px] font-medium tabular-nums sm:text-right"
                      >
                        {money(total, curr)}
                      </div>
                      <div className="flex items-center justify-between sm:justify-end gap-3">
                        {inv.payment_status && (
                          <span
                            className={cn(
                              "hidden sm:inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-medium",
                              statusColors[inv.payment_status] ?? "bg-secondary text-foreground",
                            )}
                          >
                            {inv.payment_status}
                          </span>
                        )}
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleSelectInvoice(inv)}
                            className="h-8 w-8 inline-flex items-center justify-center rounded-full text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
                            title="Edit"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              openDeleteDialog(
                                inv.id,
                                inv.invoice_number || inv.id,
                                inv.client_name || "Unknown",
                              );
                            }}
                            className="h-8 w-8 inline-flex items-center justify-center rounded-full text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </Panel>

        <DeleteConfirmDialog
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          invoiceNumber={deleteTarget?.invoiceNumber ?? ""}
          clientName={deleteTarget?.clientName ?? ""}
          loading={isSaving}
          onConfirm={handleDeleteConfirm}
        />
      </DashboardPage>
    );
  }

  return (
    <DashboardPage
      eyebrow="Invoices"
      title={editingInvoiceId ? "Edit Invoice" : "New Invoice"}
      description="Invoice items update totals instantly. Tax is applied after discount."
      actions={
        <>
          <button
            onClick={closeForm}
            className="inline-flex items-center gap-2 rounded-full border border-hairline bg-white px-4 py-2 text-[13px] font-medium transition-colors hover:bg-secondary"
          >
            <X className="h-3.5 w-3.5" /> Cancel
          </button>
          <Link
            to="/dashboard/settings"
            className="hidden sm:inline-flex items-center gap-2 rounded-full border border-hairline bg-white px-4 py-2 text-[13px] font-medium transition-colors hover:bg-secondary"
          >
            Settings
          </Link>
          {editingInvoiceId && (
            <button
              onClick={() =>
                openDeleteDialog(
                  editingInvoiceId,
                  invoiceNumber,
                  clientName || "Unknown",
                )
              }
              disabled={isSaving}
              className="hidden sm:inline-flex items-center gap-2 rounded-full bg-destructive/10 px-4 py-2 text-[13px] font-medium text-destructive transition-colors hover:bg-destructive/20 disabled:opacity-50"
            >
              Delete Invoice
            </button>
          )}
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="inline-flex items-center gap-2 rounded-full bg-foreground px-4 py-2 text-[13px] font-medium text-background transition-colors hover:opacity-90 disabled:opacity-50"
          >
            {isSaving ? "Saving..." : editingInvoiceId ? "Update Invoice" : "Save Invoice"}
          </button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2 rounded-full bg-foreground px-4 py-2 text-[13px] font-medium text-background transition-colors hover:opacity-90">
                Download <ArrowRight className="h-4 w-4" />
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
        </>
      }
    >
      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr] xl:gap-8 xl:items-start 2xl:grid-cols-[1.05fr_0.95fr]">
        <div className={cn("min-w-0", showMobilePreview && "hidden xl:block")}>
          <Panel
            title="Invoice Details"
            description="A structured draft area for client details and unlimited line items."
            className="space-y-6 xl:p-7"
          >
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Client Name" value={clientName} onChange={setClientName} placeholder="Nova Studio" />
              <Field label="Client Email" value={clientEmail} onChange={setClientEmail} type="email" placeholder="billing@novastudio.com" />
            </div>

            <Field label="Billing Address" optional value={billingAddress} onChange={setBillingAddress} placeholder="Street, city, state, postal code, country" />

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
                      <option key={option} value={option}>{option}</option>
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
                  <p className="mt-1 text-[12.5px] text-muted-foreground">Add as many products or services as you need.</p>
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
                  <span>Item</span><span>QTY</span><span>Cost</span><span className="text-right">Amount</span><span />
                </div>
                {items.map((item) => {
                  const total = item.quantity * item.unitPrice;
                  return (
                    <div
                      key={item.id}
                      className="grid gap-4 rounded-2xl border border-hairline bg-white p-4 sm:grid-cols-2 sm:gap-x-4 sm:gap-y-3 lg:grid-cols-[minmax(0,2.2fr)_minmax(72px,0.75fr)_minmax(96px,1.05fr)_minmax(96px,1.05fr)_2.75rem] lg:items-center lg:gap-x-4 lg:gap-y-0 xl:grid-cols-2 xl:gap-y-3 2xl:grid-cols-[minmax(0,2.2fr)_minmax(72px,0.75fr)_minmax(96px,1.05fr)_minmax(96px,1.05fr)_2.75rem] 2xl:items-center 2xl:gap-x-4 2xl:gap-y-0"
                    >
                      <div className="min-w-0 sm:col-span-2 lg:col-span-1 xl:col-span-2 2xl:col-span-1">
                        <span className="mb-1.5 block text-[11px] text-muted-foreground lg:hidden xl:block 2xl:hidden">Item</span>
                        <InputField value={item.product} onChange={(value) => updateItem(item.id, "product", value)} placeholder="Consulting session" />
                      </div>
                      <div className="min-w-0">
                        <span className="mb-1.5 block text-[11px] text-muted-foreground lg:hidden xl:block 2xl:hidden">Quantity</span>
                        <InputField value={String(item.quantity)} onChange={(value) => updateItem(item.id, "quantity", value.replace(/[^0-9]/g, ""))} type="number" min={1} placeholder="1" inputMode="numeric" />
                      </div>
                      <div className="min-w-0">
                        <span className="mb-1.5 block text-[11px] text-muted-foreground lg:hidden xl:block 2xl:hidden">Cost</span>
                        <CurrencyField currency={currency} value={item.unitPrice} onChange={(value) => updateItem(item.id, "unitPrice", value)} />
                      </div>
                      <div className="min-w-0">
                        <span className="mb-1.5 block text-[11px] text-muted-foreground lg:hidden xl:block 2xl:hidden">Amount</span>
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
                <CurrencyField currency={currency} value={discount} onChange={setDiscount} wrapperClassName="mt-1.5" />
              </div>
              <div className="min-w-0">
                <label className="text-[12px] text-muted-foreground">
                  Tax Rate <span className="text-muted-foreground/60">(%)</span>
                </label>
                <div className="relative mt-1.5 flex h-11 min-w-0 items-center rounded-2xl border border-hairline bg-white pl-3 pr-2 transition focus-within:border-foreground/20">
                  <input
                    type="number"
                    min={0}
                    max={100}
                    step="0.01"
                    value={taxRate || ""}
                    onChange={(e) => setTaxRate(Number(e.target.value) || 0)}
                    placeholder="0"
                    className="h-full w-full min-w-0 bg-transparent px-2 text-right text-[14px] outline-none placeholder:text-muted-foreground/60"
                  />
                  <span className="text-[12px] font-medium text-muted-foreground pr-1">%</span>
                </div>
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
                      <option key={option.code} value={option.code}>{option.code} - {option.label}</option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
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
              <span className="rounded-full bg-white px-3 py-1 font-medium text-foreground">{invoiceNumber}</span>
              <span>{currency}</span>
              {safeTaxRate > 0 && <span>{safeTaxRate}% tax</span>}
              {safeDiscount > 0 && <span>{money(safeDiscount, currency)} discount</span>}
            </div>

            <button
              onClick={() => setShowMobilePreview(true)}
              className="xl:hidden w-full inline-flex items-center justify-center gap-2 rounded-full border border-hairline bg-white px-4 py-2.5 text-[13px] font-medium transition-colors hover:bg-secondary"
            >
              <Eye className="h-3.5 w-3.5" /> Preview Invoice
            </button>
          </Panel>
        </div>

        <div className={cn("space-y-4 min-w-0", !showMobilePreview && "hidden xl:block")}>
          {showMobilePreview && (
            <button
              onClick={() => setShowMobilePreview(false)}
              className="xl:hidden w-full inline-flex items-center justify-center gap-2 rounded-full border border-hairline bg-white px-4 py-2.5 text-[13px] font-medium transition-colors hover:bg-secondary"
            >
              ← Back to form
            </button>
          )}
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
                  <h3 className="text-[22px] font-semibold tracking-[-0.04em] sm:text-[26px]">{companyName || "Your Company"}</h3>
                  <p className="mt-2 text-[13px] leading-relaxed text-muted-foreground">{companyAddress}</p>
                </div>
                <div className="sm:text-right">
                  <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">Invoice</p>
                  <span className="mt-2 inline-flex rounded-full border border-hairline px-3 py-1 text-[13px] font-medium tabular-nums">{invoiceNumber}</span>
                  <div className="mt-3 flex items-center gap-2 sm:justify-end">
                    <span className="text-[12px] text-muted-foreground">Issued {formatDateLabel(issueDate)}</span>
                    <PaymentStatusPill status={paymentStatus} />
                  </div>
                </div>
              </div>

              <div className="mt-6 overflow-hidden rounded-2xl border border-hairline">
                <div className="grid grid-cols-1 divide-y divide-hairline sm:grid-cols-2 sm:divide-x sm:divide-y-0">
                  <div className="p-5">
                    <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Billed to</p>
                    <div className="mt-2 text-[14px] font-medium">{clientName || "Client name"}</div>
                    {clientEmail && <div className="mt-1 text-[13px] text-muted-foreground">{clientEmail}</div>}
                  </div>
                  <div className="p-5">
                    <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Due date</p>
                    <div className="mt-2 text-[14px] font-medium">{formatDateLabel(dueDate)}</div>
                  </div>
                </div>
                {billingAddress && (
                  <div className="border-t border-hairline p-5">
                    <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Address</p>
                    <div className="mt-2 text-[13px] leading-relaxed text-muted-foreground">{billingAddress}</div>
                  </div>
                )}
              </div>

              <div className="py-6">
                <div className="overflow-hidden rounded-2xl border border-hairline">
                  <div className="flex items-center justify-between gap-4 bg-surface/70 px-5 py-3.5 text-[10.5px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
                    <span>Item</span><span>Amount</span>
                  </div>
                  <div className="divide-y divide-hairline">
                    {items.map((item) => {
                      const total = item.quantity * item.unitPrice;
                      return (
                        <div key={item.id} className="flex items-start justify-between gap-4 px-5 py-4 text-[13px]">
                          <div className="min-w-0 flex-1">
                            <p className="font-medium break-words">{item.product || "Item"}</p>
                            <p className="mt-1 break-words text-[12px] text-muted-foreground tabular-nums">
                              {item.quantity} × {money(item.unitPrice, currency)}
                            </p>
                          </div>
                          <span className="shrink-0 text-right font-medium tabular-nums">{money(total, currency)}</span>
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
                    <span className="font-medium text-foreground tabular-nums">{money(subtotal, currency)}</span>
                  </div>
                  {safeDiscount > 0 && (
                    <div className="flex items-center justify-between px-1 text-[13px] text-muted-foreground">
                      <span>Discount</span>
                      <span className="font-medium text-foreground tabular-nums">-{money(safeDiscount, currency)}</span>
                    </div>
                  )}
                  {safeTaxRate > 0 && (
                    <div className="flex items-center justify-between px-1 text-[13px] text-muted-foreground">
                      <span>Tax ({safeTaxRate}%)</span>
                      <span className="font-medium text-foreground tabular-nums">+{money(taxAmount, currency)}</span>
                    </div>
                  )}
                  <div className="flex items-baseline justify-between border-t border-hairline px-1 pt-3">
                    <span className="text-[13px] font-medium text-muted-foreground">Total</span>
                    <span className="text-[22px] font-semibold tracking-[-0.02em] tabular-nums">{money(grandTotal, currency)}</span>
                  </div>
                </div>
              </div>

              {notes && (
                <div className="mt-6 border-t border-hairline pt-6">
                  <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Notes</p>
                  <p className="mt-2 text-[13px] leading-relaxed text-muted-foreground">{notes}</p>
                </div>
              )}

              <div className="mt-12 flex justify-center pb-2">
                <p className="text-[11px] text-muted-foreground/60 tracking-widest uppercase">
                  Powered by <span className="font-semibold text-foreground/50 tracking-normal">Envoiz</span>
                </p>
              </div>
            </div>
          </Panel>
        </div>
      </div>

      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        invoiceNumber={deleteTarget?.invoiceNumber ?? ""}
        clientName={deleteTarget?.clientName ?? ""}
        loading={isSaving}
        onConfirm={handleDeleteConfirm}
      />

      <InvoiceSuccessDialog
        open={showSuccess}
        onOpenChange={setShowSuccess}
        invoiceNumber={savedInvoiceNumber}
        isUpdate={wasUpdate}
      />
    </DashboardPage>
  );
}

function DeleteConfirmDialog({
  open,
  onOpenChange,
  invoiceNumber,
  clientName,
  loading,
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  invoiceNumber: string;
  clientName: string;
  loading: boolean;
  onConfirm: () => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md gap-0 border-hairline p-0 overflow-hidden">
        <div className="border-b border-hairline bg-destructive/5 px-6 py-5">
          <DialogTitle className="text-[17px] font-semibold">Delete Invoice</DialogTitle>
          <DialogDescription className="mt-1.5 text-[13px] text-muted-foreground">
            This will permanently delete invoice{" "}
            <span className="font-mono font-medium text-foreground">#{invoiceNumber}</span> for{" "}
            <span className="font-medium text-foreground">{clientName}</span>. This action cannot
            be undone.
          </DialogDescription>
        </div>
        <div className="flex justify-end gap-3 p-5">
          <button
            onClick={() => onOpenChange(false)}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-full border border-hairline bg-white px-4 py-2 text-[13px] font-medium transition-colors hover:bg-secondary disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-full bg-destructive px-4 py-2 text-[13px] font-medium text-white transition-colors hover:bg-destructive/90 disabled:opacity-50"
          >
            {loading ? "Deleting..." : "Delete"}
          </button>
        </div>
      </DialogContent>
    </Dialog>
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
