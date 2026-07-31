import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";

import { AuthForm } from "@/components/auth/AuthForm";
import { useAuth } from "@/components/auth/auth-context";
import { AuthShell } from "@/components/auth/AuthShell";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Sign in — Envoiz" },
      {
        name: "description",
        content:
          "Sign in to your Envoiz account with Google or GitHub to manage invoices, customers, and payments.",
      },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const { session, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && session) {
      void navigate({ to: "/dashboard" });
    }
  }, [loading, navigate, session]);

  return (
    <AuthShell
      title="Log in to Envoiz"
      subtitleText="Don't have an account?"
      subtitleLinkLabel="Sign up."
      subtitleLinkTo="/signup"
    >
      <AuthForm />
    </AuthShell>
  );
}
