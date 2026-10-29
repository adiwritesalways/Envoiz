import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, Check, CreditCard, Loader2, ShieldCheck, Smartphone, Wallet } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/components/auth/auth-context";
import { brandName } from "@/lib/envoiz";
import { PRICE_BDT, PRICE_USD } from "@/lib/payment";
import { createStripeCheckoutSession } from "@/lib/stripe";

export const Route = createFileRoute("/checkout")({
  head: () => ({
    meta: [
      { title: `Checkout - ${brandName}` },
      { name: "description", content: "Upgrade your Envoiz workspace securely." },
    ],
  }),
  component: CheckoutPage,
});

type PaymentMethod = "stripe" | "paypal" | "bkash" | "nagad";

const methods = [
  { id: "stripe" as const, label: "Card", detail: "Visa, Mastercard, Amex", icon: CreditCard, currency: "USD" },
  { id: "paypal" as const, label: "PayPal", detail: "Pay with your PayPal account", icon: Wallet, currency: "USD" },
  { id: "bkash" as const, label: "bKash", detail: "Bangladesh mobile wallet", icon: Smartphone, currency: "BDT" },
  { id: "nagad" as const, label: "Nagad", detail: "Bangladesh digital wallet", icon: Wallet, currency: "BDT" },
];

function CheckoutPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>("stripe");
  const [processing, setProcessing] = useState(false);
  const selected = methods.find((method) => method.id === selectedMethod)!;
  const amount = selected.currency === "BDT" ? `৳${PRICE_BDT}` : `$${PRICE_USD.toFixed(2)}`;

  const handlePayment = async () => {
    if (!user) {
      void navigate({ to: "/login", search: { redirect: "/checkout" } as never });
      return;
    }
    setProcessing(true);
    try {
      if (selectedMethod === "stripe") {
        const result = await createStripeCheckoutSession(user.id);
        if (result.error) throw new Error(result.error);
        if (result.url) window.location.href = result.url;
      } else if (selectedMethod === "paypal") {
        const response = await fetch("/api/paypal/create-payment", {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: user.id }),
        });
        const result = await response.json();
        if (!response.ok || !result.url) throw new Error(result.error || "PayPal is not configured yet.");
        window.location.href = result.url;
      } else {
        const response = await fetch(`/api/${selectedMethod}/create-payment`, {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: user.id, amount: PRICE_BDT }),
        });
        const result = await response.json();
        const url = selectedMethod === "bkash" ? result.bkashURL : result.nagadURL;
        if (!response.ok || !url) throw new Error(result.error || "Could not start payment.");
        window.location.href = url;
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not start payment.");
      setProcessing(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white">
      <header className="border-b border-[#1d1d1d] bg-[#0d0d0d]/90">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
          <button onClick={() => navigate({ to: "/" })} className="flex items-center gap-2 text-sm text-neutral-400 hover:text-white">
            <ArrowLeft className="h-4 w-4" /> Back to Envoiz
          </button>
          <span className="text-sm font-medium tracking-wide text-neutral-300">Secure checkout</span>
        </div>
      </header>
      <div className="mx-auto grid max-w-6xl gap-6 px-6 py-12 lg:grid-cols-[1.1fr_.9fr] lg:gap-10 lg:py-20">
        <section>
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-neutral-500">Upgrade your workflow</p>
          <h1 className="mb-4 text-4xl font-semibold tracking-tight sm:text-5xl">Checkout</h1>
          <p className="mb-10 max-w-xl text-base leading-7 text-neutral-400">Choose the payment method that works best for you. Local wallets are charged in BDT; international methods remain in USD.</p>
          <div className="grid gap-3 sm:grid-cols-2">
            {methods.map((method) => {
              const Icon = method.icon;
              const active = method.id === selectedMethod;
              return <button key={method.id} onClick={() => setSelectedMethod(method.id)} className={`flex items-center gap-4 rounded-2xl border p-5 text-left transition-colors ${active ? "border-white bg-[#1b1b1b]" : "border-[#242424] bg-[#111111] hover:border-[#3a3a3a]"}`}>
                <span className={`flex h-11 w-11 items-center justify-center rounded-xl ${active ? "bg-white text-black" : "bg-[#202020] text-neutral-400"}`}><Icon className="h-5 w-5" /></span>
                <span className="min-w-0 flex-1"><span className="block font-medium">{method.label}</span><span className="mt-1 block text-xs text-neutral-500">{method.detail}</span></span>
                {active && <Check className="h-5 w-5" />}
              </button>;
            })}
          </div>
          <div className="mt-8 flex items-center gap-3 text-xs text-neutral-500"><ShieldCheck className="h-4 w-4 text-emerald-500" /> Your payment is securely processed by the selected provider.</div>
        </section>
        <aside className="h-fit rounded-3xl border border-[#252525] bg-[#121212] p-6 sm:p-8">
          <p className="text-sm text-neutral-500">Your plan</p><div className="mt-3 flex items-end justify-between border-b border-[#252525] pb-6"><div><h2 className="text-2xl font-semibold">Envoiz Pro</h2><p className="mt-1 text-sm text-neutral-500">Monthly subscription</p></div><span className="text-2xl font-semibold">{amount}</span></div>
          <ul className="space-y-4 py-6 text-sm text-neutral-300">{["Unlimited invoices", "Custom branding", "Multiple payment methods", "No Envoiz watermark"].map((feature) => <li key={feature} className="flex gap-3"><Check className="h-4 w-4 text-emerald-500" />{feature}</li>)}</ul>
          <div className="flex items-center justify-between border-t border-[#252525] pt-5 text-sm"><span className="text-neutral-500">Total today</span><span className="text-xl font-semibold">{amount} <small className="text-xs font-normal text-neutral-500">{selected.currency}</small></span></div>
          <button onClick={handlePayment} disabled={processing} className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-white py-3.5 text-sm font-semibold text-black transition hover:bg-neutral-200 disabled:cursor-not-allowed disabled:opacity-60">{processing ? <><Loader2 className="h-4 w-4 animate-spin" /> Connecting...</> : `Continue with ${selected.label}`}</button>
          <p className="mt-4 text-center text-xs leading-5 text-neutral-600">By continuing, you agree to the Envoiz subscription terms. You can cancel anytime.</p>
        </aside>
      </div>
    </main>
  );
}
