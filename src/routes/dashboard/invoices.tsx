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
  Lock,
  Pencil,
  Plus,
  Search,
  Trash2,
  ArrowRight,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { toPng } from "html-to-image";
import { pdf } from "@react-pdf/renderer";
import { createRoot } from "react-dom/client";
import InvoiceTemplate from "@/components/InvoiceTemplate";
import InvoiceTemplate2 from "@/components/InvoiceTemplate2";
import { InvoicePDFDocument } from "@/components/envoiz/InvoicePDFDocument";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { checkInvoiceLimit, checkIsPro } from "@/lib/invoices";
import { UpgradeModal } from "@/components/envoiz/UpgradeModal";

import { DashboardPage, Panel } from "@/components/envoiz/DashboardUI";
import { InvoiceSuccessDialog } from "@/components/envoiz/InvoiceSuccessDialog";
import { SendInvoiceDialog } from "@/components/envoiz/SendInvoiceDialog";
import { useAuth } from "@/components/auth/auth-context";
import { supabase } from "@/lib/supabase";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import {
  brandName,
  currencyOptions,
  defaultCurrency,
  defaultInvoiceTemplate,
  formatInvoiceNumber,
  readUserStorageValue,
  proInvoiceTemplate,
  normalizeInvoiceTemplate,
  settingsStorageKeys,
  writeUserStorageValue,
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
        const r = data[i], g = data[i + 1], b = data[i + 2];
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

function getScrollContainer() {
  return document.getElementById("dashboard-scroll");
}

function scrollToTop() {
  getScrollContainer()?.scrollTo({ top: 0, behavior: "smooth" });
}

function scrollToInvoiceList() {
  const container = getScrollContainer();
  const el = document.getElementById("invoice-list");
  if (!container || !el) return;
  const offset =
    el.getBoundingClientRect().top - container.getBoundingClientRect().top + container.scrollTop;
  container.scrollTo({ top: offset - 24, behavior: "smooth" });
}

function InvoicesPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const isPro = checkIsPro(user);

  const [isFormOpen, setIsFormOpen] = useState(true);
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

  const [sendDialogOpen, setSendDialogOpen] = useState(false);
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);

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
  const [recurringFrequency, setRecurringFrequency] = useState<
    "none" | "weekly" | "monthly" | "yearly"
  >("none");
  const [autoReminders, setAutoReminders] = useState(false);
  const [brandLogo, setBrandLogo] = useState("");
  const [paymentInstructions, setPaymentInstructions] = useState("");

  useEffect(() => {
    setCurrency(
      readUserStorageValue(
        user?.id,
        settingsStorageKeys.defaultCurrency,
        defaultCurrency,
      ) as CurrencyCode,
    );
    const savedName =
      user?.user_metadata?.company_name ||
      readUserStorageValue(user?.id, settingsStorageKeys.companyName, "");
    const savedAddress =
      user?.user_metadata?.company_address ||
      readUserStorageValue(user?.id, settingsStorageKeys.companyAddress, "");
    setCompanyName(savedName);
    setCompanyAddress(savedAddress);

    if (user?.id) {
      setBrandLogo(readUserStorageValue(user.id, settingsStorageKeys.brandLogo, ""));
      setPaymentInstructions(
        readUserStorageValue(user.id, settingsStorageKeys.paymentInstructions, ""),
      );
      setAutoReminders(
        readUserStorageValue(user.id, settingsStorageKeys.autoReminders, "false") === "true",
      );
    }
  }, [isPro, user?.id, user?.user_metadata?.company_name, user?.user_metadata?.company_address]);

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

  useEffect(() => {
    const target = sessionStorage.getItem("envoiz-scroll-to");
    if (target === "invoice-list") {
      sessionStorage.removeItem("envoiz-scroll-to");
      setTimeout(() => scrollToInvoiceList(), 400);
    }
  }, []);

  useEffect(() => {
    const pending = localStorage.getItem("envoiz_pending_invoice");
    if (pending) {
      try {
        const parsed = JSON.parse(pending);
        if (parsed.clientName) setClientName(parsed.clientName);
        if (parsed.clientEmail) setClientEmail(parsed.clientEmail);
        if (parsed.issueDate) setIssueDate(parsed.issueDate);
        if (parsed.dueDate) setDueDate(parsed.dueDate);
        if (parsed.currency) setCurrency(parsed.currency);
        if (parsed.taxRate) setTaxRate(parsed.taxRate);
        if (parsed.discountRate) setDiscount(parsed.discountRate);

        if (parsed.items && Array.isArray(parsed.items)) {
          setItems(
            parsed.items.map(
              (item: { description?: string; quantity?: number; rate?: number }) => ({
                id: Math.random(),
                product: item.description || "",
                quantity: item.quantity || 1,
                unitPrice: item.rate || 0,
              }),
            ),
          );
        }

        setIsFormOpen(true);
      } catch (err) {
        console.error("Failed to parse pending invoice", err);
      } finally {
        localStorage.removeItem("envoiz_pending_invoice");
      }
    }
  }, []);

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
      const matchStatus = statusFilter === "all" || inv.payment_status === statusFilter;
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
      const { error } = await supabase.from("envoiz_invoices").delete().eq("id", deleteTarget.id);
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
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : typeof error === "object" && error !== null && "message" in error
            ? String((error as { message?: unknown }).message ?? "Unknown error")
            : "Unknown error";
      toast.error(
        `Failed to delete invoice: ${message || "Make sure DELETE permissions are set in Supabase RLS policies."}`,
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleSave = async () => {
    if (!clientName.trim()) {
      toast.error("Client name is required.");
      return;
    }
    if (!clientEmail.trim()) {
      toast.error("Client email is required.");
      return;
    }
    if (!clientEmail.includes("@")) {
      toast.error("Please enter a valid email address.");
      return;
    }
    const hasNamedItem = items.some((item) => item.product.trim() !== "");
    if (!hasNamedItem) {
      toast.error("Add at least one line item with a name.");
      return;
    }
    if (!user) {
      toast.error("You must be logged in to save an invoice.");
      return;
    }

    if (!editingInvoiceId) {
      const isPro = checkIsPro(user);
      const limitReached = await checkInvoiceLimit(user.id, isPro);
      if (limitReached) {
        setIsUpgradeModalOpen(true);
        return;
      }
    }

    setIsSaving(true);

    const buildPayload = (withTaxRate: boolean) => ({
      invoice_number: invoiceNumber,
      client_name: clientName,
      client_email: clientEmail,
      billing_address: billingAddress,
      issue_date: issueDate,
      due_date: dueDate,
      payment_status: paymentStatus,
      currency,
      discount,
      ...(withTaxRate ? { tax_rate: taxRate } : {}),
      notes,
      company_name: companyName,
      company_address: companyAddress,
    });

    const isMissingColumn = (err: unknown) =>
      err instanceof Error && err.message.toLowerCase().includes("tax_rate");

    try {
      let invoiceData;
      if (editingInvoiceId) {
        let result = await supabase
          .from("envoiz_invoices")
          .update(buildPayload(true))
          .eq("id", editingInvoiceId)
          .select()
          .single();

        if (result.error && isMissingColumn(result.error)) {
          result = await supabase
            .from("envoiz_invoices")
            .update(buildPayload(false))
            .eq("id", editingInvoiceId)
            .select()
            .single();
        }

        if (result.error) throw result.error;
        invoiceData = result.data;

        const { error: deleteError } = await supabase
          .from("envoiz_invoice_items")
          .delete()
          .eq("invoice_id", editingInvoiceId);
        if (deleteError) {
          throw new Error("Could not update invoice items. Check DELETE permissions in Supabase.");
        }
      } else {
        let result = await supabase
          .from("envoiz_invoices")
          .insert({ user_id: user.id, ...buildPayload(true) })
          .select()
          .single();

        if (result.error && isMissingColumn(result.error)) {
          result = await supabase
            .from("envoiz_invoices")
            .insert({ user_id: user.id, ...buildPayload(false) })
            .select()
            .single();
        }

        if (result.error) throw result.error;
        invoiceData = result.data;
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
      setSendDialogOpen(true);
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : typeof error === "object" && error !== null && "message" in error
            ? String((error as { message?: unknown }).message ?? "Unknown error")
            : "Unknown error";
      toast.error(`Failed to save: ${message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const getExportInvoiceData = (): InvoiceExportData => ({
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
    taxRate: safeTaxRate,
    isPro,
    brandLogo: readUserStorageValue(user?.id, settingsStorageKeys.brandLogo, brandLogo),
    invoiceTemplate: normalizeInvoiceTemplate(
      readUserStorageValue(
        user?.id,
        settingsStorageKeys.invoiceTemplate,
        defaultInvoiceTemplate(isPro),
      ),
    ),
    contactEmail: "HELLO@REALLYGREATSITE.COM",
    contactPhone: "+123-456-7890",
    paymentInstructions: readUserStorageValue(
      user?.id,
      settingsStorageKeys.paymentInstructions,
      paymentInstructions,
    ),
  });

  const handleDownload = async (format: "pdf" | "png") => {
    if (!captureRef.current) return;

    try {
      if (format === "pdf") {
        const invoiceData = getExportInvoiceData();

        // Strip white background from logo before PDF rendering
        if (invoiceData.brandLogo) {
          invoiceData.brandLogo = await removeWhiteBackground(invoiceData.brandLogo);
        }

        const blob = await pdf(<InvoicePDFDocument invoice={invoiceData} />).toBlob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `Invoice-${invoiceNumber}.pdf`;
        a.click();
        URL.revokeObjectURL(url);
        toast.success("Invoice downloaded as PDF.");
      } else {
        // Build an off-screen A4-sized invoice matching the PDF template exactly.
        // Uses only explicit inline styles — no CSS variables, no Tailwind classes —
        // so html-to-image captures it correctly every time.
        const PAGE_W = 595; // A4 points width, matches @react-pdf A4

        const container = document.createElement("div");
        container.style.cssText = [
          "position:fixed",
          "top:0",
          "left:0",
          "width:" + PAGE_W + "px",
          "background:#efe7d8",
          "z-index:-1",
          "pointer-events:none",
          "transform:translateX(-200vw)",
        ].join(";");
        document.body.appendChild(container);

        const fmt = (n: number) =>
          new Intl.NumberFormat("en-US", {
            style: "currency",
            currency,
            maximumFractionDigits: 2,
          }).format(n || 0);

        const fmtDate = (v: string) => {
          if (!v) return "—";
          const d = new Date(`${v}T00:00:00`);
          return isNaN(d.getTime())
            ? "—"
            : d.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
        };

        // Status pill colors match InvoicePDFDocument
        const statusStyle: Record<string, string> = {
          Paid: "background:#dcfce7;color:#15803d;",
          Overdue: "background:#fee2e2;color:#b91c1c;",
          Pending: "background:#f1f1f1;color:#525252;",
        };
        const pillStyle = statusStyle[paymentStatus] ?? statusStyle.Pending;

        const invoiceData = getExportInvoiceData();
        if (invoiceData.invoiceTemplate === proInvoiceTemplate) {
          const templateRoot = createRoot(container);
          const templateData = {
            invoiceNumber: invoiceData.invoiceNumber,
            issueDate: new Date(`${invoiceData.issueDate}T00:00:00`)
              .toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
              })
              .toUpperCase(),
            dueDate: new Date(`${invoiceData.dueDate}T00:00:00`)
              .toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
              })
              .toUpperCase(),
            companyName: invoiceData.companyName || "Your Company",
            brandLogo: invoiceData.brandLogo,
            companyAddressLines: (invoiceData.companyAddress || "")
              .split(/\r?\n/)
              .map((line) => line.trim())
              .filter(Boolean),
            billTo: {
              name: invoiceData.clientName || "Client Name",
              address: invoiceData.billingAddress || "",
              phone: "",
            },
            items: invoiceData.items.map((item) => ({
              description: item.product || "Item",
              qty: String(item.quantity).padStart(2, "0"),
              price: money(item.unitPrice, invoiceData.currency),
              subtotal: money(item.quantity * item.unitPrice, invoiceData.currency),
            })),
            emptyRowCount: Math.max(0, 4 - invoiceData.items.length),
            taxLabel: "TAX",
            tax: money(
              (invoiceData.subtotal - Math.min(invoiceData.discount, invoiceData.subtotal)) *
                (invoiceData.taxRate / 100),
              invoiceData.currency,
            ),
            grandTotal: money(invoiceData.grandTotal, invoiceData.currency),
            notes: invoiceData.notes || " ",
            contactEmail: invoiceData.contactEmail || "HELLO@REALLYGREATSITE.COM",
            contactPhone: invoiceData.contactPhone || "+123-456-7890",
            signerName: invoiceData.companyName || " ",
            signerTitle: "GENERAL MANAGER",
          };
          if (invoiceData.paymentInstructions) {
            const paymentLines = invoiceData.paymentInstructions
              .split(/\r?\n/)
              .map((line) => line.trim())
              .filter(Boolean);
            if (paymentLines.length > 0) {
              (
                templateData as typeof templateData & {
                  paymentMethod?: { bankName?: string; accountName?: string; phone?: string };
                }
              ).paymentMethod = {
                bankName: paymentLines[0] || "",
                accountName: paymentLines[1] || "",
                phone: paymentLines[2] || "",
              };
            }
          }
          templateRoot.render(<InvoiceTemplate data={templateData} exportMode />);
          await new Promise((resolve) =>
            requestAnimationFrame(() => requestAnimationFrame(resolve)),
          );
          try {
            const dataUrl = await toPng(container.firstElementChild as HTMLElement, {
              pixelRatio: 2,
              cacheBust: true,
              backgroundColor: "#efe7d8",
            });
            const link = document.createElement("a");
            link.download = `Invoice-${invoiceNumber}.png`;
            link.href = dataUrl;
            link.click();
            toast.success("Invoice downloaded as PNG.");
          } finally {
            templateRoot.unmount();
            document.body.removeChild(container);
          }
          return;
        } else if (invoiceData.invoiceTemplate === "Template 2") {
          container.style.background = "#0a0a0a";
          const templateRoot = createRoot(container);
          const templateData = {
            invoiceNumber: invoiceData.invoiceNumber,
            issueDate: new Date(`${invoiceData.issueDate}T00:00:00`)
              .toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
              })
              .toUpperCase(),
            dueDate: new Date(`${invoiceData.dueDate}T00:00:00`)
              .toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
              })
              .toUpperCase(),
            companyName: invoiceData.companyName || "Your Company",
            brandLogo: invoiceData.brandLogo,
            companyAddressLines: (invoiceData.companyAddress || "")
              .split(/\r?\n/)
              .map((line) => line.trim())
              .filter(Boolean),
            billTo: {
              name: invoiceData.clientName || "Client Name",
              address: invoiceData.billingAddress || "",
              phone: "",
            },
            items: invoiceData.items.map((item) => ({
              description: item.product || "Item",
              qty: String(item.quantity).padStart(2, "0"),
              price: money(item.unitPrice, invoiceData.currency),
              subtotal: money(item.quantity * item.unitPrice, invoiceData.currency),
            })),
            emptyRowCount: Math.max(0, 4 - invoiceData.items.length),
            taxLabel: "TAX",
            tax: money(
              (invoiceData.subtotal - Math.min(invoiceData.discount, invoiceData.subtotal)) *
                (invoiceData.taxRate / 100),
              invoiceData.currency,
            ),
            grandTotal: money(invoiceData.grandTotal, invoiceData.currency),
            notes: invoiceData.notes || "",
            contactEmail: invoiceData.clientEmail || "",
            contactPhone: invoiceData.contactPhone || "",
            signerName: invoiceData.companyName || "",
            signerTitle: "GENERAL MANAGER",
            paymentStatus: invoiceData.paymentStatus || "",
            currency: invoiceData.currency || "USD",
          };
          if (invoiceData.paymentInstructions) {
            const paymentLines = invoiceData.paymentInstructions
              .split(/\r?\n/)
              .map((line) => line.trim())
              .filter(Boolean);
            if (paymentLines.length > 0) {
              (
                templateData as typeof templateData & {
                  paymentMethod?: { bankName?: string; accountName?: string; phone?: string };
                }
              ).paymentMethod = {
                bankName: paymentLines[0] || "",
                accountName: paymentLines[1] || "",
                phone: paymentLines[2] || "",
              };
            }
          }
          templateRoot.render(<InvoiceTemplate2 data={templateData} exportMode />);
          await new Promise((resolve) =>
            requestAnimationFrame(() => requestAnimationFrame(resolve)),
          );
          try {
            const dataUrl = await toPng(container.firstElementChild as HTMLElement, {
              pixelRatio: 2,
              cacheBust: true,
              backgroundColor: "#0a0a0a",
            });
            const link = document.createElement("a");
            link.download = `Invoice-${invoiceNumber}.png`;
            link.href = dataUrl;
            link.click();
            toast.success("Invoice downloaded as PNG.");
          } finally {
            templateRoot.unmount();
            document.body.removeChild(container);
          }
          return;
        }

        const itemRowsHtml = items
          .map(
            (item) => `
            <tr>
              <td style="padding:16px 20px;border-top:1pt solid #efefef;vertical-align:top;">
                <div style="font-size:10px;font-weight:bold;color:#000000;">${item.product || "Item"}</div>
                <div style="font-size:9px;color:#737373;margin-top:4px;">${item.quantity} x ${fmt(item.unitPrice)}</div>
              </td>
              <td style="padding:16px 20px;border-top:1pt solid #efefef;text-align:right;vertical-align:top;">
                <span style="font-size:10px;font-weight:bold;color:#000000;">${fmt(item.quantity * item.unitPrice)}</span>
              </td>
            </tr>`,
          )
          .join("");

        const discountRowHtml =
          safeDiscount > 0
            ? `<tr>
                <td style="padding:5px 4px;font-size:10px;color:#737373;">Discount</td>
                <td style="padding:5px 4px;font-size:10px;font-weight:bold;text-align:right;">-${fmt(safeDiscount)}</td>
               </tr>`
            : "";

        const taxRowHtml =
          safeTaxRate > 0
            ? `<tr>
                <td style="padding:5px 4px;font-size:10px;color:#737373;">Tax (${safeTaxRate}%)</td>
                <td style="padding:5px 4px;font-size:10px;font-weight:bold;text-align:right;">+${fmt(taxAmount)}</td>
               </tr>`
            : "";

        const notesHtml = notes
          ? `<div style="border-top:1pt solid #efefef;padding-top:24px;margin-top:0;">
               <div style="font-size:8.5px;text-transform:uppercase;color:#737373;letter-spacing:1.5px;margin-bottom:8px;">Notes</div>
               <div style="font-size:10px;color:#737373;line-height:1.4;white-space:pre-line;">${notes}</div>
             </div>`
          : "";

        const billingAddressHtml = billingAddress
          ? `<tr>
              <td colspan="2" style="padding:20px;border-top:1pt solid #efefef;">
                <div style="font-size:8.5px;text-transform:uppercase;color:#737373;letter-spacing:1.5px;margin-bottom:8px;">Address</div>
                <div style="font-size:10px;color:#737373;line-height:1.4;white-space:pre-line;">${billingAddress}</div>
              </td>
             </tr>`
          : "";

        container.innerHTML = `
          <div style="
            font-family:Helvetica,Arial,sans-serif;
            font-size:10px;
            color:#000000;
            background:#ffffff;
            width:${PAGE_W}px;
            padding:40px;
            box-sizing:border-box;
          ">

            <!-- Header row -->
            <div style="display:flex;justify-content:space-between;align-items:flex-start;border-bottom:1pt solid #efefef;padding-bottom:24px;margin-bottom:24px;">
              <div style="max-width:240px;">
                <div style="font-size:20px;font-weight:bold;margin-bottom:8px;">${companyName || "Your Company"}</div>
                <div style="font-size:10px;color:#737373;line-height:1.4;white-space:pre-line;">${companyAddress || ""}</div>
              </div>
              <div style="text-align:right;">
                <div style="font-size:8.5px;text-transform:uppercase;color:#737373;letter-spacing:1.5px;">Invoice</div>
                <div style="margin-top:8px;border:1pt solid #efefef;border-radius:12px;padding:4px 8px;font-size:10px;font-weight:bold;display:inline-block;">${invoiceNumber}</div>
                <div style="margin-top:12px;display:flex;align-items:center;justify-content:flex-end;gap:8px;">
                  <span style="font-size:9px;color:#737373;">Issued ${fmtDate(issueDate)}</span>
                  <span style="border-radius:999px;padding:3px 8px;font-size:8.5px;font-weight:bold;${pillStyle}">${paymentStatus || "Pending"}</span>
                </div>
              </div>
            </div>

            <!-- Billed to / Due date grid -->
            <div style="border:1pt solid #efefef;border-radius:16px;margin-bottom:24px;overflow:hidden;">
              <table style="width:100%;border-collapse:collapse;">
                <tr>
                  <td style="padding:20px;border-right:1pt solid #efefef;vertical-align:top;width:50%;">
                    <div style="font-size:8.5px;text-transform:uppercase;color:#737373;letter-spacing:1.5px;margin-bottom:8px;">Billed to</div>
                    <div style="font-size:11px;font-weight:bold;">${clientName || "Client name"}</div>
                    ${clientEmail ? `<div style="font-size:10px;color:#737373;margin-top:4px;">${clientEmail}</div>` : ""}
                  </td>
                  <td style="padding:20px;vertical-align:top;width:50%;">
                    <div style="font-size:8.5px;text-transform:uppercase;color:#737373;letter-spacing:1.5px;margin-bottom:8px;">Due date</div>
                    <div style="font-size:11px;font-weight:bold;">${fmtDate(dueDate)}</div>
                  </td>
                </tr>
                ${billingAddressHtml}
              </table>
            </div>

            <!-- Items table -->
            <div style="border:1pt solid #efefef;border-radius:16px;margin-bottom:24px;overflow:hidden;">
              <table style="width:100%;border-collapse:collapse;">
                <thead>
                  <tr style="background:#f9f9f9;">
                    <th style="padding:12px 20px;font-size:8px;text-transform:uppercase;color:#737373;letter-spacing:1px;font-weight:bold;text-align:left;">Item</th>
                    <th style="padding:12px 20px;font-size:8px;text-transform:uppercase;color:#737373;letter-spacing:1px;font-weight:bold;text-align:right;">Amount</th>
                  </tr>
                </thead>
                <tbody>${itemRowsHtml}</tbody>
              </table>
            </div>

            <!-- Totals -->
            <div style="display:flex;justify-content:flex-end;margin-bottom:24px;">
              <div style="width:220px;">
                <table style="width:100%;border-collapse:collapse;">
                  <tr>
                    <td style="padding:5px 4px;font-size:10px;color:#737373;">Subtotal</td>
                    <td style="padding:5px 4px;font-size:10px;font-weight:bold;text-align:right;">${fmt(subtotal)}</td>
                  </tr>
                  ${discountRowHtml}
                  ${taxRowHtml}
                </table>
                <div style="display:flex;justify-content:space-between;align-items:baseline;border-top:1pt solid #efefef;padding-top:12px;margin-top:2px;padding-left:4px;padding-right:4px;">
                  <span style="font-size:10px;font-weight:bold;color:#737373;">Total</span>
                  <span style="font-size:16px;font-weight:bold;">${fmt(grandTotal)}</span>
                </div>
              </div>
            </div>

            <!-- Notes -->
            ${notesHtml}

            <!-- Watermark -->
            ${
              !isPro
                ? `
            <div style="margin-top:48px;text-align:center;">
              <span style="font-size:8.5px;color:#a3a3a3;text-transform:uppercase;letter-spacing:1.5px;">
                Powered by <span style="color:#737373;font-weight:bold;">Envoiz</span>
              </span>
            </div>`
                : ""
            }

          </div>`;

        try {
          const dataUrl = await toPng(container.firstElementChild as HTMLElement, {
            pixelRatio: 2,
            cacheBust: true,
            backgroundColor: "#ffffff",
          });
          const link = document.createElement("a");
          link.download = `Invoice-${invoiceNumber}.png`;
          link.href = dataUrl;
          link.click();
          toast.success("Invoice downloaded as PNG.");
        } finally {
          document.body.removeChild(container);
        }
      }
    } catch (error: unknown) {
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
    scrollToTop();
  };

  const generatePdfBase64 = async (): Promise<string | null> => {
    try {
      const invoiceData = getExportInvoiceData();
      const blob = await pdf(<InvoicePDFDocument invoice={invoiceData} />).toBlob();
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(blob);
      });
    } catch (e) {
      console.error(e);
      return null;
    }
  };

  return (
    <DashboardPage
      eyebrow="Invoices"
      title={editingInvoiceId ? "Edit Invoice" : "New Invoice"}
      description="Invoice items update totals instantly. Tax is applied after discount."
      actions={
        <>
          <button
            onClick={scrollToInvoiceList}
            className="inline-flex items-center gap-2 rounded-full border border-[#2a2a2a] bg-[#141414] text-white px-4 py-2 text-[13px] font-medium transition-colors hover:bg-[#1f1f1f]"
          >
            <FileText className="h-3.5 w-3.5" /> View all invoices
          </button>
          {editingInvoiceId && (
            <button
              onClick={() =>
                openDeleteDialog(editingInvoiceId, invoiceNumber, clientName || "Unknown")
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
            {isSaving ? "Saving..." : editingInvoiceId ? "Update & Send" : "Save & Send"}
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
                <label className="text-[12px] text-neutral-400">Payment Status</label>
                <div className="relative mt-1.5">
                  <select
                    value={paymentStatus}
                    onChange={(event) => setPaymentStatus(event.target.value as PaymentStatus)}
                    className="h-11 w-full appearance-none rounded-2xl border border-hairline bg-[#0d0d0d] text-white pl-3 pr-10 text-[14px] outline-none transition focus:border-foreground/20"
                  >
                    {paymentStatusOptions.map((option) => (
                      <option key={option} value={option} className="bg-[#0d0d0d] text-white">
                        {option}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500" />
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-hairline bg-[#121212] p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="min-w-0">
                  <h3 className="text-[14px] font-medium text-white">Items Details</h3>
                  <p className="mt-1 text-[12.5px] text-neutral-400">
                    Add as many products or services as you need.
                  </p>
                </div>
                <button
                  onClick={addRow}
                  className="inline-flex shrink-0 items-center gap-2 rounded-full bg-[#2a2a2a] px-3 py-2 text-[12px] font-medium text-white transition-colors hover:bg-[#333]"
                >
                  <Plus className="h-3.5 w-3.5" /> Add Item
                </button>
              </div>

              <div className="mt-5 space-y-3">
                <div className="hidden gap-x-4 gap-y-2 rounded-2xl bg-[#050505] px-4 py-3 text-[12px] uppercase tracking-[0.16em] text-neutral-400 lg:grid lg:grid-cols-[minmax(0,2.2fr)_minmax(72px,0.75fr)_minmax(96px,1.05fr)_minmax(96px,1.05fr)_2.75rem] lg:items-center xl:hidden 2xl:grid">
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
                      className="grid gap-4 rounded-2xl border border-hairline bg-[#0d0d0d] p-4 sm:grid-cols-2 sm:gap-x-4 sm:gap-y-3 lg:grid-cols-[minmax(0,2.2fr)_minmax(72px,0.75fr)_minmax(96px,1.05fr)_minmax(96px,1.05fr)_2.75rem] lg:items-center lg:gap-x-4 lg:gap-y-0 xl:grid-cols-2 xl:gap-y-3 2xl:grid-cols-[minmax(0,2.2fr)_minmax(72px,0.75fr)_minmax(96px,1.05fr)_minmax(96px,1.05fr)_2.75rem] 2xl:items-center 2xl:gap-x-4 2xl:gap-y-0"
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
                        <span className="mb-1.5 block text-[11px] text-neutral-400 lg:hidden xl:block 2xl:hidden">
                          Amount
                        </span>
                        <div className="flex h-11 items-center justify-end rounded-2xl bg-[#050505] text-white px-4 text-[14px] font-medium tabular-nums border border-[#1f1f1f]">
                          {money(total, currency)}
                        </div>
                      </div>
                      <div className="flex items-center justify-end sm:col-span-2 lg:col-span-1 lg:justify-center xl:col-span-2 xl:justify-end 2xl:col-span-1 2xl:justify-center">
                        <button
                          type="button"
                          onClick={() => removeRow(item.id)}
                          className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-neutral-400 transition-colors hover:bg-neutral-900 hover:text-white"
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
                <label className="text-[12px] text-neutral-400">
                  Tax Rate <span className="text-neutral-500/60">(%)</span>
                </label>
                <div className="relative mt-1.5 flex h-11 min-w-0 items-center rounded-2xl border border-hairline bg-[#0d0d0d] pl-3 pr-2 transition focus-within:border-foreground/20">
                  <input
                    type="number"
                    min={0}
                    max={100}
                    step="0.01"
                    value={taxRate || ""}
                    onChange={(e) => setTaxRate(Number(e.target.value) || 0)}
                    placeholder="0"
                    className="h-full w-full min-w-0 bg-transparent px-2 text-right text-[14px] text-white outline-none placeholder:text-neutral-600 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none [appearance:textfield]"
                  />
                  <span className="text-[12px] font-medium text-neutral-400 pr-1">%</span>
                </div>
              </div>
              <div className="min-w-0">
                <label className="text-[12px] text-neutral-400">Currency</label>
                <div className="relative mt-1.5">
                  <select
                    value={currency}
                    onChange={(event) => setCurrency(event.target.value as CurrencyCode)}
                    className="h-11 w-full appearance-none rounded-2xl border border-hairline bg-[#0d0d0d] text-white pl-3 pr-10 text-[14px] outline-none transition focus:border-foreground/20"
                  >
                    {currencyOptions.map((option) => (
                      <option
                        key={option.code}
                        value={option.code}
                        className="bg-[#0d0d0d] text-white"
                      >
                        {option.code} - {option.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500" />
                </div>
              </div>
            </div>

            <div>
              <label className="text-[12px] text-neutral-400">
                Notes to Customer <span className="text-neutral-500/60">(optional)</span>
              </label>
              <textarea
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                rows={3}
                placeholder="e.g. Thanks for the opportunity to work together — happy to answer any questions."
                className="mt-1.5 w-full resize-none rounded-2xl border border-hairline bg-[#0d0d0d] text-white px-3 py-3 text-[14px] leading-relaxed outline-none transition placeholder:text-neutral-600 focus:border-foreground/20"
              />
            </div>

            {/* Recurring Schedule - Pro Feature */}
            <div className="relative">
              <label className="text-[12px] text-neutral-400 flex items-center gap-2">
                Recurring Schedule
                {!isPro && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2 py-0.5 text-[10px] font-medium text-amber-400 border border-amber-500/20">
                    <Lock className="h-2.5 w-2.5" /> Pro
                  </span>
                )}
              </label>
              <div className="relative mt-1.5">
                <select
                  value={isPro ? recurringFrequency : "none"}
                  onChange={(e) =>
                    isPro
                      ? setRecurringFrequency(e.target.value as typeof recurringFrequency)
                      : setIsUpgradeModalOpen(true)
                  }
                  onClick={() => !isPro && setIsUpgradeModalOpen(true)}
                  disabled={!isPro}
                  className="h-11 w-full appearance-none rounded-2xl border border-hairline bg-[#0d0d0d] text-white pl-3 pr-10 text-[14px] outline-none transition focus:border-foreground/20 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="none">None (one-time invoice)</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="yearly">Yearly</option>
                </select>
                <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500" />
              </div>
              {!isPro && (
                <p className="mt-1.5 text-[11px] text-neutral-500">
                  Upgrade to Pro to enable automatic recurring invoices.
                  <button
                    onClick={() => setIsUpgradeModalOpen(true)}
                    className="ml-1 text-white underline underline-offset-2 hover:no-underline"
                  >
                    Learn more
                  </button>
                </p>
              )}
            </div>

            {/* Auto Reminders - Pro Feature */}
            <div className="relative flex items-center justify-between">
              <div>
                <label className="text-[12px] text-neutral-400 flex items-center gap-2">
                  Automated Overdue Reminders
                  {!isPro && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2 py-0.5 text-[10px] font-medium text-amber-400 border border-amber-500/20">
                      <Lock className="h-2.5 w-2.5" /> Pro
                    </span>
                  )}
                </label>
                <p className="text-[11px] text-neutral-500 mt-1">
                  Send automated email reminders when the invoice is overdue.
                </p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={autoReminders}
                onClick={() => {
                  if (!isPro) {
                    setIsUpgradeModalOpen(true);
                  } else {
                    const newValue = !autoReminders;
                    setAutoReminders(newValue);
                    if (user?.id) {
                      writeUserStorageValue(
                        user.id,
                        settingsStorageKeys.autoReminders,
                        newValue ? "true" : "false",
                      );
                    }
                  }
                }}
                className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 ${
                  autoReminders && isPro ? "bg-emerald-500" : "bg-[#2a2a2a]"
                }`}
              >
                <span className="sr-only">Toggle automated reminders</span>
                <span
                  aria-hidden="true"
                  className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    autoReminders && isPro ? "translate-x-4" : "translate-x-0"
                  }`}
                />
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-3 rounded-3xl bg-[#050505] p-4 text-[13px] text-neutral-400 border border-[#1f1f1f]">
              <span className="rounded-full bg-[#121212] px-3 py-1 font-medium text-white border border-[#1f1f1f]">
                {invoiceNumber}
              </span>
              <span>{currency}</span>
              {safeTaxRate > 0 && <span>{safeTaxRate}% tax</span>}
              {safeDiscount > 0 && <span>{money(safeDiscount, currency)} discount</span>}
            </div>

            <button
              onClick={() => setShowMobilePreview(true)}
              className="xl:hidden w-full inline-flex items-center justify-center gap-2 rounded-full border border-[#2a2a2a] bg-[#141414] text-white px-4 py-2.5 text-[13px] font-medium transition-colors hover:bg-[#1f1f1f]"
            >
              <Eye className="h-3.5 w-3.5" /> Preview Invoice
            </button>
          </Panel>
        </div>

        <div className={cn("space-y-4 min-w-0", !showMobilePreview && "hidden xl:block")}>
          {showMobilePreview && (
            <button
              onClick={() => setShowMobilePreview(false)}
              className="xl:hidden w-full inline-flex items-center justify-center gap-2 rounded-full border border-[#2a2a2a] bg-[#141414] text-white px-4 py-2.5 text-[13px] font-medium transition-colors hover:bg-[#1f1f1f]"
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
              className={cn(
                "rounded-3xl border border-[#1f1f1f] bg-[#0d0d0d] relative text-white",
                "p-5 sm:p-8",
              )}
            >
              <div
                className={cn(
                  "flex flex-col gap-6 pb-6 sm:flex-row sm:items-start sm:justify-between",
                  "border-b border-[#1f1f1f]",
                )}
              >
                <div className="max-w-xs">
                  {brandLogo ? (
                    <img
                      src={brandLogo}
                      alt="Logo"
                      className="max-w-[140px] max-h-[50px] mb-2 object-contain"
                      style={{ mixBlendMode: "screen" }}
                    />
                  ) : (
                    <h3 className="text-[22px] font-semibold tracking-[-0.04em] sm:text-[26px] text-white">
                      {companyName || "Your Company"}
                    </h3>
                  )}
                  <p className="mt-2 text-[13px] leading-relaxed text-neutral-400">
                    {companyAddress}
                  </p>
                </div>
                <div className="sm:text-right">
                  <p className="text-[11px] uppercase tracking-[0.2em] text-neutral-500">Invoice</p>
                  <span className="mt-2 inline-flex rounded-md border border-[#1f1f1f] bg-[#050505] px-3 py-1 text-[13px] font-medium tabular-nums text-white">
                    {invoiceNumber}
                  </span>
                  <div className="mt-3 flex items-center gap-2 sm:justify-end">
                    <span className="text-[12px] text-neutral-400">
                      Issued {formatDateLabel(issueDate)}
                    </span>
                    <PaymentStatusPill status={paymentStatus} />
                  </div>
                </div>
              </div>

              <div
                className={cn(
                  "mt-6 overflow-hidden bg-[#050505]",
                  "rounded-2xl border border-[#1f1f1f]",
                )}
              >
                <div className="grid grid-cols-1 divide-y divide-[#1f1f1f] sm:grid-cols-2 sm:divide-x sm:divide-y-0">
                  <div className="p-5">
                    <p className="text-[11px] uppercase tracking-[0.18em] text-neutral-500">
                      Billed to
                    </p>
                    <div className="mt-2 text-[14px] font-medium text-white">
                      {clientName || "Client name"}
                    </div>
                    {clientEmail && (
                      <div className="mt-1 text-[13px] text-neutral-400">{clientEmail}</div>
                    )}
                  </div>
                  <div className="p-5">
                    <p className="text-[11px] uppercase tracking-[0.18em] text-neutral-500">
                      Due date
                    </p>
                    <div className="mt-2 text-[14px] font-medium text-white">
                      {formatDateLabel(dueDate)}
                    </div>
                  </div>
                </div>
                {billingAddress && (
                  <div className="border-t border-[#1f1f1f] p-5">
                    <p className="text-[11px] uppercase tracking-[0.18em] text-neutral-500">
                      Address
                    </p>
                    <div className="mt-2 text-[13px] leading-relaxed text-neutral-400">
                      {billingAddress}
                    </div>
                  </div>
                )}
              </div>

              <div className="py-6">
                <div
                  className={cn(
                    "overflow-hidden bg-[#050505]",
                    "rounded-2xl border border-[#1f1f1f]",
                  )}
                >
                  <div
                    className={cn(
                      "flex items-center justify-between gap-4 px-5 py-3.5 text-[10.5px] font-medium uppercase tracking-[0.14em] border-b border-[#1f1f1f]",
                      "bg-[#121212] text-neutral-400",
                    )}
                  >
                    <span>Item</span>
                    <span>Amount</span>
                  </div>
                  <div className="divide-y divide-[#1f1f1f]">
                    {items.map((item) => {
                      const total = item.quantity * item.unitPrice;
                      return (
                        <div
                          key={item.id}
                          className="flex items-start justify-between gap-4 px-5 py-4 text-[13px]"
                        >
                          <div className="min-w-0 flex-1">
                            <p className="font-medium break-words text-white">
                              {item.product || "Item"}
                            </p>
                            <p className="mt-1 break-words text-[12px] text-neutral-400 tabular-nums">
                              {item.quantity} × {money(item.unitPrice, currency)}
                            </p>
                          </div>
                          <span className="shrink-0 text-right font-medium tabular-nums text-white">
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
                  <div className="flex items-center justify-between px-1 text-[13px] text-neutral-400">
                    <span>Subtotal</span>
                    <span className="font-medium text-white tabular-nums">
                      {money(subtotal, currency)}
                    </span>
                  </div>
                  {safeDiscount > 0 && (
                    <div className="flex items-center justify-between px-1 text-[13px] text-neutral-400">
                      <span>Discount</span>
                      <span className="font-medium text-white tabular-nums">
                        -{money(safeDiscount, currency)}
                      </span>
                    </div>
                  )}
                  {safeTaxRate > 0 && (
                    <div className="flex items-center justify-between px-1 text-[13px] text-neutral-400">
                      <span>Tax ({safeTaxRate}%)</span>
                      <span className="font-medium text-white tabular-nums">
                        +{money(taxAmount, currency)}
                      </span>
                    </div>
                  )}
                  <div className="flex items-baseline justify-between border-t border-[#1f1f1f] px-1 pt-3">
                    <span className="text-[13px] font-medium text-neutral-400">Total</span>
                    <span className="text-[22px] font-semibold tracking-[-0.02em] tabular-nums text-white">
                      {money(grandTotal, currency)}
                    </span>
                  </div>
                </div>
              </div>

              {(notes || paymentInstructions) && (
                <div className="mt-6 border-t border-[#1f1f1f] pt-6 flex flex-col gap-4">
                  {notes && (
                    <div>
                      <p className="text-[11px] uppercase tracking-[0.18em] text-neutral-500">
                        Notes
                      </p>
                      <p className="mt-2 text-[13px] leading-relaxed text-neutral-400">{notes}</p>
                    </div>
                  )}
                  {paymentInstructions && (
                    <div>
                      <p className="text-[11px] uppercase tracking-[0.18em] text-neutral-500">
                        Payment Instructions
                      </p>
                      <p className="mt-2 text-[13px] leading-relaxed text-neutral-400">
                        {paymentInstructions}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {!isPro && (
                <div className="mt-12 flex justify-center pb-2">
                  <p className="text-[11px] text-neutral-500 tracking-widest uppercase">
                    Powered by{" "}
                    <span className="font-semibold text-neutral-400 tracking-normal">Envoiz</span>
                  </p>
                </div>
              )}
            </div>
          </Panel>
        </div>
      </div>

      <div id="invoice-list" className="mt-10">
        <div className="mb-4">
          <h2 className="text-xl font-semibold tracking-[-0.03em]">All invoices</h2>
          <p className="mt-1 text-[13px] text-muted-foreground">
            Browse, filter, and manage every invoice you've created.
          </p>
        </div>
        <Panel>
          <div className="mb-5 flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500" />
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by client or invoice #..."
                className="h-10 w-full rounded-2xl border border-hairline bg-[#0d0d0d] text-white pl-9 pr-4 text-[13px] outline-none transition focus:border-foreground/20 placeholder:text-neutral-600"
              />
            </div>
            <div className="flex items-center gap-1.5 rounded-2xl border border-hairline bg-[#0d0d0d] p-1">
              {(["all", "Pending", "Paid", "Overdue"] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  className={cn(
                    "rounded-xl px-3 py-1.5 text-[12px] font-medium transition-colors",
                    statusFilter === s
                      ? "bg-[#2a2a2a] text-white"
                      : "text-neutral-400 hover:text-white",
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
                  ? "Fill in the form above to create your first invoice."
                  : "Try a different search or filter."}
              </p>
            </div>
          ) : (
            <div className="overflow-hidden rounded-3xl border border-hairline">
              <div className="hidden sm:grid sm:grid-cols-[auto_1fr_auto_auto_auto_auto] items-center gap-4 bg-[#0d0d0d] px-4 py-3 text-[11px] uppercase tracking-[0.16em] text-neutral-400">
                <span>Invoice #</span>
                <span>Client</span>
                <span>Issue date</span>
                <span>Due date</span>
                <span>Amount</span>
                <span>Status</span>
              </div>
              <div className="divide-y divide-[#1f1f1f] bg-[#121212]/40">
                {filteredInvoices.map((inv) => {
                  const total = computeListTotal(inv);
                  const curr = (inv.currency as CurrencyCode) || "USD";
                  return (
                    <div
                      key={inv.id}
                      className="group flex flex-col gap-3 px-4 py-4 sm:grid sm:grid-cols-[auto_1fr_auto_auto_auto_auto] sm:items-center sm:gap-4 cursor-pointer hover:bg-white/5 transition-colors"
                    >
                      <div
                        onClick={() => handleSelectInvoice(inv)}
                        className="font-mono text-[12px] font-medium text-neutral-500"
                      >
                        {inv.invoice_number || "—"}
                      </div>
                      <div onClick={() => handleSelectInvoice(inv)} className="min-w-0">
                        <div className="truncate text-[14px] font-medium text-white">
                          {inv.client_name || "Unknown"}
                        </div>
                        <div className="text-[12px] text-neutral-500 sm:hidden">
                          {inv.payment_status && (
                            <span
                              className={cn(
                                "inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-medium border border-neutral-800 bg-[#0d0d0d] text-white",
                              )}
                            >
                              {inv.payment_status}
                            </span>
                          )}
                        </div>
                      </div>
                      <div
                        onClick={() => handleSelectInvoice(inv)}
                        className="hidden sm:block text-[12px] text-neutral-400 whitespace-nowrap"
                      >
                        {formatDateShort(inv.issue_date)}
                      </div>
                      <div
                        onClick={() => handleSelectInvoice(inv)}
                        className="hidden sm:block text-[12px] text-neutral-400 whitespace-nowrap"
                      >
                        {formatDateShort(inv.due_date)}
                      </div>
                      <div
                        onClick={() => handleSelectInvoice(inv)}
                        className="text-[13px] font-medium tabular-nums sm:text-right text-white"
                      >
                        {money(total, curr)}
                      </div>
                      <div className="flex items-center justify-between sm:justify-end gap-3">
                        {inv.payment_status && <PaymentStatusPill status={inv.payment_status} />}
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleSelectInvoice(inv)}
                            className="h-8 w-8 inline-flex items-center justify-center rounded-full text-neutral-400 hover:bg-neutral-800 hover:text-white transition-colors"
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
                            className="h-8 w-8 inline-flex items-center justify-center rounded-full text-neutral-400 hover:bg-destructive/10 hover:text-destructive transition-colors"
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
        onNewInvoice={() => {
          setShowSuccess(false);
          resetForm();
          scrollToTop();
        }}
      />
      <SendInvoiceDialog
        open={sendDialogOpen}
        onOpenChange={setSendDialogOpen}
        invoiceNumber={invoiceNumber}
        clientEmail={clientEmail}
        clientName={clientName}
        generatePdfBase64={generatePdfBase64}
        onNewInvoice={() => {
          setSendDialogOpen(false);
          resetForm();
          scrollToTop();
        }}
      />
      <UpgradeModal open={isUpgradeModalOpen} onOpenChange={setIsUpgradeModalOpen} />
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
            <span className="font-medium text-foreground">{clientName}</span>. This action cannot be
            undone.
          </DialogDescription>
        </div>
        <div className="flex justify-end gap-3 p-5">
          <button
            onClick={() => onOpenChange(false)}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-full border border-[#2a2a2a] bg-[#141414] text-white px-4 py-2 text-[13px] font-medium transition-colors hover:bg-[#1f1f1f] disabled:opacity-50"
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
      <label className="text-[12px] text-neutral-400">
        {label} {optional && <span className="text-neutral-500/60">(optional)</span>}
      </label>
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="mt-1.5 h-11 w-full rounded-2xl border border-hairline bg-[#0d0d0d] text-white px-3 text-[14px] outline-none transition placeholder:text-neutral-600 focus:border-foreground/20"
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
      <label className="text-[12px] text-neutral-400">
        {label} {optional && <span className="text-neutral-500/60">(optional)</span>}
      </label>
      <div className="relative mt-1.5">
        <input
          type="date"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="peer absolute inset-0 z-10 h-11 w-full cursor-pointer opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:inset-0 [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-0"
        />
        <div className="pointer-events-none flex h-11 w-full min-w-0 items-center justify-between gap-2 rounded-2xl border border-hairline bg-[#0d0d0d] px-3 text-[14px] text-white transition peer-focus:border-foreground/20">
          <span className="truncate">{formatDateLabel(value)}</span>
          <CalendarDays className="h-4 w-4 shrink-0 text-neutral-500" />
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
      className="h-11 w-full min-w-0 rounded-2xl border border-hairline bg-[#0d0d0d] text-white px-3 text-[14px] outline-none transition placeholder:text-neutral-600 focus:border-foreground/20 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none [appearance:textfield]"
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
        "flex h-11 min-w-0 items-center rounded-2xl border border-hairline bg-[#0d0d0d] pl-3 pr-2 transition focus-within:border-foreground/20",
        wrapperClassName,
      )}
    >
      <span className="text-[12px] font-medium text-neutral-400">{currency}</span>
      <input
        type="number"
        min={0}
        step="0.01"
        value={value || ""}
        onChange={(event) => onChange(Number(event.target.value) || 0)}
        placeholder="0.00"
        className="h-full w-full min-w-0 bg-transparent px-2 text-right text-[14px] text-white outline-none placeholder:text-neutral-600 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none [appearance:textfield]"
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
