import React from "react";
import "./InvoiceTemplate2.css";
import type { InvoiceTemplateProps } from "./InvoiceTemplate";

export default function InvoiceTemplate2({ data = {}, exportMode = false }: InvoiceTemplateProps) {
  const currency = (data as any).currency || "USD";
  const money = (n: number | string) => {
    const num = typeof n === 'string' ? parseFloat(n.replace(/[^0-9.-]+/g,"")) : n;
    if (isNaN(num)) return typeof n === 'string' ? n : `$0.00`;
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency,
    }).format(num);
  };
  const studioName = data.companyName || "Studio";
  const invoiceDate = data.issueDate || "15th July 2024";
  const dueDate = data.dueDate || "N/A";
  const paymentStatus = (data as any).paymentStatus || "";
  const clientName = data.billTo?.name || "[Client Name]";
  const clientEmail = data.contactEmail || "";
  const invoiceNumber = data.invoiceNumber || "001";

  const items = data.items?.length ? data.items.map(item => ({
    name: item.description,
    subItems: [],
    quantity: parseInt(item.qty, 10) || 1,
    unitPrice: parseFloat(item.price.replace(/[^0-9.-]+/g,"")) || 0,
    subtotal: parseFloat(item.subtotal.replace(/[^0-9.-]+/g,"")) || 0,
  })) : [
    {
      name: "Project Item #1",
      subItems: ["Sub Item 1", "Sub Item 2"],
      quantity: 1,
      unitPrice: 500.0,
      subtotal: 500.0,
    },
    {
      name: "Project Item #2",
      subItems: ["Sub Item 1", "Sub Item 2"],
      quantity: 1,
      unitPrice: 500.0,
      subtotal: 500.0,
    },
  ];

  const subtotal = items.reduce((acc, item) => acc + item.subtotal, 0);
  const taxes = parseFloat((data.tax || "0").replace(/[^0-9.-]+/g,"")) || 0;
  const total = data.grandTotal ? parseFloat(data.grandTotal.replace(/[^0-9.-]+/g,"")) : (subtotal + taxes);

  const payment = {
    bankLabel: data.paymentMethod?.bankName || "Bank Transfer",
    bankDetails: data.paymentMethod?.accountName || "Your Bank Details",
    paypalLabel: "Phone",
    paypalDetails: data.paymentMethod?.phone || data.contactPhone || "Your Phone Number",
  };

  const notes = data.notes || "";

  return (
    <div className={`invoice-template-2-root ${exportMode ? 'invoice-page--export' : ''}`}>
      {/* Header */}
      <h1 className="invoice-title">{studioName}</h1>
      <hr className="invoice-rule" />
      <div className="invoice-meta-row">
        <span>{invoiceDate}</span>
        <div className="invoice-meta-right">
          <span>Due Date: {dueDate}</span>
          {paymentStatus && <span className="invoice-payment-status">{paymentStatus}</span>}
        </div>
      </div>
      <div className="invoice-client">
        <div className="invoice-client-name">{clientName}</div>
        {clientEmail && <div className="invoice-client-email">{clientEmail}</div>}
      </div>

      {/* Services */}
      <h2 className="invoice-section-title">Services</h2>

      <div className="items-header">
        <span>&nbsp;</span>
        <span>Quantity</span>
        <span>Unit Price</span>
        <span>Subtotal</span>
      </div>

      {items.map((item, i) => (
        <div className="item-row" key={i}>
          <div>
            <div className="item-name">{item.name}</div>
            {item.subItems.map((s, j) => (
              <div className="item-subs" key={j}>
                {s}
              </div>
            ))}
          </div>
          <div className="item-qty">{item.quantity}</div>
          <div className="item-unit">{money(item.unitPrice)}</div>
          <div className="item-sub">{money(item.subtotal)}</div>
        </div>
      ))}

      <div className="summary">
        <div className="summary-table">
          <div className="summary-line">
            <span>Subtotal</span>
            <span>{money(subtotal)}</span>
          </div>
          <div className="summary-line">
            <span>{data.taxLabel || "Taxes"}</span>
            <span>{money(taxes)}</span>
          </div>
          <div className="summary-line summary-line--total">
            <span>Total Price</span>
            <span>{money(total)}</span>
          </div>
        </div>
      </div>

      {/* Invoice number */}
      <div className="invoice-number">{invoiceNumber.startsWith('#') ? invoiceNumber : `#${invoiceNumber}`}</div>
      <div className="footer-rule" />

      {/* Payment + Notes */}
      <div className="footer-grid">
        <div className="payment-block">
          <p className="footer-heading">Payment</p>
          <div className="payment-line">
            <p className="payment-value">{payment.bankLabel}</p>
            <p className="payment-value">{payment.bankDetails}</p>
          </div>
          <div className="payment-line">
            <p className="payment-value">{payment.paypalLabel}</p>
            <p className="payment-value">{payment.paypalDetails}</p>
          </div>
        </div>

        {notes && (
          <div className="notes-block">
            <p className="footer-heading">Notes to Customer</p>
            <p className="notes-body">{notes}</p>
          </div>
        )}
      </div>
    </div>
  );
}
