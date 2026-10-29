import "./InvoiceTemplate.css";

export interface InvoiceTemplateLineItem {
  description: string;
  qty: string;
  price: string;
  subtotal: string;
}

export interface InvoiceTemplateData {
  invoiceNumber: string;
  issueDate: string;
  dueDate: string;
  companyName: string;
  companyAddressLines: string[];
  billTo: {
    name: string;
    address: string;
    phone: string;
  };
  paymentMethod: {
    bankName: string;
    accountName: string;
    phone: string;
  };
  items: InvoiceTemplateLineItem[];
  emptyRowCount?: number;
  taxLabel?: string;
  tax: string;
  grandTotal: string;
  notes: string;
  contactEmail: string;
  contactPhone: string;
  signerName: string;
  signerTitle: string;
  brandLogo?: string;
}

const defaultInvoice: InvoiceTemplateData = {
  invoiceNumber: "#1234",
  issueDate: "AUGUST 12, 2030",
  dueDate: "SEPTEMBER 12, 2030",
  companyName: "LICERIA & CO.",
  companyAddressLines: ["123 ANYWHERE ST.,", "ANY CITY", "+123-456-7890"],
  billTo: {
    name: "OLIVIA WILSON",
    address: "123 Anywhere st., Any City",
    phone: "+123-456-7890",
  },
  paymentMethod: {
    bankName: "Borcelle Bank",
    accountName: "AVERY DAVIS",
    phone: "+123-456-7890",
  },
  items: [
    { description: "LOGO DESIGN", qty: "05", price: "$200", subtotal: "$1000" },
    { description: "PACKAGING DESIGN", qty: "04", price: "$300", subtotal: "$1200" },
    { description: "POSTER DESIGN", qty: "10", price: "$150", subtotal: "$1500" },
    { description: "BROCHURE", qty: "10", price: "$150", subtotal: "$1500" },
  ],
  emptyRowCount: 4,
  taxLabel: "TAX",
  tax: "$340",
  grandTotal: "$4860",
  notes:
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Praesent placerat vel sapien a ornare. Morbi faucibus nunc diam, in sodales nunc rutrum et. Aenean quis risus blandit, finibus lorem vitae, tincidunt purus.",
  contactEmail: "",
  contactPhone: "",
  signerName: "OLIVIA WILSON",
  signerTitle: "GENERAL MANAGER",
};

export interface InvoiceTemplateProps {
  data?: Partial<InvoiceTemplateData> & {
    billTo?: Partial<InvoiceTemplateData["billTo"]>;
    paymentMethod?: Partial<InvoiceTemplateData["paymentMethod"]>;
  };
  exportMode?: boolean;
}

export default function InvoiceTemplate({ data = {}, exportMode = false }: InvoiceTemplateProps) {
  const invoice: InvoiceTemplateData = {
    ...defaultInvoice,
    ...data,
    billTo: { ...defaultInvoice.billTo, ...data.billTo },
    paymentMethod: { ...defaultInvoice.paymentMethod, ...data.paymentMethod },
    items: data.items?.length ? data.items : defaultInvoice.items,
  };
  const emptyRows = Array.from({ length: invoice.emptyRowCount ?? 4 });
  const companyDisplay = invoice.companyName.replace(/\s*&\s*/, "\n& ");
  const contactEmail = invoice.contactEmail;

  return (
    <div className={exportMode ? "invoice-page invoice-page--export" : "invoice-page"}>
      <div className="invoice-header">
        <h1 className="invoice-title company-name-override">{companyDisplay}</h1>
        <div className="company-logo-container">
          {invoice.brandLogo ? (
            <img src={invoice.brandLogo} alt="Logo" className="invoice-logo" />
          ) : (
            <div className="logo-placeholder">LOGO</div>
          )}
        </div>
      </div>

      <div className="invoice-meta">
        <div className="invoice-meta-left">
          <p>
            <span>INVOICE NUMBER:</span> {invoice.invoiceNumber}
          </p>
          <p>
            <span>DATE:</span> {invoice.issueDate}
          </p>
          <p>
            <span>DUE DATE:</span> {invoice.dueDate}
          </p>
        </div>
        <div className="invoice-meta-right">
          {invoice.companyAddressLines.map((line, index) => (
            <p key={`${line}-${index}`}>{line}</p>
          ))}
        </div>
      </div>

      <div className="invoice-parties">
        <div className="bill-to">
          <h3>Bill To:</h3>
          <p className="name">{invoice.billTo.name}</p>
          <p>{invoice.billTo.address}</p>
          <p>{invoice.billTo.phone}</p>
        </div>
        <div className="payment-method">
          <h3>Payment Method</h3>
          <p>{invoice.paymentMethod.bankName}</p>
          <p className="name">{invoice.paymentMethod.accountName}</p>
          <p>{invoice.paymentMethod.phone}</p>
        </div>
      </div>

      <table className="invoice-table">
        <thead>
          <tr>
            <th className="col-description">DESCRIPTION</th>
            <th className="col-qty">QTY</th>
            <th className="col-price">PRICE</th>
            <th className="col-subtotal">SUBTOTAL</th>
          </tr>
        </thead>
        <tbody>
          {invoice.items.map((item, index) => (
            <tr key={`${item.description}-${index}`}>
              <td className="col-description">{item.description}</td>
              <td className="col-qty">{item.qty}</td>
              <td className="col-price">{item.price}</td>
              <td className="col-subtotal">{item.subtotal}</td>
            </tr>
          ))}
          {emptyRows.map((_, index) => (
            <tr key={`empty-${index}`} className="empty-row">
              <td className="col-description">&nbsp;</td>
              <td className="col-qty">&nbsp;</td>
              <td className="col-price">&nbsp;</td>
              <td className="col-subtotal">&nbsp;</td>
            </tr>
          ))}
          <tr className="summary-row">
            <td colSpan={2} className="no-border" />
            <td className="summary-label">{invoice.taxLabel ?? "TAX"}</td>
            <td className="summary-value">{invoice.tax}</td>
          </tr>
          <tr className="summary-row">
            <td colSpan={2} className="no-border" />
            <td className="summary-label total-label">GRAND TOTAL</td>
            <td className="summary-value total-value">{invoice.grandTotal}</td>
          </tr>
        </tbody>
      </table>

      <div className="invoice-footer">
        <div className="terms">
          <p className="notes-text">{invoice.notes}</p>
          <div className="contact">
            <p>
              FOR ANY QUESTIONS, PLEASE CONTACT
              <br />
              {contactEmail}
              {invoice.contactPhone ? (
                <>
                  <br />
                  OR {invoice.contactPhone}.
                </>
              ) : null}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
