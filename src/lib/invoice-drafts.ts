import { supabase } from "@/lib/supabase";

export type PendingInvoiceDraft = {
  clientName?: string;
  clientEmail?: string;
  issueDate?: string;
  dueDate?: string;
  currency?: string;
  taxRate?: number;
  discountRate?: number;
  notes?: string;
  items?: Array<{
    description?: string;
    quantity?: number;
    rate?: number;
  }>;
};

export async function createInvoiceDraft(payload: PendingInvoiceDraft) {
  const draftToken = crypto.randomUUID();
  const { error } = await supabase.from("envoiz_invoice_drafts").insert({
    draft_token: draftToken,
    payload,
  });
  if (error) throw error;
  return draftToken;
}

export async function claimInvoiceDraft(draftToken: string) {
  const { data, error } = await supabase.rpc("claim_envoiz_invoice_draft", {
    draft_token: draftToken,
  });

  if (error) throw error;
  return (data ?? null) as PendingInvoiceDraft | null;
}
