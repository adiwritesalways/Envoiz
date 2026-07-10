import { Link } from "@tanstack/react-router";
import { supabase } from "@/lib/supabase";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PaymentStatusPill } from "@/components/envoiz/DashboardUI";
import { ArrowRight, ChevronRight, FileStack, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";

type RecentInvoiceRow = {
  id: string;
  client_name?: string | null;
  invoice_number?: string | null;
  payment_status?: any;
  issue_date?: string | null;
};

type RecentInvoicesListProps = {
  user: { id: string } | null;
  onSelect?: (invoice: RecentInvoiceRow) => void;
  title?: string;
  description?: string;
  /** If provided, shows a "View all" button in the header linking to this route. */
  viewAllHref?: string;
};

export function RecentInvoicesList({
  user,
  onSelect,
  title = "Recent invoices",
  description = "Your most recently saved invoices.",
  viewAllHref,
}: RecentInvoicesListProps) {
  const { data: invoices = [], isLoading: loading } = useQuery({
    queryKey: ["recentInvoices", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("envoiz_invoices")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(10);
      if (error) throw error;
      return data || [];
    },
    enabled: Boolean(user?.id),
  });

  const formatDateLabel = (value: string | null | undefined) => {
    if (!value) return "—";
    const date = new Date(`${value}T00:00:00`);
    if (Number.isNaN(date.getTime())) return "—";
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };

  if (!user) return null;

  return (
    <Card className="border-border bg-card p-5 shadow-none w-full">
      <div className="flex items-center justify-between gap-3 border-b border-border pb-4">
        <div>
          <h3 className="text-sm font-semibold tracking-tight">{title}</h3>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
        {viewAllHref && (
          <Button asChild variant="ghost" size="sm" className="shrink-0 -mr-2">
            <Link to={viewAllHref} className="flex items-center gap-1.5">
              View all <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </Button>
        )}
      </div>

      <div className="mt-2 divide-y divide-border">
        {loading ? (
          <div className="flex justify-center items-center py-10">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : invoices.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-10 text-center">
            <FileStack className="h-6 w-6 text-muted-foreground/60" />
            <p className="text-sm text-muted-foreground">No recent invoices found.</p>
          </div>
        ) : (
          invoices.map((inv) => {
            const clientInitial = inv.client_name
              ? inv.client_name.slice(0, 2).toUpperCase()
              : "NA";
            return (
              <div
                key={inv.id}
                className={cn(
                  "group flex items-center justify-between gap-3 py-3 text-sm transition-colors",
                  onSelect && "cursor-pointer hover:bg-muted/50 rounded-md px-2 -mx-2",
                )}
                onClick={() => onSelect && onSelect(inv)}
              >
                <div className="flex min-w-0 items-center gap-3">
                  <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-border bg-background text-[11px] font-semibold uppercase text-foreground">
                    {clientInitial}
                  </div>
                  <div className="min-w-0">
                    <div className="font-medium truncate max-w-[150px] sm:max-w-xs">
                      {inv.client_name || "Unknown Client"}
                    </div>
                    <div className="font-mono text-xs text-muted-foreground">
                      {inv.invoice_number}
                    </div>
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-4">
                  <div className="hidden sm:block">
                    <PaymentStatusPill status={inv.payment_status} />
                  </div>
                  <div className="text-muted-foreground text-xs whitespace-nowrap">
                    {formatDateLabel(inv.issue_date)}
                  </div>
                  {onSelect && (
                    <ChevronRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground/50 transition-transform group-hover:translate-x-0.5" />
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </Card>
  );
}
