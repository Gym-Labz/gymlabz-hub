/**
 * API de usuários (alunos) - integração com GymCore Backend
 */

import { apiFetchWithAuth } from "./api";

export interface UserContact {
  email: string;
  phone: string;
}

export interface UserByGymId {
  id: string;
  firstName: string;
  lastName: string;
  cpf: string;
  birthDate?: string;
  isActive: boolean;
  contact: UserContact | null;
}

export interface ResponseUserByGymId {
  users: UserByGymId[];
}

export interface CreateUserRequest {
  firstName: string;
  lastName: string;
  gender: string;
  cpf: string;
  username: string;
  birthDate?: string;
  contact?: { email?: string; phone?: string; emergencyContactName?: string; emergencyContactPhone?: string };
  address?: { street?: string; number?: string; complement?: string; neighborhood?: string; city?: string; state?: string; postalCode?: string };
  healthInformation?: { weight?: string; height?: string; preExistingConditions?: string; hasInjuryHistory?: boolean; injuryHistory?: string; medicalCertificateProvided?: boolean };
}

export interface UpdateUserRequest {
  username?: string;
  email?: string;
  password?: string;
  birthDate?: string;
  contact?: {
    email?: string;
    phone?: string;
    emergencyContactName?: string;
    emergencyContactPhone?: string;
  };
  address?: {
    street?: string;
    number?: string;
    complement?: string;
    neighborhood?: string;
    city?: string;
    state?: string;
    postalCode?: string;
  };
  healthInformation?: {
    weight?: string;
    height?: string;
    preExistingConditions?: string;
    hasInjuryHistory?: boolean;
    injuryHistory?: string;
    medicalCertificateProvided?: boolean;
  };
}

export interface UserById {
  id: string;
  firstName: string;
  lastName: string;
  gender: string;
  cpf: string;
  isActive: boolean;
  birthDate?: string;
  username: string;
  contact?: {
    email?: string;
    phone?: string;
    emergencyContactName?: string;
    emergencyContactPhone?: string;
  } | null;
  address?: {
    street?: string;
    number?: string;
    complement?: string;
    neighborhood?: string;
    city?: string;
    state?: string;
    postalCode?: string;
  } | null;
  healthInformation?: {
    weight?: string;
    height?: string;
    preExistingConditions?: string;
    hasInjuryHistory?: boolean;
    injuryHistory?: string;
    medicalCertificateProvided?: boolean;
  } | null;
}

export async function getUsersByGymId(token: string): Promise<ResponseUserByGymId> {
  return apiFetchWithAuth<ResponseUserByGymId>("/users/get-user-by-gym-id", token, {
    method: "GET",
  });
}

export async function getUserById(
  token: string,
  userId: string
): Promise<UserById> {
  const res = await apiFetchWithAuth<{ user: UserById }>(`/users/${userId}`, token, {
    method: "GET",
  });
  return res.user;
}

export async function createUser(
  token: string,
  data: CreateUserRequest
): Promise<{ success: boolean; id: string }> {
  return apiFetchWithAuth("/users/register", token, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateUser(
  token: string,
  userId: string,
  data: UpdateUserRequest
): Promise<{ success: boolean }> {
  return apiFetchWithAuth(`/users/update-register/${userId}`, token, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function removeUserFromGym(
  token: string,
  userId: string
): Promise<{ success: boolean }> {
  return apiFetchWithAuth(`/user-gyms/${userId}`, token, {
    method: "DELETE",
  });
}
