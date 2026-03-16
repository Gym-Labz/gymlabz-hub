/**
 * API de dados da academia - integração com GymCore Backend
 */

import { apiFetchWithAuth } from "./api";

export interface GymData {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  socialMedia?: string;
  schedule: string;
  maxCapacity?: number | null;
  cnpj: string;
  username: string;
  manager?: Record<string, unknown>;
  extras?: Record<string, unknown>[];
  gymConfig?: Record<string, unknown>[];
  isActive: boolean;
}

export interface UpdateGymData {
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
  socialMedia?: string;
  schedule?: string;
  maxCapacity?: number | null;
  manager?: {
    name?: string;
    email?: string;
    phone?: string;
    position?: string;
  };
}

export async function getGym(token: string): Promise<GymData> {
  return apiFetchWithAuth<GymData>("/gym/me", token);
}

export async function updateGym(token: string, data: UpdateGymData): Promise<GymData> {
  return apiFetchWithAuth<GymData>("/gym/me", token, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}
