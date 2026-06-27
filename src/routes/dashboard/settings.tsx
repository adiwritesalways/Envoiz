import { createFileRoute } from "@tanstack/react-router";
import { ExternalLink, ShieldCheck, DollarSign } from "lucide-react";
import { useEffect, useState } from "react";

import { DashboardPage, Panel } from "@/components/envoiz/DashboardUI";
import {
  brandName,
  currencyOptions,
  defaultCurrency,
  readStorageValue,
  settingsStorageKeys,
  type CurrencyCode,
  writeStorageValue,
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
  const [email, setEmail] = useState("alex@envoiz.com");
  const [companyName, setCompanyName] = useState("Envoiz Studio");
  const [companyAddress, setCompanyAddress] = useState("Dhanmondi, Dhaka, Bangladesh");
  const [defaultCurrencyValue, setDefaultCurrencyValue] = useState<CurrencyCode>(defaultCurrency);

  useEffect(() => {
    setEmail(readStorageValue(settingsStorageKeys.email, "alex@envoiz.com"));
    setCompanyName(readStorageValue(settingsStorageKeys.companyName, "Envoiz Studio"));
    setCompanyAddress(
      readStorageValue(settingsStorageKeys.companyAddress, "Dhanmondi, Dhaka, Bangladesh"),
    );
    setDefaultCurrencyValue(
      readStorageValue(settingsStorageKeys.defaultCurrency, defaultCurrency) as CurrencyCode,
    );
  }, []);

  const savePreferences = () => {
    writeStorageValue(settingsStorageKeys.email, email);
    writeStorageValue(settingsStorageKeys.companyName, companyName);
    writeStorageValue(settingsStorageKeys.companyAddress, companyAddress);
    writeStorageValue(settingsStorageKeys.defaultCurrency, defaultCurrencyValue);
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
          <Field label="Email" value={email} readOnly />
          <div className="mt-4 rounded-3xl bg-surface/60 p-4 text-[13px] text-muted-foreground">
            <div className="flex items-center gap-2 font-medium text-foreground">
              <ShieldCheck className="h-4 w-4" /> Protected account
            </div>
            <p className="mt-2 leading-relaxed">
              This email is treated as a display-only profile field in the frontend mockup.
            </p>
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
              className="inline-flex items-center gap-2 rounded-full bg-foreground px-4 py-2 text-[13px] font-medium text-background transition-colors hover:opacity-90"
            >
              <DollarSign className="h-3.5 w-3.5" />
              Save preferences
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
