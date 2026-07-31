import { createFileRoute, useNavigate } from "@tanstack/react-router";
import InvoiceTemplate from "@/components/InvoiceTemplate";
import { useAuth } from "@/components/auth/auth-context";
import { checkIsPro } from "@/lib/invoices";
import { useEffect } from "react";

export const Route = createFileRoute("/invoice")({
  component: InvoicePage,
});

function InvoicePage() {
  const { session, loading } = useAuth();
  const navigate = useNavigate();
  // Using the exact pattern found in invoices.tsx
  const isPro = checkIsPro(session?.user);

  useEffect(() => {
    if (!loading && !isPro) {
      void navigate({ to: "/dashboard/settings" });
    }
  }, [loading, isPro, navigate]);

  if (loading || !isPro) return null;

  return <InvoiceTemplate />;
}
