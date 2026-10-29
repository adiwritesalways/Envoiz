import { createFileRoute } from "@tanstack/react-router";
import { DashboardApp } from "@/components/envoiz/DashboardApp";

export const Route = createFileRoute("/dashboard/settings")({
  head: () => ({
    meta: [
      { title: "Settings — Envoiz" },
      {
        name: "description",
        content: "Make Envoiz work the way your business does.",
      },
    ],
  }),
  component: DashboardSettingsPage,
});

function DashboardSettingsPage() {
  return <DashboardApp initialSection="settings" />;
}

function SelectField({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <div className="min-w-0">
      <label className="text-[12px] font-medium text-neutral-400">{label}</label>
      <div className="relative mt-1.5">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-11 w-full appearance-none rounded-2xl border border-hairline bg-[#0d0d0d] pl-3.5 pr-10 text-[14px] text-white outline-none transition focus:border-foreground/20"
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value} className="bg-[#0d0d0d] text-white">
              {opt.label}
            </option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500" />
      </div>
    </div>
  );
}

function getPasswordStrength(password: string) {
  let score = 0;
  if (password.length >= 8) score += 1;
  if (password.length >= 12) score += 1;
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score += 1;
  if (/[0-9]/.test(password)) score += 1;
  if (/[^A-Za-z0-9]/.test(password)) score += 1;

  if (score <= 1) return { label: "Weak", pct: 33, color: "bg-red-500", text: "text-red-400" };
  if (score <= 3) return { label: "Fair", pct: 66, color: "bg-amber-500", text: "text-amber-400" };
  return { label: "Strong", pct: 100, color: "bg-emerald-500", text: "text-emerald-400" };
}

function PasswordStrengthMeter({ password }: { password: string }) {
  const strength = getPasswordStrength(password);
  return (
    <div className="flex items-center gap-2.5">
      <div className="h-1 flex-1 overflow-hidden rounded-full bg-[#1f1f1f]">
        <div
          className={cn("h-full rounded-full transition-all", strength.color)}
          style={{ width: `${strength.pct}%` }}
        />
      </div>
      <span className={cn("text-[11px] font-medium", strength.text)}>{strength.label}</span>
    </div>
  );
}
