import { createFileRoute, Link } from "@tanstack/react-router";
import { useAuth } from "@/components/auth/auth-context";
import { checkIsPro } from "@/lib/invoices";
import { brandName } from "@/lib/envoiz";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { CreditCard, Calendar, Download, Sparkles } from "lucide-react";
import { PaymentModal } from "@/components/envoiz/PaymentModal";

export const Route = createFileRoute("/dashboard/billing")({
  head: () => ({
    meta: [
      { title: `Billing & Payments — ${brandName}` },
      {
        name: "description",
        content: "View your payment history and manage your subscription.",
      },
    ],
  }),
  component: BillingPage,
});

type Payment = {
  id: string;
  gateway: string;
  amount: number;
  currency: string;
  status: string;
  transaction_id: string;
  created_at: string;
};

function PageIntro({ eyebrow, title, copy, action }: { eyebrow: string; title: string; copy?: string; action?: React.ReactNode }) {
  return (
    <div className="mb-10 flex flex-col justify-between gap-6 md:flex-row md:items-end">
      <div>
        <p className="label mb-3">{eyebrow}</p>
        <h1 className="display-title">{title}</h1>
        {copy && <p className="body-copy mt-3 max-w-lg">{copy}</p>}
      </div>
      {action}
    </div>
  );
}

function BillingPage() {
  const { user } = useAuth();
  const isPro = checkIsPro(user);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

  useEffect(() => {
    if (!user) return;

    const fetchPayments = async () => {
      const { data, error } = await supabase
        .from("payments")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (!error && data) {
        setPayments(data);
      }
      setLoading(false);
    };

    fetchPayments();
  }, [user]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatAmount = (amount: number, currency: string) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency,
    }).format(amount);
  };

  return (
    <>
      <PaymentModal open={isPaymentModalOpen} onOpenChange={setIsPaymentModalOpen} />
      <PageIntro
        eyebrow="Workspace / Billing"
        title="Billing & Subscription"
        copy="View your past transactions, payment methods, and current workspace plan."
        action={
          !isPro ? (
            <button
              onClick={() => setIsPaymentModalOpen(true)}
              className="wine-button inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium"
            >
              <Sparkles size={16} />
              Upgrade to Pro
            </button>
          ) : undefined
        }
      />

      <div className="space-y-6">
        {/* Current Plan */}
        <section className="surface p-5 md:p-6">
          <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="label mb-2">Subscription</p>
              <h2 className="section-title">Current plan</h2>
            </div>
            {isPro && (
              <span className="status-pill status-paid self-start sm:self-auto">
                Active Pro Plan
              </span>
            )}
          </div>

          <div className="rounded-lg border border-[#e3e3e2] bg-[#faf9f6] p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="text-xl font-medium tracking-tight text-[#292827] mb-1">
                  {isPro ? "Pro Plan" : "Free Plan"}
                </div>
                <div className="text-xs text-[#666]">
                  {isPro ? "$7.00 / month" : "$0.00 / month"}
                </div>
              </div>
            </div>

            {isPro ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-[#e3e3e2]">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-md bg-white border border-[#e3e3e2]">
                    <Calendar className="h-4 w-4 text-[#666]" />
                  </div>
                  <div>
                    <div className="label">Next billing</div>
                    <div className="text-sm font-medium text-[#292827]">
                      {new Date(
                        new Date(user?.user_metadata?.pro_since || Date.now()).setMonth(
                          new Date(user?.user_metadata?.pro_since || Date.now()).getMonth() + 1
                        )
                      ).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-md bg-white border border-[#e3e3e2]">
                    <CreditCard className="h-4 w-4 text-[#666]" />
                  </div>
                  <div>
                    <div className="label">Payment method</div>
                    <div className="text-sm font-medium text-[#292827]">Card on file</div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="pt-4 border-t border-[#e3e3e2]">
                <p className="body-copy mb-4">
                  You're currently on the Free plan. Upgrade to Pro for unlimited invoices, custom branding, and watermark-free exports.
                </p>
                <button
                  onClick={() => setIsPaymentModalOpen(true)}
                  className="wine-button inline-flex items-center gap-2 px-4 py-2 text-xs font-medium"
                >
                  <Sparkles size={14} />
                  Upgrade to Pro
                </button>
              </div>
            )}
          </div>
        </section>

        {/* Payment History */}
        <section className="surface p-5 md:p-6">
          <div className="mb-6">
            <p className="label mb-2">History</p>
            <h2 className="section-title">Payment history</h2>
          </div>

          {loading ? (
            <div className="text-center py-12 text-sm text-[#666]">Loading transactions…</div>
          ) : payments.length === 0 ? (
            <div className="text-center py-12">
              <span className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-lg bg-[#d4c7ff] text-[#421d24]">
                <CreditCard size={19} />
              </span>
              <p className="text-sm font-medium text-[#292827] mb-1">No payment history yet</p>
              <p className="body-copy max-w-sm mx-auto">
                Transactions and invoices for your subscription will appear here once charged.
              </p>
            </div>
          ) : (
            <div className="overflow-hidden rounded-lg border border-[#e3e3e2]">
              <div className="hidden grid-cols-[1.1fr_1fr_.9fr_.8fr_1fr_auto] gap-4 border-b border-[#e3e3e2] px-5 py-3 bg-[#faf9f6] md:grid">
                <p className="label">Date</p>
                <p className="label">Gateway</p>
                <p className="label">Amount</p>
                <p className="label">Status</p>
                <p className="label">Transaction ID</p>
                <p className="label text-right">Actions</p>
              </div>
              <div className="divide-y divide-[#e3e3e2]">
                {payments.map((payment) => (
                  <div
                    key={payment.id}
                    className="grid grid-cols-1 md:grid-cols-[1.1fr_1fr_.9fr_.8fr_1fr_auto] items-center gap-4 px-5 py-3.5 hover:bg-[#f7f4ef]/50 transition-colors"
                  >
                    <div className="text-sm text-[#292827]">{formatDate(payment.created_at)}</div>
                    <div>
                      <span className="label capitalize">{payment.gateway}</span>
                    </div>
                    <div className="tabular-nums text-sm font-medium text-[#292827]">
                      {formatAmount(payment.amount, payment.currency)}
                    </div>
                    <div>
                      <span
                        className={`status-pill ${
                          payment.status === "completed"
                            ? "status-paid"
                            : payment.status === "failed"
                              ? "status-overdue"
                              : "status-sent"
                        }`}
                      >
                        {payment.status}
                      </span>
                    </div>
                    <div className="font-mono text-xs text-[#666] truncate">
                      {payment.transaction_id || "—"}
                    </div>
                    <div className="text-right">
                      <button className="quiet-link inline-flex items-center gap-1.5 text-xs font-medium">
                        <Download className="h-3.5 w-3.5" />
                        Receipt
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>
      </div>
    </>
  );
}
