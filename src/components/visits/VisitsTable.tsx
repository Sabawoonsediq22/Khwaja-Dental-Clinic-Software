import React from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { PatientAvatar, Badge } from "../ui";
import { VisitsTableProps } from "../../types/VisitTypes";
import { Popover } from "../ui/Popover";

function formatDate(date: string | null | undefined): string {
  if (!date) return "-";
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "2-digit",
  });
}

const statusVariant: Record<string, "default" | "success" | "destructive" | "warning"> = {
  Open: "warning",
  Completed: "success",
  Cancelled: "destructive",
};

const VisitsTable: React.FC<VisitsTableProps> = ({ visits }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  if (visits.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 bg-white dark:bg-gray-800">
        <p className="text-gray-500 dark:text-gray-400 text-sm">
          {t(
            "allVisits.table.empty",
            "No visits match your current search and filters.",
          )}
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800">
      {/* Desktop Table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-gray-100 dark:bg-gray-900 border-gray-200 dark:border-gray-700">
              <th className="py-3 px-4 font-bold text-xs uppercase tracking-wider text-gray-800 dark:text-gray-400 whitespace-nowrap">
                {t("allVisits.table.no", "NO.")}
              </th>
              <th className="py-3 px-4 font-bold text-xs uppercase tracking-wider text-gray-800 dark:text-gray-400">
                {t("allVisits.table.patient", "PATIENT")}
              </th>
              <th className="py-3 px-4 font-bold text-xs uppercase tracking-wider text-gray-800 dark:text-gray-400">
                {t("allVisits.table.visitId", "VISIT ID")}
              </th>
              <th className="py-3 px-4 font-bold text-xs uppercase tracking-wider text-gray-800 dark:text-gray-400">
                {t("allVisits.table.date", "DATE")}
              </th>
              <th className="py-3 px-4 font-bold text-xs uppercase tracking-wider text-gray-800 dark:text-gray-400 hidden lg:table-cell">
                {t("allVisits.table.complaint", "COMPLAINT")}
              </th>
              <th className="py-3 px-4 font-bold text-xs uppercase tracking-wider text-gray-800 dark:text-gray-400 text-center">
                {t("allVisits.table.procedures", "PROCEDURES")}
              </th>
              <th className="py-3 px-4 font-bold text-xs uppercase tracking-wider text-gray-800 dark:text-gray-400 text-right">
                {t("allVisits.table.total", "TOTAL")}
              </th>
              <th className="py-3 px-4 font-bold text-xs uppercase tracking-wider text-gray-800 dark:text-gray-400">
                {t("allVisits.table.status", "STATUS")}
              </th>
              <th className="py-3 px-4 font-bold text-xs uppercase tracking-wider text-gray-800 dark:text-gray-400 w-16">
                {t("allVisits.table.actions", "ACTIONS")}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-700/60">
            {visits.map((visit, index) => (
              <tr
                key={`${visit.id}-${index}`}
                className="hover:bg-gray-50 dark:hover:bg-gray-700/40 transition-colors cursor-pointer"
                onClick={() => navigate(`/patients/${visit.patient_id}`)}
              >
                <td className="py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-300 whitespace-nowrap">
                  {index + 1}
                </td>
                <td className="py-3 px-4">
                  <div className="flex items-center gap-3">
                    <PatientAvatar name={visit.patient_name} size="md" />
                    <div className="flex flex-col min-w-0">
                      <span className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                        {visit.patient_name}
                      </span>
                      {visit.patient_phone && (
                        <span className="text-xs text-gray-500 dark:text-gray-400 truncate">
                          {visit.patient_phone}
                        </span>
                      )}
                    </div>
                  </div>
                </td>
                <td className="py-3 px-4 text-sm font-mono text-gray-600 dark:text-gray-300 whitespace-nowrap">
                  {visit.id}
                </td>
                <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-300 whitespace-nowrap">
                  {formatDate(visit.visit_date)}
                </td>
                <td className="py-3 px-4 text-sm text-gray-500 dark:text-gray-400 hidden lg:table-cell truncate max-w-xs">
                  {visit.chief_complaint || "-"}
                </td>
                <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-300 text-center">
                  {visit.procedures_count}
                </td>
                <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-300 text-right whitespace-nowrap">
                  {visit.total_afn > 0 || visit.total_usd > 0 ? (
                    <>
                      {visit.total_afn > 0 && <span>{visit.total_afn.toLocaleString()} AFN</span>}
                      {visit.total_afn > 0 && visit.total_usd > 0 && <span className="mx-1">/</span>}
                      {visit.total_usd > 0 && <span>${visit.total_usd.toLocaleString()}</span>}
                    </>
                  ) : (
                    <span className="text-gray-400">-</span>
                  )}
                </td>
                <td className="py-3 px-4">
                  <Badge variant={statusVariant[visit.status] || "default"}>
                    {t(`allVisits.status.${visit.status.toLowerCase()}`, visit.status)}
                  </Badge>
                </td>
                <td className="py-3 px-4" onClick={(e) => e.stopPropagation()}>
                  <Popover
                    actions={[
                      {
                        label: t("allVisits.actions.viewPatient", "View Patient"),
                        onClick: () => navigate(`/patients/${visit.patient_id}`),
                      },
                      {
                        label: t("allVisits.actions.viewProfile", "View Profile"),
                        onClick: () => navigate(`/patients/${visit.patient_id}`),
                      },
                    ]}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Card List */}
      <div className="md:hidden divide-y divide-gray-100 dark:divide-gray-700/60">
        {visits.map((visit, idx) => (
          <div
            key={`${visit.id}-${idx}`}
            className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/40 transition-colors cursor-pointer"
            onClick={() => navigate(`/patients/${visit.patient_id}`)}
          >
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <PatientAvatar name={visit.patient_name} size="md" />
                <div className="flex flex-col min-w-0">
                  <span className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                    {visit.patient_name}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400 truncate">
                    {visit.id}
                  </span>
                </div>
              </div>
              <Badge variant={statusVariant[visit.status] || "default"}>
                {t(`allVisits.status.${visit.status.toLowerCase()}`, visit.status)}
              </Badge>
            </div>
            <div className="mt-2 ml-12 grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-gray-500 dark:text-gray-400">
              <span>{formatDate(visit.visit_date)}</span>
              <span>{visit.procedures_count} {t("allVisits.procedures", "procedures")}</span>
              {visit.chief_complaint && (
                <span className="col-span-2 truncate">{visit.chief_complaint}</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default VisitsTable;
