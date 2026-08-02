import type { ReceiptCurrency, ReceiptData, ReceiptProcedure } from "./types";
import { DOLLAR_PROCEDURE_NAMES } from "../../shared/constants/Procedures";

export const DEFAULT_CLINIC = {
  name: "KHWAJA DENTAL & IMPLANT SERVICE",
  address: "House 42, Road 7, Sector 3, Uttara, Dhaka",
  phone: "Phone: +880 1711-223344",
  logoUrl: null,
};

export const DOLLAR_PROCEDURES = DOLLAR_PROCEDURE_NAMES;

export const MOCK_RECEIPT_DATA: ReceiptData = {
  id: "INV-MOCK-20260619",
  invoiceNumber: "RCP-2023-0492",
  patientId: "KD-8821",
  patientName: "Rahim Ahmed",
  patientPhone: "+880 1711-223344",
  visitId: "V-20231012-000001",
  issueDate: "2023-10-12T00:00:00.000Z",
  currency: "AFN",
  subtotalAfn: 5000,
  subtotalUsd: 3000,
  discountAfn: 0,
  discountUsd: 0,
  totalAfn: 5000,
  totalUsd: 3000,
  paidAfn: 5000,
  paidUsd: 0,
  outstandingAfn: 0,
  outstandingUsd: 3000,
  status: "Partial",
  clinic: DEFAULT_CLINIC,
  procedures: [
    {
      treatmentRecordId: "TR-MOCK-1",
      procedureName: "Root Canal Treatment",
      quantity: 1,
      unitPriceAfn: 5000,
      unitPriceUsd: 0,
      totalPriceAfn: 5000,
      totalPriceUsd: 0,
      performedAt: "2023-10-12T00:00:00.000Z",
      toothNumbers: [16],
    },
    {
      treatmentRecordId: "TR-MOCK-2",
      procedureName: "Zirconium Crown",
      quantity: 2,
      unitPriceAfn: 0,
      unitPriceUsd: 1500,
      totalPriceAfn: 0,
      totalPriceUsd: 3000,
      performedAt: "2023-10-12T00:00:00.000Z",
      toothNumbers: [11, 21],
    },
  ],
  payments: [
    {
      id: "PAY-MOCK-1",
      amountAfn: 5000,
      amountUsd: 0,
      method: "Cash",
      notes: "Initial cash payment",
      receivedAt: "2023-10-12T00:00:00.000Z",
    },
  ],
};

export const formatCurrency = (amount: number, currency: ReceiptCurrency = "AFN") => {
  const value = Number.isFinite(amount) ? amount : 0;
  const symbol = currency === "USD" ? "$" : "AFN";
  const formatted = new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);

  return `${formatted} ${symbol}`;
};

export const formatShortCurrency = (amount: number, currency: ReceiptCurrency = "AFN") => {
  const value = Number.isFinite(amount) ? amount : 0;
  const symbol = currency === "USD" ? "$" : "AFN";
  const formatted = new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);

  return `${formatted} ${symbol}`;
};

export const formatReceiptDate = (dateValue: string | null | undefined) => {
  if (!dateValue) return "-";

  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) return "-";

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  });
};

export const formatReceiptTime = (dateValue: string | null | undefined) => {
  if (!dateValue) return "";

  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) return "";

  return date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

export const getCurrencyForProcedureName = (procedureName: string): ReceiptCurrency =>
  DOLLAR_PROCEDURES.includes(procedureName) ? "USD" : "AFN";

export const getProcedureLabel = (procedure: ReceiptProcedure) => {
  const toothNumbersArray = typeof procedure.toothNumbers === 'string'
    ? procedure.toothNumbers.split(',').map(n => n.trim()).filter(n => n)
    : procedure.toothNumbers;
  const toothLabel = toothNumbersArray && toothNumbersArray.length > 0
    ? ` (Tooth: ${toothNumbersArray.join(", ")})`
    : "";
  const quantityLabel = procedure.quantity > 1 ? ` (x${procedure.quantity})` : "";

  return `${procedure.procedureName}${toothLabel}${quantityLabel}`;
};

export const getReceiptTotals = (receipt: ReceiptData) => {
  const subtotalAfn = receipt.procedures.reduce((sum, item) => sum + (item.totalPriceAfn || 0), 0);
  const subtotalUsd = receipt.procedures.reduce((sum, item) => sum + (item.totalPriceUsd || 0), 0);
  const discountAfn = Math.max(receipt.discountAfn || 0, 0);
  const discountUsd = Math.max(receipt.discountUsd || 0, 0);
  const totalAfn = Math.max(subtotalAfn - discountAfn, 0);
  const totalUsd = Math.max(subtotalUsd - discountUsd, 0);
  const paidAfn = receipt.payments.reduce((sum, payment) => sum + (payment.amountAfn || 0), 0) || receipt.paidAfn;
  const paidUsd = receipt.payments.reduce((sum, payment) => sum + (payment.amountUsd || 0), 0) || receipt.paidUsd;
  const outstandingAfn = Math.max(totalAfn - paidAfn, 0);
  const outstandingUsd = Math.max(totalUsd - paidUsd, 0);

  return {
    subtotalAfn,
    subtotalUsd,
    discountAfn,
    discountUsd,
    totalAfn,
    totalUsd,
    paidAfn,
    paidUsd,
    outstandingAfn,
    outstandingUsd,
  };
};

export const buildReceiptDownloadJson = (receipt: ReceiptData) =>
  JSON.stringify(receipt, null, 2);

export const buildReceiptDownloadHtml = (receipt: ReceiptData) => `<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Receipt ${receipt.invoiceNumber}</title>
  <style>
    body { font-family: Inter, system-ui, sans-serif; margin: 0; background: #fff; color: #111827; }
    .receipt { width: 80mm; margin: 0 auto; padding: 12px; }
    .brand { text-align: center; color: #0f766e; font-weight: 800; font-size: 16px; }
    .address { text-align: center; color: #6b7280; font-size: 11px; margin-top: 4px; }
    .divider { border-top: 1px solid #e5e7eb; margin: 10px 0; }
    .meta { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; font-size: 11px; }
    .right { text-align: right; }
    table { width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 11px; }
    th { text-align: left; text-transform: uppercase; color: #6b7280; border-bottom: 1px solid #e5e7eb; padding: 4px 0; }
    td { padding: 6px 0; border-bottom: 1px solid #f3f4f6; }
    .money { text-align: right; }
    .total { color: #0f766e; font-size: 14px; font-weight: 800; }
    .logo img { max-height: 40px; margin-left: auto; display: block; margin-bottom: 8px; }
    .outstanding { color: #dc2626; font-size: 14px; font-weight: 800; }
    .footer { text-align: center; color: #6b7280; font-size: 10px; margin-top: 14px; }
  </style>
</head>
<body>
  <div class="receipt">
    ${receipt.clinic.logoUrl ? `<div class="logo"><img src="${receipt.clinic.logoUrl}" alt="Logo" /></div>` : ""}
    <div class="brand">${receipt.clinic.name}</div>
    <div class="address">${receipt.clinic.address}<br />${receipt.clinic.phone}</div>
    <div class="divider"></div>
    <div class="meta">
      <div>Receipt No: <strong>#${receipt.invoiceNumber}</strong><br />Patient Name: <strong>${receipt.patientName}</strong></div>
      <div class="right">Date: <strong>${formatReceiptDate(receipt.issueDate)}</strong><br />Patient ID: <strong>${receipt.patientId}</strong></div>
    </div>
    <table>
      <thead><tr><th>Procedure</th><th class="money">Price</th></tr></thead>
      <tbody>${receipt.procedures.map((procedure) => `<tr><td>${getProcedureLabel(procedure)}</td><td class="money">${receipt.currency === "USD" ? formatCurrency(procedure.totalPriceUsd, "USD") : formatCurrency(procedure.totalPriceAfn, "AFN")}</td></tr>`).join("")}</tbody>
    </table>
    <div class="divider"></div>
    <div class="meta">
      <div>${receipt.subtotalAfn > 0 ? `Subtotal (AFN)<br />` : ""}${receipt.discountAfn > 0 ? `Discount (AFN)<br />` : ""}${receipt.totalAfn > 0 ? `<span class="total">Total (AFN)<br /></span>` : ""}${receipt.paidAfn > 0 ? `<span class="total">Paid (AFN)</span>` : ""}</div>
      <div class="right">${receipt.subtotalAfn > 0 ? `${formatCurrency(receipt.subtotalAfn, "AFN")}<br />` : ""}${receipt.discountAfn > 0 ? `<span style="color:#dc2626">${formatCurrency(receipt.discountAfn, "AFN")}</span><br />` : ""}${receipt.totalAfn > 0 ? `<span class="total">${formatCurrency(receipt.totalAfn, "AFN")}</span><br />` : ""}${receipt.paidAfn > 0 ? `<span class="total">${formatCurrency(receipt.paidAfn, "AFN")}</span>` : ""}</div>
    </div>
    ${receipt.subtotalUsd > 0 || receipt.discountUsd > 0 || receipt.totalUsd > 0 || receipt.paidUsd > 0 ? `
    <div class="meta">
      <div>${receipt.subtotalUsd > 0 ? `Subtotal ($)<br />` : ""}${receipt.discountUsd > 0 ? `Discount ($)<br />` : ""}${receipt.totalUsd > 0 ? `<span class="total">Total ($)<br /></span>` : ""}${receipt.paidUsd > 0 ? `<span class="total">Paid ($)</span>` : ""}</div>
      <div class="right">${receipt.subtotalUsd > 0 ? `${formatCurrency(receipt.subtotalUsd, "USD")}<br />` : ""}${receipt.discountUsd > 0 ? `<span style="color:#dc2626">${formatCurrency(receipt.discountUsd, "USD")}</span><br />` : ""}${receipt.totalUsd > 0 ? `<span class="total">${formatCurrency(receipt.totalUsd, "USD")}</span><br />` : ""}${receipt.paidUsd > 0 ? `<span class="total">${formatCurrency(receipt.paidUsd, "USD")}</span>` : ""}</div>
    </div>` : ""}
    <div class="divider"></div>
    <div class="meta">
      <div>Outstanding Balance</div>
      <div class="right outstanding">${receipt.outstandingAfn > 0 ? formatCurrency(receipt.outstandingAfn, "AFN") : ""}${receipt.outstandingAfn > 0 && receipt.outstandingUsd > 0 ? " / " : ""}${receipt.outstandingUsd > 0 ? formatCurrency(receipt.outstandingUsd, "USD") : ""}</div>
    </div>
    <div class="footer">${receipt.clinic.name ? `Thank you for choosing ${receipt.clinic.name}!` : "Thank you for your visit!"}</div>
  </div>
</body>
</html>`;
