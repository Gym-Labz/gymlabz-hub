/**
 * API de comunicação - integração com GymCore Backend (rotas employee)
 */

import { apiFetchWithAuth } from "./api";

export type CommunicationType = "notification" | "alert" | "information" | "promotion" | "reminder";
export type CommunicationSource = "gym" | "system";
export type CommunicationStatus = "pending" | "sent" | "delivered" | "read" | "failed";

export interface CommunicationForEmployee {
  id: string;
  title: string;
  content: string;
  type: CommunicationType;
  source: CommunicationSource;
  status: CommunicationStatus;
  scheduledDate: string | null;
  startDate: string | null;
  endDate: string | null;
  sentDate: string | null;
  createdById: string;
  recipientCount: number;
  readCount: number;
  likedCount: number;
  imageUrl?: string | null;
}

export interface CreateCommunicationRequest {
  title: string;
  content: string;
  type: CommunicationType;
  source: CommunicationSource;
  status: CommunicationStatus;
  scheduledDate?: string;
  startDate?: string;
  endDate?: string;
  isGlobal?: boolean;
  metadata?: Record<string, unknown>;
}

export interface UpdateCommunicationRequest {
  title?: string;
  content?: string;
  type?: CommunicationType;
  source?: CommunicationSource;
  status?: CommunicationStatus;
  scheduledDate?: string;
  startDate?: string;
  endDate?: string;
  isGlobal?: boolean;
  metadata?: Record<string, unknown>;
}

export async function getCommunicationsForEmployee(
  token: string,
  options?: { limit?: number; offset?: number }
): Promise<CommunicationForEmployee[]> {
  const params = new URLSearchParams();
  if (options?.limit != null) params.set("limit", String(options.limit));
  if (options?.offset != null) params.set("offset", String(options.offset));
  const query = params.toString();
  const path = `/communication/get-communication-for-employee${query ? `?${query}` : ""}`;
  return apiFetchWithAuth<CommunicationForEmployee[]>(path, token, { method: "GET" });
}

export async function getCommunicationById(
  token: string,
  communicationId: string
): Promise<CommunicationForEmployee & { metadata?: Record<string, unknown> }> {
  return apiFetchWithAuth(`/communication/${communicationId}`, token, { method: "GET" });
}

export async function createCommunication(
  token: string,
  data: CreateCommunicationRequest,
  imageFile?: File | null
): Promise<{ success: boolean; id: string }> {
  if (imageFile) {
    const formData = new FormData();
    formData.append("title", data.title);
    formData.append("content", data.content);
    formData.append("type", data.type);
    formData.append("source", data.source);
    formData.append("status", data.status);
    if (data.scheduledDate) formData.append("scheduledDate", data.scheduledDate);
    if (data.startDate) formData.append("startDate", data.startDate);
    if (data.endDate) formData.append("endDate", data.endDate);
    if (data.isGlobal != null) formData.append("isGlobal", String(data.isGlobal));
    if (data.metadata) formData.append("metadata", JSON.stringify(data.metadata));
    formData.append("image", imageFile);
    return apiFetchWithAuth("/communication", token, {
      method: "POST",
      body: formData,
    });
  }
  return apiFetchWithAuth("/communication", token, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateCommunication(
  token: string,
  communicationId: string,
  data: UpdateCommunicationRequest
): Promise<{ success: boolean }> {
  return apiFetchWithAuth(`/communication/${communicationId}`, token, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function deleteCommunication(
  token: string,
  communicationId: string
): Promise<{ success: boolean }> {
  return apiFetchWithAuth(`/communication/${communicationId}`, token, {
    method: "DELETE",
  });
}
