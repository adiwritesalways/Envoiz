/**
 * demo-data.ts
 *
 * Realistic sample data used when running in demo / unauthenticated mode.
 * This data is purely local and is NOT persisted to any server.
 * All amounts are fictional.
 */

export type InvoiceRecord = {
  id: string;
  number: string;
  clientName: string;
  clientEmail: string;
  items: { product: string; quantity: number; unitPrice: number }[];
  total: number;
  createdAt: string;
  dueDate: string;
  status: "Draft" | "Pending" | "Paid" | "Overdue";
  currency: string;
  taxRate?: number;
};

// ---------- invoices -------------------------------------------------------

export const DEMO_INVOICES: InvoiceRecord[] = [
  {
    id: "demo-001",
    number: "INV-001",
    clientName: "Alder Studio",
    clientEmail: "billing@alderstudio.com",
    items: [
      { product: "Brand identity refresh", quantity: 1, unitPrice: 1800 },
      { product: "Identity handover package", quantity: 1, unitPrice: 600 },
    ],
    total: 2400,
    createdAt: "2025-03-12T00:00:00Z",
    dueDate: "2025-03-26T00:00:00Z",
    status: "Paid",
    currency: "GBP",
  },
  {
    id: "demo-002",
    number: "INV-002",
    clientName: "Nova Studio",
    clientEmail: "hello@novastudio.io",
    items: [
      { product: "Brand strategy workshop", quantity: 2, unitPrice: 900 },
      { product: "Art direction — 4 days", quantity: 4, unitPrice: 650 },
    ],
    total: 4400,
    createdAt: "2025-04-03T00:00:00Z",
    dueDate: "2025-04-17T00:00:00Z",
    status: "Paid",
    currency: "USD",
  },
  {
    id: "demo-003",
    number: "INV-003",
    clientName: "Bloom Agency",
    clientEmail: "accounts@bloomagency.co",
    items: [{ product: "Motion design — reel", quantity: 1, unitPrice: 3200 }],
    total: 3200,
    createdAt: "2025-05-08T00:00:00Z",
    dueDate: "2025-05-22T00:00:00Z",
    status: "Pending",
    currency: "EUR",
  },
  {
    id: "demo-004",
    number: "INV-004",
    clientName: "Craft House",
    clientEmail: "finance@crafthouse.design",
    items: [
      { product: "UX audit", quantity: 1, unitPrice: 1400 },
      { product: "Design system tokens", quantity: 1, unitPrice: 800 },
    ],
    total: 2200,
    createdAt: "2025-05-20T00:00:00Z",
    dueDate: "2025-06-03T00:00:00Z",
    status: "Overdue",
    currency: "USD",
  },
  {
    id: "demo-005",
    number: "INV-005",
    clientName: "Meridian Labs",
    clientEmail: "billing@meridianlabs.dev",
    items: [{ product: "Product strategy consultation", quantity: 3, unitPrice: 1100 }],
    total: 3300,
    createdAt: "2025-06-10T00:00:00Z",
    dueDate: "2025-06-24T00:00:00Z",
    status: "Pending",
    currency: "USD",
  },
  {
    id: "demo-006",
    number: "INV-006",
    clientName: "Alder Studio",
    clientEmail: "billing@alderstudio.com",
    items: [{ product: "Campaign visual direction", quantity: 5, unitPrice: 420 }],
    total: 2100,
    createdAt: "2025-07-01T00:00:00Z",
    dueDate: "2025-07-15T00:00:00Z",
    status: "Paid",
    currency: "GBP",
  },
  {
    id: "demo-007",
    number: "INV-007",
    clientName: "Halo Creative",
    clientEmail: "finance@halocreative.com",
    items: [
      { product: "Web design — 8 pages", quantity: 1, unitPrice: 4800 },
      { product: "Copywriting support", quantity: 1, unitPrice: 600 },
    ],
    total: 5400,
    createdAt: "2025-07-18T00:00:00Z",
    dueDate: "2025-08-01T00:00:00Z",
    status: "Pending",
    currency: "USD",
  },
  {
    id: "demo-008",
    number: "INV-008",
    clientName: "Nova Studio",
    clientEmail: "hello@novastudio.io",
    items: [{ product: "Logo animation pack", quantity: 1, unitPrice: 1200 }],
    total: 1200,
    createdAt: "2025-08-05T00:00:00Z",
    dueDate: "2025-08-19T00:00:00Z",
    status: "Draft",
    currency: "USD",
  },
];

// ---------- payments (subscription history) --------------------------------

export type DemoPayment = {
  id: string;
  date: string;
  gateway: string;
  amount: number;
  currency: string;
  status: "completed" | "pending" | "failed";
  transactionId: string;
  description: string;
};

export const DEMO_PAYMENTS: DemoPayment[] = [
  {
    id: "pay-001",
    date: "2025-03-15T10:23:00Z",
    gateway: "Stripe",
    amount: 7.0,
    currency: "USD",
    status: "completed",
    transactionId: "txn_3PkA8xHJcMmBvL2X0001",
    description: "Envoiz Pro — March 2025",
  },
  {
    id: "pay-002",
    date: "2025-04-15T10:31:00Z",
    gateway: "Stripe",
    amount: 7.0,
    currency: "USD",
    status: "completed",
    transactionId: "txn_3PkA8xHJcMmBvL2X0002",
    description: "Envoiz Pro — April 2025",
  },
  {
    id: "pay-003",
    date: "2025-05-15T09:58:00Z",
    gateway: "Stripe",
    amount: 7.0,
    currency: "USD",
    status: "completed",
    transactionId: "txn_3PkA8xHJcMmBvL2X0003",
    description: "Envoiz Pro — May 2025",
  },
  {
    id: "pay-004",
    date: "2025-06-15T10:07:00Z",
    gateway: "Stripe",
    amount: 7.0,
    currency: "USD",
    status: "failed",
    transactionId: "txn_3PkA8xHJcMmBvL2X0004",
    description: "Envoiz Pro — June 2025 (card declined)",
  },
  {
    id: "pay-005",
    date: "2025-06-16T14:12:00Z",
    gateway: "Stripe",
    amount: 7.0,
    currency: "USD",
    status: "completed",
    transactionId: "txn_3PkA8xHJcMmBvL2X0005",
    description: "Envoiz Pro — June 2025 (retry)",
  },
];

// ---------- revenue report data --------------------------------------------

export type MonthlyRevenue = { month: string; paid: number; outstanding: number };

export const DEMO_MONTHLY_REVENUE: MonthlyRevenue[] = [
  { month: "Jan", paid: 0, outstanding: 0 },
  { month: "Feb", paid: 0, outstanding: 0 },
  { month: "Mar", paid: 2400, outstanding: 0 },
  { month: "Apr", paid: 4400, outstanding: 0 },
  { month: "May", paid: 0, outstanding: 5400 },
  { month: "Jun", paid: 2100, outstanding: 3300 },
  { month: "Jul", paid: 2100, outstanding: 5400 },
  { month: "Aug", paid: 0, outstanding: 1200 },
];

// ---------- fake demo "user" -----------------------------------------------

export const DEMO_USER_META = {
  full_name: "Alex Meridian",
  company_name: "Meridian Studio",
  email: "alex@meridianstudio.com",
  default_currency: "USD",
  is_pro: true,
  pro_since: "2025-03-01T00:00:00Z",
};
