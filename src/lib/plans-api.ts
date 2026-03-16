/**
 * API de planos - integração com GymCore Backend
 */

import { apiFetchWithAuth } from "./api";

export type BillingCycle = "monthly" | "quarterly" | "semiannual" | "annual";

export type PlanBenefit =
  | { name?: string; title?: string; description?: string }
  | string;

export interface Plan {
  id: string;
  name: string;
  description: string | null;
  price: number;
  billingCycle: BillingCycle;
  durationDays: number;
  signupFee: number;
  gymId: string;
  createdAt: string;
  updatedAt: string;
  includesClasses?: boolean;
  maxVisitsPerMonth?: number;
  accessHours?: string | null;
  benefits?: PlanBenefit[];
}

export interface CreatePlanRequest {
  name: string;
  description?: string;
  price: number;
  billingCycle: BillingCycle;
  durationDays: number;
  signupFee?: number;
  /** Plano full: inclui todas as aulas extras sem pagamento adicional */
  includesClasses?: boolean;
}

export interface UpdatePlanRequest {
  name?: string;
  description?: string;
  price?: number;
  billingCycle?: BillingCycle;
  durationDays?: number;
  signupFee?: number;
  /** Plano full: inclui todas as aulas extras sem pagamento adicional */
  includesClasses?: boolean;
}

const BILLING_CYCLE_DAYS: Record<BillingCycle, number> = {
  monthly: 30,
  quarterly: 90,
  semiannual: 180,
  annual: 365,
};

export function getDurationDaysForBillingCycle(cycle: BillingCycle): number {
  return BILLING_CYCLE_DAYS[cycle];
}

export async function getPlans(token: string): Promise<Plan[]> {
  const res = await apiFetchWithAuth<{ success: boolean; data: Plan[] }>(
    "/plans",
    token,
    { method: "GET" }
  );
  return res.data ?? [];
}

export async function createPlan(
  token: string,
  data: CreatePlanRequest
): Promise<{ success: boolean; message: string; data: Plan }> {
  return apiFetchWithAuth("/plans", token, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updatePlan(
  token: string,
  id: string,
  data: UpdatePlanRequest
): Promise<{ success: boolean; message: string; data: Plan }> {
  return apiFetchWithAuth(`/plans/${id}`, token, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function deletePlan(
  token: string,
  id: string
): Promise<{ success: boolean; message: string }> {
  return apiFetchWithAuth(`/plans/${id}`, token, {
    method: "DELETE",
  });
}
