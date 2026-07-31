import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";

import { AuthForm } from "@/components/auth/AuthForm";
import { useAuth } from "@/components/auth/auth-context";
import { AuthShell } from "@/components/auth/AuthShell";

export const Route = createFileRoute("/signup")({
  head: () => ({
    meta: [
      { title: "Get started — Envoiz" },
      {
        name: "description",
        content:
          "Create your free Envoiz account with Google or GitHub and start sending beautiful invoices in minutes.",
      },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: SignupPage,
});

function SignupPage() {
  const { session, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && session) {
      void navigate({ to: "/dashboard" });
    }
  }, [loading, navigate, session]);

  return (
    <AuthShell
      title="Create your Envoiz account"
      subtitleText="Already have an account?"
      subtitleLinkLabel="Log in."
      subtitleLinkTo="/login"
    >
      <AuthForm />
    </AuthShell>
  );
}
