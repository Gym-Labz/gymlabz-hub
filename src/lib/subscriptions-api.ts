/**
 * API de assinaturas (planos dos alunos) - integração com GymCore Backend
 */

import { apiFetchWithAuth } from "./api";

export interface PlanInfo {
  id: string;
  name: string;
  price: number;
  billingCycle: string;
  /** Plano full: inclui todas as aulas extras sem pagamento adicional */
  includesClasses?: boolean;
}

export interface Subscription {
  id: string;
  userId: string;
  plan: PlanInfo;
  gymId: string;
  startDate: string;
  endDate: string;
  status: string;
  autoRenew: boolean;
}

export interface AddSubscriptionRequest {
  userId: string;
  planId: string;
  startDate: string;
  endDate?: string;
  status?: string;
  autoRenew?: boolean;
}

export async function getSubscriptions(
  token: string
): Promise<{ success: boolean; data: Subscription[] }> {
  return apiFetchWithAuth("/subscriptions", token, { method: "GET" });
}

export async function addSubscription(
  token: string,
  data: AddSubscriptionRequest
): Promise<{ success: boolean; data: Subscription }> {
  const body = {
    ...data,
    startDate: new Date(data.startDate),
    endDate: data.endDate ? new Date(data.endDate) : undefined,
  };
  return apiFetchWithAuth("/subscriptions", token, {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export async function getUserSubscriptions(
  token: string,
  userId: string
): Promise<{ success: boolean; data: Subscription[] }> {
  return apiFetchWithAuth(`/subscriptions/user/${userId}`, token, {
    method: "GET",
  });
}

export interface UpdateSubscriptionRequest {
  planId?: string;
  endDate?: string;
  status?: string;
  autoRenew?: boolean;
}

export async function updateSubscription(
  token: string,
  subscriptionId: string,
  data: UpdateSubscriptionRequest
): Promise<{ success: boolean; data: Subscription }> {
  const body = {
    ...data,
    endDate: data.endDate ? new Date(data.endDate) : undefined,
  };
  return apiFetchWithAuth(`/subscriptions/${subscriptionId}`, token, {
    method: "PUT",
    body: JSON.stringify(body),
  });
}
