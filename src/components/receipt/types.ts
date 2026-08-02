export type ReceiptInvoiceStatus = "Unpaid" | "Partial" | "Paid";

export type ReceiptCurrency = "AFN" | "USD";

export interface ReceiptClinic {
  name: string;
  address: string;
  phone: string;
  logoUrl?: string | null;
}

export interface ReceiptPatient {
  id: string;
  fullName: string;
  phone?: string | null;
}

export interface ReceiptPayment {
  id: string;
  amountAfn: number;
  amountUsd: number;
  method?: string | null;
  notes?: string | null;
  receivedAt: string;
}

export interface ReceiptProcedure {
  treatmentRecordId?: string;
  procedureName: string;
  additionalNote?: string | null;
  quantity: number;
  unitPriceAfn: number;
  unitPriceUsd: number;
  totalPriceAfn: number;
  totalPriceUsd: number;
  performedAt?: string;
  toothNumbers?: string | number[];
}

export interface ReceiptData {
  id: string;
  invoiceNumber: string;
  patientId: string;
  patientName: string;
  patientPhone?: string | null;
  visitId: string;
  issueDate: string;
  currency: ReceiptCurrency;
  subtotalAfn: number;
  subtotalUsd: number;
  discountAfn: number;
  discountUsd: number;
  totalAfn: number;
  totalUsd: number;
  paidAfn: number;
  paidUsd: number;
  outstandingAfn: number;
  outstandingUsd: number;
  status: ReceiptInvoiceStatus;
  procedures: ReceiptProcedure[];
  payments: ReceiptPayment[];
  clinic: ReceiptClinic;
}

export interface ReceiptSource {
  invoiceId?: string;
  patientId?: string;
  visitId?: string;
  mockData?: ReceiptData;
}
