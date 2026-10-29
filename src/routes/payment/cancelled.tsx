import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { XCircle } from "lucide-react";
import { brandName } from "@/lib/envoiz";

export const Route = createFileRoute("/payment/cancelled")({
  head: () => ({
    meta: [
      { title: `Payment Cancelled - ${brandName}` },
      {
        name: "description",
        content: "Your payment was cancelled.",
      },
    ],
  }),
  component: PaymentCancelledPage,
});

function PaymentCancelledPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#f2f0eb] flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#f0ece1] border-2 border-[#dcd9d2] mx-auto mb-6">
          <XCircle className="h-10 w-10 text-[#716e69]" />
        </div>
        
        <h1 className="text-3xl font-bold text-[#292827] mb-3">Payment Cancelled</h1>
        <p className="text-[15px] text-[#55524c] mb-8">
          Your payment was cancelled. No charges were made to your account. You can try again whenever you're ready.
        </p>

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
