/**
 * API de aulas - integração com GymCore Backend
 */

import { apiFetchWithAuth } from "./api";

export interface GymClass {
  id: string;
  name: string;
  type: string;
  instructorName: string;
  scheduleTime: string;
  location: string;
  daysOfWeek: number[];
  maxSpots: number;
  price: number;
  isActive: boolean;
  gymId: string;
  enrolledCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface GymClassEnrollment {
  id: string;
  gymClassId: string;
  userId: string;
  enrolledAt: string;
  status: string;
  user?: { id: string; firstName: string; lastName: string };
  gymClass?: { id: string; name: string; type: string; scheduleTime: string; location: string; price?: number };
}

export interface CreateGymClassRequest {
  name: string;
  type: string;
  instructorName: string;
  scheduleTime: string;
  location: string;
  daysOfWeek: number[];
  maxSpots: number;
  price?: number;
}

export interface UpdateGymClassRequest extends Partial<CreateGymClassRequest> {}

const DAYS_LABELS: Record<number, string> = {
  0: "Dom",
  1: "Seg",
  2: "Ter",
  3: "Qua",
  4: "Qui",
  5: "Sex",
  6: "Sáb",
};

export function getDaysLabel(days: number[]): string {
  if (!days?.length) return "—";
  return days.map((d) => DAYS_LABELS[d] ?? d).join(", ");
}

export async function getGymClasses(token: string): Promise<GymClass[]> {
  const data = await apiFetchWithAuth<GymClass[]>("/gym-classes", token, {
    method: "GET",
  });
  return Array.isArray(data) ? data : [];
}

export async function createGymClass(
  token: string,
  data: CreateGymClassRequest
): Promise<GymClass> {
  return apiFetchWithAuth<GymClass>("/gym-classes", token, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateGymClass(
  token: string,
  id: string,
  data: UpdateGymClassRequest
): Promise<GymClass> {
  return apiFetchWithAuth<GymClass>(`/gym-classes/${id}`, token, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function deleteGymClass(
  token: string,
  id: string
): Promise<void> {
  await apiFetchWithAuth(`/gym-classes/${id}`, token, {
    method: "DELETE",
  });
}

export async function getEnrollmentsByClass(
  token: string,
  classId: string
): Promise<GymClassEnrollment[]> {
  const data = await apiFetchWithAuth<GymClassEnrollment[]>(
    `/gym-classes/${classId}/enrollments`,
    token,
    { method: "GET" }
  );
  return Array.isArray(data) ? data : [];
}

export async function getEnrollmentsByUser(
  token: string,
  userId: string
): Promise<GymClassEnrollment[]> {
  const data = await apiFetchWithAuth<GymClassEnrollment[]>(
    `/gym-classes/user/${userId}/enrollments`,
    token,
    { method: "GET" }
  );
  return Array.isArray(data) ? data : [];
}

export async function enrollStudent(
  token: string,
  classId: string,
  userId: string
): Promise<GymClassEnrollment> {
  return apiFetchWithAuth<GymClassEnrollment>(
    `/gym-classes/${classId}/enroll`,
    token,
    {
      method: "POST",
      body: JSON.stringify({ userId }),
    }
  );
}

export async function removeEnrollment(
  token: string,
  enrollmentId: string
): Promise<void> {
  await apiFetchWithAuth(`/gym-classes/enrollments/${enrollmentId}`, token, {
    method: "DELETE",
  });
}
