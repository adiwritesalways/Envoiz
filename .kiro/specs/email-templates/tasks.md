# Implementation Tasks — Envoiz Email Templates

## Task 1: Create `src/lib/email-templates.ts`
- [ ] Implement shared `buildTemplate(heading, body, ctaLabel)` helper returning a full inline-CSS HTML string
- [ ] Export `confirmSignupTemplate` — heading: "Confirm your Envoiz account", CTA: "Confirm your email"
- [ ] Export `resetPasswordTemplate` — heading: "Reset your Envoiz password", CTA: "Reset your password"
- [ ] Export `magicLinkTemplate` — heading: "Your Envoiz sign-in link", CTA: "Sign in to Envoiz"
- [ ] Export `changeEmailTemplate` — heading: "Confirm your new Envoiz email", CTA: "Confirm email change"

## Task 2: Add magic link section to `AuthForm.tsx`
- [ ] Add `magicLinkMode`, `magicEmail`, `magicLoading` state
- [ ] Add `onMagicLinkSubmit` calling `supabase.auth.signInWithOtp`
- [ ] Render toggle + form below social buttons, login mode only
- [ ] Accessible label/input pair, focus ring, loading state

## Task 3: Add Change Email panel to `settings.tsx`
- [ ] Add `newEmail`, `emailChangeSaving` state
- [ ] Add `handleEmailChange` calling `supabase.auth.updateUser({ email })`
- [ ] Insert panel between Change Password and Danger Zone
- [ ] Hide for OAuth users, accessible label/input pair

## Task 4: Create `src/routes/confirm-email-change.tsx`
- [ ] `createFileRoute("/confirm-email-change")` with head meta
- [ ] Three states: detecting / success / invalid
- [ ] Listen for `EMAIL_CHANGE` auth event + hash param fallback
- [ ] 4s timeout fallback to invalid state
- [ ] Visual shell matching `/reset-password`

## Task 5: Verify redirect URLs in `AuthForm.tsx`
- [ ] Confirm `signUp` emailRedirectTo → `/dashboard` ✅
- [ ] Confirm `resetPasswordForEmail` redirectTo → `/reset-password` ✅
