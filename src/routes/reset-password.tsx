import { createFileRoute, Link } from "@tanstack/react-router";

import { AuthShell } from "@/components/auth/AuthShell";

export const Route = createFileRoute("/reset-password")({
  head: () => ({
    meta: [
      { title: "Account Access — Envoiz" },
      { name: "description", content: "Recover access to your Envoiz account." },
    ],
  }),
  component: ResetPasswordPage,
});

function ResetPasswordPage() {
  return (
    <AuthShell
      title="Continue with your account provider"
      subtitle="Envoiz accounts use Google or GitHub sign in. Return to sign in and choose the provider linked to your account."
      footer={
        <Link to="/login" className="font-semibold text-[#5b7732] hover:underline">
          Back to sign in
        </Link>
      }
      mode="forgot"
    >
      <Link
        to="/login"
        className="primary-button full-button inline-flex items-center justify-center"
        style={{ minHeight: "44px" }}
      >
        Continue to sign in
      </Link>
    </AuthShell>
  );
}
