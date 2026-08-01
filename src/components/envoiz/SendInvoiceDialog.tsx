import React, { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Send, Loader2, X } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/components/auth/auth-context";

interface SendInvoiceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  invoiceNumber: string;
  clientEmail: string;
  clientName: string;
  generatePdfBase64: () => Promise<string | null>;
  onNewInvoice?: () => void;
}

export function SendInvoiceDialog({
  open,
  onOpenChange,
  invoiceNumber,
  clientEmail,
  clientName,
  generatePdfBase64,
  onNewInvoice,
}: SendInvoiceDialogProps) {
  const { user } = useAuth();
  const companyName = user?.user_metadata?.company_name || "Envoiz";
  const buildSubject = () => `Invoice${invoiceNumber ? ` ${invoiceNumber}` : ""} from ${companyName}`;
  const [subject, setSubject] = useState(buildSubject);
  const [message, setMessage] = useState(`Hi ${clientName || 'there'},\n\nPlease find attached the invoice ${invoiceNumber}.\n\nThank you for your business!`);
  const [sending, setSending] = useState(false);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientEmail) {
      toast.error("Client email is missing.");
      return;
    }

    setSending(true);
    try {
      const pdfBase64 = await generatePdfBase64();
      if (!pdfBase64) {
        throw new Error("Failed to generate PDF attachment.");
      }

      const { data, error } = await supabase.functions.invoke('send-invoice', {
        body: {
          clientEmail,
          subject,
          message: message.replace(/\n/g, '<br/>'),
          replyTo: user?.email,
          pdfBase64,
          invoiceNumber
        }
      });

      if (error) {
        throw error;
      }
      
      if (!data?.success) {
         throw new Error(data?.error?.message || "Failed to send email via Resend");
      }

      toast.success("Invoice sent successfully!");
      onOpenChange(false);
    } catch (err: any) {
      toast.error(`Failed to send invoice: ${err.message || "Ensure your Edge Function is deployed."}`);
    } finally {
      setSending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        hideCloseButton
        className="max-w-md gap-0 border-hairline p-0 overflow-hidden bg-[#0d0d0d] shadow-2xl sm:rounded-3xl"
        onInteractOutside={(e) => e.preventDefault()}
      >
        <div className="relative border-b border-[#1f1f1f] bg-[#050505] px-6 py-6">
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            aria-label="Close dialog"
            className="absolute right-5 top-5 rounded-full p-1.5 text-neutral-500 transition-colors hover:bg-white/10 hover:text-white focus:outline-none"
          >
            <X className="h-4 w-4" />
          </button>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-foreground/10">
              <Send className="h-4 w-4 text-foreground" />
            </div>
            <div>
              <DialogTitle className="text-[17px] font-semibold text-white">
                Email to Client
              </DialogTitle>
              <DialogDescription className="text-[13px] text-neutral-400 mt-0.5">
                Send invoice <span className="text-white font-medium">{invoiceNumber}</span> to <span className="text-white font-medium">{clientEmail}</span>
              </DialogDescription>
            </div>
          </div>
        </div>

        <form onSubmit={handleSend}>
          <div className="p-6 space-y-5 bg-[#0d0d0d]">
            <div>
              <label className="text-[12px] font-medium text-neutral-400 mb-1.5 block">Subject</label>
              <input
                type="text"
                required
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full rounded-2xl border border-hairline bg-[#050505] text-white px-3 py-2.5 text-[14px] outline-none transition focus:border-foreground/20 placeholder:text-neutral-600"
              />
            </div>
            <div>
              <label className="text-[12px] font-medium text-neutral-400 mb-1.5 block">Message</label>
              <textarea
                required
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={5}
                className="w-full resize-none rounded-2xl border border-hairline bg-[#050505] text-white px-3 py-2.5 text-[14px] outline-none transition focus:border-foreground/20 placeholder:text-neutral-600 leading-relaxed"
              />
            </div>
            
            {/* PDF Attachment Indicator */}
            <div className="flex items-center justify-between rounded-2xl border border-hairline bg-[#141414]/50 px-4 py-3">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-500/10">
                  <div className="text-[10px] font-bold text-red-500">PDF</div>
                </div>
                <div>
                  <div className="text-[13px] font-medium text-white">{invoiceNumber}.pdf</div>
                  <div className="text-[11px] text-neutral-500">Auto-generated & attached</div>
                </div>
              </div>
              <div className="text-[11px] text-neutral-500 bg-neutral-800/50 px-2 py-1 rounded-md">
                Reply to: {user?.email}
              </div>
            </div>
          </div>
          
          <div className="flex flex-col-reverse sm:flex-row sm:items-center justify-between gap-3 border-t border-[#1f1f1f] bg-[#050505] px-6 py-4">
            {onNewInvoice && (
              <button
                type="button"
                onClick={() => {
                  onOpenChange(false);
                  onNewInvoice();
                }}
                disabled={sending}
                className="inline-flex justify-center items-center rounded-full border border-hairline bg-transparent px-4 py-2.5 sm:py-2 text-[13px] font-medium text-neutral-400 transition-colors hover:bg-white/5 hover:text-white"
              >
                Create another invoice
              </button>
            )}
            
            <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
              <button
                type="submit"
                disabled={sending}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full bg-white px-4 py-2.5 sm:py-2 text-[13px] font-semibold text-black transition-colors hover:bg-neutral-200 disabled:opacity-50"
              >
                {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
                {sending ? "Sending..." : "Send Email"}
              </button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
