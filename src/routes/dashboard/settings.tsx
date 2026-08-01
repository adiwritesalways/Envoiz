import { createFileRoute, useRouter } from "@tanstack/react-router";
import {
  ShieldCheck,
  LogOut,
  Eye,
  EyeOff,
  Upload,
  Building2,
  Palette,
  Lock,
  Check,
  ChevronDown,
  AlertTriangle,
  Trash2,
  Save,
  Info,
  Image as ImageIcon,
  Sparkles,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { useAuth } from "@/components/auth/auth-context";
import { DashboardPage, Panel } from "@/components/envoiz/DashboardUI";
import { supabase } from "@/lib/supabase";
import { checkIsPro } from "@/lib/invoices";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
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
        content: "Manage your profile, branding, and workspace preferences for Envoiz.",
      },
    ],
  }),
  component: SettingsPage,
});

type TabType = "general" | "branding" | "security";

const tabs: { id: TabType; label: string; icon: typeof Building2 }[] = [
  { id: "general", label: "General", icon: Building2 },
  { id: "branding", label: "Branding", icon: Palette },
  { id: "security", label: "Security", icon: Lock },
];

const templateOptions = [
  {
    id: "Standard",
    name: "Standard",
    tier: "free" as const,
    desc: "A clean, rounded layout with a status pill and simple item table. Included on every plan.",
    preview: "/previews/template-standard.png",
  },
  {
    id: "Template 1",
    name: "Modern Executive",
    tier: "pro" as const,
    desc: "Bold cream-and-red header with a bordered line-item table and grand total block.",
    preview: "/previews/template-1.png",
  },
  {
    id: "Template 2",
    name: "Minimalist Slate",
    tier: "pro" as const,
    desc: "High-contrast dark theme with oversized type. Logos aren't shown on this layout yet.",
    preview: "/previews/template-2.png",
  },
];

function SettingsPage() {
  const { user, refreshSession } = useAuth();
  const router = useRouter();
  const isPro = checkIsPro(user);
  const isOAuthUser =
    user?.app_metadata?.provider === "google" || user?.app_metadata?.provider === "github";

  const [activeTab, setActiveTab] = useState<TabType>("general");

  // ---- General & branding fields (share one save flow) ----
  const [companyName, setCompanyName] = useState("");
  const [companyAddress, setCompanyAddress] = useState("");
  const [defaultCurrencyValue, setDefaultCurrencyValue] = useState<CurrencyCode>(defaultCurrency);
  const [brandLogo, setBrandLogo] = useState("");
  const [invoiceTemplate, setInvoiceTemplate] = useState("Standard");
  const [saving, setSaving] = useState(false);
  const [logoDragActive, setLogoDragActive] = useState(false);

  const [initial, setInitial] = useState({
    companyName: "",
    companyAddress: "",
    defaultCurrencyValue: defaultCurrency as CurrencyCode,
    brandLogo: "",
    invoiceTemplate: "Standard",
  });

  // ---- Security fields ----
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [passwordSaving, setPasswordSaving] = useState(false);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!user) return;
    const name =
      user.user_metadata?.company_name ||
      readUserStorageValue(user.id, settingsStorageKeys.companyName, "");
    const address =
      user.user_metadata?.company_address ||
      readUserStorageValue(user.id, settingsStorageKeys.companyAddress, "");
    const currency = readUserStorageValue(
      user.id,
      settingsStorageKeys.defaultCurrency,
      defaultCurrency,
    ) as CurrencyCode;
    const logo = readUserStorageValue(user.id, settingsStorageKeys.brandLogo, "");
    const template = readUserStorageValue(user.id, settingsStorageKeys.invoiceTemplate, "Standard");

    setCompanyName(name);
    setCompanyAddress(address);
    setDefaultCurrencyValue(currency);
    setBrandLogo(logo);
    setInvoiceTemplate(template);
    setInitial({
      companyName: name,
      companyAddress: address,
      defaultCurrencyValue: currency,
      brandLogo: logo,
      invoiceTemplate: template,
    });
  }, [user?.id]);

  const isDirty = useMemo(
    () =>
      companyName !== initial.companyName ||
      companyAddress !== initial.companyAddress ||
      defaultCurrencyValue !== initial.defaultCurrencyValue ||
      brandLogo !== initial.brandLogo ||
      invoiceTemplate !== initial.invoiceTemplate,
    [companyName, companyAddress, defaultCurrencyValue, brandLogo, invoiceTemplate, initial],
  );

  // Warn before an accidental tab close/refresh with unsaved changes.
  useEffect(() => {
    if (!isDirty) return;
    const handler = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [isDirty]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.navigate({ to: "/login" });
  };

  const savePreferences = async () => {
    if (!user || !isDirty) return;
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
      writeUserStorageValue(user.id, settingsStorageKeys.brandLogo, brandLogo);
      writeUserStorageValue(user.id, settingsStorageKeys.invoiceTemplate, invoiceTemplate);

      setInitial({ companyName, companyAddress, defaultCurrencyValue, brandLogo, invoiceTemplate });
      toast.success("Settings saved.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save preferences.");
    } finally {
      setSaving(false);
    }
  };

  const discardChanges = () => {
    setCompanyName(initial.companyName);
    setCompanyAddress(initial.companyAddress);
    setDefaultCurrencyValue(initial.defaultCurrencyValue);
    setBrandLogo(initial.brandLogo);
    setInvoiceTemplate(initial.invoiceTemplate);
  };

  const readLogoFile = (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file.");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      toast.error("File size must be less than 2MB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => setBrandLogo(e.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handlePasswordChange = async () => {
    if (!newPassword || !confirmNewPassword) {
      toast.error("Please fill in both password fields.");
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
      toast.success("Password updated successfully.");
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
        const ids = invoiceIds.map((r: { id: string }) => r.id);
        await supabase.from("envoiz_invoice_items").delete().in("invoice_id", ids);
      }

      await supabase.from("envoiz_invoices").delete().eq("user_id", user.id);
      try {
        await supabase.rpc("delete_user");
      } catch (e) {
        // ignore
      }

      await supabase.auth.signOut();
      router.navigate({ to: "/" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete account.");
      setDeleting(false);
    }
  };

  const initials = (user?.user_metadata?.full_name || user?.email || "User")
    .slice(0, 2)
    .toUpperCase();
  const memberSince = user?.created_at
    ? new Date(user.created_at).toLocaleDateString("en-US", { month: "long", year: "numeric" })
    : null;

  return (
    <DashboardPage
      eyebrow="Workspace"
      title="Settings"
      description="Manage your profile, branding, and account preferences."
      actions={
        <button
          type="button"
          onClick={savePreferences}
          disabled={!isDirty || saving}
          className={cn(
            "inline-flex items-center gap-2 rounded-full px-4 py-2 text-[13px] font-semibold transition-colors",
            isDirty
              ? "bg-white text-black hover:bg-[#e0e0e0] disabled:cursor-not-allowed disabled:opacity-60"
              : "cursor-default border border-[#2a2a2a] bg-[#141414] text-neutral-500",
          )}
        >
          {saving ? (
            "Saving..."
          ) : isDirty ? (
            <>
              <Save className="h-3.5 w-3.5" /> Save changes
            </>
          ) : (
            <>
              <Check className="h-3.5 w-3.5" /> Saved
            </>
          )}
        </button>
      }
    >
      <div className="space-y-5">
        {/* Tab switcher */}
        <div className="inline-flex items-center gap-1 rounded-xl border border-[#1f1f1f] bg-[#0d0d0d] p-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "flex items-center gap-2 rounded-lg px-3.5 py-2 text-[13px] font-medium transition-colors",
                  active ? "bg-[#1f1f1f] text-white" : "text-neutral-400 hover:text-white",
                )}
              >
                <Icon className="h-3.5 w-3.5" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* ---------------- General ---------------- */}
        {activeTab === "general" && (
          <div className="grid gap-5 lg:grid-cols-12">
            <Panel className="lg:col-span-4">
              <div className="flex items-center gap-3">
                <Avatar className="h-14 w-14">
                  <AvatarImage src={user?.user_metadata?.avatar_url} />
                  <AvatarFallback className="bg-[#1f1f1f] text-[15px] font-semibold text-white">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <div className="truncate text-[15px] font-semibold text-white">
                    {user?.user_metadata?.full_name || "Your account"}
                  </div>
                  <div className="truncate text-[12.5px] text-neutral-500">{user?.email}</div>
                </div>
              </div>

              <p className="mt-2 text-[11.5px] text-neutral-600">
                Update your photo from the avatar menu in the top bar.
              </p>

              <div className="mt-5 space-y-2.5 border-t border-[#1f1f1f] pt-5 text-[12.5px]">
                <div className="flex items-center justify-between">
                  <span className="text-neutral-500">Status</span>
                  <span className="inline-flex items-center gap-1.5 font-medium text-emerald-400">
                    <ShieldCheck className="h-3.5 w-3.5" /> Verified
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-neutral-500">Plan</span>
                  {isPro ? (
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 text-[11px] font-medium text-emerald-400">
                      <Sparkles className="h-3 w-3" /> Pro
                    </span>
                  ) : (
                    <span className="rounded-full border border-[#2a2a2a] bg-[#141414] px-2 py-0.5 text-[11px] font-medium text-neutral-400">
                      Free
                    </span>
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-neutral-500">Sign-in method</span>
                  <span className="capitalize text-neutral-300">
                    {isOAuthUser ? user?.app_metadata?.provider : "Email & password"}
                  </span>
                </div>
                {memberSince && (
                  <div className="flex items-center justify-between">
                    <span className="text-neutral-500">Member since</span>
                    <span className="text-neutral-300">{memberSince}</span>
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={handleSignOut}
                className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full border border-[#2a2a2a] bg-[#0d0d0d] px-4 py-2.5 text-[13px] font-medium text-neutral-300 transition-colors hover:border-[#3a3a3a] hover:text-white"
              >
                <LogOut className="h-3.5 w-3.5" /> Sign out
              </button>
            </Panel>

            <Panel
              title="Company & currency"
              description="These defaults are applied automatically to every new invoice."
              className="lg:col-span-8"
            >
              <div className="space-y-5">
                <div className="grid gap-5 sm:grid-cols-2">
                  <TextField
                    label="Company name"
                    value={companyName}
                    onChange={setCompanyName}
                    placeholder="e.g. Acme Studio LLC"
                  />
                  <SelectField
                    label="Default currency"
                    value={defaultCurrencyValue}
                    onChange={(v) => setDefaultCurrencyValue(v as CurrencyCode)}
                    options={currencyOptions.map((o) => ({
                      value: o.code,
                      label: `${o.code} — ${o.label}`,
                    }))}
                  />
                </div>
                <TextField
                  label="Business address"
                  value={companyAddress}
                  onChange={setCompanyAddress}
                  placeholder="Street, city, state, postal code, country"
                />
                <p className="text-[12px] leading-relaxed text-neutral-500">
                  Your company name and address appear in the header of every generated invoice.
                </p>
              </div>
            </Panel>
          </div>
        )}

        {/* ---------------- Branding ---------------- */}
        {activeTab === "branding" && (
          <div className="space-y-5">
            <Panel title="Logo" description="Shown on invoice PDF and PNG exports.">
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setLogoDragActive(true);
                }}
                onDragLeave={() => setLogoDragActive(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setLogoDragActive(false);
                  const file = e.dataTransfer.files?.[0];
                  if (file) readLogoFile(file);
                }}
                className={cn(
                  "flex flex-col items-center gap-4 rounded-2xl border border-dashed p-6 text-center transition-colors sm:flex-row sm:text-left",
                  logoDragActive
                    ? "border-neutral-400 bg-white/5"
                    : "border-[#2a2a2a] bg-[#0a0a0a]",
                  invoiceTemplate === "Template 2" && "pointer-events-none opacity-40 grayscale",
                )}
              >
                <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-[#1f1f1f] bg-white p-2">
                  {brandLogo ? (
                    <img
                      src={brandLogo}
                      alt="Brand logo"
                      className="h-full w-full object-contain"
                    />
                  ) : (
                    <ImageIcon className="h-6 w-6 text-neutral-400" />
                  )}
                </div>
                <div className="flex-1 space-y-2">
                  <p className="text-[13px] text-neutral-400">
                    Drag and drop a PNG, JPG or SVG here, or
                  </p>
                  <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
                    <label className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-white px-4 py-2 text-[12.5px] font-semibold text-black transition-colors hover:bg-[#e0e0e0]">
                      <Upload className="h-3.5 w-3.5" /> Choose file
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) readLogoFile(file);
                          e.target.value = "";
                        }}
                      />
                    </label>
                    {brandLogo && (
                      <button
                        type="button"
                        onClick={() => setBrandLogo("")}
                        className="inline-flex items-center gap-1.5 rounded-full border border-[#2a2a2a] px-4 py-2 text-[12.5px] font-medium text-neutral-400 transition-colors hover:border-red-900/40 hover:text-red-400"
                      >
                        <Trash2 className="h-3.5 w-3.5" /> Remove
                      </button>
                    )}
                  </div>
                  <p className="text-[11.5px] text-neutral-600">
                    Max 2MB. Transparent background recommended.
                  </p>
                </div>
              </div>
              {invoiceTemplate === "Template 2" && (
                <p className="mt-3 inline-flex items-center gap-1.5 text-[11.5px] text-amber-400">
                  <AlertTriangle className="h-3.5 w-3.5" /> Minimalist Slate doesn't display a logo
                  yet.
                </p>
              )}
            </Panel>

            <Panel
              title="Invoice template"
              description="Choose the layout used for PDF and PNG exports."
            >
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {templateOptions.map((tpl) => {
                  const selected = invoiceTemplate === tpl.id;
                  return (
                    <button
                      key={tpl.id}
                      type="button"
                      onClick={() => setInvoiceTemplate(tpl.id)}
                      className={cn(
                        "group relative flex flex-col overflow-hidden rounded-2xl border text-left transition-all",
                        selected
                          ? "border-white/70 bg-[#161616] shadow-[0_0_0_1px_rgba(255,255,255,0.12)]"
                          : "border-[#1f1f1f] bg-[#0d0d0d] hover:border-[#333333]",
                      )}
                    >
                      <div className="relative aspect-[3/4] w-full overflow-hidden border-b border-[#1f1f1f] bg-[#050505]">
                        <img
                          src={tpl.preview}
                          alt={`${tpl.name} invoice template preview`}
                          className="h-full w-full object-cover object-top transition-transform duration-300 group-hover:scale-[1.03]"
                        />
                        {selected && (
                          <div className="absolute right-2.5 top-2.5 grid h-6 w-6 place-items-center rounded-full bg-white text-black shadow-lg">
                            <Check className="h-3.5 w-3.5" strokeWidth={3} />
                          </div>
                        )}
                      </div>
                      <div className="flex flex-1 flex-col gap-1.5 p-4">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[13px] font-semibold text-white">{tpl.name}</span>
                          {tpl.tier === "pro" ? (
                            <span className="inline-flex shrink-0 items-center gap-1 rounded-full border border-amber-500/20 bg-amber-500/10 px-2 py-0.5 text-[10px] font-medium text-amber-400">
                              <Sparkles className="h-2.5 w-2.5" /> Pro
                            </span>
                          ) : (
                            <span className="inline-flex shrink-0 items-center rounded-full border border-[#2a2a2a] bg-[#141414] px-2 py-0.5 text-[10px] font-medium text-neutral-400">
                              Free
                            </span>
                          )}
                        </div>
                        <p className="text-[12px] leading-relaxed text-neutral-500">{tpl.desc}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </Panel>
          </div>
        )}

        {/* ---------------- Security ---------------- */}
        {activeTab === "security" && (
          <div className="space-y-5">
            <Panel title="Password" description="Update the password used to sign in.">
              {isOAuthUser ? (
                <div className="flex items-center gap-3 rounded-2xl border border-[#1f1f1f] bg-[#0a0a0a] p-4 text-[12.5px] text-neutral-400">
                  <Info className="h-4 w-4 shrink-0 text-neutral-500" />
                  <span>
                    Your account is currently linked to {" "}
                    <span className="font-medium capitalize text-white">
                      {user?.app_metadata?.provider}
                    </span>
                    . Please manage your authentication settings directly through this provider.
                  </span>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="text-[12px] font-medium text-neutral-400">
                        New password
                      </label>
                      <div className="relative mt-1.5">
                        <input
                          type={showPassword ? "text" : "password"}
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          placeholder="At least 8 characters"
                          className="h-11 w-full rounded-2xl border border-hairline bg-[#0d0d0d] pl-3.5 pr-10 text-[14px] text-white outline-none transition placeholder:text-neutral-600 focus:border-foreground/20"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword((v) => !v)}
                          className="absolute right-2.5 top-1/2 h-7 w-7 -translate-y-1/2 rounded-md text-neutral-500 transition hover:bg-white/5 hover:text-white grid place-items-center"
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </div>
                    <TextField
                      label="Confirm new password"
                      type={showPassword ? "text" : "password"}
                      value={confirmNewPassword}
                      onChange={setConfirmNewPassword}
                      placeholder="Re-enter password"
                    />
                  </div>

                  {newPassword && (
                    <div className="space-y-2">
                      <PasswordStrengthMeter password={newPassword} />
                      {confirmNewPassword && newPassword !== confirmNewPassword && (
                        <p className="text-[11.5px] text-red-400">Passwords don't match yet.</p>
                      )}
                      {confirmNewPassword && newPassword === confirmNewPassword && (
                        <p className="inline-flex items-center gap-1.5 text-[11.5px] text-emerald-400">
                          <Check className="h-3 w-3" /> Passwords match.
                        </p>
                      )}
                    </div>
                  )}

                  <div className="flex justify-end pt-1">
                    <button
                      type="button"
                      onClick={handlePasswordChange}
                      disabled={passwordSaving || !newPassword || !confirmNewPassword}
                      className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-[13px] font-semibold text-black transition-colors hover:bg-[#e0e0e0] disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {passwordSaving ? "Updating..." : "Update password"}
                    </button>
                  </div>
                </div>
              )}
            </Panel>

            <Panel className="border-destructive/25 bg-destructive/[0.04]">
              <div className="mb-4 flex items-center gap-2 border-b border-destructive/20 pb-4">
                <AlertTriangle className="h-4 w-4 text-destructive" />
                <h2 className="text-xs font-semibold uppercase tracking-wider text-destructive">
                  Danger zone
                </h2>
              </div>
              <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
                <div>
                  <div className="text-[13.5px] font-medium text-white">Delete account</div>
                  <p className="mt-1 max-w-md text-[12.5px] leading-relaxed text-neutral-400">
                    Permanently deletes your account, invoices, customers, and branding settings.
                    This cannot be undone.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setDeleteDialogOpen(true);
                    setDeleteConfirmText("");
                  }}
                  className="inline-flex shrink-0 items-center gap-2 rounded-full bg-destructive px-4 py-2.5 text-[13px] font-semibold text-white transition-colors hover:bg-destructive/90"
                >
                  <Trash2 className="h-3.5 w-3.5" /> Delete account
                </button>
              </div>
            </Panel>
          </div>
        )}

        {/* Unsaved changes bar — sticks near the bottom of the scroll area */}
        {isDirty && (activeTab === "general" || activeTab === "branding") && (
          <div className="sticky bottom-4 z-10">
            <div className="flex flex-col gap-3 rounded-2xl border border-[#2a2a2a] bg-[#141414]/95 px-5 py-3.5 shadow-2xl backdrop-blur sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-2.5 text-[13px] text-neutral-300">
                <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-amber-400" />
                You have unsaved changes.
              </div>
              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={discardChanges}
                  disabled={saving}
                  className="rounded-full px-4 py-2 text-[13px] font-medium text-neutral-400 transition-colors hover:text-white disabled:opacity-50"
                >
                  Discard
                </button>
                <button
                  type="button"
                  onClick={savePreferences}
                  disabled={saving}
                  className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-[13px] font-semibold text-black transition-colors hover:bg-[#e0e0e0] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving ? "Saving..." : "Save changes"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Delete account modal */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="max-w-md gap-0 border-hairline p-0 overflow-hidden bg-[#0d0d0d] shadow-2xl sm:rounded-3xl">
          <div className="border-b border-[#1f1f1f] bg-destructive/5 px-6 py-5">
            <DialogTitle className="flex items-center gap-2 text-[16px] font-semibold text-white">
              <AlertTriangle className="h-4 w-4 text-destructive" /> Delete account
            </DialogTitle>
            <DialogDescription className="mt-1.5 text-[13px] leading-relaxed text-neutral-400">
              This permanently removes your account, invoices, customers, and branding settings.
              This action cannot be undone.
            </DialogDescription>
          </div>
          <div className="space-y-4 p-6">
            <div>
              <label className="text-[12px] font-medium text-neutral-400">
                Type <span className="font-mono font-semibold text-destructive">DELETE</span> to
                confirm
              </label>
              <input
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                placeholder="DELETE"
                className="mt-1.5 h-11 w-full rounded-2xl border border-hairline bg-[#050505] px-3.5 font-mono text-[13px] text-white outline-none transition placeholder:text-neutral-700 focus:border-destructive/40"
              />
            </div>
            <div className="flex justify-end gap-3 pt-1">
              <button
                type="button"
                onClick={() => setDeleteDialogOpen(false)}
                className="rounded-full border border-[#2a2a2a] bg-[#141414] px-4 py-2 text-[13px] font-medium text-neutral-300 transition-colors hover:bg-[#1f1f1f]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteAccount}
                disabled={deleteConfirmText !== "DELETE" || deleting}
                className="rounded-full bg-destructive px-4 py-2 text-[13px] font-semibold text-white transition-colors hover:bg-destructive/90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {deleting ? "Deleting..." : "Delete permanently"}
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </DashboardPage>
  );
}

function TextField({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <div className="min-w-0">
      <label className="text-[12px] font-medium text-neutral-400">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="mt-1.5 h-11 w-full rounded-2xl border border-hairline bg-[#0d0d0d] px-3.5 text-[14px] text-white outline-none transition placeholder:text-neutral-600 focus:border-foreground/20"
      />
    </div>
  );
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
