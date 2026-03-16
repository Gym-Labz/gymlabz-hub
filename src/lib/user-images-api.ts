/**
 * API de imagens do usuário - integração com GymCore Backend
 */

import { apiFetchWithAuth } from "./api";

export interface UserImage {
  id: string;
  type: string;
  imageUrl: string;
  thumbnailUrl?: string;
  description?: string;
  takenAt: string;
  uploadedAt: string;
  isPrimary: boolean;
  fileSize: number;
  width?: number;
  height?: number;
}

export interface GetUserImagesResponse {
  images: UserImage[];
  total: number;
  limit: number;
  offset: number;
}

export async function getUserImages(
  token: string,
  userId: string,
  options?: { type?: string; limit?: number; offset?: number }
): Promise<GetUserImagesResponse> {
  const params = new URLSearchParams();
  if (options?.type) params.set("type", options.type);
  if (options?.limit != null) params.set("limit", String(options.limit));
  if (options?.offset != null) params.set("offset", String(options.offset));
  const query = params.toString();
  const path = `/user-images/user/${userId}${query ? `?${query}` : ""}`;
  return apiFetchWithAuth<GetUserImagesResponse>(path, token, { method: "GET" });
}

export async function uploadUserImage(
  token: string,
  userId: string,
  imageFile: File,
  options?: { type?: string; description?: string; takenAt?: string }
): Promise<{ id: string }> {
  const formData = new FormData();
  formData.append("image", imageFile);
  formData.append("type", options?.type || "profile");
  if (options?.description) formData.append("description", options.description);
  if (options?.takenAt) formData.append("takenAt", options.takenAt);

  return apiFetchWithAuth<{ id: string }>(`/user-images/upload/${userId}`, token, {
    method: "POST",
    body: formData,
  });
}

export async function setPrimaryImage(
  token: string,
  imageId: string
): Promise<{ success: boolean }> {
  return apiFetchWithAuth<{ success: boolean }>(
    `/user-images/${imageId}/set-primary`,
    token,
    { method: "PUT" }
  );
}

export async function deleteUserImage(
  token: string,
  imageId: string
): Promise<{ success: boolean }> {
  return apiFetchWithAuth<{ success: boolean }>(`/user-images/${imageId}`, token, {
    method: "DELETE",
  });
}
