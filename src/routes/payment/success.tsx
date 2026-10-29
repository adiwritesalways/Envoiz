import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { CheckCircle2 } from "lucide-react";
import { useEffect } from "react";
import { brandName } from "@/lib/envoiz";

export const Route = createFileRoute("/payment/success")({
  head: () => ({
    meta: [
      { title: `Payment Successful - ${brandName}` },
      {
        name: "description",
        content: "Your payment was successful. Welcome to Pro!",
      },
    ],
  }),
  component: PaymentSuccessPage,
});

function PaymentSuccessPage() {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to dashboard after 5 seconds
    const timer = setTimeout(() => {
      navigate({ to: "/dashboard" });
    }, 5000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen bg-[#f2f0eb] flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 border-2 border-emerald-500 mx-auto mb-6">
          <CheckCircle2 className="h-10 w-10 text-emerald-600" />
        </div>
        
        <h1 className="text-3xl font-bold text-[#292827] mb-3">Payment Successful!</h1>
        <p className="text-[15px] text-[#55524c] mb-8">
          Thank you for upgrading to Pro. You now have access to unlimited invoices, custom branding, and watermark-free exports.
        </p>

        <div className="rounded-2xl border border-[#dcd9d2] bg-white p-6 mb-8 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <span className="text-[#716e69] text-sm">Plan</span>
            <span className="text-[#292827] font-semibold">Pro</span>
          </div>
          <div className="flex items-center justify-between mb-4">
            <span className="text-[#716e69] text-sm">Amount Paid</span>
            <span className="text-[#292827] font-semibold">$7.00 USD</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[#716e69] text-sm">Billing</span>
            <span className="text-[#292827] font-semibold">Monthly</span>
          </div>
        </div>

        <button
          onClick={() => navigate({ to: "/dashboard" })}
          className="wine-button w-full py-3 rounded-xl text-sm font-bold shadow-md"
        >
          Go to Dashboard
        </button>

        <p className="mt-4 text-xs text-[#949088]">
          Redirecting automatically in 5 seconds...
        </p>
      </div>
    </div>
  );
}
