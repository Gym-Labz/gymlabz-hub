import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Plus,
  Pencil,
  Trash2,
  X,
  Loader2,
  Users,
  UserPlus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import logo from "@/assets/gymlabz-logo.png";
import { useAuth } from "@/contexts/AuthContext";
import {
  getGymClasses,
  createGymClass,
  updateGymClass,
  deleteGymClass,
  getEnrollmentsByClass,
  enrollStudent,
  removeEnrollment,
  getDaysLabel,
  type GymClass,
  type GymClassEnrollment,
} from "@/lib/gym-classes-api";
import { getUsersByGymId } from "@/lib/users-api";

const DAYS_OPTIONS = [
  { value: 0, label: "Dom" },
  { value: 1, label: "Seg" },
  { value: 2, label: "Ter" },
  { value: 3, label: "Qua" },
  { value: 4, label: "Qui" },
  { value: 5, label: "Sex" },
  { value: 6, label: "Sáb" },
];

const Aulas = () => {
  const navigate = useNavigate();
  const { token } = useAuth();
  const [aulas, setAulas] = useState<GymClass[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [enrollModalOpen, setEnrollModalOpen] = useState(false);
  const [enrollClass, setEnrollClass] = useState<GymClass | null>(null);
  const [enrollments, setEnrollments] = useState<GymClassEnrollment[]>([]);
  const [alunos, setAlunos] = useState<{ id: string; firstName: string; lastName: string }[]>([]);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [enrollLoading, setEnrollLoading] = useState(false);

  const [nome, setNome] = useState("");
  const [tipo, setTipo] = useState("");
  const [instructor, setInstructor] = useState("");
  const [horario, setHorario] = useState("");
  const [local, setLocal] = useState("");
  const [diasSemana, setDiasSemana] = useState<number[]>([]);
  const [vagas, setVagas] = useState("");
  const [valor, setValor] = useState("");

  const fetchData = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const data = await getGymClasses(token);
      setAulas(data);
    } catch (err) {
      setError((err as { message?: string }).message || "Erro ao carregar aulas.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [token]);

  const resetForm = () => {
    setEditId(null);
    setNome("");
    setTipo("");
    setInstructor("");
    setHorario("");
    setLocal("");
    setDiasSemana([]);
    setVagas("");
    setValor("");
    setModalOpen(false);
  };

  const openNew = () => {
    resetForm();
    setModalOpen(true);
  };

  const openEdit = (aula: GymClass) => {
    setEditId(aula.id);
    setNome(aula.name);
    setTipo(aula.type);
    setInstructor(aula.instructorName);
    setHorario(aula.scheduleTime);
    setLocal(aula.location);
    setDiasSemana(aula.daysOfWeek ?? []);
    setVagas(String(aula.maxSpots));
    setValor(String(aula.price ?? 0));
    setModalOpen(true);
  };

  const openEnrollModal = async (aula: GymClass) => {
    setEnrollClass(aula);
    setEnrollModalOpen(true);
    setEnrollments([]);
    setSelectedUserId("");
    if (!token) return;
    setEnrollLoading(true);
    try {
      const [enrollsRes, usersRes] = await Promise.all([
        getEnrollmentsByClass(token, aula.id),
        getUsersByGymId(token),
      ]);
      setEnrollments(enrollsRes);
      setAlunos(usersRes.users.map((u) => ({ id: u.id, firstName: u.firstName, lastName: u.lastName })));
    } catch (err) {
      setError((err as { message?: string }).message || "Erro ao carregar dados.");
    } finally {
      setEnrollLoading(false);
    }
  };

  const handleSave = async () => {
    if (!nome.trim() || !tipo.trim() || !instructor.trim() || !horario.trim() || !local.trim() || !vagas.trim() || !token) return;
    const vagasNum = parseInt(vagas, 10);
    const valorNum = parseFloat(valor.replace(",", ".")) || 0;
    if (isNaN(vagasNum) || vagasNum < 1) return;

    setSaving(true);
    setError(null);
    try {
      const payload = {
        name: nome.trim(),
        type: tipo.trim(),
        instructorName: instructor.trim(),
        scheduleTime: horario.trim(),
        location: local.trim(),
        daysOfWeek: diasSemana.length ? diasSemana : [1, 2, 3, 4, 5],
        maxSpots: vagasNum,
        price: valorNum,
      };
      if (editId) {
        await updateGymClass(token, editId, payload);
      } else {
        await createGymClass(token, payload);
      }
      resetForm();
      await fetchData();
    } catch (err) {
      setError((err as { message?: string }).message || "Erro ao salvar aula.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId || !token) return;
    setDeleting(true);
    setError(null);
    try {
      await deleteGymClass(token, deleteId);
      setDeleteId(null);
      await fetchData();
    } catch (err) {
      setError((err as { message?: string }).message || "Erro ao excluir aula.");
    } finally {
      setDeleting(false);
    }
  };

  const handleEnroll = async () => {
    if (!token || !enrollClass || !selectedUserId) return;
    const enrolled = enrollments.length;
    if (enrolled >= enrollClass.maxSpots) {
      setError("Não há vagas disponíveis.");
      return;
    }
    setEnrollLoading(true);
    setError(null);
    try {
      await enrollStudent(token, enrollClass.id, selectedUserId);
      const res = await getEnrollmentsByClass(token, enrollClass.id);
      setEnrollments(res);
      setSelectedUserId("");
      await fetchData();
    } catch (err) {
      setError((err as { message?: string }).message || "Erro ao matricular aluno.");
    } finally {
      setEnrollLoading(false);
    }
  };

  const handleRemoveEnrollment = async (enrollmentId: string) => {
    if (!token) return;
    setEnrollLoading(true);
    try {
      await removeEnrollment(token, enrollmentId);
      if (enrollClass) {
        const res = await getEnrollmentsByClass(token, enrollClass.id);
        setEnrollments(res);
      }
      await fetchData();
    } catch (err) {
      setError((err as { message?: string }).message || "Erro ao remover matrícula.");
    } finally {
      setEnrollLoading(false);
    }
  };

  const toggleDia = (d: number) => {
    setDiasSemana((prev) =>
      prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d].sort()
    );
  };

  const formatCurrency = (v: number) =>
    Number(v).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  const enrolledIds = enrollments.map((e) => e.userId);
  const availableAlunos = alunos.filter((a) => !enrolledIds.includes(a.id));

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 bg-card/80 backdrop-blur-lg border-b border-border">
        <div className="flex items-center justify-between px-4 h-16 max-w-5xl mx-auto">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/dashboard")}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft size={20} />
            </button>
            <img src={logo} alt="GymLabz" className="w-9 h-9 object-contain" />
            <span className="text-lg font-bold tracking-tight">
              Gym<span className="gym-text-gradient">Labz</span>
            </span>
          </div>
          <Button onClick={openNew} size="sm" className="gap-1.5">
            <Plus size={16} />
            Nova Aula
          </Button>
        </div>
      </header>

      <main className="px-4 py-6 max-w-5xl mx-auto">
        <h1 className="text-2xl font-bold text-foreground mb-1">Aulas</h1>
        <p className="text-sm text-muted-foreground mb-6">
          Cadastre e gerencie as aulas da academia
        </p>

        {error && (
          <div className="p-3 rounded-lg bg-destructive/20 text-destructive text-sm mb-4">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-20 gap-2 text-muted-foreground">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span>Carregando aulas...</span>
          </div>
        ) : aulas.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            <p>Nenhuma aula cadastrada.</p>
            <p className="text-xs mt-1">Clique em &quot;Nova Aula&quot; para criar.</p>
          </div>
        ) : (
          <div className="grid gap-3">
            {aulas.map((aula) => (
              <div
                key={aula.id}
                className="flex items-center justify-between p-4 rounded-xl bg-card border border-border hover:border-primary/30 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-foreground">{aula.name}</p>
                  <div className="flex items-center gap-3 mt-1 flex-wrap text-sm text-muted-foreground">
                    <span>{aula.type}</span>
                    <span>•</span>
                    <span>Prof. {aula.instructorName}</span>
                    <span>•</span>
                    <span>{aula.scheduleTime}</span>
                    <span>•</span>
                    <span>{aula.location}</span>
                    <span>•</span>
                    <span>{getDaysLabel(aula.daysOfWeek)}</span>
                    <span className="text-primary font-medium">
                      {aula.enrolledCount ?? 0}/{aula.maxSpots} vagas
                    </span>
                    {Number(aula.price) > 0 && (
                      <>
                        <span>•</span>
                        <span>{formatCurrency(aula.price)}</span>
                      </>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1 ml-3">
                  <button
                    onClick={() => openEnrollModal(aula)}
                    className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                    title="Gerenciar alunos"
                  >
                    <Users size={16} />
                  </button>
                  <button
                    onClick={() => openEdit(aula)}
                    className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                  >
                    <Pencil size={16} />
                  </button>
                  <button
                    onClick={() => setDeleteId(aula.id)}
                    className="p-2 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Modal Criar/Editar */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
          <div className="bg-card border border-border rounded-xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-foreground">
                {editId ? "Editar Aula" : "Nova Aula"}
              </h2>
              <button onClick={resetForm} className="text-muted-foreground hover:text-foreground">
                <X size={20} />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">Nome</label>
                <Input value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Ex: Spinning Manhã" />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">Tipo</label>
                <Input value={tipo} onChange={(e) => setTipo(e.target.value)} placeholder="Ex: Spinning, Yoga" />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">Professor</label>
                <Input value={instructor} onChange={(e) => setInstructor(e.target.value)} placeholder="Nome do professor" />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">Horário</label>
                <Input value={horario} onChange={(e) => setHorario(e.target.value)} placeholder="Ex: 08:00" />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">Local</label>
                <Input value={local} onChange={(e) => setLocal(e.target.value)} placeholder="Ex: Sala 1" />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">Dias da semana</label>
                <div className="flex flex-wrap gap-2">
                  {DAYS_OPTIONS.map((d) => (
                    <button
                      key={d.value}
                      type="button"
                      onClick={() => toggleDia(d.value)}
                      className={`px-3 py-1 rounded-full text-sm transition-colors ${
                        diasSemana.includes(d.value)
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground hover:bg-muted/80"
                      }`}
                    >
                      {d.label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">Número de vagas</label>
                <Input type="number" min={1} value={vagas} onChange={(e) => setVagas(e.target.value)} />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">Valor (R$)</label>
                <Input type="number" step="0.01" min={0} value={valor} onChange={(e) => setValor(e.target.value)} placeholder="0" />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <Button variant="secondary" className="flex-1" onClick={resetForm} disabled={saving}>
                Cancelar
              </Button>
              <Button
                className="flex-1"
                onClick={handleSave}
                disabled={!nome.trim() || !tipo.trim() || !instructor.trim() || !horario.trim() || !local.trim() || !vagas.trim() || saving}
              >
                {saving ? <Loader2 size={16} className="animate-spin" /> : "Salvar"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Matrículas */}
      {enrollModalOpen && enrollClass && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
          <div className="bg-card border border-border rounded-xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-foreground">
                Alunos - {enrollClass.name}
              </h2>
              <button
                onClick={() => {
                  setEnrollModalOpen(false);
                  setEnrollClass(null);
                }}
                className="text-muted-foreground hover:text-foreground"
              >
                <X size={20} />
              </button>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              {enrollments.length}/{enrollClass.maxSpots} vagas preenchidas
            </p>

            {enrollments.length < enrollClass.maxSpots && availableAlunos.length > 0 && (
              <div className="flex gap-2 mb-4">
                <select
                  value={selectedUserId}
                  onChange={(e) => setSelectedUserId(e.target.value)}
                  className="flex-1 h-10 px-3 rounded-md border border-input bg-background text-foreground text-sm"
                >
                  <option value="">Selecione um aluno</option>
                  {availableAlunos.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.firstName} {a.lastName}
                    </option>
                  ))}
                </select>
                <Button
                  size="sm"
                  onClick={handleEnroll}
                  disabled={!selectedUserId || enrollLoading}
                >
                  {enrollLoading ? <Loader2 size={16} className="animate-spin" /> : <UserPlus size={16} />}
                </Button>
              </div>
            )}

            <div className="space-y-2 max-h-48 overflow-y-auto">
              {enrollments.length === 0 ? (
                <p className="text-sm text-muted-foreground py-4 text-center">
                  Nenhum aluno matriculado.
                </p>
              ) : (
                enrollments.map((e) => (
                  <div
                    key={e.id}
                    className="flex items-center justify-between py-2 px-3 rounded-lg bg-muted/50 text-sm"
                  >
                    <span>
                      {e.user?.firstName} {e.user?.lastName}
                    </span>
                    <button
                      onClick={() => handleRemoveEnrollment(e.id)}
                      disabled={enrollLoading}
                      className="text-destructive hover:underline text-xs"
                    >
                      Remover
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Confirmação exclusão */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
          <div className="bg-card border border-border rounded-xl w-full max-w-sm p-6 text-center">
            <h2 className="text-lg font-bold text-foreground mb-2">Excluir aula?</h2>
            <p className="text-sm text-muted-foreground mb-6">Esta ação não pode ser desfeita.</p>
            <div className="flex gap-3">
              <Button variant="secondary" className="flex-1" onClick={() => setDeleteId(null)} disabled={deleting}>
                Cancelar
              </Button>
              <Button variant="destructive" className="flex-1" onClick={handleDelete} disabled={deleting}>
                {deleting ? <Loader2 size={16} className="animate-spin" /> : "Excluir"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Aulas;
