/**
 * Envoiz branded Supabase auth email templates.
 *
 * HOW TO USE:
 * 1. Open the Supabase Dashboard → Authentication → Email Templates
 * 2. For each template, paste the corresponding exported string below into the "Body" field
 * 3. Update the "Subject" field to match the heading in each template
 *
 * All CSS is inline — email clients strip <style> blocks and class names.
 * The logo is embedded as a base64 data URI so it renders without any external request.
 * Supabase replaces {{ .ConfirmationURL }} with the signed one-time link at send time.
 */


// ---------------------------------------------------------------------------
// Shared shell builder
// ---------------------------------------------------------------------------

function buildTemplate(heading: string, body: string, ctaLabel: string): string {
  return `<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta http-equiv="X-UA-Compatible" content="IE=edge" />
  <title>${heading}</title>
</head>
<body style="margin:0;padding:0;background-color:#f9fafb;font-family:Inter,system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;">
  <!-- Outer wrapper -->
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f9fafb;">
    <tr>
      <td align="center" style="padding:48px 16px;">

        <!-- Card -->
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;background-color:#ffffff;border:1px solid #e5e7eb;border-radius:16px;">
          <tr>
            <td style="padding:40px 40px 32px;">

              <!-- Logo -->
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:32px;">
                <tr>
                  <td>
                    <img
  src="https://placehold.co/120x36?text=Envoiz"
  alt="Envoiz"
  height="36"
  style="height:36px;width:auto;display:block;border:0;outline:none;"
/>
                  </td>
                </tr>
              </table>

              <!-- Heading -->
              <h1 style="margin:0 0 12px;font-size:20px;font-weight:600;line-height:1.3;color:#111827;letter-spacing:-0.01em;">${heading}</h1>

              <!-- Body copy -->
              <p style="margin:0 0 28px;font-size:15px;line-height:1.6;color:#374151;">${body}</p>

              <!-- CTA button -->
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:20px;">
                <tr>
                  <td style="border-radius:8px;background-color:#000000;">
                    <a
                      href="{{ .ConfirmationURL }}"
                      target="_blank"
                      style="display:inline-block;padding:14px 28px;font-size:14px;font-weight:600;color:#ffffff;text-decoration:none;border-radius:8px;background-color:#000000;letter-spacing:0.01em;"
                    >${ctaLabel}</a>
                  </td>
                </tr>
              </table>

              <!-- Fallback URL -->
              <p style="margin:0 0 32px;font-size:12px;line-height:1.5;color:#6b7280;">
                If the button doesn't work, copy and paste this link into your browser:<br />
                <a href="{{ .ConfirmationURL }}" style="color:#374151;word-break:break-all;">{{ .ConfirmationURL }}</a>
              </p>

              <!-- Divider -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="border-top:1px solid #f3f4f6;padding-top:20px;">
                    <!-- Footer -->
                    <p style="margin:0;font-size:12px;line-height:1.5;color:#9ca3af;">
                      Envoiz &middot; Smart Invoicing for Freelancers and Businesses<br />
                      You received this email because an action was taken on your account.
                    </p>
                  </td>
                </tr>
              </table>

            </td>
          </tr>
        </table>

      </td>
    </tr>
  </table>
</body>
</html>`;
}

// ---------------------------------------------------------------------------
// Template 1 — Confirm signup
// Supabase template: "Confirm signup"
// Suggested subject: "Confirm your Envoiz account"
// ---------------------------------------------------------------------------
export const confirmSignupTemplate = buildTemplate(
  "Confirm your Envoiz account",
  "You&#39;re almost in. Click the button below to verify your email address and activate your Envoiz account.<br /><br />If you didn&#39;t create an Envoiz account, you can safely ignore this email.",
  "Confirm your email",
);

// ---------------------------------------------------------------------------
// Template 2 — Reset password
// Supabase template: "Reset password"
// Suggested subject: "Reset your Envoiz password"
// ---------------------------------------------------------------------------
export const resetPasswordTemplate = buildTemplate(
  "Reset your Envoiz password",
  "We received a request to reset the password for your Envoiz account. Click the button below to choose a new password.<br /><br />If you didn&#39;t request a password reset, you can safely ignore this email — your password will remain unchanged.",
  "Reset your password",
);

// ---------------------------------------------------------------------------
// Template 3 — Magic link
// Supabase template: "Magic Link"
// Suggested subject: "Your Envoiz sign-in link"
// ---------------------------------------------------------------------------
export const magicLinkTemplate = buildTemplate(
  "Your Envoiz sign-in link",
  "You requested a passwordless sign-in link for your Envoiz account. Click the button below to sign in instantly.<br /><br />If you didn&#39;t request this link, you can safely ignore this email.",
  "Sign in to Envoiz",
);

// ---------------------------------------------------------------------------
// Template 4 — Change email
// Supabase template: "Change Email Address"
// Suggested subject: "Confirm your new Envoiz email"
// ---------------------------------------------------------------------------
export const changeEmailTemplate = buildTemplate(
  "Confirm your new Envoiz email",
  "We received a request to change the email address linked to your Envoiz account. Click the button below to confirm your new address.<br /><br />If you didn&#39;t request this change, you can safely ignore this email — your current email address will remain unchanged.",
  "Confirm email change",
);
