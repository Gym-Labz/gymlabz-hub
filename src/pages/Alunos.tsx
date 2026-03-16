import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Plus, Pencil, X, Search, Loader2, DollarSign, DoorOpen, Dumbbell, Edit3 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import logo from "@/assets/gymlabz-logo.png";
import { useAuth } from "@/contexts/AuthContext";
import {
  getUsersByGymId,
  removeUserFromGym,
  type UserByGymId,
} from "@/lib/users-api";
import {
  getSubscriptions,
  addSubscription,
  updateSubscription,
  getUserSubscriptions,
} from "@/lib/subscriptions-api";
import { getPlans } from "@/lib/plans-api";
import {
  getPaymentsByUser,
  getPaymentMethods,
  createSubscriptionPayment,
  createExtraClassPayment,
  type Payment,
  type PaymentMethod,
} from "@/lib/financial-api";
import { getAccessReports, allowAccess, type AccessReportItem } from "@/lib/access-api";
import { getUserWithTraining, type UserWithTraining } from "@/lib/user-training-api";
import { getEnrollmentsByUser, type GymClassEnrollment } from "@/lib/gym-classes-api";

interface Aluno {
  id: string;
  nome: string;
  email: string;
  plano: string;
  status: "ativo" | "inativo";
  criadoEm: string;
  imageUrl?: string | null;
}

function getIniciais(nome: string): string {
  const parts = nome.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function mapUserToAluno(
  u: UserByGymId & { imageUrl?: string | null },
  planByUserId: Record<string, string>
): Aluno {
  return {
    id: u.id,
    nome: `${u.firstName} ${u.lastName}`.trim(),
    email: u.contact?.email || "-",
    plano: planByUserId[u.id] || "-",
    status: u.isActive ? "ativo" : "inativo",
    criadoEm: "-",
    imageUrl: u.imageUrl ?? null,
  };
}

const Alunos = () => {
  const navigate = useNavigate();
  const { token, hasRole } = useAuth();
  const canEditTraining = hasRole("MANAGER", "TEACHER");
  const [alunos, setAlunos] = useState<Aluno[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [planos, setPlanos] = useState<{ id: string; name: string }[]>([]);
  const [activeSubByUserId, setActiveSubByUserId] = useState<
    Record<string, { planId: string; subscriptionId: string }>
  >({});

  const [saving, setSaving] = useState(false);
  const [busca, setBusca] = useState("");
  const [financeModalOpen, setFinanceModalOpen] = useState(false);
  const [financeAluno, setFinanceAluno] = useState<Aluno | null>(null);
  const [financeLoading, setFinanceLoading] = useState(false);
  const [financeData, setFinanceData] = useState<{
    planName: string;
    planPrice: number;
    subscriptionId: string | null;
    planIncludesClasses: boolean;
    payments: Payment[];
    totalPaid: number;
    currentMonthPayment: Payment | null | undefined;
    extraClasses: GymClassEnrollment[];
  } | null>(null);
  const [registerPaymentOpen, setRegisterPaymentOpen] = useState(false);
  const [registerExtraClassPaymentOpen, setRegisterExtraClassPaymentOpen] = useState(false);
  const [selectedExtraClassForPayment, setSelectedExtraClassForPayment] = useState<GymClassEnrollment | null>(null);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [selectedPaymentMethodId, setSelectedPaymentMethodId] = useState("");
  const [registeringPayment, setRegisteringPayment] = useState(false);
  const [registeringExtraClassPayment, setRegisteringExtraClassPayment] = useState(false);
  const [accessModalOpen, setAccessModalOpen] = useState(false);
  const [accessAluno, setAccessAluno] = useState<Aluno | null>(null);
  const [accessLoading, setAccessLoading] = useState(false);
  const [accessData, setAccessData] = useState<AccessReportItem[] | null>(null);
  const [trainingModalOpen, setTrainingModalOpen] = useState(false);
  const [trainingAluno, setTrainingAluno] = useState<Aluno | null>(null);
  const [trainingLoading, setTrainingLoading] = useState(false);
  const [trainingData, setTrainingData] = useState<UserWithTraining | null>(null);
  const [allowingAccess, setAllowingAccess] = useState(false);

  const fetchData = async (silent = false) => {
    if (!token) return;
    if (!silent) setLoading(true);
    setError(null);
    try {
      const [usersRes, subsRes, plansRes] = await Promise.all([
        getUsersByGymId(token),
        getSubscriptions(token).catch(() => ({ success: true, data: [] })),
        getPlans(token).catch(() => []),
      ]);

      const planByUserId: Record<string, string> = {};
      const activeSub: Record<string, { planId: string; subscriptionId: string }> = {};
      if (subsRes.data) {
        subsRes.data.forEach(
          (s: {
            userId: string;
            status: string;
            plan?: { name: string; id: string };
            id: string;
          }) => {
            if (s.status === "active" && s.plan) {
              planByUserId[s.userId] = s.plan.name;
              activeSub[s.userId] = {
                planId: s.plan.id,
                subscriptionId: s.id,
              };
            }
          }
        );
      }

      setActiveSubByUserId(activeSub);
      setAlunos(usersRes.users.map((u) => mapUserToAluno(u, planByUserId)));
      setPlanos(
        Array.isArray(plansRes)
          ? plansRes.map((p: { id: string; name: string }) => ({ id: p.id, name: p.name }))
          : []
      );
    } catch (err) {
      setError((err as { message?: string }).message || "Erro ao carregar alunos.");
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [token]);

  const filtered = alunos.filter((a) =>
    a.nome.toLowerCase().includes(busca.toLowerCase())
  );

  const openFinanceModal = async (a: Aluno) => {
    setFinanceAluno(a);
    setFinanceModalOpen(true);
    setFinanceData(null);
    if (!token) return;
    setFinanceLoading(true);
    try {
      const [payRes, subsRes, enrollmentsRes] = await Promise.all([
        getPaymentsByUser(token, a.id, { limit: 100, offset: 0 }),
        getUserSubscriptions(token, a.id).catch(() => ({ success: true, data: [] })),
        getEnrollmentsByUser(token, a.id).catch(() => []),
      ]);
      const extraClasses = (enrollmentsRes || []).filter(
        (e) => e.gymClass && Number(e.gymClass.price ?? 0) > 0
      );
      const paidPayments = payRes.payments.filter(
        (p) => p.status === "paid" || p.status === "PAID" || p.status === "COMPLETED"
      );
      const totalPaid = paidPayments.reduce(
        (s, p) => s + Number(p.amount || 0),
        0
      );
      const now = new Date();
      const currentMonth = now.getMonth();
      const currentYear = now.getFullYear();
      const currentMonthPayment =
        payRes.payments.find((p) => {
          const d = new Date(p.dueDate);
          return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
        }) ?? null;
      const activeSub = subsRes.data?.find(
        (s: { status: string }) => s.status === "active"
      );
      const planName = activeSub?.plan?.name || a.plano || "Nenhum";
      const planPrice = activeSub?.plan?.price ?? 0;
      const subscriptionId = activeSub?.id ?? null;
      const planIncludesClasses = !!activeSub?.plan?.includesClasses;
      setFinanceData({
        planName,
        planPrice: Number(planPrice || 0),
        subscriptionId,
        planIncludesClasses,
        payments: payRes.payments,
        totalPaid,
        currentMonthPayment,
        extraClasses,
      });
    } catch (err) {
      setError((err as { message?: string }).message || "Erro ao carregar dados financeiros.");
    } finally {
      setFinanceLoading(false);
    }
  };

  const openRegisterPayment = async () => {
    if (!token) return;
    setRegisterPaymentOpen(true);
    setSelectedPaymentMethodId("");
    try {
      const methods = await getPaymentMethods(token);
      setPaymentMethods(methods);
      if (methods.length > 0) setSelectedPaymentMethodId(methods[0].id);
    } catch (err) {
      setError((err as { message?: string }).message || "Erro ao carregar métodos de pagamento.");
    }
  };

  const openRegisterExtraClassPayment = async (enrollment: GymClassEnrollment) => {
    if (!token) return;
    setSelectedExtraClassForPayment(enrollment);
    setRegisterExtraClassPaymentOpen(true);
    setSelectedPaymentMethodId("");
    try {
      const methods = await getPaymentMethods(token);
      setPaymentMethods(methods);
      if (methods.length > 0) setSelectedPaymentMethodId(methods[0].id);
    } catch (err) {
      setError((err as { message?: string }).message || "Erro ao carregar métodos de pagamento.");
    }
  };

  const handleRegisterExtraClassPayment = async () => {
    if (!token || !financeAluno || !selectedExtraClassForPayment?.gymClass || !selectedPaymentMethodId) return;
    const amount = Number(selectedExtraClassForPayment.gymClass.price ?? 0);
    if (amount <= 0) {
      setError("Valor da aula inválido.");
      return;
    }
    setRegisteringExtraClassPayment(true);
    setError(null);
    try {
      await createExtraClassPayment(token, {
        userId: financeAluno.id,
        paymentMethodId: selectedPaymentMethodId,
        gymClassId: selectedExtraClassForPayment.gymClass.id,
        gymClassName: selectedExtraClassForPayment.gymClass.name,
        amount,
        paymentDate: new Date().toISOString(),
      });
      setRegisterExtraClassPaymentOpen(false);
      setSelectedExtraClassForPayment(null);
      await openFinanceModal(financeAluno);
    } catch (err) {
      setError((err as { message?: string }).message || "Erro ao registrar pagamento da aula extra.");
    } finally {
      setRegisteringExtraClassPayment(false);
    }
  };

  const handleRegisterPayment = async () => {
    if (!token || !financeAluno || !financeData?.subscriptionId || !selectedPaymentMethodId) return;
    const amount = financeData.currentMonthPayment
      ? Number(financeData.currentMonthPayment.amount || 0)
      : financeData.planPrice;
    if (amount <= 0) {
      setError("Valor do pagamento inválido.");
      return;
    }
    setRegisteringPayment(true);
    setError(null);
    try {
      const now = new Date();
      const dueDate = financeData.currentMonthPayment?.dueDate
        ? new Date(financeData.currentMonthPayment.dueDate).toISOString()
        : new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59).toISOString();
      await createSubscriptionPayment(token, {
        userId: financeAluno.id,
        subscriptionId: financeData.subscriptionId,
        paymentMethodId: selectedPaymentMethodId,
        amount,
        paymentDate: now.toISOString(),
        dueDate,
      });
      setRegisterPaymentOpen(false);
      await openFinanceModal(financeAluno);
    } catch (err) {
      setError((err as { message?: string }).message || "Erro ao registrar pagamento.");
    } finally {
      setRegisteringPayment(false);
    }
  };

  const openAccessModal = async (a: Aluno) => {
    setAccessAluno(a);
    setAccessModalOpen(true);
    setAccessData(null);
    if (!token) return;
    setAccessLoading(true);
    try {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 30);
      const res = await getAccessReports(token, {
        userId: a.id,
        startDate: startDate.toISOString().split("T")[0],
        endDate: endDate.toISOString().split("T")[0],
        limit: 100,
      });
      setAccessData(res.data || []);
    } catch (err) {
      setError((err as { message?: string }).message || "Erro ao carregar acessos.");
    } finally {
      setAccessLoading(false);
    }
  };

  const openTrainingModal = async (a: Aluno) => {
    setTrainingAluno(a);
    setTrainingModalOpen(true);
    setTrainingData(null);
    if (!token) return;
    setTrainingLoading(true);
    try {
      const data = await getUserWithTraining(token, a.id);
      setTrainingData(data);
    } catch (err) {
      setError((err as { message?: string }).message || "Erro ao carregar treino.");
    } finally {
      setTrainingLoading(false);
    }
  };

  const handleAllowAccess = async () => {
    if (!token || !accessAluno) return;
    setAllowingAccess(true);
    setError(null);
    try {
      const res = await allowAccess(token, accessAluno.id);
      if (res.success) {
        await openAccessModal(accessAluno);
      } else {
        setError(res.message);
      }
    } catch (err) {
      setError((err as { message?: string }).message || "Erro ao liberar acesso.");
    } finally {
      setAllowingAccess(false);
    }
  };

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
          <Button onClick={() => navigate("/alunos/novo")} size="sm" className="gap-1.5">
            <Plus size={16} />
            Novo Aluno
          </Button>
        </div>
      </header>
      <main className="px-4 py-6 max-w-5xl mx-auto">
        <h1 className="text-2xl font-bold text-foreground mb-1">Alunos</h1>
        <p className="text-sm text-muted-foreground mb-4">
          Gerencie os alunos da academia
        </p>

        {error && (
          <div className="p-3 rounded-lg bg-destructive/20 text-destructive text-sm mb-4">
            {error}
          </div>
        )}

        <div className="relative mb-5">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar aluno..."
            className="pl-9"
          />
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16 gap-2 text-muted-foreground">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span>Carregando alunos...</span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            <p>Nenhum aluno encontrado.</p>
          </div>
        ) : (
          <div className="grid gap-3">
            {filtered.map((aluno) => (
              <div
                key={aluno.id}
                className="p-4 rounded-xl bg-card border border-border hover:border-primary/30 transition-colors"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <Avatar className="h-12 w-12 shrink-0">
                      {aluno.imageUrl && (
                        <AvatarImage src={aluno.imageUrl} alt={aluno.nome} />
                      )}
                      <AvatarFallback className="bg-primary/20 text-primary font-semibold text-sm">
                        {getIniciais(aluno.nome)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-semibold text-foreground truncate">
                          {aluno.nome}
                        </p>
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full font-medium shrink-0 ${
                            aluno.status === "ativo"
                              ? "bg-primary/20 text-primary"
                              : "bg-destructive/20 text-destructive"
                          }`}
                        >
                          {aluno.status}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 mt-1">
                        <span className="text-sm text-muted-foreground truncate">
                          {aluno.email}
                        </span>
                        <span className="text-xs text-primary font-medium shrink-0">
                          {aluno.plano}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 ml-3">
                    <button
                      onClick={() => openAccessModal(aluno)}
                      className="p-2 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                      title="Acessos"
                    >
                      <DoorOpen size={16} />
                    </button>
                    <button
                      onClick={() => openTrainingModal(aluno)}
                      className="p-2 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                      title="Treino"
                    >
                      <Dumbbell size={16} />
                    </button>
                    <button
                      onClick={() => openFinanceModal(aluno)}
                      className="p-2 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                      title="Detalhes financeiros"
                    >
                      <DollarSign size={16} />
                    </button>
                    <button
                      onClick={() => navigate(`/alunos/${aluno.id}`)}
                      className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                      title="Editar"
                    >
                      <Pencil size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Modal Acessos */}
      {accessModalOpen && accessAluno && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
          <div className="bg-card border border-border rounded-xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                <DoorOpen size={20} className="text-primary" />
                Acessos - {accessAluno.nome}
              </h2>
              <button
                onClick={() => {
                  setAccessModalOpen(false);
                  setAccessAluno(null);
                  setAccessData(null);
                }}
                className="text-muted-foreground hover:text-foreground"
              >
                <X size={20} />
              </button>
            </div>
            <Button
              onClick={handleAllowAccess}
              disabled={allowingAccess || accessAluno.status === "inativo"}
              className="w-full mb-5 gap-2"
            >
              {allowingAccess ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <DoorOpen size={18} />
              )}
              Liberar acesso
            </Button>
            {accessAluno.status === "inativo" && (
              <p className="text-sm text-muted-foreground mb-4">
                Aluno inativo. Ative o aluno para liberar acesso.
              </p>
            )}
            {accessLoading ? (
              <div className="flex items-center justify-center py-12 gap-2 text-muted-foreground">
                <Loader2 className="h-6 w-6 animate-spin" />
                <span>Carregando...</span>
              </div>
            ) : accessData ? (
              <div className="space-y-4">
                <p className="text-sm font-semibold text-foreground">
                  Registros dos últimos 30 dias
                </p>
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {accessData
                    .filter((a) => a.accessStatus === "granted")
                    .sort(
                      (a, b) =>
                        new Date(b.accessDate).getTime() - new Date(a.accessDate).getTime()
                    )
                    .map((a) => (
                      <div
                        key={a.id}
                        className="flex items-center justify-between py-2 px-3 rounded-lg bg-muted/50 text-sm"
                      >
                        <span className="text-muted-foreground">
                          {new Date(a.accessDate).toLocaleDateString("pt-BR")} às{" "}
                          {new Date(a.accessDate).toLocaleTimeString("pt-BR", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                        <span className="text-xs text-primary font-medium">
                          {a.accessMethod === "manual" ? "Manual" : a.accessMethod}
                        </span>
                      </div>
                    ))}
                  {accessData.filter((a) => a.accessStatus === "granted").length === 0 && (
                    <p className="text-sm text-muted-foreground py-8 text-center">
                      Nenhum acesso registrado nos últimos 30 dias.
                    </p>
                  )}
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground py-8 text-center">
                Não foi possível carregar os dados.
              </p>
            )}
          </div>
        </div>
      )}

      {/* Modal Treino */}
      {trainingModalOpen && trainingAluno && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div
            className="bg-card border border-border rounded-2xl w-full max-w-lg overflow-hidden max-h-[90vh] flex flex-col shadow-2xl shadow-black/40 animate-modal-in"
            style={{ animationFillMode: "both" }}
          >
            {/* Header com gradiente - shrink-0 para nunca encolher, overflow-visible para não cortar o X */}
            <div className="relative shrink-0 bg-gradient-to-br from-primary/20 via-primary/5 to-transparent p-6 border-b border-border/50 rounded-t-2xl">
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_hsl(var(--primary)/0.15)_0%,_transparent_60%)]" />
              <div className="relative flex items-start justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="p-2.5 rounded-xl bg-primary/20 text-primary animate-pulse-soft shrink-0">
                    <Dumbbell size={24} strokeWidth={2.5} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h2 className="text-xl font-bold text-foreground tracking-tight break-words">
                      Treino de {trainingAluno.nome}
                    </h2>
                    <p className="text-sm text-muted-foreground mt-0.5">
                      Visualize o treino ativo do aluno
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {canEditTraining && (
                    <Button
                      variant="secondary"
                      size="sm"
                      className="gap-1.5"
                      onClick={() => {
                        const activeTraining = trainingData?.trainings?.find((t) => t.isActive);
                        navigate("/alunos/treino", {
                          state: {
                            aluno: trainingAluno,
                            trainingData,
                            trainingId: activeTraining?.id,
                          },
                        });
                        setTrainingModalOpen(false);
                        setTrainingAluno(null);
                        setTrainingData(null);
                      }}
                    >
                      <Edit3 size={16} />
                      {trainingData?.trainings?.some((t) => t.isActive)
                        ? "Editar treino"
                        : "Criar treino"}
                    </Button>
                  )}
                  <button
                    onClick={() => {
                      setTrainingModalOpen(false);
                      setTrainingAluno(null);
                      setTrainingData(null);
                    }}
                    className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary/80 transition-colors duration-200"
                    aria-label="Fechar"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>
            </div>

            {/* Conteúdo - min-h-0 necessário para overflow funcionar em flex */}
            <div className="flex-1 min-h-0 overflow-y-auto p-6">
              {trainingLoading ? (
                <div className="space-y-3 animate-pulse-soft">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="space-y-3">
                      <div className="h-4 w-48 rounded-full bg-muted/60" />
                      <div className="space-y-2 pl-4">
                        {[1, 2, 3, 4].map((j) => (
                          <div
                            key={j}
                            className="h-3 rounded-full bg-muted/40"
                            style={{
                              width: `${60 + j * 8}%`,
                              animationDelay: `${(i + j) * 0.1}s`,
                            }}
                          />
                        ))}
                      </div>
                    </div>
                  ))}
                  <div className="flex justify-center pt-6">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                </div>
              ) : trainingData ? (
                <div className="space-y-6">
                  {trainingData.trainings && trainingData.trainings.length > 0 ? (
                    trainingData.trainings
                      .filter((t) => t.isActive)
                      .map((ut, utIdx) => (
                        <div
                          key={ut.id}
                          className="space-y-4 animate-slide-up opacity-0"
                          style={{
                            animationDelay: `${utIdx * 0.1}s`,
                            animationFillMode: "forwards",
                          }}
                        >
                          {/* Card do treino */}
                          <div className="space-y-4">
                            <div className="rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 p-5 gym-card-glow">
                                <div className="flex items-start justify-between gap-3">
                                  <div>
                                    <h3 className="font-bold text-xl text-foreground">
                                      {ut.trainingList.name}
                                    </h3>
                                    {ut.trainingList.description && (
                                      <p className="text-sm text-muted-foreground mt-1.5">
                                        {ut.trainingList.description}
                                      </p>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-3 shrink-0">
                                    <div className="flex items-center gap-3 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20">
                                      <span className="text-xs text-muted-foreground">Prof.</span>
                                      <span className="text-sm font-semibold text-primary">
                                        {ut.teacher.name}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              </div>

                              {/* Presets */}
                          {ut.trainingList.presets &&
                            Object.entries(ut.trainingList.presets).map(
                              ([presetName, preset], presetIdx) => (
                                <div
                                  key={presetName}
                                  className="space-y-3 animate-slide-up opacity-0"
                                  style={{
                                    animationDelay: `${(utIdx + 1) * 0.1 + presetIdx * 0.08}s`,
                                    animationFillMode: "forwards",
                                  }}
                                >
                                  <div className="flex items-center gap-3">
                                    <div className="h-8 w-1 rounded-full bg-primary/60" />
                                    <h4 className="font-semibold text-foreground">
                                      {presetName}
                                    </h4>
                                    {preset.lastExecutionDate && (
                                      <span className="text-xs px-2.5 py-1 rounded-full bg-muted/60 text-muted-foreground">
                                        Último:{" "}
                                        {new Date(
                                          preset.lastExecutionDate
                                        ).toLocaleDateString("pt-BR")}
                                      </span>
                                    )}
                                  </div>

                                  {preset.groups && preset.groups.length > 0 ? (
                                    <div className="space-y-4 pl-4">
                                      {preset.groups
                                        .sort(
                                          (a, b) =>
                                            a.orderPosition - b.orderPosition
                                        )
                                        .map((g, gIdx) => (
                                          <div
                                            key={g.id}
                                            className="group animate-slide-in-left opacity-0"
                                            style={{
                                              animationDelay: `${(utIdx + 1) * 0.1 + presetIdx * 0.08 + (gIdx + 1) * 0.06}s`,
                                              animationFillMode: "forwards",
                                            }}
                                          >
                                            <div className="pl-4 border-l-2 border-primary/40 hover:border-primary/60 transition-colors duration-300">
                                              {g.name && (
                                                <p className="text-sm font-semibold text-primary mb-2">
                                                  {g.name}
                                                </p>
                                              )}
                                              <div className="space-y-2">
                                                {g.exercises
                                                  .sort(
                                                    (a, b) =>
                                                      a.orderPosition -
                                                      b.orderPosition
                                                  )
                                                  .map((ex) => (
                                                    <div
                                                      key={ex.id}
                                                      className="flex items-center gap-3 py-2 px-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors duration-200 group-hover:bg-muted/40"
                                                    >
                                                      <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-primary/15 text-primary shrink-0 overflow-hidden">
                                                        {ex.animationLink ? (
                                                          <img
                                                            src={ex.animationLink}
                                                            alt={ex.name}
                                                            className="w-full h-full object-contain"
                                                          />
                                                        ) : (
                                                          <Dumbbell size={18} />
                                                        )}
                                                      </div>
                                                      <div className="flex-1 min-w-0">
                                                        <p className="text-sm font-medium text-foreground truncate">
                                                          {ex.name}
                                                        </p>
                                                        <div className="flex flex-wrap gap-2 mt-1">
                                                          <span className="text-xs px-2 py-0.5 rounded-md bg-primary/20 text-primary font-medium">
                                                            {ex.sets}x
                                                            {ex.repetitions} rep
                                                          </span>
                                                          {ex.intervalSeconds >
                                                            0 && (
                                                            <span className="text-xs px-2 py-0.5 rounded-md bg-muted/60 text-muted-foreground">
                                                              {ex.intervalSeconds}
                                                              s descanso
                                                            </span>
                                                          )}
                                                        </div>
                                                      </div>
                                                    </div>
                                                  ))}
                                              </div>
                                            </div>
                                          </div>
                                        ))}
                                    </div>
                                  ) : preset.exercises &&
                                    preset.exercises.length > 0 ? (
                                    <div className="space-y-2 pl-4">
                                      {preset.exercises
                                        .sort(
                                          (a, b) =>
                                            a.orderPosition - b.orderPosition
                                        )
                                        .map((ex, exIdx) => (
                                          <div
                                            key={ex.id}
                                            className="flex items-center gap-3 py-2 px-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors duration-200 animate-slide-in-left opacity-0"
                                            style={{
                                              animationDelay: `${(utIdx + 1) * 0.1 + presetIdx * 0.08 + (exIdx + 1) * 0.05}s`,
                                              animationFillMode: "forwards",
                                            }}
                                          >
                                            <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-primary/15 text-primary shrink-0 overflow-hidden">
                                              {ex.animationLink ? (
                                                <img
                                                  src={ex.animationLink}
                                                  alt={ex.name}
                                                  className="w-full h-full object-contain"
                                                />
                                              ) : (
                                                <Dumbbell size={18} />
                                              )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                              <p className="text-sm font-medium text-foreground truncate">
                                                {ex.name}
                                              </p>
                                              <div className="flex flex-wrap gap-2 mt-1">
                                                <span className="text-xs px-2 py-0.5 rounded-md bg-primary/20 text-primary font-medium">
                                                  {ex.sets}x{ex.repetitions} rep
                                                </span>
                                                {ex.intervalSeconds > 0 && (
                                                  <span className="text-xs px-2 py-0.5 rounded-md bg-muted/60 text-muted-foreground">
                                                    {ex.intervalSeconds}s
                                                    descanso
                                                  </span>
                                                )}
                                              </div>
                                            </div>
                                          </div>
                                        ))}
                                    </div>
                                  ) : (
                                    <p className="text-sm text-muted-foreground pl-4 border-l-2 border-muted/50 italic">
                                      Nenhum exercício neste preset.
                                    </p>
                                  )}
                                </div>
                              )
                            )}
                          </div>
                        </div>
                      ))
                  ) : (
                    <div className="flex flex-col items-center justify-center py-16 text-center animate-slide-up opacity-0"
                      style={{ animationFillMode: "forwards" }}
                    >
                      <div className="p-6 rounded-full bg-muted/50 mb-4">
                        <Dumbbell size={48} className="text-muted-foreground" />
                      </div>
                      <p className="text-base font-medium text-foreground">
                        Nenhum treino ativo
                      </p>
                      <p className="text-sm text-muted-foreground mt-1 max-w-xs">
                        Este aluno ainda não possui um treino ativo cadastrado.
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-16 text-center animate-slide-up opacity-0"
                  style={{ animationFillMode: "forwards" }}
                >
                  <div className="p-6 rounded-full bg-destructive/10 mb-4">
                    <X size={48} className="text-destructive" />
                  </div>
                  <p className="text-base font-medium text-foreground">
                    Erro ao carregar
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Não foi possível carregar o treino.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal Registrar Pagamento */}
      {registerPaymentOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
          <div className="bg-card border border-border rounded-xl w-full max-w-sm p-6">
            <h2 className="text-lg font-bold text-foreground mb-2">
              Registrar pagamento
            </h2>
            <p className="text-sm text-muted-foreground mb-4">
              Selecione o método de pagamento para registrar a mensalidade.
            </p>
            <div className="space-y-4">
              {financeData && (
                <div className="p-3 rounded-lg bg-muted/50 text-sm">
                  <p className="text-muted-foreground">Valor</p>
                  <p className="font-semibold text-foreground">
                    {(financeData.currentMonthPayment
                      ? Number(financeData.currentMonthPayment.amount || 0)
                      : financeData.planPrice
                    ).toLocaleString("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    })}
                  </p>
                </div>
              )}
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">
                  Método de pagamento
                </label>
                {paymentMethods.length === 0 ? (
                  <p className="text-sm text-muted-foreground py-2">
                    Nenhum método de pagamento cadastrado. Cadastre em Financeiro.
                  </p>
                ) : (
                  <select
                    value={selectedPaymentMethodId}
                    onChange={(e) => setSelectedPaymentMethodId(e.target.value)}
                    className="w-full h-10 px-3 rounded-md border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    {paymentMethods.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <Button
                variant="secondary"
                className="flex-1"
                onClick={() => setRegisterPaymentOpen(false)}
                disabled={registeringPayment}
              >
                Cancelar
              </Button>
              <Button
                className="flex-1"
                onClick={handleRegisterPayment}
                disabled={
                  registeringPayment ||
                  !selectedPaymentMethodId ||
                  !financeData?.subscriptionId
                }
              >
                {registeringPayment ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  "Registrar"
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Registrar Pagamento Aula Extra */}
      {registerExtraClassPaymentOpen && selectedExtraClassForPayment && financeAluno && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
          <div className="bg-card border border-border rounded-xl w-full max-w-sm p-6">
            <h2 className="text-lg font-bold text-foreground mb-2">
              Registrar pagamento - Aula extra
            </h2>
            <p className="text-sm text-muted-foreground mb-4">
              Pagamento da aula: <strong>{selectedExtraClassForPayment.gymClass?.name}</strong>
            </p>
            <div className="space-y-4">
              <div className="p-3 rounded-lg bg-muted/50 text-sm">
                <p className="text-muted-foreground">Valor</p>
                <p className="font-semibold text-foreground">
                  {Number(selectedExtraClassForPayment.gymClass?.price ?? 0).toLocaleString("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  })}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">
                  Método de pagamento
                </label>
                {paymentMethods.length === 0 ? (
                  <p className="text-sm text-muted-foreground py-2">
                    Nenhum método de pagamento cadastrado. Cadastre em Financeiro.
                  </p>
                ) : (
                  <select
                    value={selectedPaymentMethodId}
                    onChange={(e) => setSelectedPaymentMethodId(e.target.value)}
                    className="w-full h-10 px-3 rounded-md border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    {paymentMethods.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <Button
                variant="secondary"
                className="flex-1"
                onClick={() => {
                  setRegisterExtraClassPaymentOpen(false);
                  setSelectedExtraClassForPayment(null);
                }}
                disabled={registeringExtraClassPayment}
              >
                Cancelar
              </Button>
              <Button
                className="flex-1"
                onClick={handleRegisterExtraClassPayment}
                disabled={
                  registeringExtraClassPayment ||
                  !selectedPaymentMethodId
                }
              >
                {registeringExtraClassPayment ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  "Registrar"
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Detalhes Financeiros */}
      {financeModalOpen && financeAluno && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
          <div className="bg-card border border-border rounded-xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                <DollarSign size={20} className="text-primary" />
                Financeiro - {financeAluno.nome}
              </h2>
              <button
                onClick={() => {
                  setFinanceModalOpen(false);
                  setFinanceAluno(null);
                  setFinanceData(null);
                }}
                className="text-muted-foreground hover:text-foreground"
              >
                <X size={20} />
              </button>
            </div>
            {financeLoading ? (
              <div className="flex items-center justify-center py-12 gap-2 text-muted-foreground">
                <Loader2 className="h-6 w-6 animate-spin" />
                <span>Carregando...</span>
              </div>
            ) : financeData ? (
              <div className="space-y-5">
                {financeData.subscriptionId && (
                  <Button
                    onClick={openRegisterPayment}
                    className="w-full gap-2"
                  >
                    <DollarSign size={18} />
                    Registrar pagamento da mensalidade
                  </Button>
                )}
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-4 rounded-xl bg-primary/10 border border-primary/20">
                    <p className="text-xs text-muted-foreground mb-0.5">Plano atual</p>
                    <p className="font-semibold text-foreground">{financeData.planName}</p>
                    {financeData.planIncludesClasses && (
                      <p className="text-xs text-emerald-600 font-medium mt-1">Plano full – aulas extras inclusas</p>
                    )}
                  </div>
                  <div className="p-4 rounded-xl bg-primary/10 border border-primary/20">
                    <p className="text-xs text-muted-foreground mb-0.5">Total gasto</p>
                    <p className="font-semibold text-primary">
                      {financeData.totalPaid.toLocaleString("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      })}
                    </p>
                  </div>
                </div>
                {financeData.currentMonthPayment && (
                  <div className="p-4 rounded-xl bg-card border border-border">
                    <p className="text-xs text-muted-foreground mb-1">Mensalidade do mês</p>
                    <div className="flex items-center justify-between">
                      <span className="font-medium">
                        {financeData.currentMonthPayment.plan?.name || "—"}
                      </span>
                      <span
                        className={`text-sm font-bold ${
                          financeData.currentMonthPayment.status === "paid" ||
                          financeData.currentMonthPayment.status === "PAID" ||
                          financeData.currentMonthPayment.status === "COMPLETED"
                            ? "text-primary"
                            : "text-amber-600"
                        }`}
                      >
                        {financeData.currentMonthPayment.amount.toLocaleString("pt-BR", {
                          style: "currency",
                          currency: "BRL",
                        })}{" "}
                        (
                        {financeData.currentMonthPayment.status === "paid" ||
                        financeData.currentMonthPayment.status === "PAID" ||
                        financeData.currentMonthPayment.status === "COMPLETED"
                          ? "Pago"
                          : financeData.currentMonthPayment.status === "overdue"
                            ? "Em atraso"
                            : "Pendente"}
                        )
                      </span>
                    </div>
                  </div>
                )}
                {!financeData.planIncludesClasses && financeData.extraClasses.length > 0 && (
                  <div className="p-4 rounded-xl bg-card border border-border">
                    <p className="text-xs text-muted-foreground mb-1">Aulas extras</p>
                    <p className="font-semibold text-foreground mb-2">
                      {financeData.extraClasses
                        .reduce(
                          (s, e) => s + Number(e.gymClass?.price ?? 0),
                          0
                        )
                        .toLocaleString("pt-BR", {
                          style: "currency",
                          currency: "BRL",
                        })}
                    </p>
                    <div className="space-y-2">
                      {financeData.extraClasses.map((e) => (
                        <div
                          key={e.id}
                          className="flex items-center justify-between gap-2 py-1.5 px-2 rounded-lg bg-muted/30"
                        >
                          <div className="flex-1 min-w-0">
                            <span className="text-sm text-foreground">{e.gymClass?.name || "—"}</span>
                            <span className="text-sm font-medium text-foreground ml-1">
                              {Number(e.gymClass?.price ?? 0).toLocaleString("pt-BR", {
                                style: "currency",
                                currency: "BRL",
                              })}
                            </span>
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            className="shrink-0 text-xs"
                            onClick={() => openRegisterExtraClassPayment(e)}
                          >
                            <DollarSign size={12} className="mr-1" />
                            Registrar pagamento
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                <div>
                  <p className="text-sm font-semibold text-foreground mb-3">
                    Histórico de pagamentos
                  </p>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {financeData.payments
                      .filter(
                        (p) =>
                          p.status === "paid" ||
                          p.status === "PAID" ||
                          p.status === "COMPLETED"
                      )
                      .sort(
                        (a, b) =>
                          new Date(b.paymentDate || b.dueDate).getTime() -
                          new Date(a.paymentDate || a.dueDate).getTime()
                      )
                      .map((p) => (
                        <div
                          key={p.id}
                          className="flex flex-col gap-0.5 py-2 px-3 rounded-lg bg-muted/50 text-sm"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-muted-foreground">
                              {new Date(p.paymentDate || p.dueDate).toLocaleDateString("pt-BR")} -{" "}
                              {p.plan?.name || p.notes || "—"}
                            </span>
                            <span className="font-medium text-primary">
                              {Number(p.amount).toLocaleString("pt-BR", {
                                style: "currency",
                                currency: "BRL",
                              })}
                            </span>
                          </div>
                          {p.receivedByName && (
                            <span className="text-xs text-muted-foreground">
                              Registrado por: {p.receivedByName}
                            </span>
                          )}
                        </div>
                      ))}
                    {financeData.payments.filter(
                      (p) =>
                        p.status === "paid" ||
                        p.status === "PAID" ||
                        p.status === "COMPLETED"
                    ).length === 0 && (
                      <p className="text-sm text-muted-foreground py-4 text-center">
                        Nenhum pagamento registrado ainda.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground py-8 text-center">
                Não foi possível carregar os dados.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Alunos;
