export const brandName = "Envoiz";
export const slogan = "Smart Invoicing for Freelancers and Businesses";

export const faviconUrl = new URL("../../Envoiz site icon.png", import.meta.url).href;
export const logoUrl = new URL("../../Envoiz lp icon.png", import.meta.url).href;

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

export const sampleInvoices = [
  {
    id: "ENV-000128",
    customer: "Northstar Labs",
    amount: "$4,820",
    status: "Paid",
    date: "Jun 26, 2026",
  },
  {
    id: "ENV-000127",
    customer: "Acme Studio",
    amount: "$1,240",
    status: "Pending",
    date: "Jun 26, 2026",
  },
  {
    id: "ENV-000126",
    customer: "Vertex Agency",
    amount: "$8,410",
    status: "Paid",
    date: "Jun 25, 2026",
  },
  {
    id: "ENV-000125",
    customer: "Pulse Commerce",
    amount: "$2,150",
    status: "Pending",
    date: "Jun 24, 2026",
  },
] as const;

export const sampleCustomers = [
  { name: "Northstar Labs", email: "billing@northstarlabs.com" },
  { name: "Acme Studio", email: "finance@acmestudio.com" },
  { name: "Vertex Agency", email: "hello@vertex.agency" },
  { name: "Pulse Commerce", email: "accounts@pulsecommerce.co" },
] as const;

export const sampleRecentDeliveries = [
  { event: "invoice.paid", target: "webhook /payments", status: "Delivered", time: "2m ago" },
  { event: "invoice.created", target: "webhook /billing", status: "Delivered", time: "12m ago" },
  { event: "customer.created", target: "webhook /crm", status: "Retrying", time: "31m ago" },
] as const;

export const dashboardMetrics = [
  { label: "Total invoices", value: "1,284", delta: "+12.4%" },
  { label: "Paid invoices", value: "1,108", delta: "+9.2%" },
  { label: "Pending invoices", value: "176", delta: "-2.1%" },
  { label: "Total revenue", value: "$48,290", delta: "+18.7%" },
] as const;

export function formatInvoiceNumber(sequence: number) {
  return `ENV-${String(sequence).padStart(6, "0")}`;
}

export const settingsStorageKeys = {
  companyName: "envoiz_company_name",
  companyAddress: "envoiz_company_address",
  email: "envoiz_profile_email",
  defaultCurrency: "envoiz_default_currency",
} as const;

export function readStorageValue(key: string, fallback: string) {
  if (typeof window === "undefined") return fallback;
  return window.localStorage.getItem(key) ?? fallback;
}

export function writeStorageValue(key: string, value: string) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(key, value);
}

/**
 * html2canvas can't parse modern CSS color functions (oklch(), color-mix()),
 * which this app's theme relies on for every border/background color via
 * `* { border-color: var(--color-border) }` and similar rules. Without this
 * fallback, html2canvas throws while reading computed styles and the invoice
 * capture fails silently. Pass this as the `onclone` option to html2canvas to
 * swap in plain rgb/hex equivalents inside the cloned document just for the
 * capture, preserving the same look.
 */
export function applyExportColorFallbacks(clonedDoc: Document) {
  const style = clonedDoc.createElement("style");
  style.textContent = `
    :root {
      --background: #ffffff;
      --surface: #f9f9f9;
      --foreground: #000000;
      --card: #ffffff;
      --card-foreground: #000000;
      --popover: #ffffff;
      --popover-foreground: #000000;
      --primary: #000000;
      --primary-foreground: #ffffff;
      --secondary: #f5f5f5;
      --secondary-foreground: #000000;
      --muted: #f5f5f5;
      --muted-foreground: #737373;
      --accent: #f5f5f5;
      --accent-foreground: #000000;
      --destructive: #dc2626;
      --destructive-foreground: #ffffff;
      --border: rgba(0, 0, 0, 0.08);
      --hairline: rgba(0, 0, 0, 0.06);
      --input: rgba(0, 0, 0, 0.1);
      --ring: rgba(0, 0, 0, 0.2);
    }
  `;
  clonedDoc.head.appendChild(style);
}
