import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

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
    const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
    
    if (!RESEND_API_KEY) {
      throw new Error("Missing RESEND_API_KEY environment variable");
    }

    const { clientEmail, subject, message, replyTo, pdfBase64, invoiceNumber } = await req.json();

    if (!clientEmail || !pdfBase64) {
      throw new Error("Missing required fields: clientEmail or pdfBase64");
    }

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        // You should configure the From email in your dashboard, or hardcode your verified domain here
        from: Deno.env.get('RESEND_FROM_EMAIL') || 'onboarding@resend.dev',
        to: [clientEmail],
        reply_to: replyTo,
        subject: subject || `Invoice ${invoiceNumber || ''}`,
        html: `<p>${message || 'Please find your invoice attached.'}</p>`,
        attachments: [
          {
            filename: `invoice_${invoiceNumber || 'download'}.pdf`,
            content: pdfBase64.split(',')[1] || pdfBase64, // handle data URI prefix if present
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
