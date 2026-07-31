# Design Document — Envoiz Email Templates

## Overview

This feature delivers branded Supabase auth email templates and the frontend wiring for
two currently-missing auth flows (magic link sign-in and email-address change). The work
touches four areas:

1. `src/lib/email-templates.ts` — the single source-of-truth file for all four HTML templates
2. `src/components/auth/AuthForm.tsx` — magic link section added to login mode
3. `src/routes/dashboard/settings.tsx` — "Change email" panel added
4. `src/routes/confirm-email-change.tsx` — new top-level route

No new npm dependencies are introduced.

---

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│  Supabase Dashboard (manual paste)                       │
│  Auth → Email Templates (× 4)                           │
│    confirmSignupTemplate  ─────────────────────────┐    │
│    resetPasswordTemplate  ─────────────────────┐   │    │
│    magicLinkTemplate      ─────────────────┐   │   │    │
│    changeEmailTemplate    ─────────────┐   │   │   │    │
└────────────────────────────────────────│───│───│───│────┘
                                         │   │   │   │
                           src/lib/email-templates.ts
                           (exported TS string constants)
                                         │   │   │   │
           ┌─────────────────────────────┘   │   │   │
           ▼                                 │   │   │
   /confirm-email-change            /dashboard   │   │
   (new route — EMAIL_CHANGE event) /settings    │   │
                                    (Change email│   │
                                     panel)      │   │
                                                 │   │
                                  /login          │   │
                                  (magic link     │   │
                                   section)       │   │
                                                  │   │
                                  /reset-password ─   │
                                  (already exists)    │
                                                       │
                                  /dashboard ──────────┘
                                  (signup confirm redirect)
```

### Data flow per email type

| Template | Trigger (client call) | `{{ .ConfirmationURL }}` lands at |
|---|---|---|
| Confirm signup | `signUp({ emailRedirectTo: origin + '/dashboard' })` | `/dashboard` |
| Reset password | `resetPasswordForEmail(email, { redirectTo: origin + '/reset-password' })` | `/reset-password` |
| Magic link | `signInWithOtp({ email, options: { emailRedirectTo: origin + '/dashboard' } })` | `/dashboard` |
| Change email | `updateUser({ email }, { emailRedirectTo: origin + '/confirm-email-change' })` | `/confirm-email-change` |

---

## Module: `src/lib/email-templates.ts`

### Purpose
Single source file exporting four named string constants. Each is a self-contained HTML
document ready to be copy-pasted into the Supabase Dashboard.

### Constraints
- **Inline CSS only** — `style=""` attributes on every styled element. No `<style>` blocks,
  no class names. Major email clients (Gmail, Outlook, Apple Mail) strip non-inline styles.
- **No external resources** — logo embedded as the existing base64 data URI from
  `src/lib/envoiz-logo-data.ts`. No web fonts loaded via `<link>` (email clients block them);
  font stack falls back gracefully: `Inter, system-ui, -apple-system, sans-serif`.
- **Supabase variable** — exactly one CTA anchor per template with
  `href="{{ .ConfirmationURL }}"`. Supabase replaces this at send time.
- **Max width 600 px** — industry-standard email container width.

### Visual structure (all four templates share the same shell)

```
┌──────────────────────────────────────────┐  max-width: 600px
│  [white background, light-gray border]   │  background: #ffffff
│                                          │  border: 1px solid #e5e7eb
│  ┌──────────────────────────────────┐    │  border-radius: 16px
│  │  Logo (base64 img, h=36px)       │    │  padding: 40px 40px 32px
│  └──────────────────────────────────┘    │
│                                          │
│  Heading (20px, #111827, semibold)       │
│  Body copy (15px, #374151, 1.6 lh)      │
│                                          │
│  ┌──────────────────────────────────┐    │
│  │  [CTA Button]                    │    │  background: #000000
│  │  Button label (14px, #ffffff)    │    │  border-radius: 8px
│  └──────────────────────────────────┘    │  padding: 14px 28px
│                                          │
│  Fallback URL note (12px, #6b7280)      │
│  ──────────────────────────────────      │  border-top: 1px solid #f3f4f6
│  Footer: "Envoiz · Smart Invoicing"     │  font-size: 12px, #9ca3af
└──────────────────────────────────────────┘
```

### Template-specific content

| Constant | Subject line (informational) | Heading | Body copy summary | Button label |
|---|---|---|---|---|
| `confirmSignupTemplate` | Confirm your Envoiz account | Confirm your Envoiz account | "You're almost in. Click below to verify your email and activate your account." + ignore note | Confirm your email |
| `resetPasswordTemplate` | Reset your Envoiz password | Reset your Envoiz password | "We received a request to reset your password. Click below to choose a new one." + ignore note | Reset your password |
| `magicLinkTemplate` | Your Envoiz sign-in link | Your Envoiz sign-in link | "You requested a passwordless sign-in link. Click below to sign in instantly." + ignore note | Sign in to Envoiz |
| `changeEmailTemplate` | Confirm your new Envoiz email | Confirm your new Envoiz email | "We received a request to change your account email. Click below to confirm your new address." + ignore note | Confirm email change |

### Implementation pattern

```ts
// src/lib/email-templates.ts
import { envoizLpLogoDataUri } from "./envoiz-logo-data";

function buildTemplate(heading: string, body: string, ctaLabel: string): string {
  return `<!DOCTYPE html>
<html lang="en">
...shell with inline styles...
  ${heading} / ${body} / ${ctaLabel}
  href="{{ .ConfirmationURL }}"
...
</html>`;
}

export const confirmSignupTemplate  = buildTemplate(...);
export const resetPasswordTemplate  = buildTemplate(...);
export const magicLinkTemplate      = buildTemplate(...);
export const changeEmailTemplate    = buildTemplate(...);
```

The shared `buildTemplate` helper keeps duplication near-zero while each export remains a
plain string constant usable as a copy-paste artifact.

---

## Component: `AuthForm.tsx` — Magic Link Section

### Where it renders
Below the existing `<form>` and the "or continue with" divider, visible only when
`mode === "login"` and `resetMode === false`.

### Visual layout (matches existing auth UI style)

```
─────────────────────────────────
  or sign in with a magic link
─────────────────────────────────

  Email
  [_________________________________]
  [  Send magic link  →            ]

  ← Back to password sign in   (shown after success)
```

### State additions
```ts
const [magicLinkMode, setMagicLinkMode] = useState(false);
const [magicEmail, setMagicEmail] = useState("");
const [magicLoading, setMagicLoading] = useState(false);
```

### Logic
```ts
const onMagicLinkSubmit = async (e: FormEvent) => {
  e.preventDefault();
  setMagicLoading(true);
  const { error } = await supabase.auth.signInWithOtp({
    email: magicEmail,
    options: { emailRedirectTo: `${window.location.origin}/dashboard` },
  });
  if (error) setError(error.message);
  else setInfo("Check your email for a sign-in link.");
  setMagicLoading(false);
};
```

### Accessibility
- `<label htmlFor="magicEmail">` paired with `<input id="magicEmail">`
- Focus ring: `focus:ring-2 focus:ring-black/10 focus:border-black/30` (matches existing inputs)
- Submit button disabled while loading, with spinner

---

## Component: `settings.tsx` — Change Email Panel

### Where it renders
New `<Panel>` inserted between the "Change Password" panel and the "Danger Zone" panel.
Hidden for OAuth users (`isOAuthUser === true`) with an informational note, same pattern
as the existing Change Password panel.

### Visual layout

```
┌─ Change Email ──────────────────────────────────────┐
│  Update the email address linked to your account.   │
│                                                      │
│  New email address                                   │
│  [________________________________________]          │
│  [ Send confirmation ]                               │
│                                                      │
│  (success/error message area)                        │
└──────────────────────────────────────────────────────┘
```

### State additions (inside `SettingsPage`)
```ts
const [newEmail, setNewEmail] = useState("");
const [emailChangeSaving, setEmailChangeSaving] = useState(false);
```

### Logic
```ts
const handleEmailChange = async () => {
  if (!newEmail) return;
  setEmailChangeSaving(true);
  const redirectTo = `${window.location.origin}/confirm-email-change`;
  const { error } = await supabase.auth.updateUser(
    { email: newEmail },
    { emailRedirectTo: redirectTo },
  );
  if (error) toast.error(error.message);
  else {
    toast.success("Check your new email address for a confirmation link.");
    setNewEmail("");
  }
  setEmailChangeSaving(false);
};
```

### Accessibility
- `<label htmlFor="newEmail">` paired with `<input id="newEmail">`
- Button disabled while saving

---

## Route: `src/routes/confirm-email-change.tsx`

### URL
`/confirm-email-change`

### Registration
TanStack Router auto-discovers routes by file name. Creating the file is sufficient —
`routeTree.gen.ts` is regenerated at next dev/build. No manual edits to `routeTree.gen.ts`.

### Page states

```
State A — detecting (initial mount, listening for event)
  "Confirming your email change…"  (spinner or neutral message)

State B — success (EMAIL_CHANGE event received)
  ✓  "Email address updated."
     "Your account email has been changed. You can now sign in with your new address."
     [ Go to Dashboard → ]

State C — invalid / expired (mounted with no valid token, timeout after 4s)
  ✗  "Invalid or expired link"
     "This confirmation link may have already been used or has expired."
     [ Back to Settings → ]
```

### Logic
```ts
useEffect(() => {
  // Detect EMAIL_CHANGE from URL hash (Supabase PKCe/implicit flow sets type=email_change)
  const hashParams = new URLSearchParams(window.location.hash.slice(1));
  const type = hashParams.get("type");
  if (type === "email_change") setStatus("success");

  const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
    if (event === "EMAIL_CHANGE") setStatus("success");
  });

  // Fallback: if no event after 4s, treat as invalid
  const timer = setTimeout(() => {
    setStatus((s) => s === "detecting" ? "invalid" : s);
  }, 4000);

  return () => { subscription.unsubscribe(); clearTimeout(timer); };
}, []);
```

### Visual style
Matches `/reset-password` exactly:
- `min-h-screen bg-[#f8f8f7] flex flex-col items-center justify-center`
- White card: `rounded-3xl border border-hairline bg-white p-8 shadow-[0_2px_16px_rgba(0,0,0,0.06)]`
- `<BrandLogo>` centered above the card
- `max-w-sm w-full`

---

## Redirect URL Audit

| Call site | Current `redirectTo` / `emailRedirectTo` | Required | Status |
|---|---|---|---|
| `AuthForm` — `signUp` | `window.location.origin + '/dashboard'` | `/dashboard` | ✅ correct |
| `AuthForm` — `resetPasswordForEmail` | `window.location.origin + '/reset-password'` | `/reset-password` | ✅ correct |
| `AuthForm` — `signInWithOtp` (new) | `window.location.origin + '/dashboard'` | `/dashboard` | new |
| `settings.tsx` — `updateUser` email (new) | `window.location.origin + '/confirm-email-change'` | `/confirm-email-change` | new |

Both existing calls are already correct. No changes needed there.

---

## File Change Summary

| File | Change type |
|---|---|
| `src/lib/email-templates.ts` | **New** — four exported HTML template strings |
| `src/components/auth/AuthForm.tsx` | **Edit** — magic link section in login mode |
| `src/routes/dashboard/settings.tsx` | **Edit** — Change Email panel |
| `src/routes/confirm-email-change.tsx` | **New** — confirm-email-change route |

No changes to `routeTree.gen.ts` (auto-generated), `supabase.ts`, or any other file.
