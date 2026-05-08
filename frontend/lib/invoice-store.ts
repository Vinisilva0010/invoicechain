interface InvoiceRecord {
  invoiceId: string;
  checkoutUrl: string;
  amountUsd: number;
  description: string;
  freelancerWallet: string;
  expiresAt: number;
  status: "pending" | "paid" | "expired";
  txHash?: string;
}

// Store em memória — suficiente para demo no hackathon
const store = new Map<string, InvoiceRecord>();

export function saveInvoice(record: InvoiceRecord) {
  store.set(record.invoiceId, record);
}

export function getInvoice(invoiceId: string): InvoiceRecord | null {
  return store.get(invoiceId) || null;
}

export function markInvoicePaid(invoiceId: string, txHash: string) {
  const invoice = store.get(invoiceId);
  if (invoice) {
    invoice.status = "paid";
    invoice.txHash = txHash;
    store.set(invoiceId, invoice);
  }
}
