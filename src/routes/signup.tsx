import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect } from "react";

import { AuthForm } from "@/components/auth/AuthForm";
import { useAuth } from "@/components/auth/auth-context";
import { AuthShell } from "@/components/auth/AuthShell";

export const Route = createFileRoute("/signup")({
  head: () => ({
    meta: [
      { title: "Create your account — Envoiz" },
      {
        name: "description",
        content: "Create your workspace and keep the business side of your work in good order.",
      },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: SignupPage,
});

function SignupPage() {
  const { session, loading } = useAuth();

  useEffect(() => {
    if (!loading && session) {
      window.location.replace("/dashboard");
    }
  }, [loading, session]);

  return (
    <AuthShell
      title="Create your account"
      subtitle="Create your workspace and keep the business side of your work in good order."
      footer={
        <>
          Already have an account? <Link to="/login">Sign in</Link>
        </>
      }
      mode="signup"
    >
      <AuthForm />
    </AuthShell>
  );
}
