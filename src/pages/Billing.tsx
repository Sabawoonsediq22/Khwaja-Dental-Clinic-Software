import { useState, useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { LoadingSpinner, Pagination } from "../components/ui";
import BillingHeader from "../components/billing/BillingHeader";
import BillingTable from "../components/billing/BillingTable";
import PaymentModal from "../components/billing/PaymentModal";
import { ReceiptPreviewModal } from "../components/receipt";
import { useInvoices, useAddPayment } from "../hooks/useInvoices";
import { useDebounce } from "../hooks/useDebounce";
import { useQueryClient } from "@tanstack/react-query";
import { useParams, useSearchParams } from "react-router-dom";
import type { InvoiceListItem } from "../types/ApiTypes";
import { toast } from "sonner";

const PAGE_SIZE = 10;
const SEARCH_DEBOUNCE_MS = 300;

const Billing: React.FC = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const { id } = useParams<{ id?: string }>();
  const [searchParams] = useSearchParams();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<
    "All" | "Unpaid" | "Partial" | "Paid"
  >(() => {
    const filter = searchParams.get("filter");
    if (filter === "outstanding") return "All";
    return "All";
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(PAGE_SIZE);

  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [selectedInvoice, setSelectedInvoice] =
    useState<InvoiceListItem | null>(null);

  const filterOutstanding = searchParams.get("filter") === "outstanding";

  useEffect(() => {
    if (id) {
      setSearchQuery(id);
    }
  }, [id]);

  const debouncedSearchQuery = useDebounce(searchQuery, SEARCH_DEBOUNCE_MS);

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchQuery]);

  const { data, isLoading, error } = useInvoices({
    query: debouncedSearchQuery || undefined,
    status: filterOutstanding
      ? undefined
      : selectedStatus !== "All"
        ? selectedStatus
        : undefined,
    page: currentPage,
    perPage: filterOutstanding ? 100 : itemsPerPage,
  });

  const filteredInvoices = useMemo(() => {
    if (!filterOutstanding) return data?.items ?? [];
    return (data?.items ?? []).filter(
      (inv) => (inv.outstanding_afn ?? 0) > 0 || (inv.outstanding_usd ?? 0) > 0,
    );
  }, [data?.items, filterOutstanding]);

  const totalFiltered = filterOutstanding ? filteredInvoices.length : data?.total ?? 0;
  const totalPages = filterOutstanding
    ? Math.ceil(filteredInvoices.length / itemsPerPage)
    : data?.total_pages ?? 1;

  const paginatedInvoices = useMemo(() => {
    if (!filterOutstanding) return filteredInvoices;
    const start = (currentPage - 1) * itemsPerPage;
    return filteredInvoices.slice(start, start + itemsPerPage);
  }, [filteredInvoices, filterOutstanding, currentPage, itemsPerPage]);

  const addPaymentMutation = useAddPayment();

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
  };

  const handleStatusChange = (
    status: "All" | "Unpaid" | "Partial" | "Paid",
  ) => {
    setSelectedStatus(status);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handleItemsPerPageChange = (items: number) => {
    setItemsPerPage(items);
    setCurrentPage(1);
  };

  const handleRecordPayment = (invoice: InvoiceListItem) => {
    setSelectedInvoice(invoice);
    setShowPaymentModal(true);
  };

  const handlePrintReceipt = (invoice: InvoiceListItem) => {
    setSelectedInvoice(invoice);
    setShowReceiptModal(true);
  };

  const handlePaymentSubmit = (input: {
    invoice_id: string;
    amount_afn: number;
    amount_usd: number;
    method: "Cash" | "Card" | "Mobile" | "Insurance";
    notes?: string | null;
  }) => {
    addPaymentMutation.mutate(input, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["invoices"] });
        toast.success(
          t(
            "billing.notifications.paymentAdded",
            "Payment recorded successfully",
          ),
        );
      },
      onError: (error) => {
        toast.error(
          `${t("billing.notifications.paymentError", "Failed to record payment")}: ${String(error)}`,
        );
      },
    });
  };

  const invoices = paginatedInvoices;
  const allInvoices = data?.items ?? [];
  const totalOutstanding = allInvoices.reduce(
    (sum, inv) => sum + (inv.outstanding_afn ?? 0) + (inv.outstanding_usd ?? 0),
    0,
  );
  const totalOutstandingAfn = allInvoices.reduce(
    (sum, inv) => sum + (inv.outstanding_afn ?? 0),
    0,
  );
  const totalOutstandingUsd = allInvoices.reduce(
    (sum, inv) => sum + (inv.outstanding_usd ?? 0),
    0,
  );

  return (
    <div className="flex flex-col h-full">
      <BillingHeader
        invoices={invoices}
        totalInvoices={filterOutstanding ? totalFiltered : (data?.total ?? 0)}
        totalOutstanding={totalOutstanding}
        totalOutstandingAmount={data?.total_outstanding ?? 0}
        totalOutstandingAfn={totalOutstandingAfn}
        totalOutstandingUsd={totalOutstandingUsd}
        searchQuery={searchQuery}
        selectedStatus={filterOutstanding ? "All" : selectedStatus}
        onSearchChange={handleSearchChange}
        onStatusChange={handleStatusChange}
        unpaidCount={data?.unpaid_count}
        partialCount={data?.partial_count}
        paidCount={data?.paid_count}
      />

      <div className="flex-1 overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700 mb-3">
        {isLoading ? (
          <div className="flex h-full items-center justify-center">
            <LoadingSpinner
              size="lg"
              text={t("billing.loadingInvoices", "Loading invoices...")}
            />
          </div>
        ) : error ? (
          <div className="flex h-full items-center justify-center">
            <div className="text-lg text-red-500">
              {t("billing.errorLoading", "Error loading invoices")}:{" "}
              {String(error)}
            </div>
          </div>
        ) : (
          <BillingTable
            invoices={invoices}
            onRecordPayment={handleRecordPayment}
            onPrintReceipt={handlePrintReceipt}
          />
        )}
      </div>

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={totalFiltered}
        itemsPerPage={itemsPerPage}
        onPageChange={handlePageChange}
        onItemsPerPageChange={handleItemsPerPageChange}
      />

      {selectedInvoice && (
        <>
          <PaymentModal
            isOpen={showPaymentModal}
            onClose={() => setShowPaymentModal(false)}
            invoiceId={selectedInvoice.id}
            outstandingAmount={
              (selectedInvoice.outstanding_afn ?? 0) +
              (selectedInvoice.outstanding_usd ?? 0)
            }
            outstandingAfn={selectedInvoice.outstanding_afn ?? 0}
            outstandingUsd={selectedInvoice.outstanding_usd ?? 0}
            onSave={handlePaymentSubmit}
          />

          <ReceiptPreviewModal
            invoiceId={selectedInvoice.id}
            isOpen={showReceiptModal}
            onClose={() => setShowReceiptModal(false)}
          />
        </>
      )}
    </div>
  );
};

export default Billing;
