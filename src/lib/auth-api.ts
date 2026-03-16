/**
 * API de autenticação - integração com GymCore Backend
 */

import { apiFetch } from "./api";

export interface EmployeeSignInRequest {
  document: string;
  password: string;
  gymId?: string;
}

export interface SignInSuccessResponse {
  type: "success";
  access_token: string;
}

export interface MultipleGymsResponse {
  type: "multiple_gyms";
  message: string;
  employeeId: string;
  gyms: { id: string; name: string; relationId: string; metadata?: Record<string, unknown> }[];
}

export type EmployeeSignInResponse = SignInSuccessResponse | MultipleGymsResponse;

export async function employeeSignIn(
  data: EmployeeSignInRequest
): Promise<EmployeeSignInResponse> {
  return apiFetch<EmployeeSignInResponse>("/auth/employee-signin", {
    method: "POST",
    body: JSON.stringify(data),
  });
}
