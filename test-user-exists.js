import fs from "fs";

const envFile = fs.readFileSync(".env.local", "utf8");
const env = Object.fromEntries(
  envFile.split("\n").filter(line => line && !line.startsWith("#")).map(line => line.split("="))
);

const supabaseUrl = env.VITE_SUPABASE_URL?.trim();
const supabaseKey = env.VITE_SUPABASE_ANON_KEY?.trim();

async function testUserExists() {
  const url = `${supabaseUrl}/auth/v1/signup`;
  
  // Try to sign up the EXACT same user we tried before
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "apikey": supabaseKey,
      "Authorization": `Bearer ${supabaseKey}`,
    },
    body: JSON.stringify({
      email: "test-signup-raw@example.com",
      password: "Password123!",
      data: {
        onboarding_pending: true,
      }
    }),
  });

  const text = await res.text();
  console.log("Status:", res.status);
  console.log("Response:", text);
}

testUserExists();
