import React from "react";
import { Link, useNavigate, useLocation } from "@tanstack/react-router";
import { LayoutDashboard, FileText, Users, Code, Webhook, Settings, Search } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/components/auth/auth-context";
import { supabase } from "@/lib/supabase";
import { BrandLogo } from "@/components/BrandLogo";
import { CompanyOnboardingWizard } from "@/components/envoiz/CompanyOnboardingWizard";
import { toast } from "sonner";
import { useRef, useState } from "react";

// Navigation items
const navItems = [
  { icon: LayoutDashboard, label: "Overview", to: "/dashboard" },
  { icon: FileText, label: "Invoices", to: "/dashboard/invoices" },
  { icon: Users, label: "Customers", to: "/dashboard/customers" },
  { icon: Code, label: "API", to: "/dashboard/api" },
  { icon: Webhook, label: "Webhooks", to: "/dashboard/webhooks" },
  { icon: Settings, label: "Settings", to: "/dashboard/settings" },
];

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const { user, refreshSession } = useAuth();
  const { pathname } = useLocation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  // Manual active detection — more reliable than activeProps during SSR hydration.
  // Overview uses exact match; all other pages use startsWith.
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

  return (
    <div className="fixed inset-0 flex overflow-hidden bg-background">
      <CompanyOnboardingWizard />
      {/* Sidebar */}
      <aside className="w-64 flex-shrink-0 flex flex-col border-r border-border bg-muted/20">
        <div className="p-6 flex items-center">
          <Link to="/" className="hover:opacity-80 transition-opacity">
            <BrandLogo className="h-12 w-auto" />
          </Link>
        </div>

        <div className="px-4 pb-4">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search..."
              className="w-full bg-background pl-8 pr-12 rounded-md h-9 shadow-sm"
            />
            <div className="absolute right-1.5 top-1.5 flex h-6 items-center rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
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
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="p-4 mt-auto">
          <Card className="shadow-sm border-primary/20 bg-primary/5">
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-sm font-semibold">Upgrade your plan</CardTitle>
              <CardDescription className="text-xs">
                Unlock advanced invoicing features and API limits.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <Button className="w-full text-xs h-8" variant="default">
                Upgrade Now
              </Button>
            </CardContent>
          </Card>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 min-h-0 overflow-hidden">
        {/* Header */}
        <header className="h-14 flex-shrink-0 flex items-center justify-between border-b border-border px-6 bg-background">
          <div className="flex items-center text-sm font-medium text-muted-foreground">
            {currentPageLabel}
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
              <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                {initials}
              </AvatarFallback>
            </Avatar>
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 overflow-auto px-5 py-6 lg:px-8 lg:py-8 xl:px-10">
          <div className="mx-auto w-full max-w-[1760px]">{children}</div>
        </div>
      </main>
    </div>
  );
}
