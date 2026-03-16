/**
 * API de funcionários (employees) - integração com GymCore Backend
 */

import { apiFetchWithAuth } from "./api";

export type ProfileEmployee = "MANAGER" | "TEACHER" | "RECEPTIONIST";

export interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  username: string;
  profile: ProfileEmployee;
  gender?: string;
  phoneNumber?: string;
  hiringDate?: string;
  position?: string | null;
  isActive: boolean;
}

export interface CreateEmployeeRequest {
  firstName: string;
  lastName: string;
  email: string;
  username: string;
  password?: string;
  cpf: string;
  profile: ProfileEmployee;
  gender?: string;
  phoneNumber?: string;
  hiringDate?: string;
  position?: string;
  isActive?: boolean;
}

export interface UpdateEmployeeRequest {
  firstName?: string;
  lastName?: string;
  email?: string;
  username?: string;
  password?: string;
  profile?: ProfileEmployee;
  gender?: string;
  phoneNumber?: string;
  hiringDate?: string;
  position?: string;
  isActive?: boolean;
}

export async function getEmployees(token: string): Promise<Employee[]> {
  const res = await apiFetchWithAuth<{ employees: Employee[] }>(
    "/employees",
    token,
    { method: "GET" }
  );
  return res.employees;
}

export async function getEmployeeById(
  token: string,
  id: string
): Promise<Employee & { cpf?: string }> {
  return apiFetchWithAuth(`/employees/get-employee-by-id/${id}`, token, {
    method: "GET",
  });
}

export async function createEmployee(
  token: string,
  data: CreateEmployeeRequest
): Promise<{ success: boolean; id: string }> {
  return apiFetchWithAuth("/employees", token, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateEmployee(
  token: string,
  employeeId: string,
  data: UpdateEmployeeRequest
): Promise<{ success: boolean }> {
  return apiFetchWithAuth(`/employees/${employeeId}`, token, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}
