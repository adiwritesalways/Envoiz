import * as React from "react";
import { Sparkles, Upload } from "lucide-react";
import { toast } from "sonner";

import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/components/auth/auth-context";
import { supabase } from "@/lib/supabase";
import {
  readUserStorageValue,
  settingsStorageKeys,
  writeUserStorageValue,
} from "@/lib/envoiz";

const DEFAULT_COMPANY_NAME = "Envoiz Studio";
const DEFAULT_COMPANY_ADDRESS = "Dhanmondi, Dhaka, Bangladesh";

export function CompanyOnboardingWizard() {
  const { user, refreshSession } = useAuth();
  const [open, setOpen] = React.useState(false);
  const [companyName, setCompanyName] = React.useState("");
  const [companyAddress, setCompanyAddress] = React.useState("");
  const [avatarUrl, setAvatarUrl] = React.useState<string | undefined>();
  const [saving, setSaving] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (!user?.id) {
      setOpen(false);
      return;
    }

    const savedCompanyName = readUserStorageValue(user.id, settingsStorageKeys.companyName, "");
    const savedCompanyAddress = readUserStorageValue(user.id, settingsStorageKeys.companyAddress, "");
    const onboardingComplete = readUserStorageValue(
      user.id,
      settingsStorageKeys.onboardingComplete,
      "",
    );

    setCompanyName(savedCompanyName);
    setCompanyAddress(savedCompanyAddress);
    setAvatarUrl(user.user_metadata?.avatar_url);
    setOpen(!onboardingComplete);
  }, [user]);

  const uploadAvatar = async (file: File) => {
    if (!user) throw new Error("You must be logged in to upload a profile picture.");

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

    setAvatarUrl(publicUrl);
    await refreshSession();
  };

  const handleAvatarChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const file = event.target.files?.[0];
      if (!file) return;
      await uploadAvatar(file);
      toast.success("Profile picture updated.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to upload profile picture.");
    } finally {
      event.target.value = "";
    }
  };

  const handleSave = async () => {
    if (!user) return;

    setSaving(true);
    try {
      writeUserStorageValue(
        user.id,
        settingsStorageKeys.companyName,
        companyName.trim() || DEFAULT_COMPANY_NAME,
      );
      writeUserStorageValue(
        user.id,
        settingsStorageKeys.companyAddress,
        companyAddress.trim() || DEFAULT_COMPANY_ADDRESS,
      );
      writeUserStorageValue(user.id, settingsStorageKeys.onboardingComplete, "true");
      toast.success("Workspace setup saved.");
      setOpen(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to save onboarding details.");
    } finally {
      setSaving(false);
    }
  };

  if (!user) return null;

  const initials = (user.user_metadata?.full_name || user.email || "User").slice(0, 2).toUpperCase();

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-2xl gap-0 border-hairline p-0 overflow-hidden [&>button]:hidden">
        <div className="border-b border-hairline bg-gradient-to-br from-foreground to-foreground/85 px-6 py-5 text-background">
          <div className="flex items-center gap-2 text-[12px] uppercase tracking-[0.22em] text-background/70">
            <Sparkles className="h-3.5 w-3.5" />
            New account wizard
          </div>
          <DialogTitle className="mt-2 text-2xl font-semibold tracking-[-0.03em]">
            Set up your workspace
          </DialogTitle>
          <DialogDescription className="mt-2 max-w-xl text-sm text-background/75">
            Add your company details once so invoices and previews start from your own profile,
            not a previous account on this browser.
          </DialogDescription>
        </div>

        <div className="grid gap-6 p-6 md:grid-cols-[1fr_auto] md:items-start">
          <div className="space-y-4">
            <div>
              <label className="text-[12px] text-muted-foreground">Company Name</label>
              <input
                value={companyName}
                onChange={(event) => setCompanyName(event.target.value)}
                placeholder={DEFAULT_COMPANY_NAME}
                className="mt-1.5 h-11 w-full rounded-2xl border border-hairline bg-white px-3 text-[14px] outline-none transition focus:border-foreground/20"
              />
            </div>
            <div>
              <label className="text-[12px] text-muted-foreground">Company Address</label>
              <textarea
                value={companyAddress}
                onChange={(event) => setCompanyAddress(event.target.value)}
                placeholder={DEFAULT_COMPANY_ADDRESS}
                rows={4}
                className="mt-1.5 w-full resize-none rounded-2xl border border-hairline bg-white px-3 py-3 text-[14px] outline-none transition focus:border-foreground/20"
              />
            </div>
            <div className="rounded-2xl border border-dashed border-hairline bg-surface/40 p-4 text-[13px] text-muted-foreground">
              Upload a profile picture now, or skip it and do it later from the avatar in the top
              bar.
            </div>
          </div>

          <div className="flex flex-col items-center gap-3 rounded-3xl border border-hairline bg-surface/40 p-5 text-center">
            <Avatar className="h-20 w-20">
              <AvatarImage src={avatarUrl} />
              <AvatarFallback className="bg-primary/10 text-primary text-lg font-semibold">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="space-y-1">
              <div className="text-[13px] font-medium text-foreground">Profile picture</div>
              <div className="text-[12px] text-muted-foreground">PNG or JPG, up to your browser limit.</div>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarChange}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center gap-2 rounded-full bg-foreground px-4 py-2 text-[13px] font-medium text-background transition-colors hover:opacity-90"
            >
              <Upload className="h-4 w-4" />
              Upload picture
            </button>
          </div>
        </div>

        <div className="flex flex-wrap justify-end gap-3 border-t border-hairline bg-white px-6 py-4">
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center justify-center rounded-full bg-foreground px-4 py-2 text-[13px] font-medium text-background transition-colors hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? "Saving..." : "Finish setup"}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
