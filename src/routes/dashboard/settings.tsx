import { createFileRoute, useRouter } from "@tanstack/react-router";
import { ExternalLink, ShieldCheck, LogOut } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { useAuth } from "@/components/auth/auth-context";
import { DashboardPage, Panel } from "@/components/envoiz/DashboardUI";
import { supabase } from "@/lib/supabase";
import {

  brandName,
  currencyOptions,
  defaultCurrency,
  readUserStorageValue,
  settingsStorageKeys,
  type CurrencyCode,
  writeUserStorageValue,
} from "@/lib/envoiz";

export const Route = createFileRoute("/dashboard/settings")({
  head: () => ({
    meta: [
      { title: `Settings - ${brandName}` },
      {
        name: "description",
        content: "Update profile, company, and billing preferences for Envoiz.",
      },
    ],
  }),
  component: SettingsPage,
});

function SettingsPage() {
  const { user, refreshSession } = useAuth();
  const router = useRouter();
  const [companyName, setCompanyName] = useState("Envoiz Studio");
  const [companyAddress, setCompanyAddress] = useState("Dhanmondi, Dhaka, Bangladesh");
  const [defaultCurrencyValue, setDefaultCurrencyValue] = useState<CurrencyCode>(defaultCurrency);
  const [saving, setSaving] = useState(false);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.navigate({ to: "/login" });
  };

  useEffect(() => {
    if (!user) return;
    // Prefer Supabase metadata (cross-device). Fall back to localStorage for
    // values set before metadata storage was introduced.
    setCompanyName(
      user.user_metadata?.company_name ||
      readUserStorageValue(user.id, settingsStorageKeys.companyName, "Envoiz Studio"),
    );
    setCompanyAddress(
      user.user_metadata?.company_address ||
      readUserStorageValue(user.id, settingsStorageKeys.companyAddress, "Dhanmondi, Dhaka, Bangladesh"),
    );
    setDefaultCurrencyValue(
      readUserStorageValue(user.id, settingsStorageKeys.defaultCurrency, defaultCurrency) as CurrencyCode,
    );
  }, [user?.id]);

  const savePreferences = async () => {
    if (!user) return;
    setSaving(true);
    try {
      // Save company prefs to Supabase metadata — persists across all devices.
      const { error } = await supabase.auth.updateUser({
        data: { company_name: companyName, company_address: companyAddress },
      });
      if (error) throw error;
      await refreshSession();

      // Mirror to localStorage as a same-browser cache.
      writeUserStorageValue(user.id, settingsStorageKeys.companyName, companyName);
      writeUserStorageValue(user.id, settingsStorageKeys.companyAddress, companyAddress);
      writeUserStorageValue(user.id, settingsStorageKeys.defaultCurrency, defaultCurrencyValue);
      toast.success("Preferences saved successfully.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save preferences.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <DashboardPage
      eyebrow="Settings"
      title="Keep your workspace preferences in sync."
      description="Company details and default currency flow directly into invoice creation."
      actions={
        <a
          href="/#pricing"
          className="inline-flex items-center gap-2 rounded-full bg-foreground px-4 py-2 text-[13px] font-medium text-background transition-colors hover:opacity-90"
        >
          Pricing <ExternalLink className="h-3.5 w-3.5" />
        </a>
      }
    >
      <div className="grid gap-4 xl:grid-cols-[0.95fr_1.05fr]">
        <Panel title="Profile" description="Read-only identity details for the workspace owner.">
          <Field label="Email" value={user?.email ?? ""} readOnly />
          <div className="mt-4 rounded-3xl bg-surface/60 p-4 text-[13px] text-muted-foreground">
            <div className="flex items-center gap-2 font-medium text-foreground">
              <ShieldCheck className="h-4 w-4" /> Protected account
            </div>
            <p className="mt-2 leading-relaxed">
              This email comes from your Supabase auth session and stays read-only here.
            </p>
          </div>
          <div className="mt-6">
            <button
              onClick={handleSignOut}
              className="inline-flex items-center gap-2 rounded-xl bg-destructive/10 px-4 py-2.5 text-[13px] font-medium text-destructive transition-colors hover:bg-destructive/20"
            >
              <LogOut className="h-4 w-4" /> Sign Out
            </button>
          </div>
        </Panel>

        <Panel
          title="Preferences"
          description="Default currency will be preselected when creating a new invoice."
        >
          <div className="space-y-4">
            <div>
              <label className="text-[12px] text-muted-foreground">Default Currency</label>
              <select
                value={defaultCurrencyValue}
                onChange={(event) => setDefaultCurrencyValue(event.target.value as CurrencyCode)}
                className="mt-1.5 h-11 w-full rounded-2xl border border-hairline bg-white px-3 text-[14px] outline-none transition focus:border-foreground/20"
              >
                {currencyOptions.map((option) => (
                  <option key={option.code} value={option.code}>
                    {option.code} - {option.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="text-[12px] text-muted-foreground">Company Name</label>
                <input
                  value={companyName}
                  onChange={(event) => setCompanyName(event.target.value)}
                  className="mt-1.5 h-11 w-full rounded-2xl border border-hairline bg-white px-3 text-[14px] outline-none transition focus:border-foreground/20"
                  placeholder="Envoiz Studio"
                />
              </div>
              <div>
                <label className="text-[12px] text-muted-foreground">Company Address</label>
                <input
                  value={companyAddress}
                  onChange={(event) => setCompanyAddress(event.target.value)}
                  className="mt-1.5 h-11 w-full rounded-2xl border border-hairline bg-white px-3 text-[14px] outline-none transition focus:border-foreground/20"
                  placeholder="Your business address"
                />
              </div>
            </div>
            <button
              onClick={savePreferences}
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-full bg-foreground px-4 py-2 text-[13px] font-medium text-background transition-colors hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? "Saving..." : "Save preferences"}
            </button>
          </div>
        </Panel>
      </div>
    </DashboardPage>
  );
}

function Field({
  label,
  value,
  readOnly = false,
}: {
  label: string;
  value: string;
  readOnly?: boolean;
}) {
  return (
    <div>
      <label className="text-[12px] text-muted-foreground">{label}</label>
      <input
        readOnly={readOnly}
        value={value}
        className="mt-1.5 h-11 w-full rounded-2xl border border-hairline bg-white px-3 text-[14px] outline-none transition focus:border-foreground/20 read-only:bg-surface/50"
      />
    </div>
  );
}
