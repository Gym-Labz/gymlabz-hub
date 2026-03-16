/**
 * API de acessos - integração com GymCore Backend
 */

import { apiFetchWithAuth } from "./api";

export interface AccessReportItem {
  id: string;
  userId?: string;
  userName: string;
  accessMethod: string;
  accessStatus: string;
  accessType: string;
  accessDate: string;
  deviceId?: string;
  deviceLocation?: string;
  identifierUsed?: string;
  notes?: string;
}

export interface AccessReportPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface AccessReportSummary {
  totalAccess: number;
  totalUsers: number;
  accessByMethod: Record<string, number>;
  accessByStatus: Record<string, number>;
  accessByHour: Record<string, number>;
  successRate: number;
  peakHours: string[];
}

export interface GetAccessReportsResponse {
  data: AccessReportItem[];
  pagination: AccessReportPagination;
  summary: AccessReportSummary;
}

export interface GetAccessReportsFilters {
  startDate?: string;
  endDate?: string;
  userId?: string;
  accessMethod?: string;
  page?: number;
  limit?: number;
}

export async function getAccessReports(
  token: string,
  filters?: GetAccessReportsFilters
): Promise<GetAccessReportsResponse> {
  const params = new URLSearchParams();
  if (filters?.startDate) params.set("startDate", filters.startDate);
  if (filters?.endDate) params.set("endDate", filters.endDate);
  if (filters?.userId) params.set("userId", filters.userId);
  if (filters?.accessMethod) params.set("accessMethod", filters.accessMethod);
  if (filters?.page != null) params.set("page", String(filters.page));
  if (filters?.limit != null) params.set("limit", String(filters.limit));

  const query = params.toString();
  const path = `/access-control/reports${query ? `?${query}` : ""}`;
  return apiFetchWithAuth<GetAccessReportsResponse>(path, token, { method: "GET" });
}

export async function allowAccess(
  token: string,
  userId: string
): Promise<{ success: boolean; message: string; accessId?: string }> {
  return apiFetchWithAuth("/access-control/allow-access", token, {
    method: "POST",
    body: JSON.stringify({ userId }),
  });
}
