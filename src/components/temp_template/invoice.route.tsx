// Example usage with TanStack Router (file-based routing)
// Place this file at: src/routes/invoice.tsx
// (adjust the import path to wherever you put InvoiceTemplate.tsx / .css)

import { createFileRoute } from "@tanstack/react-router";
import InvoiceTemplate from "../InvoiceTemplate";

export const Route = createFileRoute("/invoice")({
  component: InvoicePage,
});

function InvoicePage() {
  // Pass no props to use the default sample data from the template,
  // or pass `data={{ ... }}` to override any field(s).
  return <InvoiceTemplate />;
}
