import { envoizLpLogoDataUri } from "./envoiz-logo-data";

export const brandName = "Envoiz";
export const slogan = "Smart Invoicing for Freelancers and Businesses";
export const siteUrl = import.meta.env.VITE_APP_URL || "https://envoiz.com";
export const socialPreviewUrl = `${siteUrl}/envoiz-social-preview.png`;

export const faviconUrl = "/envoiz-brand-mark-cropped.png";

// Inline the horizontal logo so the landing page can render it immediately
// without waiting on an extra image request.
export const logoUrl = "/envoiz-brand-mark-cropped.png";

export const currencyOptions = [
  { code: "USD", label: "US Dollar" },
  { code: "EUR", label: "Euro" },
  { code: "GBP", label: "British Pound" },
  { code: "AUD", label: "Australian Dollar" },
  { code: "CAD", label: "Canadian Dollar" },
  { code: "SGD", label: "Singapore Dollar" },
  { code: "BDT", label: "Bangladeshi Taka" },
  { code: "INR", label: "Indian Rupee" },
  { code: "AED", label: "UAE Dirham" },
  { code: "JPY", label: "Japanese Yen" },
] as const;

export type CurrencyCode = (typeof currencyOptions)[number]["code"];

export const defaultCurrency: CurrencyCode = "USD";

export function formatInvoiceNumber(sequence: number) {
  return `ENV-${String(sequence).padStart(6, "0")}`;
}

export function readStorageValue(key: string, fallback: string) {
  if (typeof window === "undefined") return fallback;
  return window.localStorage.getItem(key) ?? fallback;
}

export function writeStorageValue(key: string, value: string) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(key, value);
}

export function getUserScopedStorageKey(userId: string, key: string) {
  return `${key}:${userId}`;
}

export function readUserStorageValue(
  userId: string | undefined | null,
  key: string,
  fallback: string,
) {
  if (!userId) return fallback;
  return readStorageValue(getUserScopedStorageKey(userId, key), fallback);
}

export function writeUserStorageValue(
  userId: string | undefined | null,
  key: string,
  value: string,
) {
  if (!userId) return;
  writeStorageValue(getUserScopedStorageKey(userId, key), value);
}
