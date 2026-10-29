import { createFileRoute } from "@tanstack/react-router";
import { DashboardApp } from "@/components/envoiz/DashboardApp";

export const Route = createFileRoute("/dashboard/customers")({
  head: () => ({
    meta: [
      { title: "Clients — Envoiz" },
      {
        name: "description",
        content: "A clear view of the people you work with.",
      },
    ],
  }),
  component: DashboardCustomersPage,
});

function DashboardCustomersPage() {
  return <DashboardApp initialSection="clients" />;
}

function StatusPill({ status }: { status: string }) {
  const classes: Record<string, string> = {
    Paid: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20",
    Pending: "bg-amber-500/10 text-amber-400 border border-amber-500/20",
    Overdue: "bg-red-500/10 text-red-400 border border-red-500/20",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-medium",
        classes[status] ?? "bg-neutral-800 text-neutral-400",
      )}
    >
      {status}
    </span>
  );
}
