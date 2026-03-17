/**
 * API financeira e relatórios - integração com GymCore Backend
 */

import { apiFetchWithAuth } from "./api";

// Relatório financeiro
export interface FinancialReportSummary {
  totalRevenue: number;
  paidRevenue: number;
  pendingRevenue: number;
  overdueRevenue: number;
  averageRevenuePerUser: number;
  revenueGrowthPercentage: number;
}

export interface FinancialReport {
  summary: FinancialReportSummary;
  revenueByPlan: Record<string, number>;
  paymentStatus: { paid: number; pending: number; overdue: number };
  monthlyRevenueTrend: { month: string; revenue: number; growth: number }[];
  delinquencyAnalysis: {
    totalOverdue: number;
    overdueCount: number;
    averageOverdueAmount: number;
    recoveryRate: number;
  };
  topPayingMembers: {
    userId: string;
    userName: string;
    totalPaid: number;
    planType: string;
  }[];
}

// Dashboard geral
export interface DashboardReport {
  totalMembers: number;
  activeMembers: number;
  newMembersThisMonth: number;
  memberGrowthPercentage: number;
  monthlyRevenue: number;
  revenueGrowthPercentage: number;
  pendingPayments: number;
  dailyAverageAccess: number;
  accessGrowthPercentage: number;
  peakHour: string;
  onlineDevices: number;
  totalDevices: number;
  activeTrainingPlans: number;
  totalTrainers: number;
  totalEmployees?: number;
  totalCommunications?: number;
}

// Pagamento
export interface Payment {
  id: string;
  amount: number;
  paymentDate: string | null;
  dueDate: string;
  status: string;
  transactionId: string | null;
  notes: string | null;
  user: { id: string; firstName: string; lastName: string } | null;
  plan: { id: string; name: string; price: number } | null;
  paymentMethod: { id: string; name: string; type: string } | null;
  createdAt: string;
  updatedAt: string;
  receivedByName?: string;
}

export interface PaymentListResponse {
  payments: Payment[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface OverduePaymentsResponse {
  payments: Payment[];
  summary: {
    totalOverdue: number;
    totalAmount: number;
    averageDelayDays: number;
  };
}

export interface PaymentMethod {
  id: string;
  name: string;
  type: string;
}

// Relatórios
export interface MembersReport {
  summary: {
    totalMembers: number;
    activeMembers: number;
    inactiveMembers: number;
    newMembersThisMonth: number;
    churnRate: number;
    averageAge?: number;
  };
  membersByPlan: Record<string, number>;
  membersByStatus: Record<string, number>;
  genderDistribution: Record<string, number>;
  ageDistribution: Record<string, number>;
  membershipTrends: { month: string; newMembers: number; canceledMembers: number; netGrowth: number }[];
  retentionAnalysis: Record<string, number>;
}

export interface AccessReport {
  summary: {
    totalAccess: number;
    successfulAccess: number;
    failedAccess: number;
    uniqueUsers: number;
    averageDailyAccess: number;
    accessGrowthPercentage?: number;
  };
  accessTrends: { date: string; totalAccess: number; successfulAccess: number }[];
  peakHours: { hour: string; accessCount: number }[];
  accessByDevice: { deviceId: string; deviceName: string; location: string; accessCount: number; successRate: number }[];
  accessByMethod: Record<string, number>;
  topActiveUsers: { userId: string; userName: string; accessCount: number; lastAccess: string }[];
  capacityAnalysis?: { peakCapacity: number; averageCapacity: number; utilizationRate: number };
}

export interface PeakHoursReport {
  hourlyDistribution: { hour: string; accessCount: number; percentage: number }[];
  dailyDistribution: { dayOfWeek: string; totalAccess: number; peakHour: string; averageAccessPerHour: number }[];
  peakPeriods: { morning: { start: string; end: string; avgAccess: number }; afternoon: { start: string; end: string; avgAccess: number }; evening: { start: string; end: string; avgAccess: number } };
  recommendations: { type: string; message: string; priority: string }[];
  capacityUtilization?: { hour: string; utilizationRate: number; status: string }[];
}

export interface CapacityReport {
  currentCapacity: { totalMembers: number; maxCapacity: number; utilizationRate: number; status: string };
  growthProjections: { next30Days: number; next60Days: number; next90Days: number; yearEnd: number };
  capacityByArea: { area: string; currentUsage: number; maxCapacity: number; utilizationRate: number; recommendedAction: string }[];
  membershipTrends: { growthRate: number; seasonalPatterns: { month: string; expectedGrowth: number }[] };
  recommendations: { type: string; priority: string; message: string; estimatedCost?: number; expectedROI?: number }[];
}

// Funções da API
export async function getFinancialReport(
  token: string,
  filters?: { startDate?: string; endDate?: string }
): Promise<FinancialReport> {
  const params = new URLSearchParams();
  if (filters?.startDate) params.set("startDate", filters.startDate);
  if (filters?.endDate) params.set("endDate", filters.endDate);
  const query = params.toString();
  const path = `/reports/financial${query ? `?${query}` : ""}`;
  return apiFetchWithAuth<FinancialReport>(path, token, { method: "GET" });
}

export async function getDashboardReport(token: string): Promise<DashboardReport> {
  return apiFetchWithAuth<DashboardReport>("/reports/dashboard", token, {
    method: "GET",
  });
}

export async function getPaymentsByGym(
  token: string,
  options?: { limit?: number; offset?: number; status?: string }
): Promise<PaymentListResponse> {
  const params = new URLSearchParams();
  if (options?.limit != null) params.set("limit", String(options.limit));
  if (options?.offset != null) params.set("offset", String(options.offset));
  if (options?.status) params.set("status", options.status);
  const query = params.toString();
  const path = `/payments/gym${query ? `?${query}` : ""}`;
  return apiFetchWithAuth<PaymentListResponse>(path, token, { method: "GET" });
}

export async function getOverduePayments(token: string): Promise<OverduePaymentsResponse> {
  return apiFetchWithAuth<OverduePaymentsResponse>("/payments/overdue", token, {
    method: "GET",
  });
}

export async function getPaymentsByUser(
  token: string,
  userId: string,
  options?: { limit?: number; offset?: number }
): Promise<PaymentListResponse> {
  const params = new URLSearchParams();
  if (options?.limit != null) params.set("limit", String(options.limit));
  if (options?.offset != null) params.set("offset", String(options.offset));
  const query = params.toString();
  const path = `/payments/user/${userId}${query ? `?${query}` : ""}`;
  return apiFetchWithAuth<PaymentListResponse>(path, token, { method: "GET" });
}

export async function getPaymentMethods(token: string): Promise<PaymentMethod[]> {
  return apiFetchWithAuth<PaymentMethod[]>("/payments/payment-methods", token, {
    method: "GET",
  });
}

export interface CreatePaymentMethodRequest {
  name: string;
  type: string;
  description?: string;
  isActive?: boolean;
}

export async function createPaymentMethod(
  token: string,
  data: CreatePaymentMethodRequest
): Promise<{ id: string; message: string; status: string }> {
  return apiFetchWithAuth("/payments/payment-methods", token, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export interface CreateSubscriptionPaymentRequest {
  userId: string;
  subscriptionId: string;
  paymentMethodId: string;
  amount: number;
  paymentDate: string;
  dueDate?: string;
  notes?: string;
}

export async function createSubscriptionPayment(
  token: string,
  data: CreateSubscriptionPaymentRequest
): Promise<{ id: string; message: string; status: string }> {
  return apiFetchWithAuth("/payments/subscription-payment", token, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export interface CreateExtraClassPaymentRequest {
  userId: string;
  paymentMethodId: string;
  gymClassId: string;
  gymClassName: string;
  amount: number;
  paymentDate: string;
  notes?: string;
}

export async function createExtraClassPayment(
  token: string,
  data: CreateExtraClassPaymentRequest
): Promise<{ id: string; message: string; status: string }> {
  return apiFetchWithAuth("/payments/extra-class-payment", token, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function getMembersReport(
  token: string,
  filters?: { startDate?: string; endDate?: string; status?: string; planType?: string }
): Promise<MembersReport> {
  const params = new URLSearchParams();
  if (filters?.startDate) params.set("startDate", filters.startDate);
  if (filters?.endDate) params.set("endDate", filters.endDate);
  if (filters?.status) params.set("status", filters.status);
  if (filters?.planType) params.set("planType", filters.planType);
  const query = params.toString();
  return apiFetchWithAuth<MembersReport>(`/reports/members${query ? `?${query}` : ""}`, token, {
    method: "GET",
  });
}

export async function getAccessReport(
  token: string,
  filters?: { startDate?: string; endDate?: string; deviceId?: string; accessMethod?: string }
): Promise<AccessReport> {
  const params = new URLSearchParams();
  if (filters?.startDate) params.set("startDate", filters.startDate);
  if (filters?.endDate) params.set("endDate", filters.endDate);
  if (filters?.deviceId) params.set("deviceId", filters.deviceId);
  if (filters?.accessMethod) params.set("accessMethod", filters.accessMethod);
  const query = params.toString();
  return apiFetchWithAuth<AccessReport>(`/reports/access${query ? `?${query}` : ""}`, token, {
    method: "GET",
  });
}

export async function getPeakHoursReport(
  token: string,
  days?: number
): Promise<PeakHoursReport> {
  const params = days != null ? `?days=${days}` : "";
  return apiFetchWithAuth<PeakHoursReport>(`/reports/analytics/peak-hours${params}`, token, {
    method: "GET",
  });
}

export async function getCapacityReport(token: string): Promise<CapacityReport> {
  return apiFetchWithAuth<CapacityReport>("/reports/analytics/capacity", token, {
    method: "GET",
  });
}
