import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, Loader2, Dumbbell, Plus, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import logo from "@/assets/gymlabz-logo.png";
import { useAuth } from "@/contexts/AuthContext";
import {
  getUserWithTraining,
  addTrainingForUser,
  updateUserTraining,
  type UserWithTraining,
  type UserTraining,
} from "@/lib/user-training-api";
import { getTrainingLists, type TrainingListItem } from "@/lib/training-lists-api";

interface Aluno {
  id: string;
  nome: string;
  email: string;
  plano: string;
  status: "ativo" | "inativo";
  criadoEm: string;
}

type Mode = "edit" | "create";

interface LocationState {
  aluno: Aluno;
  trainingData?: UserWithTraining;
  trainingId?: string;
}

const EditarTreino = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { token } = useAuth();
  const state = location.state as LocationState | null;

  const [mode, setMode] = useState<Mode>("edit");
  const [aluno, setAluno] = useState<Aluno | null>(null);
  const [training, setTraining] = useState<UserTraining | null>(null);
  const [trainingLists, setTrainingLists] = useState<TrainingListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form - edit
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [notes, setNotes] = useState("");
  const [exercisesEdit, setExercisesEdit] = useState<
    { id: string; name: string; presetName: string; repetitions: number; sets: number; intervalSeconds: number }[]
  >([]);

  // Form - create
  const [selectedListId, setSelectedListId] = useState("");
  const [startDate, setStartDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [endDate, setEndDate] = useState("");
  const [notesCreate, setNotesCreate] = useState("");

  useEffect(() => {
    if (!state?.aluno || !token) {
      navigate("/alunos", { replace: true });
      return;
    }
    setAluno(state.aluno);

    const hasTraining = state.trainingData?.trainings?.some((t) => t.isActive);
    const ut = hasTraining && state.trainingId
      ? state.trainingData!.trainings.find(
          (t) => t.id === state.trainingId && t.isActive
        )
      : null;

    if (ut) {
      setTraining(ut);
      setMode("edit");
      setName(ut.trainingList.name);
      setDescription(ut.trainingList.description || "");
      setNotes(ut.notes || "");
      const flat: { id: string; name: string; presetName: string; repetitions: number; sets: number; intervalSeconds: number }[] = [];
      if (ut.trainingList.presets) {
        Object.entries(ut.trainingList.presets).forEach(
          ([presetName, preset]) => {
            preset.exercises?.forEach((ex) => {
              flat.push({
                id: ex.id,
                name: ex.name,
                presetName,
                repetitions: ex.repetitions,
                sets: ex.sets,
                intervalSeconds: ex.intervalSeconds,
              });
            });
            preset.groups?.forEach((g) => {
              g.exercises?.forEach((ex) => {
                flat.push({
                  id: ex.id,
                  name: ex.name,
                  presetName,
                  repetitions: ex.repetitions,
                  sets: ex.sets,
                  intervalSeconds: ex.intervalSeconds,
                });
              });
            });
          }
        );
      }
      setExercisesEdit(flat);
    } else {
      setMode("create");
    }

    getTrainingLists(token)
      .then((lists) => {
        setTrainingLists(lists);
        if (lists.length > 0) {
          setSelectedListId(lists[0].id);
        }
      })
      .catch((err) => {
        setError((err as { message?: string }).message || "Erro ao carregar presets.");
      })
      .finally(() => setLoading(false));
  }, [state, token, navigate]);

  const handleSaveEdit = async () => {
    if (!token || !training) return;
    setSaving(true);
    setError(null);
    try {
      await updateUserTraining(token, training.id, {
        name: name.trim(),
        description: description.trim(),
        notes: notes.trim() || undefined,
        // Nota: atualização de exercícios individuais requer userTrainingExerciseId no backend
      });
      navigate("/alunos", { state: { refreshTraining: true } });
    } catch (err: unknown) {
      const msg = (err as { message?: string | string[] }).message;
      setError(
        Array.isArray(msg) ? msg.join(" ") : (msg || "Erro ao salvar treino.")
      );
    } finally {
      setSaving(false);
    }
  };

  const handleCreate = async () => {
    if (!token || !aluno || !selectedListId) {
      setError("Selecione um preset de treino.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await addTrainingForUser(token, {
        userId: aluno.id,
        trainingListId: selectedListId,
        startDate: startDate + "T00:00:00.000Z",
        endDate: endDate ? endDate + "T23:59:59.999Z" : undefined,
        notes: notesCreate.trim() || undefined,
      });
      navigate("/alunos", { state: { refreshTraining: true } });
    } catch (err: unknown) {
      const msg = (err as { message?: string | string[] }).message;
      setError(
        Array.isArray(msg) ? msg.join(" ") : (msg || "Erro ao criar treino.")
      );
    } finally {
      setSaving(false);
    }
  };

  if (!aluno) return null;

  return (
    <div className="max-w-2xl mx-auto w-full">
        <div className="flex items-center justify-between mb-6 mt-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/alunos")}
              className="p-2 rounded-lg hover:bg-secondary transition-colors"
            >
              <ArrowLeft size={20} />
            </button>
            <div className="flex items-center gap-2">
              <Dumbbell size={24} className="text-primary" />
              <h1 className="text-2xl font-bold text-foreground">
                {mode === "edit" ? "Editar treino" : "Criar novo treino"} - {aluno.nome}
              </h1>
            </div>
          </div>
        </div>
        {loading ? (
          <div className="flex items-center justify-center py-16 gap-2 text-muted-foreground">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span>Carregando...</span>
          </div>
        ) : (
          <div className="space-y-6">
            {error && (
              <div className="p-4 rounded-lg bg-destructive/10 text-destructive text-sm">
                {error}
              </div>
            )}

            {training && (
              <div className="flex gap-2 p-1 rounded-lg bg-muted/30">
                <button
                  onClick={() => setMode("edit")}
                  className={`flex-1 py-2 rounded-md text-sm font-medium transition-colors ${
                    mode === "edit"
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Editar treino atual
                </button>
                <button
                  onClick={() => setMode("create")}
                  className={`flex-1 py-2 rounded-md text-sm font-medium transition-colors ${
                    mode === "create"
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Criar novo do zero
                </button>
              </div>
            )}

            {mode === "edit" ? (
              <>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-foreground block mb-1.5">
                      Nome do treino
                    </label>
                    <Input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Ex: Treino A - Hipertrofia"
                      className="bg-muted/30"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground block mb-1.5">
                      Descrição
                    </label>
                    <Input
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Descrição opcional"
                      className="bg-muted/30"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground block mb-1.5">
                      Observações
                    </label>
                    <Input
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Observações para o aluno"
                      className="bg-muted/30"
                    />
                  </div>
                </div>

                <div>
                  <h2 className="text-base font-semibold text-foreground mb-3 flex items-center gap-2">
                    <Dumbbell size={18} />
                    Exercícios do treino
                  </h2>
                  <div className="space-y-2">
                    {exercisesEdit.map((ex, idx) => (
                      <div
                        key={`${ex.id}-${idx}`}
                        className="flex items-center justify-between py-2 px-3 rounded-lg bg-muted/30 text-sm"
                      >
                        <span className="text-foreground">{ex.name}</span>
                        <span className="text-muted-foreground">
                          {ex.sets}x{ex.repetitions} • {ex.intervalSeconds}s desc.
                        </span>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Para alterar séries e repetições dos exercícios, crie um novo treino a partir de um preset.
                  </p>
                </div>

                <Button
                  onClick={handleSaveEdit}
                  disabled={saving}
                  className="w-full gap-2"
                >
                  {saving ? (
                    <Loader2 size={18} className="animate-spin" />
                  ) : (
                    <Save size={18} />
                  )}
                  Salvar alterações
                </Button>
              </>
            ) : (
              <>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-foreground block mb-1.5">
                      Preset de treino
                    </label>
                    <select
                      value={selectedListId}
                      onChange={(e) => setSelectedListId(e.target.value)}
                      className="w-full h-11 px-4 rounded-lg bg-muted/30 border border-input text-foreground focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none"
                    >
                      <option value="">Selecione um preset de treino</option>
                      {trainingLists.map((list) => {
                        const count =
                          (list.exercises?.length ?? 0) +
                          (list.exerciseGroups?.reduce((s, g) => s + (g.exercises?.length ?? 0), 0) ?? 0);
                        return (
                          <option key={list.id} value={list.id}>
                            {list.name}
                            {count > 0 ? ` (${count} exercícios)` : " (vazio)"}
                          </option>
                        );
                      })}
                    </select>
                    {trainingLists.length === 0 && !loading && (
                      <p className="text-sm text-muted-foreground mt-1">
                        Nenhum preset cadastrado. Crie presets em Treinos primeiro.
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground block mb-1.5">
                      Data de início
                    </label>
                    <Input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="bg-muted/30"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground block mb-1.5">
                      Data de término (opcional)
                    </label>
                    <Input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      placeholder="Opcional"
                      className="bg-muted/30"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground block mb-1.5">
                      Observações
                    </label>
                    <Input
                      value={notesCreate}
                      onChange={(e) => setNotesCreate(e.target.value)}
                      placeholder="Observações para o aluno"
                      className="bg-muted/30"
                    />
                  </div>
                </div>

                <p className="text-sm text-muted-foreground">
                  Ao criar um novo treino, o treino atual do aluno será desativado e substituído por este.
                </p>

                <Button
                  onClick={handleCreate}
                  disabled={saving || !selectedListId}
                  className="w-full gap-2"
                >
                  {saving ? (
                    <Loader2 size={18} className="animate-spin" />
                  ) : (
                    <Plus size={18} />
                  )}
                  Atribuir treino ao aluno
                </Button>
              </>
            )}
          </div>
        )}

    </div>
  );
};

export default EditarTreino;
