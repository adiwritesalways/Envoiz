import { createClient } from "https://esm.sh/@supabase/supabase-js@2.108.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

const escapeHtml = (value: string) =>
  value.replace(
    /[&<>'"]/g,
    (character) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        "'": "&#39;",
        '"': "&quot;",
      })[character] ?? character,
  );
const isEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (request.method !== "POST") return json({ success: false, error: "Method not allowed" }, 405);
  if (Number(request.headers.get("content-length") || 0) > 10 * 1024 * 1024)
    return json({ success: false, error: "Attachment is too large" }, 413);

  const authHeader = request.headers.get("authorization");
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY");
  const resendApiKey = Deno.env.get("RESEND_API_KEY");
  const fromEmail = Deno.env.get("RESEND_FROM_EMAIL");
  if (!authHeader || !supabaseUrl || !supabaseAnonKey)
    return json({ success: false, error: "Unauthorized" }, 401);
  if (!resendApiKey || !fromEmail) {
    console.error("Invoice email is missing RESEND_API_KEY or RESEND_FROM_EMAIL.");
    return json({ success: false, error: "Invoice email is not configured" }, 503);
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) return json({ success: false, error: "Unauthorized" }, 401);

    const body = await request.json();
    const invoiceId = typeof body.invoiceId === "string" ? body.invoiceId : "";
    const clientEmail =
      typeof body.clientEmail === "string" ? body.clientEmail.trim().toLowerCase() : "";
    const subject = typeof body.subject === "string" ? body.subject.trim().slice(0, 180) : "";
    const message = typeof body.message === "string" ? body.message.trim().slice(0, 5000) : "";
    const pdfBase64 = typeof body.pdfBase64 === "string" ? body.pdfBase64 : "";
    if (!invoiceId || !isEmail(clientEmail) || !pdfBase64)
      return json({ success: false, error: "Invalid invoice email request" }, 400);

    const encodedPdf = pdfBase64.includes(",") ? pdfBase64.split(",", 2)[1] : pdfBase64;
    const pdfBytes = Uint8Array.from(atob(encodedPdf), (character) => character.charCodeAt(0));
    if (
      pdfBytes.byteLength < 5 ||
      pdfBytes.byteLength > 7 * 1024 * 1024 ||
      new TextDecoder().decode(pdfBytes.slice(0, 5)) !== "%PDF-"
    ) {
      return json({ success: false, error: "Invalid PDF attachment" }, 400);
    }

    const { data: invoice, error: invoiceError } = await supabase
      .from("envoiz_invoices")
      .select("invoice_number, client_email")
      .eq("id", invoiceId)
      .eq("user_id", user.id)
      .maybeSingle();
    if (invoiceError || !invoice) return json({ success: false, error: "Invoice not found" }, 404);
    if (!invoice.client_email || invoice.client_email.trim().toLowerCase() !== clientEmail) {
      return json({ success: false, error: "Recipient must match the invoice client email" }, 400);
    }

    const replyTo = user.email && isEmail(user.email) ? user.email : undefined;
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${resendApiKey}` },
      body: JSON.stringify({
        from: fromEmail,
        to: [clientEmail],
        ...(replyTo ? { reply_to: replyTo } : {}),
        subject: subject || `Invoice ${invoice.invoice_number}`,
        html: `<p>${escapeHtml(message || "Please find your invoice attached.").replace(/\n/g, "<br>")}</p>`,
        attachments: [{ filename: `invoice_${invoice.invoice_number}.pdf`, content: encodedPdf }],
      }),
    });
    if (!response.ok) {
      console.error("Resend rejected an invoice email", await response.text());
      return json({ success: false, error: "Unable to send the invoice email" }, 502);
    }
    return json({ success: true });
  } catch (error) {
    console.error("Invoice email failed", error);
    return json({ success: false, error: "Unable to send the invoice email" }, 500);
  }
});
