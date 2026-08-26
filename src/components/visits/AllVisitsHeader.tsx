import React from "react";
import { useTranslation } from "react-i18next";
import { Button, SearchInput } from "../ui";
import {
  AllVisitsHeaderProps,
  VISIT_STATUS_FILTER_OPTIONS,
} from "../../types/VisitTypes";

const AllVisitsHeader: React.FC<AllVisitsHeaderProps> = ({
  totalVisits,
  openCount,
  completedCount,
  cancelledCount,
  searchQuery,
  selectedStatus,
  onSearchChange,
  onStatusChange,
}) => {
  const { t } = useTranslation();

  const stats: Record<string, number> = {
    Open: openCount,
    Completed: completedCount,
    Cancelled: cancelledCount,
  };

  const getStatusLabel = (status: string) => {
    return t(`allVisits.filters.${status.toLowerCase()}`, status);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <SearchInput
          value={searchQuery}
          onChange={onSearchChange}
          placeholder={t(
            "allVisits.searchPlaceholder",
            "Search by visit ID, patient name, phone or complaint...",
          )}
          className="w-full sm:w-lg"
        />
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between bg-gray-100 dark:bg-gray-800 rounded-lg px-4 py-3 gap-4 my-6">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex items-center gap-2 py-2">
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
              {t("allVisits.totalVisits", "Total Visits")} |{" "}
            </span>
            <span className="text-xs font-bold text-gray-900 dark:text-white">
              {totalVisits}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
            {t("allVisits.filters.status", "Status")}
          </span>
          <div className="flex items-center gap-1 bg-gray-200 dark:bg-gray-800 rounded-lg p-0.5 px-1 py-1">
            {VISIT_STATUS_FILTER_OPTIONS.map((opt) => (
              <Button
                key={opt}
                variant={selectedStatus === opt ? "default" : "ghost"}
                size="sm"
                onClick={() => onStatusChange(opt)}
                className="cursor-pointer"
              >
                {getStatusLabel(opt)}
                {opt !== "All" && stats[opt] > 0 && (
                  <span className="ml-1 text-[10px] bg-white/20 px-1 rounded">
                    {stats[opt]}
                  </span>
                )}
              </Button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AllVisitsHeader;
