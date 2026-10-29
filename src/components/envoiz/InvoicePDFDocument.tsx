import { Document, Page, View, Text, StyleSheet, Image, Font } from "@react-pdf/renderer";

// Legacy font registration kept for older generated previews.
Font.register({
  family: "Inter",
  fonts: [
    {
      src: "https://fonts.gstatic.com/s/inter/v20/UcCO3FwrK3iLTeHuS_nVMrMxCp50SjIw2boKoduKmMEVuLyfMZg.ttf",
      fontWeight: 400,
    },
    {
      src: "https://fonts.gstatic.com/s/inter/v20/UcCO3FwrK3iLTeHuS_nVMrMxCp50SjIw2boKoduKmMEVuI6fMZg.ttf",
      fontWeight: 500,
    },
    {
      src: "https://fonts.gstatic.com/s/inter/v20/UcCO3FwrK3iLTeHuS_nVMrMxCp50SjIw2boKoduKmMEVuFuYMZg.ttf",
      fontWeight: 700,
    },
    {
      src: "https://fonts.gstatic.com/s/inter/v20/UcCO3FwrK3iLTeHuS_nVMrMxCp50SjIw2boKoduKmMEVuBWYMZg.ttf",
      fontWeight: 900,
    },
  ],
});

const money = (value: number, currency: string) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency, maximumFractionDigits: 2 }).format(
    value || 0,
  );

const formatDateLabel = (value: string | null | undefined) => {
  if (!value) return "—";
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
};

const getStatusPillStyle = (status: string | undefined) => {
  switch (status) {
    case "Paid":
      return styles.statusPillPaid;
    case "Overdue":
      return styles.statusPillOverdue;
    case "Pending":
    default:
      return styles.statusPillPending;
  }
};

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: "Helvetica",
    fontSize: 10,
    color: "#000000",
    backgroundColor: "#ffffff",
  },
  logoImage: {
    width: 80,
    maxHeight: 40,
    objectFit: "contain",
    marginBottom: 8,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderBottom: "1pt solid #efefef",
    paddingBottom: 24,
    marginBottom: 24,
  },
  companyBox: {
    maxWidth: 240,
  },
  brandName: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 8,
  },
  brandAddress: {
    fontSize: 10,
    color: "#737373",
    lineHeight: 1.4,
  },
  invoiceMetaBox: {
    alignItems: "flex-end",
  },
  invoiceLabelTop: {
    fontSize: 8.5,
    textTransform: "uppercase",
    color: "#737373",
    letterSpacing: 1.5,
  },
  invoiceNumberPill: {
    marginTop: 8,
    border: "1pt solid #efefef",
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    fontSize: 10,
    fontWeight: "bold",
  },
  issueDateRow: {
    marginTop: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
  },
  issueDateLine: {
    fontSize: 9,
    color: "#737373",
    marginRight: 8,
  },
  statusPill: {
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 3,
    fontSize: 8.5,
    fontWeight: "bold",
  },
  statusPillPaid: {
    backgroundColor: "#dcfce7",
    color: "#15803d",
  },
  statusPillPending: {
    backgroundColor: "#f1f1f1",
    color: "#525252",
  },
  statusPillOverdue: {
    backgroundColor: "#fee2e2",
    color: "#b91c1c",
  },
  gridBox: {
    borderRadius: 16,
    border: "1pt solid #efefef",
    marginBottom: 24,
  },
  gridRow: {
    flexDirection: "row",
  },
  gridColLeft: {
    padding: 20,
    borderRight: "1pt solid #efefef",
    flex: 1,
  },
  gridColRight: {
    padding: 20,
    flex: 1,
  },
  gridHeader: {
    fontSize: 8.5,
    textTransform: "uppercase",
    color: "#737373",
    letterSpacing: 1.5,
  },
  gridValue: {
    marginTop: 8,
    fontSize: 11,
    fontWeight: "bold",
  },
  gridSubValue: {
    marginTop: 4,
    fontSize: 10,
    color: "#737373",
  },
  addressRow: {
    borderTop: "1pt solid #efefef",
    padding: 20,
  },
  addressValue: {
    marginTop: 8,
    fontSize: 10,
    color: "#737373",
    lineHeight: 1.4,
  },
  itemsBox: {
    borderRadius: 16,
    border: "1pt solid #efefef",
    marginBottom: 24,
  },
  itemsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#f9f9f9",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  itemsHeaderLabel: {
    fontSize: 8,
    textTransform: "uppercase",
    color: "#737373",
    letterSpacing: 1,
    fontWeight: "bold",
  },
  itemRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTop: "1pt solid #efefef",
  },
  itemName: {
    fontSize: 10,
    fontWeight: "bold",
  },
  itemMeta: {
    marginTop: 4,
    fontSize: 9,
    color: "#737373",
  },
  itemAmount: {
    fontSize: 10,
    fontWeight: "bold",
  },
  totalsContainer: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginBottom: 24,
  },
  totalsBox: {
    width: 220,
  },
  totalLine: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
    paddingHorizontal: 4,
  },
  totalLabel: {
    fontSize: 10,
    color: "#737373",
  },
  totalVal: {
    fontSize: 10,
    fontWeight: "bold",
  },
  grandTotalLine: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderTop: "1pt solid #efefef",
    paddingTop: 12,
    paddingHorizontal: 4,
    marginTop: 2,
    alignItems: "baseline",
  },
  grandTotalLabel: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#737373",
  },
  grandTotalVal: {
    fontSize: 16,
    fontWeight: "bold",
  },
  notesBox: {
    borderTop: "1pt solid #efefef",
    paddingTop: 24,
  },
  notesHeader: {
    fontSize: 8.5,
    textTransform: "uppercase",
    color: "#737373",
    letterSpacing: 1.5,
  },
  notesText: {
    marginTop: 8,
    fontSize: 10,
    color: "#737373",
    lineHeight: 1.4,
  },
  watermark: {
    marginTop: 48,
    flexDirection: "row",
    justifyContent: "center",
  },
  watermarkText: {
    fontSize: 8.5,
    color: "#a3a3a3",
    textTransform: "uppercase",
    letterSpacing: 1.5,
  },
  watermarkBold: {
    color: "#737373",
    fontWeight: "bold",
  },
});

export type InvoiceData = {
  companyName: string;
  companyAddress: string;
  clientName: string;
  clientEmail: string;
  billingAddress: string;
  invoiceNumber: string;
  issueDate: string;
  dueDate: string;
  paymentStatus: string;
  items: Array<{
    product?: string;
    quantity: number;
    unitPrice: number;
  }>;
  subtotal: number;
  discount: number;
  grandTotal: number;
  currency: string;
  notes: string;
  taxRate?: number;
  isPro?: boolean;
  brandLogo?: string;
  invoiceTemplate?: string;
  paymentInstructions?: string;
  contactEmail?: string;
  contactPhone?: string;
};

const t1Styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: "Courier",
    fontSize: 10,
    color: "#1f1710",
    backgroundColor: "#efe7d8",
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 34,
  },
  title: {
    fontSize: 58,
    lineHeight: 0.92,
    fontFamily: "Helvetica-Bold",
    color: "#d11f35",
    letterSpacing: -1.2,
  },
  companyWrap: {
    alignItems: "flex-end",
    maxWidth: 155,
  },
  companyName: {
    fontSize: 24,
    lineHeight: 1.02,
    fontFamily: "Helvetica-Bold",
    color: "#d11f35",
    textAlign: "right",
    letterSpacing: -0.5,
  },
  logoImage: {
    width: 64,
    height: 64,
    alignSelf: "flex-end",
  },
  logoPlaceholder: {
    width: 64,
    height: 64,
    backgroundColor: "rgba(54, 48, 42, 0.1)",
    justifyContent: "center",
    alignItems: "center",
  },
  logoPlaceholderText: {
    color: "rgba(54, 48, 42, 0.4)",
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    letterSpacing: 1.5,
  },
  metaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 46,
  },
  metaBlock: {
    gap: 2,
  },
  metaText: {
    fontSize: 10.5,
    lineHeight: 1.4,
  },
  metaLabel: {
    fontFamily: "Helvetica-Bold",
  },
  addressLines: {
    textAlign: "right",
    fontSize: 10.5,
    lineHeight: 1.35,
    color: "#1f1710",
    width: 155,
  },
  partiesRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 28,
  },
  partyBlock: {
    maxWidth: 220,
  },
  partyHeading: {
    fontSize: 15,
    fontFamily: "Helvetica-Bold",
    marginBottom: 10,
  },
  partyText: {
    fontSize: 10.5,
    lineHeight: 1.45,
  },
  partyName: {
    fontFamily: "Helvetica-Bold",
    textTransform: "uppercase",
  },
  table: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#64605a",
    marginBottom: 34,
  },
  tableHeader: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#64605a",
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#b9b0a4",
  },
  cell: {
    paddingVertical: 11,
    paddingHorizontal: 16,
    fontSize: 10,
  },
  headerCell: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    fontSize: 10.5,
    fontFamily: "Helvetica-Bold",
    letterSpacing: 2,
  },
  colDesc: { flex: 4.4 },
  colQty: { flex: 1, textAlign: "center" },
  colPrice: { flex: 1.3, textAlign: "right" },
  colSub: { flex: 1.4, textAlign: "right" },
  emptyRow: {
    minHeight: 28,
  },
  summaryRow: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderTopColor: "#64605a",
  },
  summaryCell: {
    paddingVertical: 11,
    paddingHorizontal: 16,
    fontSize: 10,
  },
  summaryLabel: {
    flex: 1,
    textAlign: "right",
    fontFamily: "Helvetica-Bold",
    letterSpacing: 1.8,
  },
  summaryValue: {
    width: 120,
    textAlign: "right",
    fontFamily: "Helvetica-Bold",
    letterSpacing: 0.8,
  },
  footer: {
    marginTop: 18,
  },
  termsText: {
    fontSize: 8.6,
    lineHeight: 1.5,
    color: "#3b352e",
  },
  contact: {
    marginTop: 18,
  },
  contactText: {
    fontSize: 8.8,
    lineHeight: 1.5,
  },
});

const formatUpperDate = (value: string | null | undefined) => {
  if (!value) return "—";
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return value.toUpperCase();
  return date
    .toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })
    .toUpperCase();
};

const splitLines = (value: string | null | undefined) =>
  (value || "")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

const Template1Document = ({ invoice }: { invoice: InvoiceData }) => {
  const companyAddressLines = splitLines(invoice.companyAddress);
  const paymentLines = splitLines(invoice.paymentInstructions);
  const companyDisplay = invoice.companyName.replace(/\s*&\s*/, "\n& ");
  const emptyRows = Array.from({ length: Math.max(0, 4 - invoice.items.length) });
  const taxValue =
    (invoice.subtotal - Math.min(invoice.discount, invoice.subtotal)) *
    ((invoice.taxRate ?? 0) / 100);
  const discountValue = money(invoice.discount, invoice.currency);

  return (
    <Document>
      <Page size="A4" style={t1Styles.page}>
        <View style={t1Styles.headerRow}>
          <Text style={[t1Styles.title, { fontSize: 24 }]}>
            {invoice.companyName.toUpperCase()}
          </Text>
          <View>
            {invoice.brandLogo ? (
              <Image src={invoice.brandLogo} style={t1Styles.logoImage} />
            ) : (
              <View style={t1Styles.logoPlaceholder}>
                <Text style={t1Styles.logoPlaceholderText}>LOGO</Text>
              </View>
            )}
          </View>
        </View>

        <View style={t1Styles.metaRow}>
          <View style={t1Styles.metaBlock}>
            <Text style={t1Styles.metaText}>
              <Text style={t1Styles.metaLabel}>INVOICE NUMBER:</Text> {invoice.invoiceNumber}
            </Text>
            <Text style={t1Styles.metaText}>
              <Text style={t1Styles.metaLabel}>DATE:</Text> {formatUpperDate(invoice.issueDate)}
            </Text>
            <Text style={t1Styles.metaText}>
              <Text style={t1Styles.metaLabel}>DUE DATE:</Text> {formatUpperDate(invoice.dueDate)}
            </Text>
          </View>
          <View style={t1Styles.addressLines}>
            {companyAddressLines.map((line, index) => (
              <Text key={`${line}-${index}`}>{line}</Text>
            ))}
          </View>
        </View>

        <View style={t1Styles.partiesRow}>
          <View style={t1Styles.partyBlock}>
            <Text style={t1Styles.partyHeading}>Bill To:</Text>
            <Text style={[t1Styles.partyText, t1Styles.partyName]}>{invoice.clientName}</Text>
            {invoice.billingAddress ? (
              <Text style={t1Styles.partyText}>{invoice.billingAddress}</Text>
            ) : null}
            {invoice.clientEmail ? (
              <Text style={t1Styles.partyText}>{invoice.clientEmail}</Text>
            ) : null}
          </View>
          <View style={[t1Styles.partyBlock, { alignItems: "flex-end" }]}>
            <Text style={t1Styles.partyHeading}>Payment Method</Text>
            {paymentLines.length > 0 ? (
              paymentLines.map((line, index) => (
                <Text key={`${line}-${index}`} style={t1Styles.partyText}>
                  {line}
                </Text>
              ))
            ) : (
              <Text style={t1Styles.partyText}>{invoice.paymentInstructions}</Text>
            )}
          </View>
        </View>

        <View style={t1Styles.table}>
          <View style={t1Styles.tableHeader}>
            <Text style={[t1Styles.headerCell, t1Styles.colDesc]}>DESCRIPTION</Text>
            <Text style={[t1Styles.headerCell, t1Styles.colQty]}>QTY</Text>
            <Text style={[t1Styles.headerCell, t1Styles.colPrice]}>PRICE</Text>
            <Text style={[t1Styles.headerCell, t1Styles.colSub]}>SUBTOTAL</Text>
          </View>
          {invoice.items.map((item, index) => (
            <View key={`${item.product || "item"}-${index}`} style={t1Styles.tableRow}>
              <Text style={[t1Styles.cell, t1Styles.colDesc]}>{item.product || "Item"}</Text>
              <Text style={[t1Styles.cell, t1Styles.colQty]}>
                {String(item.quantity).padStart(2, "0")}
              </Text>
              <Text style={[t1Styles.cell, t1Styles.colPrice]}>
                {money(item.unitPrice, invoice.currency)}
              </Text>
              <Text style={[t1Styles.cell, t1Styles.colSub]}>
                {money(item.quantity * item.unitPrice, invoice.currency)}
              </Text>
            </View>
          ))}
          {emptyRows.map((_, index) => (
            <View key={`empty-${index}`} style={t1Styles.tableRow}>
              <Text style={[t1Styles.cell, t1Styles.colDesc]}>&nbsp;</Text>
              <Text style={[t1Styles.cell, t1Styles.colQty]}>&nbsp;</Text>
              <Text style={[t1Styles.cell, t1Styles.colPrice]}>&nbsp;</Text>
              <Text style={[t1Styles.cell, t1Styles.colSub]}>&nbsp;</Text>
            </View>
          ))}
          <View style={t1Styles.summaryRow}>
            <Text style={[t1Styles.summaryCell, { flex: 1 }]} />
            <Text style={[t1Styles.summaryCell, t1Styles.summaryLabel]}>DISCOUNT</Text>
            <Text style={[t1Styles.summaryCell, t1Styles.summaryValue]}>-{discountValue}</Text>
          </View>
          <View style={t1Styles.summaryRow}>
            <Text style={[t1Styles.summaryCell, { flex: 1 }]} />
            <Text style={[t1Styles.summaryCell, t1Styles.summaryLabel]}>TAX</Text>
            <Text style={[t1Styles.summaryCell, t1Styles.summaryValue]}>
              {money(taxValue, invoice.currency)}
            </Text>
          </View>
          <View style={t1Styles.summaryRow}>
            <Text style={[t1Styles.summaryCell, { flex: 1 }]} />
            <Text style={[t1Styles.summaryCell, t1Styles.summaryLabel]}>GRAND TOTAL</Text>
            <Text style={[t1Styles.summaryCell, t1Styles.summaryValue]}>
              {money(invoice.grandTotal, invoice.currency)}
            </Text>
          </View>
        </View>

        <View style={t1Styles.footer}>
          <Text style={t1Styles.termsText}>{invoice.notes}</Text>
          <View style={t1Styles.contact}>
            <Text style={t1Styles.contactText}>
              FOR ANY QUESTIONS, PLEASE CONTACT{"\n"}
              {invoice.contactEmail || ""}
              {"\n"}
              {invoice.contactPhone ? (
                <>
                  {"\n"}
                  OR {invoice.contactPhone}.
                </>
              ) : null}
            </Text>
          </View>
        </View>
      </Page>
    </Document>
  );
};

// Mixi Studio Template Styles
const mixiStyles = StyleSheet.create({
  page: {
    padding: 42,
    fontFamily: "Inter",
    fontSize: 10,
    color: "#ffffff",
    backgroundColor: "#0a0a0a",
  },
  title: {
    fontSize: 30,
    fontWeight: 900,
    letterSpacing: -0.9,
    marginBottom: 14,
  },
  rule: {
    borderTopWidth: 2.5,
    borderTopColor: "#ffffff",
    marginBottom: 12,
  },
  metaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    fontSize: 10.5,
    fontWeight: 700,
    marginBottom: 3,
  },
  clientName: {
    fontSize: 10.5,
    fontWeight: 700,
    marginBottom: 2,
  },
  clientEmail: {
    fontSize: 9.5,
    fontWeight: 400,
    color: "rgba(255,255,255,0.72)",
    marginBottom: 28,
  },
  sectionTitle: {
    fontSize: 36,
    fontWeight: 900,
    letterSpacing: -0.9,
    marginBottom: 15,
  },
  itemsHeader: {
    flexDirection: "row",
    paddingTop: 8,
    paddingBottom: 8,
    marginBottom: 14,
    borderBottomWidth: 1.5,
    borderBottomColor: "#ffffff",
  },
  itemsHeaderCell: {
    fontSize: 9.5,
    fontWeight: 700,
    color: "#ffffff",
  },
  colDesc: { flex: 4 },
  colQty: { flex: 1.4, textAlign: "right", paddingRight: 4 },
  colPrice: { flex: 1.6, textAlign: "right", paddingRight: 4 },
  colSub: { flex: 1.4, textAlign: "right" },
  itemRow: {
    flexDirection: "row",
    marginBottom: 16,
  },
  itemName: {
    fontSize: 10,
    fontWeight: 700,
  },
  itemSub: {
    fontSize: 8.5,
    color: "rgba(255,255,255,0.72)",
    marginTop: 2,
  },
  itemValue: {
    fontSize: 9.5,
    textAlign: "right",
  },
  summaryBox: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginBottom: 42,
  },
  summaryTable: {
    width: 220,
  },
  summaryLine: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 3,
    fontSize: 10.5,
    fontWeight: 700,
  },
  summaryLineTotal: {
    fontWeight: 900,
  },
  invoiceNum: {
    fontSize: 42,
    fontWeight: 900,
    letterSpacing: -0.9,
    marginBottom: 18,
  },
  footerRule: {
    borderTopWidth: 1.5,
    borderTopColor: "#ffffff",
    marginBottom: 18,
  },
  footerGrid: {
    flexDirection: "row",
    gap: 24,
  },
  footerColLeft: {
    flex: 1,
  },
  footerColRight: {
    marginLeft: "auto",
    minWidth: 160,
  },
  footerHeading: {
    fontSize: 11,
    fontWeight: 800,
    marginBottom: 9,
  },
  paymentLine: {
    marginBottom: 10,
  },
  paymentLabel: {
    fontSize: 9.5,
    fontWeight: 400,
    color: "rgba(255,255,255,0.72)",
  },
  paymentValue: {
    fontSize: 9.5,
    fontWeight: 400,
    color: "rgba(255,255,255,0.72)",
  },
  notesBody: {
    fontSize: 9.5,
    color: "rgba(255,255,255,0.72)",
    lineHeight: 1.5,
  },
  paymentStatusBadge: {
    fontSize: 8,
    fontWeight: 700,
    color: "rgba(255,255,255,0.85)",
    marginTop: 2,
  },
});

const MixiStudioDocument = ({ invoice }: { invoice: InvoiceData }) => {
  const taxValue =
    (invoice.subtotal - Math.min(invoice.discount, invoice.subtotal)) *
    ((invoice.taxRate ?? 0) / 100);
  const discountValue = money(invoice.discount, invoice.currency);
  const dateLabel = (value: string | null | undefined) => {
    if (!value) return "N/A";
    const date = new Date(`${value}T00:00:00`);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
  };

  const paymentLines = invoice.paymentInstructions
    ? invoice.paymentInstructions
        .split(/\r?\n/)
        .map((l) => l.trim())
        .filter(Boolean)
    : [];
  const bankLabel = paymentLines[0] || "Bank Transfer";
  const bankValue = paymentLines[1] || "Your Bank Details";
  const phoneValue = paymentLines[2] || "";

  return (
    <Document>
      <Page size="A4" style={mixiStyles.page}>
        {/* Header */}
        <Text style={mixiStyles.title}>{invoice.companyName || "Studio"}</Text>
        <View style={mixiStyles.rule} />
        <View style={mixiStyles.metaRow}>
          <Text>{dateLabel(invoice.issueDate).toUpperCase()}</Text>
          <View style={{ alignItems: "flex-end" }}>
            <Text>Due Date: {dateLabel(invoice.dueDate).toUpperCase()}</Text>
            {invoice.paymentStatus ? (
              <Text style={mixiStyles.paymentStatusBadge}>
                {invoice.paymentStatus.charAt(0).toUpperCase() +
                  invoice.paymentStatus.slice(1).toLowerCase()}
              </Text>
            ) : null}
          </View>
        </View>
        <Text style={mixiStyles.clientName}>{invoice.clientName}</Text>
        {invoice.clientEmail ? (
          <Text style={mixiStyles.clientEmail}>{invoice.clientEmail}</Text>
        ) : null}

        {/* Services */}
        <Text style={mixiStyles.sectionTitle}>Services</Text>

        <View style={mixiStyles.itemsHeader}>
          <Text style={[mixiStyles.itemsHeaderCell, mixiStyles.colDesc]}> </Text>
          <Text style={[mixiStyles.itemsHeaderCell, mixiStyles.colQty]}>Quantity</Text>
          <Text style={[mixiStyles.itemsHeaderCell, mixiStyles.colPrice]}>Unit Price</Text>
          <Text style={[mixiStyles.itemsHeaderCell, mixiStyles.colSub]}>Subtotal</Text>
        </View>

        {invoice.items.map((item, index) => (
          <View key={`item-${index}`} style={mixiStyles.itemRow}>
            <View style={mixiStyles.colDesc}>
              <Text style={mixiStyles.itemName}>{item.product || "Item"}</Text>
            </View>
            <Text style={[mixiStyles.itemValue, mixiStyles.colQty]}>{item.quantity}</Text>
            <Text style={[mixiStyles.itemValue, mixiStyles.colPrice]}>
              {money(item.unitPrice, invoice.currency)}
            </Text>
            <Text style={[mixiStyles.itemValue, mixiStyles.colSub]}>
              {money(item.quantity * item.unitPrice, invoice.currency)}
            </Text>
          </View>
        ))}

        <View style={mixiStyles.summaryBox}>
          <View style={mixiStyles.summaryTable}>
            <View style={mixiStyles.summaryLine}>
              <Text>Subtotal</Text>
              <Text>{money(invoice.subtotal, invoice.currency)}</Text>
            </View>
            <View style={mixiStyles.summaryLine}>
              <Text>Discount</Text>
              <Text>-{discountValue}</Text>
            </View>
            <View style={mixiStyles.summaryLine}>
              <Text>TAX</Text>
              <Text>{money(taxValue, invoice.currency)}</Text>
            </View>
            <View style={[mixiStyles.summaryLine, mixiStyles.summaryLineTotal]}>
              <Text>Total Price</Text>
              <Text>{money(invoice.grandTotal, invoice.currency)}</Text>
            </View>
          </View>
        </View>

        {/* Invoice Number */}
        <Text style={mixiStyles.invoiceNum}>#{invoice.invoiceNumber}</Text>
        <View style={mixiStyles.footerRule} />

        {/* Footer: Payment left, Notes right */}
        <View style={mixiStyles.footerGrid}>
          <View style={mixiStyles.footerColLeft}>
            <Text style={mixiStyles.footerHeading}>Payment</Text>
            <View style={mixiStyles.paymentLine}>
              <Text style={mixiStyles.paymentLabel}>{bankLabel}</Text>
              <Text style={mixiStyles.paymentValue}>{bankValue}</Text>
            </View>
            {phoneValue ? (
              <View style={mixiStyles.paymentLine}>
                <Text style={mixiStyles.paymentLabel}>Phone</Text>
                <Text style={mixiStyles.paymentValue}>{phoneValue}</Text>
              </View>
            ) : null}
          </View>
          {invoice.notes ? (
            <View style={mixiStyles.footerColRight}>
              <Text style={mixiStyles.footerHeading}>Notes to Customer</Text>
              <Text style={mixiStyles.notesBody}>{invoice.notes}</Text>
            </View>
          ) : null}
        </View>
      </Page>
    </Document>
  );
};

export const InvoicePDFDocument = ({ invoice }: { invoice: InvoiceData }) => {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.headerRow}>
          <View style={styles.companyBox}>
            {invoice.isPro && invoice.brandLogo && (
              <Image src={invoice.brandLogo} style={styles.logoImage} />
            )}
            <Text style={styles.brandName}>{invoice.companyName}</Text>
            <Text style={styles.brandAddress}>{invoice.companyAddress}</Text>
          </View>
          <View style={styles.invoiceMetaBox}>
            <Text style={styles.invoiceLabelTop}>Invoice</Text>
            <View style={styles.invoiceNumberPill}>
              <Text>{invoice.invoiceNumber}</Text>
            </View>
            <View style={styles.issueDateRow}>
              <Text style={styles.issueDateLine}>Issued {formatDateLabel(invoice.issueDate)}</Text>
              <Text style={[styles.statusPill, getStatusPillStyle(invoice.paymentStatus)]}>
                {invoice.paymentStatus || "Pending"}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.gridBox}>
          <View style={styles.gridRow}>
            <View style={styles.gridColLeft}>
              <Text style={styles.gridHeader}>Billed to</Text>
              <Text style={styles.gridValue}>{invoice.clientName || "Client name"}</Text>
              {invoice.clientEmail ? (
                <Text style={styles.gridSubValue}>{invoice.clientEmail}</Text>
              ) : null}
            </View>
            <View style={styles.gridColRight}>
              <Text style={styles.gridHeader}>Due date</Text>
              <Text style={styles.gridValue}>{formatDateLabel(invoice.dueDate)}</Text>
            </View>
          </View>
          {invoice.billingAddress ? (
            <View style={styles.addressRow}>
              <Text style={styles.gridHeader}>Address</Text>
              <Text style={styles.addressValue}>{invoice.billingAddress}</Text>
            </View>
          ) : null}
        </View>

        <View style={styles.itemsBox}>
          <View style={styles.itemsHeader}>
            <Text style={styles.itemsHeaderLabel}>Item</Text>
            <Text style={styles.itemsHeaderLabel}>Amount</Text>
          </View>
          {invoice.items.map((item, i) => (
            <View key={i} style={styles.itemRow}>
              <View style={{ flex: 1, paddingRight: 16 }}>
                <Text style={styles.itemName}>{item.product || "Item"}</Text>
                <Text style={styles.itemMeta}>
                  {item.quantity} x {money(item.unitPrice, invoice.currency)}
                </Text>
              </View>
              <View>
                <Text style={styles.itemAmount}>
                  {money(item.quantity * item.unitPrice, invoice.currency)}
                </Text>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.totalsContainer}>
          <View style={styles.totalsBox}>
            <View style={styles.totalLine}>
              <Text style={styles.totalLabel}>Subtotal</Text>
              <Text style={styles.totalVal}>{money(invoice.subtotal, invoice.currency)}</Text>
            </View>
            {invoice.discount > 0 ? (
              <View style={styles.totalLine}>
                <Text style={styles.totalLabel}>Discount</Text>
                <Text style={styles.totalVal}>-{money(invoice.discount, invoice.currency)}</Text>
              </View>
            ) : null}
            {invoice.taxRate && invoice.taxRate > 0 ? (
              <View style={styles.totalLine}>
                <Text style={styles.totalLabel}>Tax ({invoice.taxRate}%)</Text>
                <Text style={styles.totalVal}>
                  +
                  {money(
                    (invoice.subtotal - Math.min(invoice.discount, invoice.subtotal)) *
                      (invoice.taxRate / 100),
                    invoice.currency,
                  )}
                </Text>
              </View>
            ) : null}
            <View style={styles.grandTotalLine}>
              <Text style={styles.grandTotalLabel}>Total</Text>
              <Text style={styles.grandTotalVal}>
                {money(invoice.grandTotal, invoice.currency)}
              </Text>
            </View>
          </View>
        </View>

        {invoice.notes || invoice.paymentInstructions ? (
          <View style={styles.notesBox}>
            {invoice.notes ? (
              <View>
                <Text style={styles.notesHeader}>Notes</Text>
                <Text style={styles.notesText}>{invoice.notes}</Text>
              </View>
            ) : null}
            {invoice.paymentInstructions ? (
              <View style={invoice.notes ? { marginTop: 16 } : {}}>
                <Text style={styles.notesHeader}>Payment Instructions</Text>
                <Text style={styles.notesText}>{invoice.paymentInstructions}</Text>
              </View>
            ) : null}
          </View>
        ) : null}

        {!invoice.isPro && (
          <View style={styles.watermark}>
            <Text style={styles.watermarkText}>
              Powered by <Text style={styles.watermarkBold}>Envoiz</Text>
            </Text>
          </View>
        )}
      </Page>
    </Document>
  );
};
