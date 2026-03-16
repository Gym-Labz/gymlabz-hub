/**
 * API de treinos do usuário - integração com GymCore Backend
 */

import { apiFetchWithAuth } from "./api";

export interface Exercise {
  id: string;
  name: string;
  muscleGroup?: string;
  description?: string;
  repetitions: number;
  sets: number;
  intervalSeconds: number;
  orderPosition: number;
  /** URL do GIF/animação do exercício (Android/Web) */
  animationLink?: string | null;
  /** URL do Lottie (iOS) */
  lottieAnimationUrl?: string | null;
}

export interface ExerciseGroup {
  id: string;
  name?: string;
  type: string;
  orderPosition: number;
  restAfterGroup: number;
  restBetweenExercises: number;
  rounds: number;
  notes?: string;
  exercises: Exercise[];
}

export interface Preset {
  lastExecutionDate?: string | null;
  exercises: Exercise[];
  groups?: ExerciseGroup[];
}

export interface TrainingListDetails {
  objetivo: string;
  observacoes: string;
  nivelDificuldade: string;
}

export interface TrainingList {
  id: string;
  name: string;
  description: string;
  details: TrainingListDetails;
  presets: Record<string, Preset>;
}

export interface Teacher {
  id: string;
  name: string;
}

export interface UserTraining {
  id: string;
  isActive: boolean;
  startDate: string;
  endDate?: string;
  notes?: string;
  /** URL do GIF/animação do treino */
  animationLink?: string | null;
  teacher: Teacher;
  trainingList: TrainingList;
}

export interface UserWithTraining {
  id: string;
  name: string;
  trainings: UserTraining[];
}

export async function getUserWithTraining(
  token: string,
  userId: string
): Promise<UserWithTraining> {
  return apiFetchWithAuth<UserWithTraining>(
    `/user-training/get-user-with-training/${userId}`,
    token,
    { method: "GET" }
  );
}

export interface AddTrainingRequest {
  userId: string;
  trainingListId: string;
  startDate: string;
  endDate?: string;
  notes?: string;
}

export interface AddTrainingResponse {
  success: boolean;
  message?: string;
  id?: string;
}

export async function addTrainingForUser(
  token: string,
  data: AddTrainingRequest
): Promise<AddTrainingResponse> {
  return apiFetchWithAuth<AddTrainingResponse>("/user-training", token, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export interface UpdateExerciseDto {
  id: string;
  customName?: string;
  customMuscleGroup?: string;
  repetitions?: number;
  sets?: number;
  intervalSeconds?: number;
  orderPosition?: number;
  presetName?: string;
}

export interface UpdateExerciseGroupDto {
  id: string;
  name?: string;
  type?: string;
  restAfterGroup?: number;
  restBetweenExercises?: number;
  rounds?: number;
  notes?: string;
  orderPosition?: number;
}

export interface UpdateTrainingRequest {
  name?: string;
  description?: string;
  details?: Record<string, unknown>;
  notes?: string;
  endDate?: string;
  exercises?: UpdateExerciseDto[];
  exerciseGroups?: UpdateExerciseGroupDto[];
}

export interface UpdateTrainingResponse {
  success: boolean;
  message?: string;
}

export async function updateUserTraining(
  token: string,
  userTrainingId: string,
  data: UpdateTrainingRequest
): Promise<UpdateTrainingResponse> {
  return apiFetchWithAuth<UpdateTrainingResponse>(
    `/user-training/${userTrainingId}`,
    token,
    {
      method: "PUT",
      body: JSON.stringify(data),
    }
  );
}
