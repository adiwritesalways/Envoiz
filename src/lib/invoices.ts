import { supabase } from "@/lib/supabase";

export type InvoiceStatus = "Pending" | "Paid";

export type InvoiceLineItem = {
  product: string;
  quantity: number;
  unitPrice: number;
};

export type InvoiceRow = {
  id: string;
  user_id: string;
  client_name: string;
  client_email: string;
  items: InvoiceLineItem[] | null;
  total: number | string | null;
  created_at: string;
  status: InvoiceStatus;
};

export type InvoiceRecord = {
  id: string;
  clientName: string;
  clientEmail: string;
  items: InvoiceLineItem[];
  total: number;
  createdAt: string;
  status: InvoiceStatus;
};

export type InvoiceDraft = {
  clientName: string;
  clientEmail: string;
  items: InvoiceLineItem[];
  status: InvoiceStatus;
};

export function calculateInvoiceTotal(items: InvoiceLineItem[]) {
  return items.reduce(
    (sum, item) =>
      sum + Math.max(0, Number(item.quantity) || 0) * Math.max(0, Number(item.unitPrice) || 0),
    0,
  );
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

  return {
    id: row.invoice_number || row.id,
    clientName: row.client_name,
    clientEmail: row.client_email,
    items,
    total: Math.max(0, subtotal - safeDiscount),
    createdAt: row.created_at || row.issue_date,
    status: row.payment_status as InvoiceStatus,
  };
}

export async function fetchInvoices(userId: string) {
  const { data, error } = await supabase
    .from("envoiz_invoices")
    .select("id, invoice_number, user_id, client_name, client_email, created_at, issue_date, payment_status, discount, envoiz_invoice_items ( product, quantity, unit_price )")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  return (data ?? []).map((row) => formatStoredInvoiceRecord(row));
}

export async function createInvoice(userId: string, draft: InvoiceDraft) {
  const payload = {
    user_id: userId,
    client_name: draft.clientName,
    client_email: draft.clientEmail,
    items: draft.items,
    total: calculateInvoiceTotal(draft.items),
    status: draft.status,
  };

  const { data, error } = await supabase
    .from("envoiz_invoices")
    .insert(payload)
    .select("id, user_id, client_name, client_email, items, total, created_at, status")
    .single();

  if (error) {
    throw error;
  }

  return formatStoredInvoiceRecord(data as InvoiceRow);
}

export async function updateInvoice(invoiceId: string, userId: string, draft: InvoiceDraft) {
  const { data, error } = await supabase
    .from("envoiz_invoices")
    .update({
      client_name: draft.clientName,
      client_email: draft.clientEmail,
      items: draft.items,
      total: calculateInvoiceTotal(draft.items),
      status: draft.status,
    })
    .eq("id", invoiceId)
    .eq("user_id", userId)
    .select("id, user_id, client_name, client_email, items, total, created_at, status")
    .single();

  if (error) {
    throw error;
  }

  return formatStoredInvoiceRecord(data as InvoiceRow);
}

export async function deleteInvoice(invoiceId: string, userId: string) {
  const { error } = await supabase
    .from("envoiz_invoices")
    .delete()
    .eq("id", invoiceId)
    .eq("user_id", userId);

  if (error) {
    throw error;
  }
}

export function buildCustomerIndex(invoices: InvoiceRecord[]) {
  const customers = new Map<
    string,
    { name: string; email: string; lastInvoiceAt: string; count: number; total: number }
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
      });
      continue;
    }

    customers.set(key, {
      ...current,
      lastInvoiceAt:
        Date.parse(current.lastInvoiceAt) > Date.parse(invoice.createdAt)
          ? current.lastInvoiceAt
          : invoice.createdAt,
      count: current.count + 1,
      total: current.total + invoice.total,
    });
  }

  return Array.from(customers.values()).sort(
    (left, right) => Date.parse(right.lastInvoiceAt) - Date.parse(left.lastInvoiceAt),
  );
}
