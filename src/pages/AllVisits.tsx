import { useState } from "react";
import { useTranslation } from "react-i18next";
import { LoadingSpinner, Pagination } from "../components/ui";
import AllVisitsHeader from "../components/visits/AllVisitsHeader";
import VisitsTable from "../components/visits/VisitsTable";
import { useAllVisits } from "../hooks/useVisits";
import { useDebounce } from "../hooks/useDebounce";

const PAGE_SIZE = 10;
const SEARCH_DEBOUNCE_MS = 300;

const AllVisits: React.FC = () => {
  const { t } = useTranslation();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<
    "All" | "Open" | "Completed" | "Cancelled"
  >("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(PAGE_SIZE);

  const debouncedSearchQuery = useDebounce(searchQuery, SEARCH_DEBOUNCE_MS);

  const { data, isLoading, error } = useAllVisits({
    query: debouncedSearchQuery || undefined,
    status: selectedStatus !== "All" ? selectedStatus : undefined,
    page: currentPage,
    perPage: itemsPerPage,
  });

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
  };

  const handleStatusChange = (
    status: "All" | "Open" | "Completed" | "Cancelled",
  ) => {
    setSelectedStatus(status);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= (data?.total_pages ?? 1)) {
      setCurrentPage(page);
    }
  };

  const handleItemsPerPageChange = (items: number) => {
    setItemsPerPage(items);
    setCurrentPage(1);
  };

  const visits = data?.items ?? [];

  return (
    <div className="flex flex-col h-full">
      <AllVisitsHeader
        totalVisits={data?.total ?? 0}
        openCount={data?.open_count ?? 0}
        completedCount={data?.completed_count ?? 0}
        cancelledCount={data?.cancelled_count ?? 0}
        searchQuery={searchQuery}
        selectedStatus={selectedStatus}
        onSearchChange={handleSearchChange}
        onStatusChange={handleStatusChange}
      />

      <div className="flex-1 overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700 mb-3">
        {isLoading ? (
          <div className="flex h-full items-center justify-center">
            <LoadingSpinner
              size="lg"
              text={t("allVisits.loading", "Loading visits...")}
            />
          </div>
        ) : error ? (
          <div className="flex h-full items-center justify-center">
            <div className="text-lg text-red-500">
              {t("allVisits.errorLoading", "Error loading visits")}:{" "}
              {String(error)}
            </div>
          </div>
        ) : (
          <VisitsTable visits={visits} />
        )}
      </div>

      <Pagination
        currentPage={currentPage}
        totalPages={data?.total_pages ?? 1}
        totalItems={data?.total ?? 0}
        itemsPerPage={itemsPerPage}
        onPageChange={handlePageChange}
        onItemsPerPageChange={handleItemsPerPageChange}
      />
    </div>
  );
};

export default AllVisits;
