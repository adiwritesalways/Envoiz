import { Document, Page, View, Text, StyleSheet } from '@react-pdf/renderer';

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
    case 'Paid':
      return styles.statusPillPaid;
    case 'Overdue':
      return styles.statusPillOverdue;
    case 'Pending':
    default:
      return styles.statusPillPending;
  }
};

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: 'Helvetica',
    fontSize: 10,
    color: '#000000',
    backgroundColor: '#ffffff',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderBottom: '1pt solid #efefef',
    paddingBottom: 24,
    marginBottom: 24,
  },
  companyBox: {
    maxWidth: 240,
  },
  brandName: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  brandAddress: {
    fontSize: 10,
    color: '#737373',
    lineHeight: 1.4,
  },
  invoiceMetaBox: {
    alignItems: 'flex-end',
  },
  invoiceLabelTop: {
    fontSize: 8.5,
    textTransform: 'uppercase',
    color: '#737373',
    letterSpacing: 1.5,
  },
  invoiceNumberPill: {
    marginTop: 8,
    border: '1pt solid #efefef',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    fontSize: 10,
    fontWeight: 'bold',
  },
  issueDateRow: {
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  issueDateLine: {
    fontSize: 9,
    color: '#737373',
    marginRight: 8,
  },
  statusPill: {
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 3,
    fontSize: 8.5,
    fontWeight: 'bold',
  },
  statusPillPaid: {
    backgroundColor: '#dcfce7',
    color: '#15803d',
  },
  statusPillPending: {
    backgroundColor: '#f1f1f1',
    color: '#525252',
  },
  statusPillOverdue: {
    backgroundColor: '#fee2e2',
    color: '#b91c1c',
  },
  gridBox: {
    borderRadius: 16,
    border: '1pt solid #efefef',
    marginBottom: 24,
  },
  gridRow: {
    flexDirection: 'row',
  },
  gridColLeft: {
    padding: 20,
    borderRight: '1pt solid #efefef',
    flex: 1,
  },
  gridColRight: {
    padding: 20,
    flex: 1,
  },
  gridHeader: {
    fontSize: 8.5,
    textTransform: 'uppercase',
    color: '#737373',
    letterSpacing: 1.5,
  },
  gridValue: {
    marginTop: 8,
    fontSize: 11,
    fontWeight: 'bold',
  },
  gridSubValue: {
    marginTop: 4,
    fontSize: 10,
    color: '#737373',
  },
  addressRow: {
    borderTop: '1pt solid #efefef',
    padding: 20,
  },
  addressValue: {
    marginTop: 8,
    fontSize: 10,
    color: '#737373',
    lineHeight: 1.4,
  },
  itemsBox: {
    borderRadius: 16,
    border: '1pt solid #efefef',
    marginBottom: 24,
  },
  itemsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#f9f9f9',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  itemsHeaderLabel: {
    fontSize: 8,
    textTransform: 'uppercase',
    color: '#737373',
    letterSpacing: 1,
    fontWeight: 'bold',
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTop: '1pt solid #efefef',
  },
  itemName: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  itemMeta: {
    marginTop: 4,
    fontSize: 9,
    color: '#737373',
  },
  itemAmount: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  totalsContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 24,
  },
  totalsBox: {
    width: 220,
  },
  totalLine: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
    paddingHorizontal: 4,
  },
  totalLabel: {
    fontSize: 10,
    color: '#737373',
  },
  totalVal: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  grandTotalLine: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTop: '1pt solid #efefef',
    paddingTop: 12,
    paddingHorizontal: 4,
    marginTop: 2,
    alignItems: 'baseline',
  },
  grandTotalLabel: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#737373',
  },
  grandTotalVal: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  notesBox: {
    borderTop: '1pt solid #efefef',
    paddingTop: 24,
  },
  notesHeader: {
    fontSize: 8.5,
    textTransform: 'uppercase',
    color: '#737373',
    letterSpacing: 1.5,
  },
  notesText: {
    marginTop: 8,
    fontSize: 10,
    color: '#737373',
    lineHeight: 1.4,
  },
  watermark: {
    marginTop: 48,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  watermarkText: {
    fontSize: 8.5,
    color: '#a3a3a3',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
  },
  watermarkBold: {
    color: '#737373',
    fontWeight: 'bold',
  },
});

type InvoiceData = {
  companyName: string;
  companyAddress: string;
  clientName: string;
  clientEmail: string;
  billingAddress: string;
  invoiceNumber: string;
  issueDate: string;
  dueDate: string;
  paymentStatus: string;
  items: any[];
  subtotal: number;
  discount: number;
  grandTotal: number;
  currency: string;
  notes: string;
};

export const InvoicePDFDocument = ({ invoice }: { invoice: InvoiceData }) => {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.headerRow}>
          <View style={styles.companyBox}>
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
                {invoice.paymentStatus || 'Pending'}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.gridBox}>
          <View style={styles.gridRow}>
            <View style={styles.gridColLeft}>
              <Text style={styles.gridHeader}>Billed to</Text>
              <Text style={styles.gridValue}>{invoice.clientName || "Client name"}</Text>
              {invoice.clientEmail ? <Text style={styles.gridSubValue}>{invoice.clientEmail}</Text> : null}
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
                <Text style={styles.itemName}>{item.product || 'Item'}</Text>
                <Text style={styles.itemMeta}>{item.quantity} x {money(item.unitPrice, invoice.currency as any)}</Text>
              </View>
              <View>
                <Text style={styles.itemAmount}>{money(item.quantity * item.unitPrice, invoice.currency as any)}</Text>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.totalsContainer}>
          <View style={styles.totalsBox}>
            <View style={styles.totalLine}>
              <Text style={styles.totalLabel}>Subtotal</Text>
              <Text style={styles.totalVal}>{money(invoice.subtotal, invoice.currency as any)}</Text>
            </View>
            {invoice.discount > 0 ? (
              <View style={styles.totalLine}>
                <Text style={styles.totalLabel}>Discount</Text>
                <Text style={styles.totalVal}>-{money(invoice.discount, invoice.currency as any)}</Text>
              </View>
            ) : null}
            <View style={styles.grandTotalLine}>
              <Text style={styles.grandTotalLabel}>Total</Text>
              <Text style={styles.grandTotalVal}>{money(invoice.grandTotal, invoice.currency as any)}</Text>
            </View>
          </View>
        </View>

        {invoice.notes ? (
          <View style={styles.notesBox}>
            <Text style={styles.notesHeader}>Notes</Text>
            <Text style={styles.notesText}>{invoice.notes}</Text>
          </View>
        ) : null}

        <View style={styles.watermark}>
          <Text style={styles.watermarkText}>
            Powered by <Text style={styles.watermarkBold}>Envoiz</Text>
          </Text>
        </View>
      </Page>
    </Document>
  );
}
