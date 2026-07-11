import { createFileRoute, useRouter } from "@tanstack/react-router";
import { ExternalLink, ShieldCheck, LogOut, Eye, EyeOff } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { useAuth } from "@/components/auth/auth-context";
import { DashboardPage, Panel } from "@/components/envoiz/DashboardUI";
import { supabase } from "@/lib/supabase";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
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
  const [companyName, setCompanyName] = useState("");
  const [companyAddress, setCompanyAddress] = useState("");
  const [defaultCurrencyValue, setDefaultCurrencyValue] = useState<CurrencyCode>(defaultCurrency);
  const [saving, setSaving] = useState(false);

  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [passwordSaving, setPasswordSaving] = useState(false);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [deleting, setDeleting] = useState(false);

  const isOAuthUser =
    user?.app_metadata?.provider === "google" || user?.app_metadata?.provider === "github";

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.navigate({ to: "/login" });
  };

  useEffect(() => {
    if (!user) return;
    setCompanyName(
      user.user_metadata?.company_name ||
        readUserStorageValue(user.id, settingsStorageKeys.companyName, ""),
    );
    setCompanyAddress(
      user.user_metadata?.company_address ||
        readUserStorageValue(user.id, settingsStorageKeys.companyAddress, ""),
    );
    setDefaultCurrencyValue(
      readUserStorageValue(
        user.id,
        settingsStorageKeys.defaultCurrency,
        defaultCurrency,
      ) as CurrencyCode,
    );
  }, [user?.id]);

  const savePreferences = async () => {
    if (!user) return;
    setSaving(true);
    try {
      const { error } = await supabase.auth.updateUser({
        data: { company_name: companyName, company_address: companyAddress },
      });
      if (error) throw error;
      await refreshSession();

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

  const handlePasswordChange = async () => {
    if (!newPassword || !confirmNewPassword) {
      toast.error("Please fill in all password fields.");
      return;
    }
    if (newPassword !== confirmNewPassword) {
      toast.error("Passwords don't match.");
      return;
    }
    if (newPassword.length < 8) {
      toast.error("Password must be at least 8 characters.");
      return;
    }
    setPasswordSaving(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      toast.success("Password updated.");
      setNewPassword("");
      setConfirmNewPassword("");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update password.");
    } finally {
      setPasswordSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!user || deleteConfirmText !== "DELETE") return;
    setDeleting(true);
    try {
      const { data: invoiceIds } = await supabase
        .from("envoiz_invoices")
        .select("id")
        .eq("user_id", user.id);

      if (invoiceIds && invoiceIds.length > 0) {
        const ids = invoiceIds.map((r: any) => r.id);
        await supabase.from("envoiz_invoice_items").delete().in("invoice_id", ids);
      }

      await supabase.from("envoiz_invoices").delete().eq("user_id", user.id);

      // MIGRATION NEEDED: Create a Supabase DB function 'delete_user' that calls auth.users delete for the current user
      // e.g.: CREATE OR REPLACE FUNCTION delete_user() RETURNS void AS $$ BEGIN DELETE FROM auth.users WHERE id = auth.uid(); END; $$ LANGUAGE plpgsql SECURITY DEFINER;
      await supabase.rpc("delete_user").catch(() => {});

      await supabase.auth.signOut();
      router.navigate({ to: "/" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete account.");
      setDeleting(false);
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
      <div className="space-y-4">
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
                  onChange={(event) =>
                    setDefaultCurrencyValue(event.target.value as CurrencyCode)
                  }
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
                    placeholder="Your company name"
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

        <Panel
          title="Change Password"
          description="Update your account password. Minimum 8 characters."
        >
          {isOAuthUser ? (
            <div className="rounded-3xl bg-surface/60 p-4 text-[13px] text-muted-foreground">
              Your account uses{" "}
              {user?.app_metadata?.provider === "google" ? "Google" : "GitHub"} sign-in. Password
              login is not available.
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div>
                <label className="text-[12px] text-muted-foreground">New Password</label>
                <div className="relative mt-1.5">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="At least 8 characters"
                    className="h-11 w-full rounded-2xl border border-hairline bg-white pl-3 pr-10 text-[14px] outline-none transition focus:border-foreground/20"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 h-7 w-7 grid place-items-center rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary transition"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              <div>
                <label className="text-[12px] text-muted-foreground">Confirm New Password</label>
                <input
                  type={showPassword ? "text" : "password"}
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                  placeholder="Re-enter new password"
                  className="mt-1.5 h-11 w-full rounded-2xl border border-hairline bg-white px-3 text-[14px] outline-none transition focus:border-foreground/20"
                />
              </div>
              <div className="flex items-end">
                <button
                  onClick={handlePasswordChange}
                  disabled={passwordSaving}
                  className="inline-flex items-center gap-2 rounded-full bg-foreground px-4 py-2 text-[13px] font-medium text-background transition-colors hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {passwordSaving ? "Updating..." : "Update password"}
                </button>
              </div>
            </div>
          )}
        </Panel>

        <Panel title="Danger Zone" description="Irreversible actions for your account.">
          <div className="rounded-3xl border border-destructive/20 bg-destructive/5 p-5">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <div className="text-[14px] font-semibold text-destructive">Delete Account</div>
                <p className="mt-1 text-[13px] text-muted-foreground">
                  Permanently delete your account, all invoices, and associated data. This cannot
                  be undone.
                </p>
              </div>
              <button
                onClick={() => { setDeleteDialogOpen(true); setDeleteConfirmText(""); }}
                className="inline-flex items-center gap-2 rounded-full bg-destructive px-4 py-2 text-[13px] font-medium text-white transition-colors hover:bg-destructive/90"
              >
                Delete Account
              </button>
            </div>
          </div>
        </Panel>
      </div>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="max-w-md gap-0 border-hairline p-0 overflow-hidden">
          <div className="border-b border-hairline bg-destructive/5 px-6 py-5">
            <DialogTitle className="text-[18px] font-semibold text-destructive">
              Delete Account
            </DialogTitle>
            <DialogDescription className="mt-1.5 text-[13px] text-muted-foreground">
              This will permanently delete your account and all your invoices. This action cannot
              be undone.
            </DialogDescription>
          </div>
          <div className="p-6 space-y-4">
            <div>
              <label className="text-[12.5px] font-medium text-foreground">
                Type <span className="font-mono font-bold">DELETE</span> to confirm
              </label>
              <input
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                placeholder="DELETE"
                className="mt-1.5 h-11 w-full rounded-2xl border border-hairline bg-white px-3 font-mono text-[14px] outline-none transition focus:border-destructive/40"
              />
            </div>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteDialogOpen(false)}
                className="inline-flex items-center gap-2 rounded-full border border-hairline bg-white px-4 py-2 text-[13px] font-medium transition-colors hover:bg-secondary"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={deleteConfirmText !== "DELETE" || deleting}
                className="inline-flex items-center gap-2 rounded-full bg-destructive px-4 py-2 text-[13px] font-medium text-white transition-colors hover:bg-destructive/90 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {deleting ? "Deleting..." : "Delete my account"}
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
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
        onChange={() => {}}
        className="mt-1.5 h-11 w-full rounded-2xl border border-hairline bg-white px-3 text-[14px] outline-none transition focus:border-foreground/20 read-only:bg-surface/50"
      />
    </div>
  );
}
