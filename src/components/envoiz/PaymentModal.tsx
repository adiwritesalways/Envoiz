import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { useState } from "react";
import { CreditCard, Smartphone, Wallet, Loader2, CheckCircle2 } from "lucide-react";
import { useAuth } from "@/components/auth/auth-context";
import { PRICE_BDT, PRICE_USD } from "@/lib/payment";
import { createStripeCheckoutSession } from "@/lib/stripe";
import { toast } from "sonner";

type PaymentMethod = "stripe" | "bkash" | "nagad";

export function PaymentModal({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { user } = useAuth();
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null);
  const [processing, setProcessing] = useState(false);

  const paymentMethods = [
    {
      id: "stripe" as PaymentMethod,
      name: "Card Payment",
      description: "Visa, Mastercard, Amex",
      icon: CreditCard,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
      borderColor: "border-blue-500/20",
      available: true,
    },
    {
      id: "bkash" as PaymentMethod,
      name: "bKash",
      description: "Mobile payment",
      icon: Smartphone,
      color: "text-pink-500",
      bgColor: "bg-pink-500/10",
      borderColor: "border-pink-500/20",
      available: true,
    },
    {
      id: "nagad" as PaymentMethod,
      name: "Nagad",
      description: "Digital wallet",
      icon: Wallet,
      color: "text-orange-500",
      bgColor: "bg-orange-500/10",
      borderColor: "border-orange-500/20",
      available: true,
    },
  ];

  const handlePayment = async () => {
    if (!selectedMethod || !user) {
      toast.error("Please sign in to continue.");
      return;
    }

    setProcessing(true);

    try {
      if (selectedMethod === "stripe") {
        const { url, error } = await createStripeCheckoutSession(user.id);
        if (error) {
          toast.error(error);
          return;
        }
        if (url) window.location.href = url;
      }

      if (selectedMethod === "bkash") {
        const response = await fetch("/api/bkash/create-payment", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: user.id, amount: PRICE_BDT }),
        });
        const { bkashURL, error } = await response.json();
        if (error) {
          toast.error(error);
          return;
        }
        if (bkashURL) window.location.href = bkashURL;
      }

      if (selectedMethod === "nagad") {
        const response = await fetch("/api/nagad/create-payment", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: user.id, amount: PRICE_BDT }),
        });
        const { nagadURL, error } = await response.json();
        if (error) {
          toast.error(error);
          return;
        }
        if (nagadURL) window.location.href = nagadURL;
      }
    } catch (error) {
      console.error("Payment error:", error);
      toast.error("Failed to process payment. Please try again.");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl bg-[#faf9f6] border-[#e3e3e2] p-0 overflow-hidden sm:rounded-2xl shadow-xl">
        <div className="p-6 text-center border-b border-[#e3e3e2] bg-white">
          <DialogTitle className="text-xl font-semibold tracking-tight text-[#292827] mb-1">
            Choose Payment Method
          </DialogTitle>
          <DialogDescription className="text-sm text-[#666]">
            Upgrade to Pro for ${PRICE_USD.toFixed(2)} USD / month
          </DialogDescription>
        </div>

        <div className="p-6">
          <div className="grid gap-3 mb-6">
            {paymentMethods.map((method) => (
              <button
                key={method.id}
                onClick={() => setSelectedMethod(method.id)}
                disabled={!method.available || processing}
                className={`relative flex items-center gap-4 p-4 rounded-xl border transition-all text-left ${
                  selectedMethod === method.id
                    ? "border-[#421d24] bg-white shadow-sm ring-1 ring-[#421d24]"
                    : "border-[#e3e3e2] bg-white hover:border-[#b9b8b6]"
                } ${!method.available ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
              >
                <div className={`flex h-11 w-11 items-center justify-center rounded-lg ${method.bgColor} ${method.color}`}>
                  <method.icon className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <div className="font-medium text-[#292827] text-sm">{method.name}</div>
                  <div className="text-xs text-[#666]">{method.description}</div>
                </div>
                {selectedMethod === method.id && <CheckCircle2 className="h-5 w-5 text-[#421d24]" />}
              </button>
            ))}
          </div>

          <div className="rounded-xl border border-[#e3e3e2] bg-white p-5 mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-[#666] text-xs font-medium uppercase tracking-wider">Pro Plan (Monthly)</span>
              <span className="text-[#292827] font-semibold text-sm">${PRICE_USD.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center pt-3 border-t border-[#e3e3e2]">
              <span className="text-[#292827] font-medium text-sm">Total</span>
              <span className="text-[#292827] text-lg font-bold">
                {selectedMethod === "stripe" ? `$${PRICE_USD.toFixed(2)} USD` : `৳${PRICE_BDT} BDT`}
              </span>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => onOpenChange(false)}
              disabled={processing}
              className="flex-1 py-2.5 rounded-lg border border-[#e3e3e2] bg-white text-sm font-medium text-[#292827] hover:bg-[#f7f4ef] transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handlePayment}
              disabled={!selectedMethod || processing}
              className="wine-button flex-1 py-2.5 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {processing ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                "Continue to Payment"
              )}
            </button>
          </div>

          <p className="text-center text-[11px] text-[#888] mt-4">
            Encrypted payment powered by Stripe, bKash, and Nagad
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
