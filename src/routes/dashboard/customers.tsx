import { createFileRoute } from "@tanstack/react-router";
import { Loader2, Mail, Plus } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

import { useAuth } from "@/components/auth/auth-context";
import { DashboardPage, EmptyState, Panel } from "@/components/envoiz/DashboardUI";
import { brandName } from "@/lib/envoiz";
import { buildCustomerIndex, fetchInvoices } from "@/lib/invoices";

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

function CustomersPage() {
  const { user } = useAuth();
  const customersQuery = useQuery({
    queryKey: ["customers", user?.id],
    queryFn: () => fetchInvoices(user?.id ?? ""),
    enabled: Boolean(user?.id),
  });

  const customers = buildCustomerIndex(customersQuery.data ?? []);

  return (
    <DashboardPage
      eyebrow="Customers"
      title="Simple customer management."
      description="A lightweight directory with the essentials now, and room to grow later."
      actions={
        <button className="inline-flex items-center gap-2 rounded-full bg-foreground px-4 py-2 text-[13px] font-medium text-background transition-colors hover:opacity-90">
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
            title="We couldn’t load customers."
            description="The list is derived from invoices, so this usually means Supabase returned an error while fetching invoice rows."
          />
        ) : customers.length ? (
          <div className="overflow-hidden rounded-3xl border border-hairline">
            <div className="grid grid-cols-[1.2fr_1.6fr_0.5fr] bg-surface/70 px-4 py-3 text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
              <span>Name</span>
              <span>Email</span>
              <span className="text-right">Count</span>
            </div>
            <div className="divide-y divide-hairline bg-white">
              {customers.map((customer) => (
                <div
                  key={customer.email}
                  className="grid grid-cols-[1.2fr_1.6fr_0.5fr] items-center gap-3 px-4 py-4"
                >
                  <div className="text-[14px] font-medium">{customer.name}</div>
                  <div className="flex items-center gap-2 text-[13px] text-muted-foreground">
                    <Mail className="h-3.5 w-3.5" />
                    <span className="truncate">{customer.email}</span>
                  </div>
                  <div className="text-right text-[12px] text-muted-foreground">
                    {customer.count} invoices
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
    </DashboardPage>
  );
}
