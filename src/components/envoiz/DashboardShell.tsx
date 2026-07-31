import React from "react";
import { Link, useNavigate, useLocation } from "@tanstack/react-router";
import { LayoutDashboard, FileText, Users, Settings, Search, Menu, X, Sparkles } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/components/auth/auth-context";
import { supabase } from "@/lib/supabase";
import { BrandLogo } from "@/components/BrandLogo";
import { CompanyOnboardingWizard } from "@/components/envoiz/CompanyOnboardingWizard";
import { UpgradeModal } from "@/components/envoiz/UpgradeModal";
import { toast } from "sonner";
import { useEffect, useRef, useState } from "react";
import { readUserStorageValue, settingsStorageKeys } from "@/lib/envoiz";
import { checkIsPro } from "@/lib/invoices";

const navItems = [
  { icon: LayoutDashboard, label: "Overview", to: "/dashboard" },
  { icon: FileText, label: "Invoices", to: "/dashboard/invoices" },
  { icon: Users, label: "Customers", to: "/dashboard/customers" },
  { icon: Settings, label: "Settings", to: "/dashboard/settings" },
];

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const { user, refreshSession } = useAuth();
  const { pathname } = useLocation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  const isPro = checkIsPro(user);

  useEffect(() => {
    if (!user?.id || user.user_metadata?.company_name) return;
    const localName    = readUserStorageValue(user.id, settingsStorageKeys.companyName,    "");
    const localAddress = readUserStorageValue(user.id, settingsStorageKeys.companyAddress, "");
    if (!localName && !localAddress) return;
    void supabase.auth
      .updateUser({ data: { company_name: localName || undefined, company_address: localAddress || undefined } })
      .then(({ error }) => { if (!error) void refreshSession(); });
  }, [user?.id]);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  const isActive = (to: string) =>
    to === "/dashboard"
      ? pathname === "/dashboard" || pathname === "/dashboard/"
      : pathname.startsWith(to);

  const currentPageLabel = navItems.find((item) => isActive(item.to))?.label ?? "Overview";

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);
      if (!event.target.files || event.target.files.length === 0 || !user) {
        throw new Error("You must select an image to upload.");
      }

      const file = event.target.files[0];
      const fileExt = file.name.split(".").pop();
      const filePath = `${user.id}-${Math.random()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage.from("avatars").upload(filePath, file);

      if (uploadError) throw uploadError;

      const {
        data: { publicUrl },
      } = supabase.storage.from("avatars").getPublicUrl(filePath);

      const { error: updateError } = await supabase.auth.updateUser({
        data: { avatar_url: publicUrl },
      });

      if (updateError) throw updateError;

      toast.success("Profile picture updated!");
      await refreshSession();
    } catch (error: any) {
      toast.error(error.message || "Error uploading image");
    } finally {
      setUploading(false);
    }
  };

  const name = user?.user_metadata?.full_name || user?.email || "User";
  const initials = name.substring(0, 2).toUpperCase();
  const avatarUrl = user?.user_metadata?.avatar_url;

  const sidebarContent = (
    <>
      <div className="p-6 flex items-center justify-between">
        <Link to="/" className="hover:opacity-80 transition-opacity" onClick={() => setMobileMenuOpen(false)}>
          <BrandLogo className="h-12 w-auto invert" />
        </Link>
        <button
          className="md:hidden p-1 rounded-md text-[#888888] hover:text-white"
          onClick={() => setMobileMenuOpen(false)}
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="px-4 pb-4">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-neutral-500" />
          <Input
            type="search"
            placeholder="Search..."
            className="w-full bg-[#121212] border-[#222222] pl-8 pr-12 rounded-md h-9 text-xs text-white placeholder:text-neutral-500 focus-visible:ring-0 focus-visible:border-neutral-500 focus-visible:ring-offset-0"
          />
          <div className="absolute right-1.5 top-1.5 flex h-6 items-center rounded border border-[#222222] bg-[#121212] px-1.5 font-mono text-[10px] font-medium text-neutral-500 opacity-100">
            <span className="text-xs">⌘K</span>
          </div>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-4 space-y-1">
        {navItems.map((item) => (
          <Link
            key={item.label}
            to={item.to}
            className={`w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
              isActive(item.to)
                ? "bg-[#141414] text-white border border-[#222222]"
                : "text-neutral-400 hover:bg-white/5 hover:text-white"
            }`}
          >
            <item.icon className="h-4 w-4" />
            {item.label}
          </Link>
        ))}
      </nav>

      <div className="p-4 mt-auto">
        {isPro ? (
          <div className="flex items-center gap-2.5 rounded-lg border border-emerald-500/20 bg-emerald-500/5 px-4 py-3">
            <Sparkles className="h-4 w-4 text-emerald-400 shrink-0" />
            <div>
              <div className="text-[12px] font-semibold text-emerald-400">Pro Plan</div>
              <div className="text-[11px] text-emerald-400/60">All features unlocked</div>
            </div>
          </div>
        ) : (
          <Card className="shadow-none border-[#1F1F1F] bg-[#121212]">
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-sm font-semibold text-white">Upgrade your plan</CardTitle>
              <CardDescription className="text-xs text-neutral-400">
                Unlock advanced invoicing features and customizations.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <Button
                onClick={() => setIsUpgradeModalOpen(true)}
                className="w-full text-xs h-8 bg-[#e0e0e0] text-black hover:bg-[#cccccc] font-medium border-0"
                variant="default"
              >
                Upgrade Now
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </>
  );

  return (
    <div className="fixed inset-0 flex overflow-hidden bg-[#050505] text-[#F5F5F5]">
      <CompanyOnboardingWizard />
      <UpgradeModal open={isUpgradeModalOpen} onOpenChange={setIsUpgradeModalOpen} />

      {/* Mobile overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/60 backdrop-blur-sm md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar — hidden on mobile, shown via drawer */}
      <aside className="hidden md:flex w-64 flex-shrink-0 flex-col border-r border-[#1F1F1F] bg-[#0D0D0D]">
        {sidebarContent}
      </aside>

      {/* Mobile slide-over drawer */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-72 flex-col border-r border-[#1F1F1F] bg-[#0D0D0D] transition-transform duration-300 md:hidden ${
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {sidebarContent}
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 min-h-0 overflow-hidden">
        {/* Header */}
        <header className="h-14 flex-shrink-0 flex items-center justify-between border-b border-[#1F1F1F] px-4 md:px-6 bg-[#050505]">
          <div className="flex items-center gap-3">
            <button
              className="md:hidden p-1.5 rounded-md text-neutral-400 hover:text-white hover:bg-white/5 transition-colors"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Open navigation menu"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div className="text-sm font-medium text-neutral-400">{currentPageLabel}</div>
          </div>
          <div className="flex items-center gap-4">
            <input
              type="file"
              accept="image/*"
              className="hidden"
              ref={fileInputRef}
              onChange={handleFileChange}
              disabled={uploading}
            />
            <Avatar
              className={`h-8 w-8 cursor-pointer transition-opacity ${uploading ? "opacity-50" : "hover:opacity-80"}`}
              onClick={handleAvatarClick}
              title="Click to change profile picture"
            >
              <AvatarImage src={avatarUrl} />
              <AvatarFallback className="bg-neutral-800 text-white text-xs font-semibold">
                {initials}
              </AvatarFallback>
            </Avatar>
          </div>
        </header>

        {/* Content */}
        <div id="dashboard-scroll" className="flex-1 overflow-auto px-4 py-5 md:px-5 md:py-6 lg:px-8 lg:py-8 xl:px-10">
          <div className="mx-auto w-full max-w-[1760px]">{children}</div>
        </div>
      </main>
    </div>
  );
}
