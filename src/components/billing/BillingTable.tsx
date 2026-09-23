import React from "react";
import { useTranslation } from "react-i18next";
import { BillingTableProps } from "../../types/BillingTypes";
import { Badge } from "../ui/Badge";
import { PaymentIcon, PrinterIcon } from "../../shared/icons/icons";

function formatDate(date: string | null | undefined): string {
  if (!date) return "-";
  try {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "2-digit",
    });
  } catch {
    return date;
  }
}

function formatCurrency(val: number): string {
  return val.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function formatDualCurrency(afn: number, usd: number): string {
  const parts: string[] = [];
  if (afn > 0) parts.push(`${formatCurrency(afn)} AFN`);
  if (usd > 0) parts.push(`$${formatCurrency(usd)}`);
  return parts.length > 0 ? parts.join(" + ") : `${formatCurrency(0)} AFN`;
}

const getStatusVariant = (status: string) => {
  switch (status) {
    case "Paid":
      return "success";
    case "Partial":
      return "warning";
    case "Unpaid":
      return "destructive";
    default:
      return "default";
  }
};

const BillingTable: React.FC<BillingTableProps> = ({
  invoices,
  onRecordPayment,
  onPrintReceipt,
}) => {
  const { t } = useTranslation();

  if (invoices.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 bg-white dark:bg-gray-800">
        <p className="text-gray-500 dark:text-gray-400 text-sm">
          {t("billing.table.empty", "No invoices found matching your criteria.")}
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800">
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-gray-100 dark:bg-gray-900 border-gray-200 dark:border-gray-700">
              <th className="py-3 px-4 font-bold text-xs uppercase tracking-wider text-gray-800 dark:text-gray-400 whitespace-nowrap">
                {t("billing.table.number", "NO.")}
              </th>
              <th className="py-3 px-4 font-bold text-xs uppercase tracking-wider text-gray-800 dark:text-gray-400">
                {t("billing.table.invoiceNumber", "INVOICE #")}
              </th>
              <th className="py-3 px-4 font-bold text-xs uppercase tracking-wider text-gray-800 dark:text-gray-400">
                {t("billing.table.patient", "PATIENT")}
              </th>
              <th className="py-3 px-4 font-bold text-xs uppercase tracking-wider text-gray-800 dark:text-gray-400">
                {t("billing.table.date", "DATE")}
              </th>
              <th className="py-3 px-4 font-bold text-xs uppercase tracking-wider text-gray-800 dark:text-gray-400">
                {t("billing.table.total", "TOTAL")}
              </th>
              <th className="py-3 px-4 font-bold text-xs uppercase tracking-wider text-gray-800 dark:text-gray-400">
                {t("billing.table.paid", "PAID")}
              </th>
              <th className="py-3 px-4 font-bold text-xs uppercase tracking-wider text-gray-800 dark:text-gray-400">
                {t("billing.table.outstanding", "OUTSTANDING")}
              </th>
              <th className="py-3 px-4 font-bold text-xs uppercase tracking-wider text-gray-800 dark:text-gray-400">
                {t("billing.table.status", "STATUS")}
              </th>
              <th className="py-3 px-4 font-bold text-xs uppercase tracking-wider text-gray-800 dark:text-gray-400">
                {t("billing.table.actions", "ACTIONS")}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-700/60">
            {invoices.map((invoice, index) => (
              <tr
                key={`${invoice.id}-${index}`}
                className="hover:bg-gray-50 dark:hover:bg-gray-700/40 transition-colors"
              >
                <td className="py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-300 whitespace-nowrap">
                  {index + 1}
                </td>
                <td className="py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-300">
                  <div className="max-w-16 truncate" title={invoice.invoice_number}>
                    {invoice.invoice_number}
                  </div>
                </td>
                <td className="py-3 px-4">
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">
                      {invoice.patient_name}
                    </span>
                    {invoice.patient_phone && (
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {invoice.patient_phone}
                      </span>
                    )}
                  </div>
                </td>
                <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-300 whitespace-nowrap">
                  {formatDate(invoice.issued_at)}
                </td>
                <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-300 whitespace-nowrap">
                  {formatDualCurrency(invoice.total_afn, invoice.total_usd)}
                </td>
                <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-300 whitespace-nowrap">
                  {formatDualCurrency(invoice.paid_afn, invoice.paid_usd)}
                </td>
                <td className="py-3 px-4 text-sm whitespace-nowrap">
                  <span
                    className={
                      (invoice.outstanding_afn + invoice.outstanding_usd) > 0
                        ? "text-orange-600 dark:text-orange-400 font-medium"
                        : "text-gray-600 dark:text-gray-300"
                    }
                  >
                    {formatDualCurrency(invoice.outstanding_afn, invoice.outstanding_usd)}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <Badge variant={getStatusVariant(invoice.status) as any} className="text-xs font-medium">
                    {invoice.status.toUpperCase()}
                  </Badge>
                </td>
                {/* ... keep existing cells ... */}
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2">
                    {(invoice.outstanding_afn + invoice.outstanding_usd) > 0 && (
                      <button
                        type="button"
                        onClick={() => onRecordPayment?.(invoice)}
                        title={t("billing.actions.recordPayment", "Record Payment")}
                        className="p-1.5 rounded-md text-gray-500 hover:text-blue-600 hover:bg-blue-50 dark:text-gray-400 dark:hover:text-blue-400 dark:hover:bg-blue-900/20 transition-colors cursor-pointer"
                      >
                        <PaymentIcon className="h-5 w-5" />
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => onPrintReceipt?.(invoice)}
                      title={t("billing.actions.printReceipt", "Print Receipt")}
                      className="p-1.5 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-700 transition-colors cursor-pointer"
                    >
                      <PrinterIcon className="h-5 w-5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="md:hidden divide-y divide-gray-100 dark:divide-gray-700/60">
        {invoices.map((invoice, idx) => (
          <div
            key={`${invoice.id}-${idx}`}
            className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/40 transition-colors"
          >
            <div className="flex items-center justify-between gap-3">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 dark:text-white truncate" title={invoice.invoice_number}>
                  {invoice.invoice_number}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  {invoice.patient_name}
                </p>
              </div>
              <Badge variant={getStatusVariant(invoice.status) as any} className="text-xs">
                {invoice.status.toUpperCase()}
              </Badge>
            </div>
            <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-gray-500 dark:text-gray-400">
              <span>{t("billing.table.dateLabel", "Date:")} {formatDate(invoice.issued_at)}</span>
              <span>{t("billing.table.totalLabel", "Total:")} {formatDualCurrency(invoice.total_afn, invoice.total_usd)}</span>
              <span>{t("billing.table.paidLabel", "Paid:")} {formatDualCurrency(invoice.paid_afn, invoice.paid_usd)}</span>
              <span>{t("billing.table.dueLabel", "Due:")} {formatDualCurrency(invoice.outstanding_afn, invoice.outstanding_usd)}</span>
            </div>
            {/* Mobile actions */}
            <div className="mt-3 flex items-center justify-end gap-2">
              {(invoice.outstanding_afn + invoice.outstanding_usd) > 0 && (
                <button
                  type="button"
                  onClick={() => onRecordPayment?.(invoice)}
                  title={t("billing.actions.recordPayment", "Record Payment")}
                  className="p-1.5 rounded-md text-gray-500 hover:text-blue-600 hover:bg-blue-50 dark:text-gray-400 dark:hover:text-blue-400 dark:hover:bg-blue-900/20 transition-colors cursor-pointer"
                >
                  <PaymentIcon className="h-5 w-5" />
                </button>
              )}
              <button
                type="button"
                onClick={() => onPrintReceipt?.(invoice)}
                title={t("billing.actions.printReceipt", "Print Receipt")}
                className="p-1.5 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-700 transition-colors cursor-pointer"
              >
                <PrinterIcon className="h-5 w-5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BillingTable;