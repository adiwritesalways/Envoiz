# Requirements Document

## Introduction

Envoiz uses Supabase Auth for all identity management. Supabase sends four transactional
authentication emails: confirm signup, reset password, magic link, and change email. Currently
these emails use Supabase's generic default templates — they carry no Envoiz branding, and two
of the four auth flows (magic link and change email) are not yet wired into the frontend.

This feature delivers two things:

1. **Branded HTML email templates** — a single TypeScript source file exporting four
   inline-CSS HTML strings, one per email type, styled in Envoiz's clean black-and-white
   brand. Each string is intended to be pasted into the Supabase Dashboard under
   Authentication → Email Templates.

2. **Frontend wiring** — a "Sign in with magic link" option on the login page, a
   "Change email" form in the settings page, and a new `/confirm-email-change` route that
   handles the post-link landing for email change confirmation.

No custom SMTP, no new dependencies, and no server-side code changes are required.

## Glossary

- **Email_Templates_Module**: The TypeScript file `src/lib/email-templates.ts` that exports
  the four HTML template strings.
- **Supabase_Auth**: The Supabase client-side auth SDK (`@supabase/supabase-js`) already
  initialised in `src/lib/supabase.ts`.
- **Confirmation_URL**: Supabase's template variable `{{ .ConfirmationURL }}` — the signed
  one-time URL Supabase inserts into each transactional email.
- **AuthForm**: The existing React component at `src/components/auth/AuthForm.tsx` that
  renders the login and signup forms.
- **Login_Page**: The existing route at `/login` that renders `AuthForm` in login mode.
- **Settings_Page**: The existing route at `/dashboard/settings`.
- **Confirm_Email_Change_Page**: The new route at `/confirm-email-change`.
- **Brand_Style**: Envoiz's visual identity — white background (`#ffffff`), near-black body
  text (`#111827`), solid-black CTA button (`#000000`) with white label, Inter font with
  system-ui fallback, light-gray hairline borders, rounded corners.
- **Inline_CSS**: HTML style attributes only; no `<style>` blocks, no class names, no
  external stylesheets. Required because email clients strip non-inline CSS.
- **OTP_Flow**: Supabase's `signInWithOtp` call, which sends a magic-link email when an
  email address is provided.

---

## Requirements

### Requirement 1: Email Templates Module

**User Story:** As a product owner, I want a single source file that contains all four
Supabase email templates, so that branded templates can be maintained in version control and
pasted into the Supabase Dashboard without manual HTML authoring.

#### Acceptance Criteria

1. THE Email_Templates_Module SHALL export four named string constants:
   `confirmSignupTemplate`, `resetPasswordTemplate`, `magicLinkTemplate`, and
   `changeEmailTemplate`.

2. THE Email_Templates_Module SHALL produce valid HTML documents for each template, where
   all CSS is applied as inline `style` attributes with no external stylesheets, no
   `<style>` blocks, and no CSS class names.

3. WHEN a template string is rendered by an email client, THE Email_Templates_Module SHALL
   include exactly one anchor element whose `href` attribute contains `{{ .ConfirmationURL }}`
   as the call-to-action link.

4. THE Email_Templates_Module SHALL style each template according to Brand_Style:
   white (`#ffffff`) background, near-black (`#111827`) body text, solid-black (`#000000`)
   CTA button with white (`#ffffff`) label text, Inter font with `system-ui, sans-serif`
   fallback, and a light-gray hairline border on the container card.

5. THE Email_Templates_Module SHALL include the Envoiz logo as an inline `<img>` element
   using the base64 data URI exported from `src/lib/envoiz-logo-data.ts`, so the logo
   renders without any external image request.

6. THE Email_Templates_Module SHALL include a footer containing the brand name "Envoiz" in
   each template.

7. THE Email_Templates_Module SHALL set CTA button text as follows:
   - `confirmSignupTemplate`: "Confirm your email"
   - `resetPasswordTemplate`: "Reset your password"
   - `magicLinkTemplate`: "Sign in to Envoiz"
   - `changeEmailTemplate`: "Confirm email change"

8. THE Email_Templates_Module SHALL ensure the CTA button foreground color (`#ffffff`) on
   background color (`#000000`) meets WCAG AA contrast ratio of at least 4.5:1.

---

### Requirement 2: Confirm Signup Email Flow

**User Story:** As a new user, I want to receive a branded confirmation email after signing
up, so that I can verify my account with a link that takes me directly to my dashboard.

#### Acceptance Criteria

1. WHEN a user submits the signup form, THE AuthForm SHALL call
   `supabase.auth.signUp` with `options.emailRedirectTo` set to
   `window.location.origin + '/dashboard'`.

2. WHEN `supabase.auth.signUp` returns without a session (email confirmation required),
   THE AuthForm SHALL display an informational message instructing the user to check their
   email to verify their account.

3. THE `confirmSignupTemplate` SHALL include the heading "Confirm your Envoiz account"
   and body copy that explains the user should click the button to verify their email address.

---

### Requirement 3: Reset Password Email Flow

**User Story:** As a user who has forgotten their password, I want to receive a branded
reset-password email, so that I can set a new password via a link that takes me to the
correct page.

#### Acceptance Criteria

1. WHEN a user submits the forgot-password form in `AuthForm`, THE AuthForm SHALL call
   `supabase.auth.resetPasswordForEmail` with `redirectTo` set to
   `window.location.origin + '/reset-password'`.

2. THE `resetPasswordTemplate` SHALL include the heading "Reset your Envoiz password" and
   body copy that explains the user requested a password reset and should click the button
   to set a new one.

3. IF the user did not request a password reset, THEN THE `resetPasswordTemplate` SHALL
   include a note in the body copy advising the user to ignore the email.

---

### Requirement 4: Magic Link Email Flow

**User Story:** As a user, I want the option to sign in without a password using a magic
link, so that I can access my account quickly without remembering credentials.

#### Acceptance Criteria

1. THE Login_Page SHALL render a "Sign in with magic link" section below the existing
   password form, containing an email input field and a submit button labelled
   "Send magic link".

2. WHEN a user submits a valid email address in the magic link section, THE Login_Page
   SHALL call `supabase.auth.signInWithOtp` with `{ email, options: { emailRedirectTo:
   window.location.origin + '/dashboard' } }`.

3. WHEN `supabase.auth.signInWithOtp` succeeds, THE Login_Page SHALL display an
   informational message telling the user to check their email for the sign-in link.

4. IF `supabase.auth.signInWithOtp` returns an error, THEN THE Login_Page SHALL display the
   error message to the user.

5. WHEN the magic link email input field is focused, THE Login_Page SHALL apply a visible
   focus indicator that meets WCAG AA standards.

6. THE magic link email input field SHALL have an associated `<label>` element with a
   `for`/`htmlFor` attribute matching the input's `id`.

7. THE `magicLinkTemplate` SHALL include the heading "Your Envoiz sign-in link" and body
   copy that explains the user requested a passwordless sign-in link.

---

### Requirement 5: Change Email Flow

**User Story:** As a signed-in user, I want to change my account email address from the
settings page, so that I can keep my login credentials up to date.

#### Acceptance Criteria

1. THE Settings_Page SHALL render a "Change email" panel containing a labelled text input
   for the new email address and a submit button labelled "Send confirmation".

2. WHEN a signed-in user submits a new email address in the change-email panel, THE
   Settings_Page SHALL call `supabase.auth.updateUser` with `{ email: newEmail }` and
   `options.emailRedirectTo` set to `window.location.origin + '/confirm-email-change'`.

3. WHEN `supabase.auth.updateUser` for email change succeeds, THE Settings_Page SHALL
   display an informational message telling the user to check their new email address for a
   confirmation link.

4. IF `supabase.auth.updateUser` for email change returns an error, THEN THE Settings_Page
   SHALL display the error message to the user.

5. THE change-email input field SHALL have an associated `<label>` element with a
   `for`/`htmlFor` attribute matching the input's `id`.

6. THE `changeEmailTemplate` SHALL include the heading "Confirm your new Envoiz email" and
   body copy explaining that the user requested an email address change and should click
   the button to confirm their new address.

---

### Requirement 6: Confirm Email Change Route

**User Story:** As a user who clicked the email-change confirmation link, I want to land on
a dedicated page that acknowledges my email has been updated, so that I have clear
confirmation the change succeeded.

#### Acceptance Criteria

1. THE Confirm_Email_Change_Page SHALL be accessible at the route `/confirm-email-change`
   using TanStack Router file-based routing.

2. WHEN the Confirm_Email_Change_Page mounts, THE Confirm_Email_Change_Page SHALL listen
   for the `EMAIL_CHANGE` auth state event via `supabase.auth.onAuthStateChange` and, upon
   receiving it, display a success message confirming the email address has been updated.

3. WHEN a valid `EMAIL_CHANGE` event is detected, THE Confirm_Email_Change_Page SHALL
   display a link or button to navigate to `/dashboard`.

4. WHEN the Confirm_Email_Change_Page mounts without a valid email-change session token in
   the URL, THE Confirm_Email_Change_Page SHALL display an informational message explaining
   that the link may be invalid or expired, with a link back to `/dashboard/settings`.

5. THE Confirm_Email_Change_Page SHALL follow Brand_Style and match the visual treatment of
   the existing `/reset-password` route.

---

### Requirement 7: No New Dependencies

**User Story:** As a developer maintaining the codebase, I want the email-templates feature
implemented without adding new npm packages, so that the dependency surface stays minimal.

#### Acceptance Criteria

1. THE Email_Templates_Module SHALL be implemented using only TypeScript string literals and
   template literals; no HTML-generation library or templating engine SHALL be added.

2. THE Login_Page magic link UI and THE Settings_Page change-email UI SHALL be implemented
   using existing project components and Tailwind CSS classes; no new UI library or CSS
   framework SHALL be introduced.

3. THE Confirm_Email_Change_Page SHALL be implemented using existing project utilities
   (TanStack Router, Supabase client, existing UI primitives); no new routing or auth
   library SHALL be introduced.
