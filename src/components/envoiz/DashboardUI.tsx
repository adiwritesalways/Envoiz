import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { DashboardShell } from "./DashboardShell";

// ─────────────────────────────────────────────────────────────────────────────

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
    <DashboardShell>
      <div className="space-y-7">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <p className="text-[11px] uppercase tracking-[0.24em] text-neutral-500 font-mono">
              {eyebrow}
            </p>
            <h1 className="mt-3 text-3xl font-bold tracking-[-0.04em] sm:text-4xl text-white">{title}</h1>
            {description && (
              <p className="mt-3 text-[15px] leading-relaxed text-neutral-400">
                {description}
              </p>
            )}
          </div>
          {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
        </div>
        {children}
      </div>
    </DashboardShell>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

type MetricCardProps = {
  label: string;
  value: string;
  delta?: string;
  accent?: string;
};

export function MetricCard({ label, value, delta, accent }: MetricCardProps) {
  const isPositive = delta?.startsWith("+");
  const isNegative = delta?.startsWith("-");

  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-lg border border-[#1F1F1F] bg-[#121212] p-4 sm:p-6 transition-all duration-200 hover:-translate-y-px hover:border-neutral-800",
        accent,
      )}
    >
      <p className="text-[10px] font-medium tracking-wider uppercase text-neutral-500 block mb-1">{label}</p>
      <p className="mt-3 text-xl md:text-2xl font-bold text-[#F5F5F5] tracking-tight tabular-nums leading-none">
        {value}
      </p>
      {delta && (
        <p
          className={cn(
            "mt-2.5 text-[11px] font-medium",
            isPositive && "text-emerald-400",
            isNegative && "text-rose-400",
            !isPositive && !isNegative && "text-neutral-400",
          )}
        >
          {delta}
        </p>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

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
        "rounded-lg border border-[#1F1F1F] bg-[#121212] p-6",
        className,
      )}
    >
      {(title || description || actions) && (
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            {title && <h2 className="text-xs font-semibold uppercase tracking-wider text-white">{title}</h2>}
            {description && (
              <p className="mt-1 text-xs leading-relaxed text-neutral-400">
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

// ─────────────────────────────────────────────────────────────────────────────

type StatusPillProps = {
  status: "Draft" | "Pending" | "Paid" | "Delivered" | "Retrying" | "Active" | "Disabled";
};

export function StatusPill({ status }: StatusPillProps) {
  const classes: Record<StatusPillProps["status"], string> = {
    Paid: "bg-emerald-500/10 text-emerald-400",
    Pending: "bg-amber-500/10 text-amber-400",
    Draft: "bg-neutral-800 text-neutral-400",
    Delivered: "bg-emerald-500/10 text-emerald-400",
    Retrying: "bg-amber-500/10 text-amber-400",
    Active: "bg-emerald-500/10 text-emerald-400",
    Disabled: "bg-neutral-800 text-neutral-400",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-medium",
        classes[status],
      )}
    >
      {status}
    </span>
  );
}

export function PaymentStatusPill({ status }: StatusPillProps) {
  return <StatusPill status={status} />;
}

// ─────────────────────────────────────────────────────────────────────────────

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
    <div className="rounded-xl border border-dashed border-[#1F1F1F] bg-[#121212]/50 p-8 text-center">
      <h3 className="text-[15px] font-medium text-white">{title}</h3>
      <p className="mx-auto mt-2 max-w-md text-[13px] leading-relaxed text-neutral-400">
        {description}
      </p>
      {action && <div className="mt-5 flex justify-center">{action}</div>}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

function smoothPath(pts: [number, number][]): string {
  if (pts.length < 2) return "";
  let d = `M ${pts[0][0]},${pts[0][1]}`;
  for (let i = 1; i < pts.length; i++) {
    const prev = pts[i - 1];
    const curr = pts[i];
    const cpx = (prev[0] + curr[0]) / 2;
    d += ` C ${cpx},${prev[1]} ${cpx},${curr[1]} ${curr[0]},${curr[1]}`;
  }
  return d;
}

export function RevenueChart({ values, className }: { values: number[]; className?: string }) {
  const W = 800;
  const H = 180;
  const PAD = { top: 16, bottom: 4, left: 0, right: 0 };

  const max = Math.max(...values);
  const min = Math.min(...values);
  const range = max - min || 1;

  const pts: [number, number][] = values.map((v, i) => [
    PAD.left + (i / (values.length - 1)) * (W - PAD.left - PAD.right),
    PAD.top + ((max - v) / range) * (H - PAD.top - PAD.bottom) * 0.88,
  ]);

  const line = smoothPath(pts);
  const area = `${line} L${W},${H} L0,${H} Z`;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" className={cn("w-full", className)}>
      <defs>
        <linearGradient id="rev-gradient" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="currentColor" stopOpacity="0.1" />
          <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} className="fill-current text-white/5" fill="url(#rev-gradient)" />
      <path
        d={line}
        fill="none"
        className="stroke-white/40"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** Legacy mini chart — kept for other pages that still reference it */
export function MiniChart({ values }: { values: number[] }) {
  return <RevenueChart values={values} className="h-24" />;
}
