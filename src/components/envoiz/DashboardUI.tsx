import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type DashboardPageProps = {
  eyebrow: string;
  title: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
};

export function DashboardPage({
  eyebrow,
  title,
  description,
  actions,
  children,
}: DashboardPageProps) {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-2xl">
          <p className="text-[11px] uppercase tracking-[0.24em] text-muted-foreground">{eyebrow}</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">{title}</h1>
          {description && (
            <p className="mt-3 text-[15px] leading-relaxed text-muted-foreground">{description}</p>
          )}
        </div>
        {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
      </div>

      {children}
    </div>
  );
}

type MetricCardProps = {
  label: string;
  value: string;
  delta?: string;
  accent?: string;
};

export function MetricCard({ label, value, delta, accent }: MetricCardProps) {
  return (
    <div
      className={cn(
        "rounded-3xl border border-hairline bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.03),0_18px_50px_rgba(0,0,0,0.05)]",
        accent,
      )}
    >
      <p className="text-[12px] text-muted-foreground">{label}</p>
      <div className="mt-3 flex items-end justify-between gap-3">
        <div className="text-3xl font-semibold tracking-[-0.04em] tabular-nums">{value}</div>
        {delta && (
          <span className="rounded-full bg-secondary px-2.5 py-1 text-[11px] font-medium text-foreground">
            {delta}
          </span>
        )}
      </div>
    </div>
  );
}

type PanelProps = {
  title?: string;
  description?: string;
  actions?: ReactNode;
  className?: string;
  children: ReactNode;
};

export function Panel({ title, description, actions, className, children }: PanelProps) {
  return (
    <section
      className={cn(
        "rounded-3xl border border-hairline bg-white/90 p-5 shadow-[0_1px_2px_rgba(0,0,0,0.03),0_18px_50px_rgba(0,0,0,0.05)]",
        className,
      )}
    >
      {(title || description || actions) && (
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            {title && <h2 className="text-[15px] font-medium tracking-[-0.02em]">{title}</h2>}
            {description && (
              <p className="mt-1 text-[13px] leading-relaxed text-muted-foreground">
                {description}
              </p>
            )}
          </div>
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </div>
      )}
      {children}
    </section>
  );
}

type StatusPillProps = {
  status: "Pending" | "Paid" | "Delivered" | "Retrying" | "Active" | "Disabled";
};

export function StatusPill({ status }: StatusPillProps) {
  const classes = {
    Paid: "bg-foreground text-background",
    Pending: "bg-secondary text-foreground",
    Delivered: "bg-emerald-50 text-emerald-700",
    Retrying: "bg-amber-50 text-amber-700",
    Active: "bg-foreground text-background",
    Disabled: "bg-secondary text-muted-foreground",
  }[status];

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-medium",
        classes,
      )}
    >
      {status}
    </span>
  );
}

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="rounded-3xl border border-dashed border-hairline bg-surface/60 p-8 text-center">
      <h3 className="text-[15px] font-medium">{title}</h3>
      <p className="mx-auto mt-2 max-w-md text-[13px] leading-relaxed text-muted-foreground">
        {description}
      </p>
      {action && <div className="mt-5 flex justify-center">{action}</div>}
    </div>
  );
}

export function MiniChart({ values }: { values: number[] }) {
  const max = Math.max(...values);
  const path = values
    .map((value, index) => {
      const x = values.length === 1 ? 0 : (index / (values.length - 1)) * 100;
      const y = 100 - (value / max) * 84;
      return `${index === 0 ? "M" : "L"}${x},${y}`;
    })
    .join(" ");

  return (
    <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="h-24 w-full">
      <defs>
        <linearGradient id="dashboard-chart" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="currentColor" stopOpacity="0.16" />
          <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path
        d={`${path} L100,100 L0,100 Z`}
        className="fill-current text-foreground/10"
        fill="url(#dashboard-chart)"
      />
      <path d={path} className="fill-none stroke-foreground" strokeWidth="1.5" />
    </svg>
  );
}
