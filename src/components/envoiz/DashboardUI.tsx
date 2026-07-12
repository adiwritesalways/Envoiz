import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

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
    <div className="space-y-7">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-2xl">
          <p className="text-[11px] uppercase tracking-[0.24em] text-muted-foreground">
            {eyebrow}
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">{title}</h1>
          {description && (
            <p className="mt-3 text-[15px] leading-relaxed text-muted-foreground">
              {description}
            </p>
          )}
        </div>
        {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
      </div>
      {children}
    </div>
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
        "group relative overflow-hidden rounded-[1.75rem] border border-hairline bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(248,248,248,0.92))] p-6 shadow-[0_1px_2px_rgba(0,0,0,0.03),0_16px_48px_rgba(0,0,0,0.04)] transition-all duration-200 hover:-translate-y-px hover:shadow-[0_1px_2px_rgba(0,0,0,0.04),0_24px_64px_rgba(0,0,0,0.08)]",
        accent,
      )}
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-black/10 to-transparent" />
      <p className="text-[11.5px] text-muted-foreground">{label}</p>
      <p className="mt-3 text-[1.9rem] font-semibold tracking-[-0.04em] tabular-nums leading-none">
        {value}
      </p>
      {delta && (
        <p
          className={cn(
            "mt-2.5 text-[12px] font-medium",
            isPositive && "text-emerald-600",
            isNegative && "text-red-500",
            !isPositive && !isNegative && "text-muted-foreground",
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
        "rounded-[1.9rem] border border-hairline bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(249,249,249,0.92))] p-6 shadow-[0_1px_2px_rgba(0,0,0,0.03),0_16px_48px_rgba(0,0,0,0.04)]",
        className,
      )}
    >
      {(title || description || actions) && (
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            {title && <h2 className="text-[14px] font-semibold tracking-[-0.02em]">{title}</h2>}
            {description && (
              <p className="mt-1 text-[12.5px] leading-relaxed text-muted-foreground">
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
    Paid: "bg-foreground text-background",
    Pending: "bg-secondary text-foreground",
    Draft: "bg-secondary text-muted-foreground",
    Delivered: "bg-emerald-50 text-emerald-700",
    Retrying: "bg-amber-50 text-amber-700",
    Active: "bg-foreground text-background",
    Disabled: "bg-secondary text-muted-foreground",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-medium",
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
    <div className="rounded-3xl border border-dashed border-hairline bg-surface/60 p-8 text-center">
      <h3 className="text-[15px] font-medium">{title}</h3>
      <p className="mx-auto mt-2 max-w-md text-[13px] leading-relaxed text-muted-foreground">
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
          <stop offset="0%" stopColor="currentColor" stopOpacity="0.18" />
          <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} className="fill-current text-foreground/85" fill="url(#rev-gradient)" />
      <path
        d={line}
        fill="none"
        className="stroke-foreground"
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
