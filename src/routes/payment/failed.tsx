import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { AlertCircle } from "lucide-react";
import { brandName } from "@/lib/envoiz";

export const Route = createFileRoute("/payment/failed")({
  head: () => ({
    meta: [
      { title: `Payment Failed - ${brandName}` },
      {
        name: "description",
        content: "Your payment failed. Please try again.",
      },
    ],
  }),
  component: PaymentFailedPage,
});

function PaymentFailedPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#f2f0eb] flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-red-100 border-2 border-red-400 mx-auto mb-6">
          <AlertCircle className="h-10 w-10 text-red-500" />
        </div>
        
        <h1 className="text-3xl font-bold text-[#292827] mb-3">Payment Failed</h1>
        <p className="text-[15px] text-[#55524c] mb-8">
          We couldn't process your payment. This might be due to insufficient funds, an expired card, or a network error. Please check your payment details and try again.
        </p>

        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 mb-8">
          <p className="text-sm text-red-700">
            If the problem persists, please contact your bank or try a different payment method.
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => navigate({ to: "/dashboard" })}
            className="flex-1 py-3 rounded-xl border border-[#dcd9d2] bg-white text-sm font-medium text-[#292827] hover:border-[#b8b4ab] transition-colors"
          >
            Go to Dashboard
          </button>
          <button
            onClick={() => navigate({ to: "/dashboard/settings" })}
            className="wine-button flex-1 py-3 rounded-xl text-sm font-bold"
          >
            Try Again
          </button>
        </div>
      </div>
    </div>
  );
}
