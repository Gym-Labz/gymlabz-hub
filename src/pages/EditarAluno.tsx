import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Loader2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import {
  getUserById,
  createUser,
  updateUser,
  removeUserFromGym,
  type UpdateUserRequest,
} from "@/lib/users-api";
import {
  addSubscription,
  updateSubscription,
  getUserSubscriptions,
} from "@/lib/subscriptions-api";
import { getPlans } from "@/lib/plans-api";

function parseNome(nome: string): { firstName: string; lastName: string } {
  const parts = nome.trim().split(/\s+/);
  if (parts.length === 0) return { firstName: "", lastName: "" };
  if (parts.length === 1) return { firstName: parts[0], lastName: parts[0] };
  return {
    firstName: parts[0],
    lastName: parts.slice(1).join(" "),
  };
}

function formatCpf(v: string) {
  const n = v.replace(/\D/g, "");
  if (n.length <= 3) return n;
  if (n.length <= 6) return `${n.slice(0, 3)}.${n.slice(3)}`;
  if (n.length <= 9) return `${n.slice(0, 3)}.${n.slice(3, 6)}.${n.slice(6)}`;
  return `${n.slice(0, 3)}.${n.slice(3, 6)}.${n.slice(6, 9)}-${n.slice(9, 11)}`;
}

function formatPhone(v: string) {
  const n = v.replace(/\D/g, "").slice(0, 11);
  if (n.length <= 2) return n ? `(${n}` : "";
  if (n.length <= 6) return `(${n.slice(0, 2)}) ${n.slice(2)}`;
  return `(${n.slice(0, 2)}) ${n.slice(2, 7)}-${n.slice(7)}`;
}

function formatCep(v: string) {
  const n = v.replace(/\D/g, "").slice(0, 8);
  if (n.length <= 5) return n;
  return `${n.slice(0, 5)}-${n.slice(5)}`;
}

const EditarAluno = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { token } = useAuth();
  const isEdit = !!id && id !== "novo";

  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [planos, setPlanos] = useState<{ id: string; name: string }[]>([]);
  const [editSubscriptionId, setEditSubscriptionId] = useState<string | null>(null);
  const planSelectRef = useRef<HTMLSelectElement>(null);

  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [cpf, setCpf] = useState("");
  const [genero, setGenero] = useState("masculino");
  const [username, setUsername] = useState("");
  const [planoId, setPlanoId] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [emergencyContactName, setEmergencyContactName] = useState("");
  const [emergencyContactPhone, setEmergencyContactPhone] = useState("");
  const [street, setStreet] = useState("");
  const [number, setNumber] = useState("");
  const [complement, setComplement] = useState("");
  const [neighborhood, setNeighborhood] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [weight, setWeight] = useState("");
  const [height, setHeight] = useState("");
  const [preExistingConditions, setPreExistingConditions] = useState("");
  const [hasInjuryHistory, setHasInjuryHistory] = useState(false);
  const [injuryHistory, setInjuryHistory] = useState("");
  const [medicalCertificateProvided, setMedicalCertificateProvided] = useState(false);

  useEffect(() => {
    if (!token) return;
    getPlans(token).then((plans) => {
      setPlanos(
        Array.isArray(plans)
          ? plans.map((p: { id: string; name: string }) => ({ id: p.id, name: p.name }))
          : []
      );
    });
  }, [token]);

  useEffect(() => {
    if (!isEdit || !token || !id) {
      if (!isEdit) setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    getUserById(token, id)
      .then((user) => {
        setNome(`${(user.firstName || "").trim()} ${(user.lastName || "").trim()}`.trim());
        setEmail(user.contact?.email || "");
        setUsername(user.username || "");
        setBirthDate(user.birthDate?.split("T")[0] || "");
        setPhone(user.contact?.phone || "");
        setEmergencyContactName(user.contact?.emergencyContactName || "");
        setEmergencyContactPhone(user.contact?.emergencyContactPhone || "");
        setStreet(user.address?.street || "");
        setNumber(user.address?.number || "");
        setComplement(user.address?.complement || "");
        setNeighborhood(user.address?.neighborhood || "");
        setCity(user.address?.city || "");
        setState(user.address?.state || "");
        setPostalCode(user.address?.postalCode || "");
        setWeight(user.healthInformation?.weight || "");
        setHeight(user.healthInformation?.height || "");
        setPreExistingConditions(user.healthInformation?.preExistingConditions || "");
        setHasInjuryHistory(user.healthInformation?.hasInjuryHistory || false);
        setInjuryHistory(user.healthInformation?.injuryHistory || "");
        setMedicalCertificateProvided(user.healthInformation?.medicalCertificateProvided || false);
      })
      .catch((err) => {
        setError((err as { message?: string }).message || "Erro ao carregar dados do aluno.");
      })
      .finally(() => setLoading(false));

    getUserSubscriptions(token, id)
      .then((res) => {
        const activeSub = res.data?.find(
          (s: { status: string }) => (s.status || "").toLowerCase() === "active"
        );
        if (activeSub) {
          setEditSubscriptionId(activeSub.id);
          setPlanoId(activeSub.plan?.id || "");
        }
      })
      .catch(() => {});
  }, [isEdit, id, token]);

  const handleSave = async () => {
    if (!token || !nome.trim()) return;
    if (!isEdit && (!cpf.replace(/\D/g, "").match(/^\d{11}$/) || !username.trim())) return;

    setSaving(true);
    setError(null);
    try {
      if (isEdit && id) {
        const updateData: UpdateUserRequest = {};
        if (username.trim()) updateData.username = username.trim();
        if (email.trim()) updateData.email = email.trim();
        if (password.trim()) updateData.password = password;
        if (birthDate.trim()) updateData.birthDate = birthDate;

        const contact: NonNullable<UpdateUserRequest["contact"]> = {};
        if (email.trim()) contact.email = email.trim();
        if (phone.replace(/\D/g, "")) contact.phone = phone.replace(/\D/g, "");
        if (emergencyContactName.trim()) contact.emergencyContactName = emergencyContactName.trim();
        if (emergencyContactPhone.replace(/\D/g, ""))
          contact.emergencyContactPhone = emergencyContactPhone.replace(/\D/g, "");
        if (Object.keys(contact).length > 0) updateData.contact = contact;

        const address: NonNullable<UpdateUserRequest["address"]> = {};
        if (street.trim()) address.street = street.trim();
        if (number.trim()) address.number = number.trim();
        if (complement.trim()) address.complement = complement.trim();
        if (neighborhood.trim()) address.neighborhood = neighborhood.trim();
        if (city.trim()) address.city = city.trim();
        if (state.trim()) address.state = state.trim();
        if (postalCode.replace(/\D/g, "")) address.postalCode = postalCode.replace(/\D/g, "");
        if (Object.keys(address).length > 0) updateData.address = address;

        updateData.healthInformation = {
          weight: weight.trim() || undefined,
          height: height.trim() || undefined,
          preExistingConditions: preExistingConditions.trim() || undefined,
          hasInjuryHistory,
          injuryHistory: injuryHistory.trim() || undefined,
          medicalCertificateProvided,
        };

        await updateUser(token, id, updateData);

        const selectedPlanId = planSelectRef.current?.value?.trim() || planoId?.trim() || "";
        if (selectedPlanId) {
          if (editSubscriptionId) {
            await updateSubscription(token, editSubscriptionId, { planId: selectedPlanId });
          } else {
            await addSubscription(token, {
              userId: id,
              planId: selectedPlanId,
              startDate: new Date().toISOString().split("T")[0] + "T00:00:00.000Z",
            });
          }
        }
      } else {
        const { firstName, lastName } = parseNome(nome);
        const cpfClean = cpf.replace(/\D/g, "");
        const res = await createUser(token, {
          firstName,
          lastName,
          gender: genero,
          cpf: cpfClean,
          username: username.trim(),
          birthDate: birthDate || undefined,
          contact:
            email.trim() || phone || emergencyContactName || emergencyContactPhone
              ? {
                  email: email.trim() || undefined,
                  phone: phone.replace(/\D/g, "") || undefined,
                  emergencyContactName: emergencyContactName.trim() || undefined,
                  emergencyContactPhone: emergencyContactPhone.replace(/\D/g, "") || undefined,
                }
              : undefined,
          address:
            street || number || neighborhood || city || state || postalCode
              ? {
                  street: street.trim() || undefined,
                  number: number.trim() || undefined,
                  complement: complement.trim() || undefined,
                  neighborhood: neighborhood.trim() || undefined,
                  city: city.trim() || undefined,
                  state: state.trim() || undefined,
                  postalCode: postalCode.replace(/\D/g, "") || undefined,
                }
              : undefined,
          healthInformation:
            weight || height || preExistingConditions || injuryHistory
              ? {
                  weight: weight.trim() || undefined,
                  height: height.trim() || undefined,
                  preExistingConditions: preExistingConditions.trim() || undefined,
                  hasInjuryHistory,
                  injuryHistory: injuryHistory.trim() || undefined,
                  medicalCertificateProvided,
                }
              : undefined,
        });

        const newUserPlanId = planSelectRef.current?.value?.trim() || planoId?.trim() || "";
        if (newUserPlanId) {
          await addSubscription(token, {
            userId: res.id,
            planId: newUserPlanId,
            startDate: new Date().toISOString().split("T")[0] + "T00:00:00.000Z",
          });
        }
      }
      navigate("/alunos");
    } catch (err: unknown) {
      const msg = (err as { message?: string | string[] }).message;
      setError(Array.isArray(msg) ? msg.join(" ") : (msg || "Erro ao salvar aluno."));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!token || !id) return;
    setDeleting(true);
    setError(null);
    try {
      await removeUserFromGym(token, id);
      setDeleteConfirm(false);
      navigate("/alunos");
    } catch (err: unknown) {
      const msg = (err as { message?: string }).message;
      setError(msg || "Erro ao excluir aluno.");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
        <div className="flex items-center justify-between px-4 py-3 max-w-2xl mx-auto">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/alunos")}
              className="p-2 rounded-lg hover:bg-secondary transition-colors"
            >
              <ArrowLeft size={20} />
            </button>
            <h1 className="text-lg font-bold text-foreground">
              {isEdit ? "Editar Aluno" : "Novo Aluno"}
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="secondary" onClick={() => navigate("/alunos")} disabled={saving}>
              Cancelar
            </Button>
            <Button
              onClick={handleSave}
              disabled={
                saving ||
                loading ||
                !nome.trim() ||
                (!isEdit &&
                  (!cpf.replace(/\D/g, "").match(/^\d{11}$/) || !username.trim()))
              }
            >
              {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
              Salvar
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto p-4 pb-8">
        {error && (
          <div className="p-4 rounded-lg bg-destructive/10 text-destructive text-sm mb-6">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-16 gap-2 text-muted-foreground">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span>Carregando dados...</span>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Dados básicos */}
            <section className="space-y-4">
              <h2 className="text-sm font-semibold text-muted-foreground uppercase">
                Dados básicos
              </h2>
              <div>
                <label className="text-sm font-medium text-foreground block mb-1.5">
                  Nome completo
                </label>
                <Input
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  placeholder="Nome completo"
                  readOnly={!!isEdit}
                  className={isEdit ? "bg-muted" : ""}
                />
                {isEdit && (
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Nome não pode ser alterado
                  </p>
                )}
              </div>
              <div>
                <label className="text-sm font-medium text-foreground block mb-1.5">E-mail</label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="email@exemplo.com"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground block mb-1.5">
                  Usuário (login)
                </label>
                <Input
                  value={username}
                  onChange={(e) =>
                    setUsername(e.target.value.toLowerCase().replace(/\s/g, ""))
                  }
                  placeholder="usuario123"
                />
              </div>
              {isEdit && (
                <div>
                  <label className="text-sm font-medium text-foreground block mb-1.5">
                    Nova senha (deixe em branco para não alterar)
                  </label>
                  <Input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                  />
                </div>
              )}
              {!isEdit && (
                <>
                  <div>
                    <label className="text-sm font-medium text-foreground block mb-1.5">CPF</label>
                    <Input
                      value={formatCpf(cpf)}
                      onChange={(e) =>
                        setCpf(e.target.value.replace(/\D/g, "").slice(0, 11))
                      }
                      placeholder="000.000.000-00"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground block mb-1.5">
                      Gênero
                    </label>
                    <select
                      value={genero}
                      onChange={(e) => setGenero(e.target.value)}
                      className="w-full h-10 px-3 rounded-md border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    >
                      <option value="masculino">Masculino</option>
                      <option value="feminino">Feminino</option>
                      <option value="outro">Outro</option>
                    </select>
                  </div>
                </>
              )}
              <div>
                <label className="text-sm font-medium text-foreground block mb-1.5">
                  Data de nascimento
                </label>
                <Input
                  type="date"
                  value={birthDate}
                  onChange={(e) => setBirthDate(e.target.value)}
                />
              </div>
              {planos.length > 0 && (
                <div>
                  <label className="text-sm font-medium text-foreground block mb-1.5">
                    Plano {isEdit ? "" : "(opcional)"}
                  </label>
                  <select
                    ref={planSelectRef}
                    value={planoId}
                    onChange={(e) => setPlanoId(e.target.value)}
                    className="w-full h-10 px-3 rounded-md border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    <option value="">Nenhum</option>
                    {planos.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </section>

            {/* Contato */}
            <section className="space-y-4 pt-6 border-t border-border">
              <h2 className="text-sm font-semibold text-muted-foreground uppercase">
                Contato
              </h2>
              <div>
                <label className="text-sm font-medium text-foreground block mb-1.5">
                  Telefone
                </label>
                <Input
                  value={formatPhone(phone)}
                  onChange={(e) =>
                    setPhone(e.target.value.replace(/\D/g, "").slice(0, 11))
                  }
                  placeholder="(00) 00000-0000"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground block mb-1.5">
                  Contato de emergência
                </label>
                <Input
                  value={emergencyContactName}
                  onChange={(e) => setEmergencyContactName(e.target.value)}
                  placeholder="Nome"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground block mb-1.5">
                  Telefone de emergência
                </label>
                <Input
                  value={formatPhone(emergencyContactPhone)}
                  onChange={(e) =>
                    setEmergencyContactPhone(e.target.value.replace(/\D/g, "").slice(0, 11))
                  }
                  placeholder="(00) 00000-0000"
                />
              </div>
            </section>

            {/* Endereço */}
            <section className="space-y-4 pt-6 border-t border-border">
              <h2 className="text-sm font-semibold text-muted-foreground uppercase">
                Endereço
              </h2>
              <div>
                <label className="text-sm font-medium text-foreground block mb-1.5">CEP</label>
                <Input
                  value={formatCep(postalCode)}
                  onChange={(e) =>
                    setPostalCode(e.target.value.replace(/\D/g, "").slice(0, 8))
                  }
                  placeholder="00000-000"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground block mb-1.5">Rua</label>
                <Input
                  value={street}
                  onChange={(e) => setStreet(e.target.value)}
                  placeholder="Rua, Avenida..."
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium text-foreground block mb-1.5">
                    Número
                  </label>
                  <Input
                    value={number}
                    onChange={(e) => setNumber(e.target.value)}
                    placeholder="Nº"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground block mb-1.5">
                    Complemento
                  </label>
                  <Input
                    value={complement}
                    onChange={(e) => setComplement(e.target.value)}
                    placeholder="Apto, Bloco..."
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-foreground block mb-1.5">Bairro</label>
                <Input
                  value={neighborhood}
                  onChange={(e) => setNeighborhood(e.target.value)}
                  placeholder="Bairro"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium text-foreground block mb-1.5">
                    Cidade
                  </label>
                  <Input
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="Cidade"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground block mb-1.5">
                    Estado
                  </label>
                  <Input
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    placeholder="UF"
                    maxLength={2}
                  />
                </div>
              </div>
            </section>

            {/* Saúde */}
            <section className="space-y-4 pt-6 border-t border-border">
              <h2 className="text-sm font-semibold text-muted-foreground uppercase">
                Informações de saúde
              </h2>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium text-foreground block mb-1.5">
                    Peso (kg)
                  </label>
                  <Input
                    type="number"
                    step="0.01"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground block mb-1.5">
                    Altura (m)
                  </label>
                  <Input
                    type="number"
                    step="0.01"
                    value={height}
                    onChange={(e) => setHeight(e.target.value)}
                    placeholder="0"
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-foreground block mb-1.5">
                  Condições pré-existentes
                </label>
                <Input
                  value={preExistingConditions}
                  onChange={(e) => setPreExistingConditions(e.target.value)}
                  placeholder="Ex: diabetes, hipertensão..."
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="hasInjuryHistory"
                  checked={hasInjuryHistory}
                  onChange={(e) => setHasInjuryHistory(e.target.checked)}
                  className="rounded border-input"
                />
                <label htmlFor="hasInjuryHistory" className="text-sm font-medium text-foreground">
                  Possui histórico de lesões
                </label>
              </div>
              {hasInjuryHistory && (
                <div>
                  <label className="text-sm font-medium text-foreground block mb-1.5">
                    Histórico de lesões
                  </label>
                  <Input
                    value={injuryHistory}
                    onChange={(e) => setInjuryHistory(e.target.value)}
                    placeholder="Descreva..."
                  />
                </div>
              )}
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="medicalCertificateProvided"
                  checked={medicalCertificateProvided}
                  onChange={(e) => setMedicalCertificateProvided(e.target.checked)}
                  className="rounded border-input"
                />
                <label
                  htmlFor="medicalCertificateProvided"
                  className="text-sm font-medium text-foreground"
                >
                  Atestado médico fornecido
                </label>
              </div>
            </section>

            {isEdit && (
              <div className="pt-6 border-t border-border">
                <button
                  onClick={() => setDeleteConfirm(true)}
                  className="text-sm text-muted-foreground hover:text-destructive transition-colors"
                >
                  Excluir aluno
                </button>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Modal Excluir */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
          <div className="bg-card border border-border rounded-xl w-full max-w-sm p-6 text-center">
            <h2 className="text-lg font-bold text-foreground mb-2">Excluir aluno?</h2>
            <p className="text-sm text-muted-foreground mb-6">
              O aluno será removido da academia. Esta ação não pode ser desfeita.
            </p>
            <div className="flex gap-3">
              <Button
                variant="secondary"
                className="flex-1"
                onClick={() => setDeleteConfirm(false)}
                disabled={deleting}
              >
                Cancelar
              </Button>
              <Button
                variant="destructive"
                className="flex-1"
                onClick={handleDelete}
                disabled={deleting}
              >
                {deleting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  "Excluir"
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EditarAluno;
