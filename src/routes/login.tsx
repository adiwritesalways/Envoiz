import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect } from "react";

import { AuthForm } from "@/components/auth/AuthForm";
import { useAuth } from "@/components/auth/auth-context";
import { AuthShell } from "@/components/auth/AuthShell";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Sign in to Envoiz" },
      {
        name: "description",
        content: "Choose your account provider to continue to your workspace.",
      },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const { session, loading } = useAuth();

  useEffect(() => {
    if (!loading && session) {
      window.location.replace("/dashboard");
    }
  }, [loading, session]);

  return (
    <AuthShell
      title="Sign in to Envoiz"
      subtitle="Choose your account provider to continue to your workspace."
      footer={
        <>
          New to Envoiz? <Link to="/signup">Create account</Link>
        </>
      }
      mode="login"
    >
      <AuthForm mode="login" />
    </AuthShell>
  );
}
