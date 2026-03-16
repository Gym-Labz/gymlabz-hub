/**
 * API de listas de treino (presets) - integração com GymCore Backend
 */

import { apiFetchWithAuth } from "./api";

export interface TrainingListExercise {
  id: string;
  name: string;
  muscleGroup?: string;
  presetName: string;
  repetitions: number;
  sets: number;
  intervalSeconds: number;
  orderPosition: number;
  animationLink?: string | null;
}

export interface TrainingListGroupExercise {
  id: string;
  name: string;
  muscleGroup?: string;
  repetitions: number;
  sets: number;
  intervalSeconds: number;
  orderPosition: number;
  groupOrder: number;
  animationLink?: string | null;
}

export interface TrainingListGroup {
  id: string;
  name?: string;
  type: string;
  orderPosition: number;
  restAfterGroup: number;
  restBetweenExercises: number;
  rounds: number;
  notes?: string | null;
  exercises: TrainingListGroupExercise[];
}

export interface TrainingListItem {
  id: string;
  name: string;
  description: string;
  details?: {
    objetivo?: string;
    observacoes?: string;
    nivelDificuldade?: string;
  };
  isActive: boolean;
  exercises: TrainingListExercise[];
  exerciseGroups?: TrainingListGroup[];
}

export interface GetTrainingListsResponse {
  success: boolean;
  data: TrainingListItem[];
}

export async function getTrainingLists(
  token: string
): Promise<TrainingListItem[]> {
  const res = await apiFetchWithAuth<GetTrainingListsResponse | { data: TrainingListItem[] }>(
    "/training-lists",
    token,
    { method: "GET" }
  );
  if (Array.isArray(res)) return res;
  if (res && "data" in res && Array.isArray(res.data)) return res.data;
  return [];
}
