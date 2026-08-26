import type { VisitListItem } from "./ApiTypes";

export type VisitStatusFilter = "All" | "Open" | "Completed" | "Cancelled";

export const VISIT_STATUS_FILTER_OPTIONS: VisitStatusFilter[] = ["All", "Open", "Completed", "Cancelled"];

export interface AllVisitsHeaderProps {
  totalVisits: number;
  openCount: number;
  completedCount: number;
  cancelledCount: number;
  searchQuery: string;
  selectedStatus: VisitStatusFilter;
  onSearchChange: (query: string) => void;
  onStatusChange: (status: VisitStatusFilter) => void;
}

export interface VisitsTableProps {
  visits: VisitListItem[];
}
