import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Check } from "lucide-react";

export function UpgradeModal({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl bg-[#0D0D0D] border-[#1F1F1F] p-0 overflow-hidden sm:rounded-2xl">
        <div className="p-8 text-center border-b border-[#1F1F1F]">
          <DialogTitle className="text-2xl font-bold tracking-tight text-white mb-2">
            You have hit your monthly limit
          </DialogTitle>
          <DialogDescription className="text-[15px] text-neutral-400 max-w-md mx-auto">
            Upgrade your plan for unlimited invoices and more features.
          </DialogDescription>
        </div>

        <div className="grid md:grid-cols-2 gap-0">
          {/* Free Tier */}
          <div className="p-8 border-r border-[#1F1F1F] bg-[#121212]">
            <h3 className="text-lg font-semibold text-white mb-1">Free Tier</h3>
            <div className="text-sm text-neutral-500 mb-6">For getting started</div>
            <div className="mb-6">
              <span className="text-4xl font-bold text-white">$0</span>
              <span className="text-neutral-500">/month</span>
            </div>
            <ul className="space-y-4 mb-8">
              {[
                "Up to 10 invoices per month",
                "Basic templates",
                "Envoiz watermark",
                "Standard support",
              ].map((feature, i) => (
                <li key={i} className="flex items-center gap-3 text-sm text-neutral-300">
                  <Check className="h-4 w-4 text-neutral-600" />
                  {feature}
                </li>
              ))}
            </ul>
            <button
              disabled
              className="w-full py-2.5 rounded-lg border border-[#2A2A2A] bg-[#1A1A1A] text-sm font-medium text-neutral-400 cursor-not-allowed"
            >
              Current Plan
            </button>
          </div>

          {/* Pro Tier */}
          <div className="p-8 bg-[#121212] relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 blur-[50px] rounded-full pointer-events-none" />
            
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-medium mb-4">
              ✨ Recommended
            </div>
            <h3 className="text-lg font-semibold text-white mb-1">Pro Tier</h3>
            <div className="text-sm text-neutral-500 mb-6">For growing businesses</div>
            <div className="mb-6">
              <span className="text-4xl font-bold text-white">$7</span>
              <span className="text-neutral-500">/month</span>
            </div>
            <ul className="space-y-4 mb-8">
              {[
                "Unlimited invoices",
                "Premium templates",
                "Remove Envoiz watermark",
                "Custom logo & branding",
                "Recurring invoices",
                "Multiple payment methods",
              ].map((feature, i) => (
                <li key={i} className="flex items-center gap-3 text-sm text-neutral-200">
                  <Check className="h-4 w-4 text-emerald-500" />
                  {feature}
                </li>
              ))}
            </ul>
            <button
              onClick={() => {
                alert("Payment integration coming soon!");
                onOpenChange(false);
              }}
              className="w-full py-2.5 rounded-lg border border-transparent bg-white text-black text-sm font-medium hover:bg-neutral-200 transition-colors"
            >
              Upgrade to Pro
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
