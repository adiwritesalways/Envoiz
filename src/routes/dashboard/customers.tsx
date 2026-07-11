import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, ChevronRight, Loader2, Mail, Plus } from "lucide-react";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";

import { useAuth } from "@/components/auth/auth-context";
import { DashboardPage, EmptyState, Panel } from "@/components/envoiz/DashboardUI";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { brandName } from "@/lib/envoiz";
import { buildCustomerIndex, fetchInvoices, type InvoiceRecord } from "@/lib/invoices";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/dashboard/customers")({
  head: () => ({
    meta: [
      { title: `Customers - ${brandName}` },
      {
        name: "description",
        content: "Manage customer records and prepare for future customer expansion in Envoiz.",
      },
    ],
  }),
  component: CustomersPage,
});

type Customer = {
  name: string;
  email: string;
  lastInvoiceAt: string;
  count: number;
  total: number;
};

function CustomersPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [addCustomerOpen, setAddCustomerOpen] = useState(false);
  const [addName, setAddName] = useState("");
  const [addEmail, setAddEmail] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  const customersQuery = useQuery({
    queryKey: ["customers", user?.id],
    queryFn: () => fetchInvoices(user?.id ?? ""),
    enabled: Boolean(user?.id),
  });

  const allInvoices: InvoiceRecord[] = customersQuery.data ?? [];
  const customers = buildCustomerIndex(allInvoices);

  const handleAddCustomer = () => {
    setAddCustomerOpen(false);
    setAddName("");
    setAddEmail("");
    toast.info(
      "To add a customer, create an invoice for them — they'll appear here automatically.",
    );
  };

  const customerInvoices = selectedCustomer
    ? allInvoices.filter(
        (inv) => inv.clientEmail.toLowerCase() === selectedCustomer.email.toLowerCase(),
      )
    : [];

  const formatMoney = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return "—";
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };

  if (selectedCustomer) {
    return (
      <DashboardPage
        eyebrow="Customers"
        title={selectedCustomer.name}
        description={selectedCustomer.email}
        actions={
          <button
            onClick={() => setSelectedCustomer(null)}
            className="inline-flex items-center gap-2 rounded-full border border-hairline bg-white px-4 py-2 text-[13px] font-medium transition-colors hover:bg-secondary"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> All customers
          </button>
        }
      >
        <div className="grid gap-4 sm:grid-cols-3 mb-4">
          {[
            { label: "Total invoices", value: String(selectedCustomer.count) },
            { label: "Total invoiced", value: formatMoney(selectedCustomer.total) },
            { label: "Last invoice", value: formatDate(selectedCustomer.lastInvoiceAt) },
          ].map((m) => (
            <div
              key={m.label}
              className="rounded-3xl border border-hairline bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.04)]"
            >
              <div className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                {m.label}
              </div>
              <div className="mt-2 font-mono text-2xl font-semibold tabular-nums tracking-tight">
                {m.value}
              </div>
            </div>
          ))}
        </div>

        <Panel title="Invoices" description={`All invoices for ${selectedCustomer.name}`}>
          {customerInvoices.length === 0 ? (
            <EmptyState
              title="No invoices found"
              description="This customer has no invoices yet."
            />
          ) : (
            <div className="overflow-hidden rounded-3xl border border-hairline">
              <div className="grid grid-cols-[auto_1fr_auto_auto] bg-surface/70 px-4 py-3 text-[11px] uppercase tracking-[0.16em] text-muted-foreground gap-4">
                <span>Invoice #</span>
                <span>Status</span>
                <span className="text-right">Amount</span>
                <span />
              </div>
              <div className="divide-y divide-hairline bg-white">
                {customerInvoices.map((inv) => (
                  <div
                    key={inv.id}
                    onClick={() => navigate({ to: "/dashboard/invoices" })}
                    className="grid grid-cols-[auto_1fr_auto_auto] items-center gap-4 px-4 py-4 cursor-pointer hover:bg-surface/40 transition-colors"
                  >
                    <div className="font-mono text-[13px] font-medium text-muted-foreground">
                      {inv.id}
                    </div>
                    <StatusPill status={inv.status as string} />
                    <div className="text-right text-[13px] font-medium tabular-nums">
                      {formatMoney(inv.total)}
                    </div>
                    <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/50" />
                  </div>
                ))}
              </div>
            </div>
          )}
        </Panel>
      </DashboardPage>
    );
  }

  return (
    <DashboardPage
      eyebrow="Customers"
      title="Simple customer management."
      description="A lightweight directory with the essentials now, and room to grow later."
      actions={
        <button
          onClick={() => setAddCustomerOpen(true)}
          className="inline-flex items-center gap-2 rounded-full bg-foreground px-4 py-2 text-[13px] font-medium text-background transition-colors hover:opacity-90"
        >
          <Plus className="h-3.5 w-3.5" /> Add customer
        </button>
      }
    >
      <Panel title="Customer list" description="Name and email only, ready for future expansion.">
        {customersQuery.isLoading ? (
          <div className="flex items-center gap-2 text-[13px] text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading customers...
          </div>
        ) : customersQuery.isError ? (
          <EmptyState
            title="We couldn't load customers."
            description="The list is derived from invoices, so this usually means Supabase returned an error while fetching invoice rows."
          />
        ) : customers.length ? (
          <div className="overflow-hidden rounded-3xl border border-hairline">
            <div className="grid grid-cols-[1.2fr_1.6fr_0.7fr_0.5fr] bg-surface/70 px-4 py-3 text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
              <span>Name</span>
              <span>Email</span>
              <span className="text-right">Total invoiced</span>
              <span className="text-right">Count</span>
            </div>
            <div className="divide-y divide-hairline bg-white">
              {customers.map((customer) => (
                <div
                  key={customer.email}
                  onClick={() => setSelectedCustomer(customer)}
                  className="grid grid-cols-[1.2fr_1.6fr_0.7fr_0.5fr] items-center gap-3 px-4 py-4 cursor-pointer hover:bg-surface/40 transition-colors"
                >
                  <div className="text-[14px] font-medium">{customer.name}</div>
                  <div className="flex items-center gap-2 text-[13px] text-muted-foreground">
                    <Mail className="h-3.5 w-3.5 shrink-0" />
                    <span className="truncate">{customer.email}</span>
                  </div>
                  <div className="text-right text-[13px] font-medium tabular-nums">
                    {formatMoney(customer.total)}
                  </div>
                  <div className="text-right text-[12px] text-muted-foreground">
                    {customer.count}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <EmptyState
            title="Customer profiles are intentionally lean."
            description="Create your first invoice to populate the customer directory automatically."
          />
        )}
      </Panel>

      <Dialog open={addCustomerOpen} onOpenChange={setAddCustomerOpen}>
        <DialogContent className="max-w-sm gap-0 border-hairline p-0 overflow-hidden">
          <div className="border-b border-hairline px-6 py-5">
            <DialogTitle className="text-[17px] font-semibold">Add Customer</DialogTitle>
            <DialogDescription className="mt-1 text-[13px] text-muted-foreground">
              Customers are auto-created from invoices.
            </DialogDescription>
          </div>
          <div className="p-6 space-y-4">
            <div>
              <label className="text-[12px] text-muted-foreground">Name</label>
              <input
                value={addName}
                onChange={(e) => setAddName(e.target.value)}
                placeholder="Client name"
                className="mt-1.5 h-11 w-full rounded-2xl border border-hairline bg-white px-3 text-[14px] outline-none transition focus:border-foreground/20"
              />
            </div>
            <div>
              <label className="text-[12px] text-muted-foreground">Email</label>
              <input
                type="email"
                value={addEmail}
                onChange={(e) => setAddEmail(e.target.value)}
                placeholder="client@company.com"
                className="mt-1.5 h-11 w-full rounded-2xl border border-hairline bg-white px-3 text-[14px] outline-none transition focus:border-foreground/20"
              />
            </div>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setAddCustomerOpen(false)}
                className="inline-flex items-center gap-2 rounded-full border border-hairline bg-white px-4 py-2 text-[13px] font-medium transition-colors hover:bg-secondary"
              >
                Cancel
              </button>
              <button
                onClick={handleAddCustomer}
                className="inline-flex items-center gap-2 rounded-full bg-foreground px-4 py-2 text-[13px] font-medium text-background transition-colors hover:opacity-90"
              >
                Save
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </DashboardPage>
  );
}

function StatusPill({ status }: { status: string }) {
  const classes: Record<string, string> = {
    Paid: "bg-[#dcfce7] text-[#15803d]",
    Pending: "bg-[#f1f1f1] text-[#525252]",
    Overdue: "bg-[#fee2e2] text-[#b91c1c]",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-medium",
        classes[status] ?? "bg-secondary text-foreground",
      )}
    >
      {status}
    </span>
  );
}
