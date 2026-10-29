import { createFileRoute, redirect } from "@tanstack/react-router";
import { useAuth } from "@/components/auth/auth-context";
import { checkIsPro } from "@/lib/invoices";
import InvoiceTemplate from "@/components/InvoiceTemplate";
import { Lock } from "lucide-react";
import { UpgradeModal } from "@/components/envoiz/UpgradeModal";
import { useState } from "react";
import { brandName } from "@/lib/envoiz";

export const Route = createFileRoute("/invoice-template")({
  head: () => ({
    meta: [
      { title: `Template 2 Invoice Template - ${brandName}` },
      {
        name: "description",
        content:
          "Professional dark-themed invoice template with clean typography and modern layout.",
      },
    ],
  }),
  component: InvoiceTemplatePage,
});

function InvoiceTemplatePage() {
  const { user } = useAuth();
  const isPro = checkIsPro(user);
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);

  if (!isPro) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-6">
        <div className="max-w-md text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#1a1a1a] border border-[#2a2a2a] mx-auto">
            <Lock className="h-7 w-7 text-neutral-400" />
          </div>
          <h1 className="mt-6 text-2xl font-semibold text-white">Pro Feature</h1>
          <p className="mt-3 text-[15px] text-neutral-400 leading-relaxed">
            The Template 2 invoice template is available on Pro and Business plans. Upgrade to
            unlock this template and remove the Envoiz watermark.
          </p>
          <button
            onClick={() => setUpgradeModalOpen(true)}
            className="mt-8 inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-[14px] font-medium text-black hover:bg-neutral-200 transition-colors"
          >
            Upgrade to Pro
          </button>
        </div>
        <UpgradeModal open={upgradeModalOpen} onOpenChange={setUpgradeModalOpen} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-semibold text-white">Template 2</h1>
          <p className="mt-2 text-[14px] text-neutral-400">
            Professional dark-themed invoice with modern typography
          </p>
        </div>
        <div className="rounded-2xl border border-[#222] bg-[#0d0d0d] p-4 overflow-hidden">
          <InvoiceTemplate />
        </div>
      </div>
    </div>
  );
}
