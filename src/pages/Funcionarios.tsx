import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Plus,
  Pencil,
  UserX,
  X,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import {
  getEmployees,
  createEmployee,
  updateEmployee,
  type Employee,
  type CreateEmployeeRequest,
  type UpdateEmployeeRequest,
  type ProfileEmployee,
} from "@/lib/employees-api";

const PROFILE_LABELS: Record<ProfileEmployee, string> = {
  MANAGER: "Gerente",
  TEACHER: "Professor",
  RECEPTIONIST: "Recepcionista",
};

const fmtDate = (d: string | undefined) =>
  d ? new Date(d + "T00:00:00").toLocaleDateString("pt-BR") : "—";

const Funcionarios = () => {
  const navigate = useNavigate();
  const { token } = useAuth();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [deactivateId, setDeactivateId] = useState<string | null>(null);
  const [deactivating, setDeactivating] = useState(false);

  // Form state
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [cpf, setCpf] = useState("");
  const [profile, setProfile] = useState<ProfileEmployee>("RECEPTIONIST");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [hiringDate, setHiringDate] = useState("");
  const [position, setPosition] = useState("");
  const [isActive, setIsActive] = useState(true);

  const fetchEmployees = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const list = await getEmployees(token);
      setEmployees(list);
    } catch (e: unknown) {
      const msg =
        e && typeof e === "object" && "message" in e
          ? String((e as { message: string }).message)
          : "Erro ao carregar funcionários";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  const resetForm = () => {
    setEditId(null);
    setFirstName("");
    setLastName("");
    setEmail("");
    setUsername("");
    setPassword("");
    setCpf("");
    setProfile("RECEPTIONIST");
    setPhoneNumber("");
    setHiringDate("");
    setPosition("");
    setIsActive(true);
  };

  const openNew = () => {
    resetForm();
    setModalOpen(true);
  };

  const openEdit = (emp: Employee) => {
    setEditId(emp.id);
    setFirstName(emp.firstName);
    setLastName(emp.lastName);
    setEmail(emp.email);
    setUsername(emp.username);
    setPassword("");
    setCpf("");
    setPhoneNumber(emp.phoneNumber || "");
    setHiringDate(emp.hiringDate ? String(emp.hiringDate).split("T")[0] : "");
    setPosition(emp.position || "");
    setProfile(emp.profile);
    setIsActive(emp.isActive);
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!token) return;
    const nomeTrim = firstName.trim();
    const sobrenomeTrim = lastName.trim();
    if (!nomeTrim || !sobrenomeTrim || !email.trim() || !username.trim()) return;
    if (!editId && !cpf.trim()) return;
    if (!editId && cpf.replace(/\D/g, "").length !== 11) return;

    setSaving(true);
    try {
      if (editId) {
        const data: UpdateEmployeeRequest = {
          firstName: nomeTrim,
          lastName: sobrenomeTrim,
          email: email.trim(),
          username: username.trim(),
          profile,
          phoneNumber: phoneNumber.trim() || undefined,
          hiringDate: hiringDate || undefined,
          position: position.trim() || undefined,
          isActive,
        };
        if (password.trim()) data.password = password;
        await updateEmployee(token, editId, data);
      } else {
        const data: CreateEmployeeRequest = {
          firstName: nomeTrim,
          lastName: sobrenomeTrim,
          email: email.trim(),
          username: username.trim(),
          cpf: cpf.replace(/\D/g, ""),
          profile,
          phoneNumber: phoneNumber.trim() || undefined,
          hiringDate: hiringDate || undefined,
          position: position.trim() || undefined,
          isActive,
        };
        if (password.trim()) data.password = password;
        await createEmployee(token, data);
      }
      setModalOpen(false);
      await fetchEmployees();
    } catch (e: unknown) {
      const msg =
        e && typeof e === "object" && "message" in e
          ? String((e as { message: string }).message)
          : "Erro ao salvar";
      setError(msg);
    } finally {
      setSaving(false);
    }
  };

  const handleDeactivate = async () => {
    if (!token || !deactivateId) return;
    setDeactivating(true);
    try {
      await updateEmployee(token, deactivateId, { isActive: false });
      setDeactivateId(null);
      await fetchEmployees();
    } catch (e: unknown) {
      const msg =
        e && typeof e === "object" && "message" in e
          ? String((e as { message: string }).message)
          : "Erro ao desativar";
      setError(msg);
    } finally {
      setDeactivating(false);
    }
  };

  const formatCpf = (v: string) => {
    const d = v.replace(/\D/g, "");
    if (d.length <= 3) return d;
    if (d.length <= 6) return `${d.slice(0, 3)}.${d.slice(3)}`;
    if (d.length <= 9) return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6)}`;
    return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6, 9)}-${d.slice(9, 11)}`;
  };

  const formatPhone = (v: string) => {
    const d = v.replace(/\D/g, "");
    if (d.length <= 2) return d ? `(${d}` : "";
    if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
    return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6, 11)}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="w-full">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <button
                onClick={() => navigate("/dashboard")}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <ArrowLeft size={20} />
              </button>
              <h1 className="text-2xl font-bold text-foreground">
                Funcionários
              </h1>
            </div>
            <p className="text-sm text-muted-foreground">
              Equipe da academia
            </p>
          </div>
          <Button onClick={openNew} size="sm" className="gap-1.5">
            <Plus size={16} />
            Novo Funcionário
          </Button>
        </div>

        {error && (
          <div className="mb-4 p-4 rounded-xl bg-destructive/10 border border-destructive/30 text-destructive flex items-center gap-2">
            <AlertCircle size={18} />
            <span>{error}</span>
            <button
              onClick={() => setError(null)}
              className="ml-auto text-destructive/80 hover:text-destructive"
            >
              <X size={16} />
            </button>
          </div>
        )}

        <div className="grid gap-3">
          {employees.length === 0 ? (
            <div className="p-8 rounded-xl bg-card border border-border text-center text-muted-foreground">
              Nenhum funcionário cadastrado. Clique em &quot;Novo Funcionário&quot; para
              começar.
            </div>
          ) : (
            employees.map((emp) => (
              <div
                key={emp.id}
                className={`flex items-center justify-between p-4 rounded-xl bg-card border border-border hover:border-primary/30 transition-colors ${
                  !emp.isActive ? "opacity-60" : ""
                }`}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-foreground truncate">
                      {emp.firstName} {emp.lastName}
                    </p>
                    {!emp.isActive && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                        Inativo
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-4 mt-1 flex-wrap">
                    <span className="text-sm text-primary font-medium">
                      {PROFILE_LABELS[emp.profile] ?? emp.profile}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {emp.email}
                    </span>
                    <span className="text-xs text-muted-foreground hidden sm:inline">
                      • {fmtDate(emp.hiringDate)}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-1 ml-3">
                  <button
                    onClick={() => openEdit(emp)}
                    className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                  >
                    <Pencil size={16} />
                  </button>
                  {emp.isActive && (
                    <button
                      onClick={() => setDeactivateId(emp.id)}
                      className="p-2 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                      title="Desativar"
                    >
                      <UserX size={16} />
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>


      {/* Modal Criar/Editar */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
          <div className="bg-card border border-border rounded-xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-foreground">
                {editId ? "Editar Funcionário" : "Novo Funcionário"}
              </h2>
              <button
                onClick={() => setModalOpen(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X size={20} />
              </button>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium text-foreground mb-1.5 block">
                    Nome
                  </label>
                  <Input
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="Nome"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-1.5 block">
                    Sobrenome
                  </label>
                  <Input
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Sobrenome"
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">
                  E-mail
                </label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="email@gym.com"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">
                  Usuário
                </label>
                <Input
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="usuario"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">
                  Senha {editId && "(deixe em branco para manter)"}
                </label>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={editId ? "••••••••" : "Mín. 6 caracteres"}
                />
              </div>
              {!editId && (
                <div>
                  <label className="text-sm font-medium text-foreground mb-1.5 block">
                    CPF
                  </label>
                  <Input
                    value={formatCpf(cpf)}
                    onChange={(e) =>
                      setCpf(e.target.value.replace(/\D/g, "").slice(0, 11))
                    }
                    placeholder="000.000.000-00"
                  />
                </div>
              )}
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">
                  Perfil
                </label>
                <select
                  value={profile}
                  onChange={(e) =>
                    setProfile(e.target.value as ProfileEmployee)
                  }
                  className="w-full h-10 rounded-lg border border-input bg-background px-3 text-sm"
                >
                  {(
                    Object.entries(PROFILE_LABELS) as [ProfileEmployee, string][]
                  ).map(([val, label]) => (
                    <option key={val} value={val}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">
                  Telefone
                </label>
                <Input
                  value={formatPhone(phoneNumber)}
                  onChange={(e) =>
                    setPhoneNumber(
                      e.target.value.replace(/\D/g, "").slice(0, 11)
                    )
                  }
                  placeholder="(11) 99999-9999"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">
                  Data de contratação
                </label>
                <Input
                  type="date"
                  value={hiringDate}
                  onChange={(e) => setHiringDate(e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">
                  Cargo
                </label>
                <Input
                  value={position}
                  onChange={(e) => setPosition(e.target.value)}
                  placeholder="Ex: Professor de Musculação"
                />
              </div>
              {editId && (
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="rounded"
                  />
                  <label
                    htmlFor="isActive"
                    className="text-sm font-medium text-foreground"
                  >
                    Ativo
                  </label>
                </div>
              )}
            </div>
            <div className="flex gap-3 mt-6">
              <Button
                variant="secondary"
                className="flex-1"
                onClick={() => setModalOpen(false)}
                disabled={saving}
              >
                Cancelar
              </Button>
              <Button
                className="flex-1"
                onClick={handleSave}
                disabled={saving}
              >
                {saving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  "Salvar"
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Desativar */}
      {deactivateId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
          <div className="bg-card border border-border rounded-xl w-full max-w-sm p-6 text-center">
            <h2 className="text-lg font-bold text-foreground mb-2">
              Desativar funcionário?
            </h2>
            <p className="text-sm text-muted-foreground mb-6">
              O funcionário não poderá mais acessar o sistema. Você pode
              reativá-lo editando o cadastro.
            </p>
            <div className="flex gap-3">
              <Button
                variant="secondary"
                className="flex-1"
                onClick={() => setDeactivateId(null)}
                disabled={deactivating}
              >
                Cancelar
              </Button>
              <Button
                variant="destructive"
                className="flex-1"
                onClick={handleDeactivate}
                disabled={deactivating}
              >
                {deactivating ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  "Desativar"
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Funcionarios;
