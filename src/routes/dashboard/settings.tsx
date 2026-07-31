import { createFileRoute, useRouter } from "@tanstack/react-router";
import {
  ExternalLink,
  ShieldCheck,
  LogOut,
  Eye,
  EyeOff,
  Upload,
  User,
  Building2,
  Palette,
  Lock,
  Sparkles,
  Check,
  AlertTriangle,
  FileText,
  CheckCircle2,
  Trash2,
  Save,
  Info,
} from "lucide-react";
import InvoiceTemplate from "@/components/InvoiceTemplate";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { useAuth } from "@/components/auth/auth-context";
import { DashboardPage } from "@/components/envoiz/DashboardUI";
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
        content: "Manage your profile, branding, and workspace preferences for Envoiz.",
      },
    ],
  }),
  component: SettingsPage,
});

type TabType = "general" | "branding" | "security";

function SettingsPage() {
  const { user, refreshSession } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>("general");

  const [companyName, setCompanyName] = useState("");
  const [companyAddress, setCompanyAddress] = useState("");
  const [defaultCurrencyValue, setDefaultCurrencyValue] = useState<CurrencyCode>(defaultCurrency);
  const [saving, setSaving] = useState(false);

  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [passwordSaving, setPasswordSaving] = useState(false);

  const [brandLogo, setBrandLogo] = useState("");
  const [invoiceTemplate, setInvoiceTemplate] = useState("Standard");

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
    setBrandLogo(readUserStorageValue(user.id, settingsStorageKeys.brandLogo, ""));
    setInvoiceTemplate(
      readUserStorageValue(
        user.id,
        settingsStorageKeys.invoiceTemplate,
        "Standard",
      ),
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
      writeUserStorageValue(user.id, settingsStorageKeys.brandLogo, brandLogo);
      writeUserStorageValue(user.id, settingsStorageKeys.invoiceTemplate, invoiceTemplate);
      toast.success("Settings saved successfully.");
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
        const ids = invoiceIds.map((r: any) => r.id);
        await supabase.from("envoiz_invoice_items").delete().in("invoice_id", ids);
      }

      await supabase.from("envoiz_invoices").delete().eq("user_id", user.id);
      await supabase.rpc("delete_user").catch(() => {});

      await supabase.auth.signOut();
      router.navigate({ to: "/" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete account.");
      setDeleting(false);
    }
  };

  const tabs: { id: TabType; label: string; icon: any; desc: string }[] = [
    {
      id: "general",
      label: "General & Profile",
      icon: Building2,
      desc: "Workspace details and account profile",
    },
    {
      id: "branding",
      label: "Branding & Templates",
      icon: Palette,
      desc: "Custom logos and invoice themes",
    },
    {
      id: "security",
      label: "Security & Account",
      icon: Lock,
      desc: "Password updates and account deletion",
    },
  ];

  return (
    <DashboardPage
      eyebrow="Workspace Control"
      title="Settings & Customization"
      description="Manage your identity, company branding, and invoice layout settings."
      actions={
        <div className="flex items-center gap-3">
          <button
            onClick={savePreferences}
            disabled={saving}
            className="group relative inline-flex items-center gap-2 overflow-hidden rounded-full bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 px-5 py-2.5 text-xs font-semibold text-white shadow-lg shadow-blue-500/20 transition-all duration-200 hover:scale-[1.02] hover:shadow-blue-500/30 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="h-4 w-4 transition-transform group-hover:rotate-12" />
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-2 p-1.5 rounded-2xl bg-neutral-900/60 border border-neutral-800/80 backdrop-blur-md">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 min-w-[180px] flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-medium transition-all duration-200 ${
                  isActive
                    ? "bg-gradient-to-b from-neutral-800 to-neutral-900 text-white shadow-md border border-neutral-700/80"
                    : "text-neutral-400 hover:text-white hover:bg-neutral-800/40"
                }`}
              >
                <div
                  className={`p-2 rounded-lg ${
                    isActive
                      ? "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                      : "bg-neutral-800/50 text-neutral-400"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                </div>
                <div className="text-left">
                  <div className="font-semibold">{tab.label}</div>
                  <div className="text-[10px] text-neutral-500 font-normal">{tab.desc}</div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Tab 1: General & Profile */}
        {activeTab === "general" && (
          <div className="grid gap-6 lg:grid-cols-12">
            {/* Left Card: Account Identity */}
            <div className="lg:col-span-5 flex flex-col justify-between rounded-3xl border border-neutral-800/80 bg-neutral-900/50 backdrop-blur-xl p-6 relative overflow-hidden group">
              <div className="absolute -top-24 -right-24 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl group-hover:bg-blue-500/20 transition-all duration-500" />

              <div className="space-y-6 relative z-10">
                <div className="flex items-center gap-4">
                  <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white text-xl font-bold shadow-lg shadow-blue-500/20 border border-white/10">
                    {user?.email?.charAt(0).toUpperCase() || "U"}
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-white">Account Profile</h3>
                    <p className="text-xs text-neutral-400">Authenticated Session</p>
                  </div>
                </div>

                <div className="space-y-4 pt-2">
                  <div>
                    <label className="text-xs font-medium text-neutral-400 block mb-1.5">
                      Email Address
                    </label>
                    <div className="relative">
                      <input
                        readOnly
                        value={user?.email ?? ""}
                        className="w-full h-11 px-3.5 rounded-xl bg-neutral-950/80 border border-neutral-800 text-xs text-neutral-300 read-only:cursor-not-allowed outline-none font-mono"
                      />
                      <ShieldCheck className="absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-emerald-400" />
                    </div>
                  </div>

                  <div className="rounded-2xl bg-emerald-500/5 border border-emerald-500/20 p-4 space-y-2">
                    <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400">
                      <ShieldCheck className="h-4 w-4" /> Account Verified
                    </div>
                    <p className="text-[11px] text-neutral-400 leading-relaxed">
                      Your identity is managed through Supabase Security. Email details remain read-only to prevent unauthorized changes.
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-6 mt-6 border-t border-neutral-800/80 relative z-10">
                <button
                  onClick={handleSignOut}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-rose-500/10 border border-rose-500/20 px-4 py-2.5 text-xs font-medium text-rose-400 transition-all hover:bg-rose-500/20 hover:border-rose-500/30"
                >
                  <LogOut className="h-4 w-4" /> Sign Out of Workspace
                </button>
              </div>
            </div>

            {/* Right Card: Preferences */}
            <div className="lg:col-span-7 rounded-3xl border border-neutral-800/80 bg-neutral-900/50 backdrop-blur-xl p-6 space-y-6">
              <div className="flex items-center justify-between border-b border-neutral-800/80 pb-4">
                <div>
                  <h3 className="text-base font-semibold text-white flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-blue-400" /> Company & Currency
                  </h3>
                  <p className="text-xs text-neutral-400 mt-0.5">
                    Default details auto-populated when creating new invoices
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-xs font-medium text-neutral-300 block mb-1.5">
                    Default Currency
                  </label>
                  <select
                    value={defaultCurrencyValue}
                    onChange={(event) =>
                      setDefaultCurrencyValue(event.target.value as CurrencyCode)
                    }
                    className="h-11 w-full rounded-xl border border-neutral-800 bg-neutral-950 px-3.5 text-xs text-white outline-none transition focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 cursor-pointer"
                  >
                    {currencyOptions.map((option) => (
                      <option key={option.code} value={option.code} className="bg-neutral-900 text-white">
                        {option.code} — {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="text-xs font-medium text-neutral-300 block mb-1.5">
                      Company Name
                    </label>
                    <input
                      value={companyName}
                      onChange={(event) => setCompanyName(event.target.value)}
                      placeholder="e.g. Acme Studio LLC"
                      className="h-11 w-full rounded-xl border border-neutral-800 bg-neutral-950 px-3.5 text-xs text-white placeholder-neutral-600 outline-none transition focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-medium text-neutral-300 block mb-1.5">
                      Business Address
                    </label>
                    <input
                      value={companyAddress}
                      onChange={(event) => setCompanyAddress(event.target.value)}
                      placeholder="e.g. 123 Tech Lane, San Francisco, CA"
                      className="h-11 w-full rounded-xl border border-neutral-800 bg-neutral-950 px-3.5 text-xs text-white placeholder-neutral-600 outline-none transition focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>
                </div>

                <div className="pt-4 flex justify-end">
                  <button
                    onClick={savePreferences}
                    disabled={saving}
                    className="inline-flex items-center gap-2 rounded-xl bg-neutral-800 border border-neutral-700/80 px-5 py-2.5 text-xs font-semibold text-white transition-all hover:bg-neutral-700 hover:border-neutral-600 active:scale-[0.98] disabled:opacity-50"
                  >
                    {saving ? "Saving..." : "Save Preferences"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Branding & Templates */}
        {activeTab === "branding" && (
          <div className="space-y-6">
            {/* Brand Logo Section */}
            <div className="rounded-3xl border border-neutral-800/80 bg-neutral-900/50 backdrop-blur-xl p-6 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-800/80 pb-4">
                <div>
                  <h3 className="text-base font-semibold text-white flex items-center gap-2">
                    <Palette className="h-4 w-4 text-purple-400" /> Brand Identity & Logo
                  </h3>
                  <p className="text-xs text-neutral-400 mt-0.5">
                    Upload your business logo to showcase on client invoices.
                  </p>
                </div>
                {invoiceTemplate === "Template 2" && (
                  <div className="inline-flex items-center gap-2 rounded-full bg-amber-500/10 border border-amber-500/20 px-3 py-1 text-[11px] font-medium text-amber-400">
                    <AlertTriangle className="h-3.5 w-3.5" /> Logos locked for Template 2
                  </div>
                )}
              </div>

              <div
                className={`transition-all duration-300 ${
                  invoiceTemplate === "Template 2" ? "opacity-40 pointer-events-none grayscale" : ""
                }`}
              >
                <div className="flex flex-col sm:flex-row items-center gap-6 p-6 rounded-2xl bg-neutral-950/60 border border-dashed border-neutral-800">
                  <div className="relative group">
                    {brandLogo ? (
                      <div className="relative h-24 w-24 overflow-hidden rounded-2xl border border-neutral-700 bg-white p-2 flex items-center justify-center shadow-inner">
                        <img src={brandLogo} alt="Brand Logo" className="h-full w-full object-contain" />
                      </div>
                    ) : (
                      <div className="h-24 w-24 rounded-2xl border border-neutral-800 bg-neutral-900 flex flex-col items-center justify-center text-neutral-500 gap-1">
                        <Upload className="h-6 w-6 text-neutral-600" />
                        <span className="text-[10px] font-mono">No Logo</span>
                      </div>
                    )}
                  </div>

                  <div className="flex-1 text-center sm:text-left space-y-2">
                    <div className="text-xs font-semibold text-white">Company Logo</div>
                    <p className="text-[11px] text-neutral-400 max-w-md">
                      PNG, JPG, or SVG. Maximum file size 2MB. Transparent background recommended.
                    </p>
                    <div className="flex flex-wrap justify-center sm:justify-start gap-3 pt-2">
                      <button
                        onClick={() => {
                          const input = document.createElement("input");
                          input.type = "file";
                          input.accept = "image/*";
                          input.onchange = (e) => {
                            const file = (e.target as HTMLInputElement).files?.[0];
                            if (file) {
                              if (file.size > 2 * 1024 * 1024) {
                                toast.error("File size must be less than 2MB");
                                return;
                              }
                              const reader = new FileReader();
                              reader.onload = (e) => {
                                setBrandLogo(e.target?.result as string);
                              };
                              reader.readAsDataURL(file);
                            }
                          };
                          input.click();
                        }}
                        className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-md shadow-blue-500/20 hover:bg-blue-500 transition-all active:scale-[0.98]"
                      >
                        <Upload className="h-3.5 w-3.5" /> Upload Logo
                      </button>
                      {brandLogo && (
                        <button
                          onClick={() => setBrandLogo("")}
                          className="inline-flex items-center gap-2 rounded-xl bg-neutral-800 border border-neutral-700 px-4 py-2 text-xs font-medium text-rose-400 hover:bg-rose-500/10 hover:border-rose-500/30 transition-all"
                        >
                          <Trash2 className="h-3.5 w-3.5" /> Remove
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Template Selection Section */}
            <div className="rounded-3xl border border-neutral-800/80 bg-neutral-900/50 backdrop-blur-xl p-6 space-y-6">
              <div className="flex items-center justify-between border-b border-neutral-800/80 pb-4">
                <div>
                  <h3 className="text-base font-semibold text-white flex items-center gap-2">
                    <FileText className="h-4 w-4 text-indigo-400" /> Invoice Design Theme
                  </h3>
                  <p className="text-xs text-neutral-400 mt-0.5">
                    Select a layout theme for generated invoice documents.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  {
                    id: "Standard",
                    name: "Standard Classic",
                    badge: "Free Tier",
                    badgeStyle: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
                    desc: "Clean minimal design with logo header and grid line items.",
                    preview: (
                      <div className="w-full h-full relative overflow-hidden bg-white">
                        <div className="absolute top-0 left-0 w-[800px] h-[1131px] origin-top-left scale-[0.28] sm:scale-[0.25] pointer-events-none select-none">
                          <InvoiceTemplate />
                        </div>
                      </div>
                    ),
                  },
                  {
                    id: "Template 1",
                    name: "Modern Executive",
                    badge: "Pro",
                    badgeStyle: "bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-blue-300 border-blue-500/30",
                    desc: "Sleek blue accent bar, bold headers, and structured totals section.",
                    preview: (
                      <img
                        src="/previews/template-1.png"
                        alt="Template 1"
                        className="w-full h-full object-cover"
                      />
                    ),
                  },
                  {
                    id: "Template 2",
                    name: "Minimalist Slate",
                    badge: "Pro",
                    badgeStyle: "bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-purple-300 border-purple-500/30",
                    desc: "Dark high-contrast header banner. (Note: Logos not supported)",
                    preview: (
                      <img
                        src="/previews/template-2.svg"
                        alt="Template 2"
                        className="w-full h-full object-cover"
                      />
                    ),
                  },
                ].map((tpl) => {
                  const isSelected = invoiceTemplate === tpl.id;
                  return (
                    <button
                      key={tpl.id}
                      onClick={() => setInvoiceTemplate(tpl.id)}
                      className={`group relative flex flex-col rounded-2xl border text-left overflow-hidden transition-all duration-300 ${
                        isSelected
                          ? "border-blue-500 ring-2 ring-blue-500/30 shadow-xl shadow-blue-500/10 bg-neutral-900"
                          : "border-neutral-800 bg-neutral-950/60 hover:border-neutral-700 hover:bg-neutral-900/80"
                      }`}
                    >
                      <div className="relative w-full aspect-[4/3] bg-neutral-950 overflow-hidden border-b border-neutral-800">
                        {tpl.preview}

                        {isSelected && (
                          <div className="absolute top-3 right-3 h-7 w-7 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-lg border border-white/20 z-10 animate-in zoom-in-50">
                            <Check className="h-4 w-4 stroke-[3]" />
                          </div>
                        )}
                      </div>

                      <div className="p-4 space-y-2 flex-1 flex flex-col justify-between">
                        <div>
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-xs font-bold text-white group-hover:text-blue-400 transition-colors">
                              {tpl.name}
                            </span>
                            <span
                              className={`text-[10px] font-bold tracking-wider px-2 py-0.5 rounded-full border uppercase ${tpl.badgeStyle}`}
                            >
                              {tpl.badge}
                            </span>
                          </div>
                          <p className="text-[11px] text-neutral-400 mt-1 leading-snug">
                            {tpl.desc}
                          </p>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="pt-4 flex justify-end">
                <button
                  onClick={savePreferences}
                  disabled={saving}
                  className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-2.5 text-xs font-semibold text-white shadow-lg shadow-blue-500/20 hover:opacity-90 transition-all active:scale-[0.98] disabled:opacity-50"
                >
                  {saving ? "Saving Theme..." : "Apply Theme & Branding"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Security & Danger Zone */}
        {activeTab === "security" && (
          <div className="space-y-6">
            {/* Password Update Panel */}
            <div className="rounded-3xl border border-neutral-800/80 bg-neutral-900/50 backdrop-blur-xl p-6 space-y-6">
              <div className="flex items-center justify-between border-b border-neutral-800/80 pb-4">
                <div>
                  <h3 className="text-base font-semibold text-white flex items-center gap-2">
                    <Lock className="h-4 w-4 text-emerald-400" /> Account Password
                  </h3>
                  <p className="text-xs text-neutral-400 mt-0.5">
                    Update your password to keep your account secure.
                  </p>
                </div>
              </div>

              {isOAuthUser ? (
                <div className="rounded-2xl bg-neutral-950/80 border border-neutral-800 p-5 text-xs text-neutral-400 flex items-center gap-3">
                  <Info className="h-5 w-5 text-blue-400 flex-shrink-0" />
                  <div>
                    Account is authenticated via{" "}
                    <span className="font-semibold text-white capitalize">
                      {user?.app_metadata?.provider} OAuth
                    </span>
                    . Password updates are managed through your social login provider.
                  </div>
                </div>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="text-xs font-medium text-neutral-300 block mb-1.5">
                      New Password
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="At least 8 characters"
                        className="h-11 w-full rounded-xl border border-neutral-800 bg-neutral-950 pl-3.5 pr-10 text-xs text-white placeholder-neutral-600 outline-none transition focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((v) => !v)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-300"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-medium text-neutral-300 block mb-1.5">
                      Confirm New Password
                    </label>
                    <input
                      type={showPassword ? "text" : "password"}
                      value={confirmNewPassword}
                      onChange={(e) => setConfirmNewPassword(e.target.value)}
                      placeholder="Re-enter password"
                      className="h-11 w-full rounded-xl border border-neutral-800 bg-neutral-950 px-3.5 text-xs text-white placeholder-neutral-600 outline-none transition focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20"
                    />
                  </div>

                  <div className="sm:col-span-2 pt-2 flex justify-end">
                    <button
                      onClick={handlePasswordChange}
                      disabled={passwordSaving}
                      className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-xs font-semibold text-white shadow-md shadow-emerald-500/20 hover:bg-emerald-500 transition-all active:scale-[0.98] disabled:opacity-50"
                    >
                      {passwordSaving ? "Updating..." : "Update Password"}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Danger Zone */}
            <div className="rounded-3xl border border-rose-500/20 bg-rose-500/5 backdrop-blur-xl p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-rose-500/20 pb-4">
                <div>
                  <h3 className="text-base font-semibold text-rose-400 flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-rose-500" /> Danger Zone
                  </h3>
                  <p className="text-xs text-neutral-400 mt-0.5">
                    Actions here are permanent and cannot be undone.
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-2">
                <div>
                  <div className="text-xs font-bold text-white">Delete Workspace Account</div>
                  <p className="text-[11px] text-neutral-400 mt-0.5">
                    Permanently delete your account, saved invoices, customers, and branding settings.
                  </p>
                </div>
                <button
                  onClick={() => {
                    setDeleteDialogOpen(true);
                    setDeleteConfirmText("");
                  }}
                  className="inline-flex items-center gap-2 rounded-xl bg-rose-600 px-4 py-2 text-xs font-semibold text-white shadow-md shadow-rose-600/20 hover:bg-rose-500 transition-all active:scale-[0.98]"
                >
                  <Trash2 className="h-3.5 w-3.5" /> Delete Account
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Delete Account Modal */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="max-w-md bg-neutral-900 border-neutral-800 text-white p-0 overflow-hidden">
          <div className="border-b border-neutral-800 bg-rose-500/10 px-6 py-5">
            <DialogTitle className="text-lg font-bold text-rose-400 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" /> Confirm Account Deletion
            </DialogTitle>
            <DialogDescription className="mt-1.5 text-xs text-neutral-400 leading-relaxed">
              This action is permanent. All your invoice history, customers, and workspace data will be erased immediately.
            </DialogDescription>
          </div>
          <div className="p-6 space-y-4">
            <div>
              <label className="text-xs font-medium text-neutral-300 block mb-1.5">
                Type <span className="font-mono font-bold text-rose-400">DELETE</span> to confirm
              </label>
              <input
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                placeholder="DELETE"
                className="h-11 w-full rounded-xl border border-neutral-800 bg-neutral-950 px-3.5 font-mono text-xs text-white placeholder-neutral-700 outline-none focus:border-rose-500/50 focus:ring-2 focus:ring-rose-500/20"
              />
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setDeleteDialogOpen(false)}
                className="rounded-xl border border-neutral-800 bg-neutral-950 px-4 py-2 text-xs font-medium text-neutral-300 hover:bg-neutral-800 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={deleteConfirmText !== "DELETE" || deleting}
                className="rounded-xl bg-rose-600 px-4 py-2 text-xs font-semibold text-white hover:bg-rose-500 disabled:opacity-50 transition-all shadow-md shadow-rose-600/20"
              >
                {deleting ? "Deleting..." : "Permanently Delete"}
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </DashboardPage>
  );
}
