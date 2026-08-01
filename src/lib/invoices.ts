/*
 * REQUIRED: Run these in Supabase SQL Editor to enable Row Level Security.
 * Without these, any authenticated user can read/edit/delete any other user's invoices.
 *
 * ALTER TABLE envoiz_invoices ENABLE ROW LEVEL SECURITY;
 * ALTER TABLE envoiz_invoice_items ENABLE ROW LEVEL SECURITY;
 *
 * CREATE POLICY "Users can view their own invoices"
 *   ON envoiz_invoices FOR SELECT USING (auth.uid() = user_id);
 *
 * CREATE POLICY "Users can insert their own invoices"
 *   ON envoiz_invoices FOR INSERT WITH CHECK (auth.uid() = user_id);
 *
 * CREATE POLICY "Users can update their own invoices"
 *   ON envoiz_invoices FOR UPDATE USING (auth.uid() = user_id);
 *
 * CREATE POLICY "Users can delete their own invoices"
 *   ON envoiz_invoices FOR DELETE USING (auth.uid() = user_id);
 *
 * CREATE POLICY "Users can view their own invoice items"
 *   ON envoiz_invoice_items FOR SELECT
 *   USING (invoice_id IN (SELECT id FROM envoiz_invoices WHERE user_id = auth.uid()));
 *
 * CREATE POLICY "Users can insert their own invoice items"
 *   ON envoiz_invoice_items FOR INSERT
 *   WITH CHECK (invoice_id IN (SELECT id FROM envoiz_invoices WHERE user_id = auth.uid()));
 *
 * CREATE POLICY "Users can update their own invoice items"
 *   ON envoiz_invoice_items FOR UPDATE
 *   USING (invoice_id IN (SELECT id FROM envoiz_invoices WHERE user_id = auth.uid()));
 *
 * CREATE POLICY "Users can delete their own invoice items"
 *   ON envoiz_invoice_items FOR DELETE
 *   USING (invoice_id IN (SELECT id FROM envoiz_invoices WHERE user_id = auth.uid()));
 *
 * MIGRATION NEEDED: Add tax_rate column if it doesn't exist:
 * ALTER TABLE envoiz_invoices ADD COLUMN IF NOT EXISTS tax_rate NUMERIC DEFAULT 0;
 */

import { supabase } from "@/lib/supabase";

export type InvoiceStatus = "Pending" | "Paid" | "Overdue";

export type InvoiceLineItem = {
  product: string;
  quantity: number;
  unitPrice: number;
};

export type InvoiceRecord = {
  id: string;
  clientName: string;
  clientEmail: string;
  items: InvoiceLineItem[];
  total: number;
  createdAt: string;
  status: InvoiceStatus;
  taxRate?: number;
  currency?: string;
};

export function calculateInvoiceTotal(items: InvoiceLineItem[], discount = 0, taxRate = 0) {
  return calculateInvoiceBreakdown(items, discount, taxRate).total;
}

// Shared breakdown utility – centralizes subtotal, discount, tax, total logic.
export function calculateInvoiceBreakdown(items: InvoiceLineItem[], discount = 0, taxRate = 0) {
  const subtotal = items.reduce(
    (sum, item) =>
      sum + Math.max(0, Number(item.quantity) || 0) * Math.max(0, Number(item.unitPrice) || 0),
    0,
  );
  const safeDiscount = Math.min(Math.max(0, discount), subtotal);
  const taxable = subtotal - safeDiscount;
  const tax = taxable * (Math.min(Math.max(0, taxRate), 100) / 100);
  const total = Math.max(0, taxable + tax);
  return { subtotal, safeDiscount, taxable, tax, total };
}

export function formatStoredInvoiceRecord(row: any): InvoiceRecord {
  const items = Array.isArray(row.envoiz_invoice_items)
    ? row.envoiz_invoice_items.map((item: any) => ({
        product: item.product,
        quantity: item.quantity,
        unitPrice: item.unit_price,
      }))
    : [];

  const subtotal = items.reduce(
    (sum: number, item: any) =>
      sum + Math.max(0, Number(item.quantity) || 0) * Math.max(0, Number(item.unitPrice) || 0),
    0,
  );
  const discount = Number(row.discount) || 0;
  const safeDiscount = Math.min(Math.max(0, discount), subtotal);
  const taxRate = Number(row.tax_rate) || 0;
  const taxable = subtotal - safeDiscount;
  const tax = taxable * (taxRate / 100);

  return {
    id: row.invoice_number || row.id,
    clientName: row.client_name,
    clientEmail: row.client_email,
    items,
    total: Math.max(0, taxable + tax),
    createdAt: row.created_at || row.issue_date,
    status: row.payment_status as InvoiceStatus,
    taxRate,
    currency: row.currency || "USD",
  };
}

export async function fetchInvoices(userId: string) {
  const { data, error } = await supabase
    .from("envoiz_invoices")
    .select(
      "id, invoice_number, user_id, client_name, client_email, created_at, issue_date, payment_status, discount, tax_rate, currency, envoiz_invoice_items ( product, quantity, unit_price )",
    )
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  return (data ?? []).map((row) => formatStoredInvoiceRecord(row));
}

export function buildCustomerIndex(invoices: InvoiceRecord[]) {
  const customers = new Map<
    string,
    { name: string; email: string; lastInvoiceAt: string; count: number; total: number; currency: string }
  >();

  for (const invoice of invoices) {
    const key = invoice.clientEmail.toLowerCase();
    const current = customers.get(key);

    if (!current) {
      customers.set(key, {
        name: invoice.clientName,
        email: invoice.clientEmail,
        lastInvoiceAt: invoice.createdAt,
        count: 1,
        total: invoice.total,
        currency: (invoice as any).currency ?? "USD",
      });
      continue;
    }

    // Keep the currency from the most recent invoice (determined by lastInvoiceAt)
    const isNewer = Date.parse(invoice.createdAt) > Date.parse(current.lastInvoiceAt);
    customers.set(key, {
      ...current,
      lastInvoiceAt: isNewer ? invoice.createdAt : current.lastInvoiceAt,
      count: current.count + 1,
      total: current.total + invoice.total,
      currency: isNewer ? ((invoice as any).currency ?? current.currency) : current.currency,
    });
  }

  return Array.from(customers.values()).sort(
    (left, right) => Date.parse(right.lastInvoiceAt) - Date.parse(left.lastInvoiceAt),
  );
}

import { User } from "@supabase/supabase-js";

export function checkIsPro(user: User | null | undefined): boolean {
  if (!user) return false;
  
  // Developer override: always return true for testing!
  return true;
}

export async function checkInvoiceLimit(userId: string, isPro: boolean = false): Promise<boolean> {
  if (isPro) return false; // Pro users have no limit

  const now = new Date();
  const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

  const { count, error } = await supabase
    .from("envoiz_invoices")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId)
    .gte("created_at", firstDayOfMonth);

  if (error) {
    console.error("Error checking invoice limit", error);
    return false; // Fail open if error
  }

  return (count ?? 0) >= 10;
}
