import { createClient } from "@supabase/supabase-js";
import fs from "fs";

const envFile = fs.readFileSync(".env.local", "utf8");
const env = Object.fromEntries(
  envFile.split("\n").filter(line => line && !line.startsWith("#")).map(line => line.split("="))
);

const supabaseUrl = env.VITE_SUPABASE_URL?.trim();
const supabaseKey = env.VITE_SUPABASE_ANON_KEY?.trim();

const supabase = createClient(supabaseUrl, supabaseKey);

async function testSignupRedirect() {
  console.log("Attempting sign up with emailRedirectTo...");
  const { data, error } = await supabase.auth.signUp({
    email: "test-redirect-error@example.com",
    password: "Password123!",
    options: {
      emailRedirectTo: "http://localhost:5173/dashboard",
      data: {
        onboarding_pending: true,
      },
    },
  });

  if (error) {
    console.error("Sign up error:", error);
    if (error.status) console.error("Status:", error.status);
    console.error("Full error object:", JSON.stringify(error, null, 2));
  } else {
    console.log("Sign up successful:", data);
  }
}

testSignupRedirect();
