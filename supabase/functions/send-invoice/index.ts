import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // ── 1. Authenticate the caller ──────────────────────────────────────
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ success: false, error: 'Missing Authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;

    // Create a client that inherits the caller's JWT so RLS applies
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid or expired token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    // ── 2. Parse request body ───────────────────────────────────────────
    const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
    
    if (!RESEND_API_KEY) {
      throw new Error("Missing RESEND_API_KEY environment variable");
    }

    const { clientEmail, subject, message, replyTo, pdfBase64, invoiceNumber } = await req.json();

    if (!clientEmail || !pdfBase64) {
      throw new Error("Missing required fields: clientEmail or pdfBase64");
    }

    // ── 3. Verify invoice ownership ─────────────────────────────────────
    // If an invoiceNumber was provided, confirm it belongs to this user.
    if (invoiceNumber) {
      const { data: invoice, error: invoiceError } = await supabase
        .from('envoiz_invoices')
        .select('id')
        .eq('invoice_number', invoiceNumber)
        .eq('user_id', user.id)
        .maybeSingle();

      if (invoiceError) {
        console.error('Invoice lookup error:', invoiceError);
        return new Response(
          JSON.stringify({ success: false, error: 'Failed to verify invoice ownership' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
        );
      }

      if (!invoice) {
        return new Response(
          JSON.stringify({ success: false, error: 'Invoice not found or does not belong to you' }),
          { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
        );
      }
    }

    // ── 4. Send the email via Resend ────────────────────────────────────
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: Deno.env.get('RESEND_FROM_EMAIL') || 'onboarding@resend.dev',
        to: [clientEmail],
        reply_to: replyTo,
        subject: subject || `Invoice ${invoiceNumber || ''}`,
        html: `<p>${message || 'Please find your invoice attached.'}</p>`,
        attachments: [
          {
            filename: `invoice_${invoiceNumber || 'download'}.pdf`,
            content: pdfBase64.split(',')[1] || pdfBase64,
          }
        ]
      }),
    });

    const data = await res.json();

    if (res.ok) {
      return new Response(JSON.stringify({ success: true, data }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    } else {
      console.error("Resend API error:", data);
      return new Response(JSON.stringify({ success: false, error: data }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

  } catch (error: any) {
    console.error("Error sending invoice:", error);
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
