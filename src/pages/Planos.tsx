import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Plus, Pencil, Trash2, X, Loader2, Info, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { CollapsibleCard } from "@/components/CollapsibleCard";
import {
  getPlans,
  createPlan,
  updatePlan,
  deletePlan,
  getDurationDaysForBillingCycle,
  type Plan,
  type BillingCycle,
} from "@/lib/plans-api";

const BILLING_CYCLE_LABELS: Record<BillingCycle, string> = {
  monthly: "Mensal",
  quarterly: "Trimestral",
  semiannual: "Semestral",
  annual: "Anual",
};

const Planos = () => {
  const navigate = useNavigate();
  const { token, hasRole } = useAuth();
  const canManage = hasRole("MANAGER");
  const [planos, setPlanos] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [nome, setNome] = useState("");
  const [preco, setPreco] = useState("");
  const [ciclo, setCiclo] = useState<BillingCycle>("monthly");
  const [descricao, setDescricao] = useState("");
  const [incluiAulas, setIncluiAulas] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [detailsPlano, setDetailsPlano] = useState<Plan | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!token) return;
    let cancelled = false;
    getPlans(token)
      .then((data) => {
        if (!cancelled) setPlanos(data);
      })
      .catch((err) => {
        if (!cancelled) {
          setError((err as { message?: string }).message || "Erro ao carregar planos.");
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [token]);

  const resetForm = () => {
    setEditId(null);
    setNome("");
    setPreco("");
    setCiclo("monthly");
    setDescricao("");
    setIncluiAulas(false);
    setModalOpen(false);
  };

  const openNew = () => {
    resetForm();
    setModalOpen(true);
  };

  const openEdit = (plano: Plan) => {
    setEditId(plano.id);
    setNome(plano.name);
    setPreco(String(Number(plano.price)));
    setCiclo(plano.billingCycle as BillingCycle);
    setDescricao(plano.description || "");
    setIncluiAulas(!!plano.includesClasses);
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!nome.trim() || !preco.trim() || !token) return;
    const precoNum = parseFloat(preco.replace(",", "."));
    if (isNaN(precoNum) || precoNum < 0) return;

    setSaving(true);
    setError(null);
    try {
      const durationDays = getDurationDaysForBillingCycle(ciclo);
      if (editId) {
        const res = await updatePlan(token, editId, {
          name: nome.trim(),
          price: precoNum,
          billingCycle: ciclo,
          durationDays,
          description: descricao.trim() || undefined,
          includesClasses: incluiAulas,
        });
        setPlanos((prev) =>
          prev.map((p) => (p.id === editId ? res.data : p))
        );
      } else {
        const res = await createPlan(token, {
          name: nome.trim(),
          price: precoNum,
          billingCycle: ciclo,
          durationDays,
          description: descricao.trim() || undefined,
          includesClasses: incluiAulas,
        });
        setPlanos((prev) => [res.data, ...prev]);
      }
      resetForm();
    } catch (err: unknown) {
      setError((err as { message?: string }).message || "Erro ao salvar plano.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId || !token) return;
    setDeleting(true);
    setError(null);
    try {
      await deletePlan(token, deleteId);
      setPlanos((prev) => prev.filter((p) => p.id !== deleteId));
      setDeleteId(null);
    } catch (err: unknown) {
      setError((err as { message?: string }).message || "Erro ao excluir plano.");
    } finally {
      setDeleting(false);
    }
  };

  const formatCurrency = (value: number) =>
    value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString("pt-BR");

  const getBenefitLabel = (b: { name?: string; title?: string; description?: string } | string) =>
    typeof b === "string" ? b : (b?.name || b?.title || b?.description || "");

  return (
    <>
        <div className="flex items-center justify-between mb-4 mt-2">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-2xl font-bold text-foreground">Planos</h1>
            </div>
            <p className="text-sm text-muted-foreground">
              Gerencie os planos da academia
            </p>
          </div>
          {canManage && (
            <Button onClick={openNew} size="sm" className="gap-1.5">
              <Plus size={16} />
              Novo Plano
            </Button>
          )}
        </div>

        {error && (
          <div className="p-3 rounded-lg bg-destructive/20 text-destructive text-sm mb-4">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-20 gap-2 text-muted-foreground">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span>Carregando planos...</span>
          </div>
        ) : planos.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            <p>Nenhum plano cadastrado.</p>
            {canManage && (
              <p className="text-xs mt-1">Clique em &quot;Novo Plano&quot; para criar o primeiro.</p>
            )}
          </div>
        ) : (
          <div className="grid gap-3">
            {planos.map((plano) => (
              <div
                key={plano.id}
                className="rounded-xl bg-card border border-border hover:border-primary/30 transition-colors overflow-hidden"
              >
                {/* ── Mobile: collapsible ── */}
                <CollapsibleCard
                  className="sm:hidden"
                  header={
                    <>
                      <span className="font-semibold text-foreground truncate flex-1 min-w-0 text-sm">
                        {plano.name}
                      </span>
                      <span className="text-sm font-medium text-primary shrink-0">
                        {formatCurrency(Number(plano.price))}
                      </span>
                    </>
                  }
                >
                  <div className="flex flex-wrap gap-2 pt-3 pb-2">
                    <span className="text-xs px-2 py-0.5 rounded-full bg-primary/20 text-primary font-medium">
                      {BILLING_CYCLE_LABELS[plano.billingCycle as BillingCycle]}
                    </span>
                    {plano.includesClasses && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-600 font-medium">
                        Plano full
                      </span>
                    )}
                    <span className="text-xs text-muted-foreground">
                      Criado em {formatDate(plano.createdAt)}
                    </span>
                  </div>
                  <div className={`grid gap-2 mt-1 ${canManage ? "grid-cols-3" : "grid-cols-1"}`}>
                    <button
                      onClick={() => setDetailsPlano(plano)}
                      className="flex flex-col items-center gap-1 py-2.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                    >
                      <Info size={18} />
                      <span className="text-xs">Detalhes</span>
                    </button>
                    {canManage && (
                      <>
                        <button
                          onClick={() => openEdit(plano)}
                          className="flex flex-col items-center gap-1 py-2.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                        >
                          <Pencil size={18} />
                          <span className="text-xs">Editar</span>
                        </button>
                        <button
                          onClick={() => setDeleteId(plano.id)}
                          className="flex flex-col items-center gap-1 py-2.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                        >
                          <Trash2 size={18} />
                          <span className="text-xs">Excluir</span>
                        </button>
                      </>
                    )}
                  </div>
                </CollapsibleCard>

                {/* ── Desktop: layout completo ── */}
                <div className="hidden sm:flex items-center justify-between p-4">
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-foreground truncate">{plano.name}</p>
                    <div className="flex items-center gap-4 mt-1 flex-wrap">
                      <span className="text-sm font-medium text-primary">
                        {formatCurrency(Number(plano.price))}
                      </span>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-primary/20 text-primary font-medium">
                        {BILLING_CYCLE_LABELS[plano.billingCycle as BillingCycle]}
                      </span>
                      {plano.includesClasses && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-600 font-medium">
                          Plano full
                        </span>
                      )}
                      <span className="text-xs text-muted-foreground">
                        Criado em {formatDate(plano.createdAt)}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 ml-3 shrink-0">
                    <button
                      onClick={() => setDetailsPlano(plano)}
                      className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                      title="Ver detalhes do plano"
                    >
                      <Info size={16} />
                    </button>
                    {canManage && (
                      <>
                        <button
                          onClick={() => openEdit(plano)}
                          className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          onClick={() => setDeleteId(plano.id)}
                          className="p-2 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      {/* Modal Criar/Editar */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
          <div className="bg-card border border-border rounded-xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-foreground">
                {editId ? "Editar Plano" : "Novo Plano"}
              </h2>
              <button
                onClick={resetForm}
                className="text-muted-foreground hover:text-foreground"
              >
                <X size={20} />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">
                  Nome do plano
                </label>
                <Input
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  placeholder="Ex: Mensal, Trimestral..."
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">
                  Ciclo de cobrança
                </label>
                <select
                  value={ciclo}
                  onChange={(e) => setCiclo(e.target.value as BillingCycle)}
                  className="w-full h-10 px-3 rounded-md border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  {(Object.keys(BILLING_CYCLE_LABELS) as BillingCycle[]).map(
                    (k) => (
                      <option key={k} value={k}>
                        {BILLING_CYCLE_LABELS[k]}
                      </option>
                    )
                  )}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">
                  Preço (R$)
                </label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  value={preco}
                  onChange={(e) => setPreco(e.target.value)}
                  placeholder="0.00"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">
                  Descrição (opcional)
                </label>
                <Input
                  value={descricao}
                  onChange={(e) => setDescricao(e.target.value)}
                  placeholder="Ex: Acesso completo à academia..."
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="incluiAulas"
                  checked={incluiAulas}
                  onChange={(e) => setIncluiAulas(e.target.checked)}
                  className="w-4 h-4 rounded border-input"
                />
                <label htmlFor="incluiAulas" className="text-sm text-foreground cursor-pointer">
                  Plano full – inclui todas as aulas extras (sem pagamento adicional)
                </label>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <Button
                variant="secondary"
                className="flex-1"
                onClick={resetForm}
                disabled={saving}
              >
                Cancelar
              </Button>
              <Button
                className="flex-1"
                onClick={handleSave}
                disabled={!nome.trim() || !preco.trim() || saving}
              >
                {saving ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  "Salvar"
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Detalhes do Plano */}
      {detailsPlano && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
          <div className="bg-card border border-border rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-foreground">
                Detalhes do plano
              </h2>
              <button
                onClick={() => setDetailsPlano(null)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X size={20} />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <p className="text-sm font-semibold text-foreground">{detailsPlano.name}</p>
                <p className="text-lg font-bold text-primary mt-1">
                  {formatCurrency(Number(detailsPlano.price))}
                  <span className="text-sm font-normal text-muted-foreground ml-2">
                    {BILLING_CYCLE_LABELS[detailsPlano.billingCycle as BillingCycle]}
                  </span>
                </p>
              </div>
              {detailsPlano.description && (
                <div>
                  <p className="text-sm font-medium text-foreground mb-1">Descrição</p>
                  <p className="text-sm text-muted-foreground">{detailsPlano.description}</p>
                </div>
              )}
              {Number(detailsPlano.signupFee) > 0 && (
                <div>
                  <p className="text-sm font-medium text-foreground mb-1">Taxa de adesão</p>
                  <p className="text-sm text-muted-foreground">
                    {formatCurrency(Number(detailsPlano.signupFee))}
                  </p>
                </div>
              )}
              {detailsPlano.accessHours && (
                <div>
                  <p className="text-sm font-medium text-foreground mb-1">Horários de acesso</p>
                  <p className="text-sm text-muted-foreground">{detailsPlano.accessHours}</p>
                </div>
              )}
              {detailsPlano.includesClasses && (
                <div className="flex items-center gap-2 text-sm text-emerald-600 font-medium">
                  <Check size={16} className="shrink-0" />
                  <span>Plano full – inclui todas as aulas extras sem pagamento adicional</span>
                </div>
              )}
              {detailsPlano.maxVisitsPerMonth != null && detailsPlano.maxVisitsPerMonth > 0 && (
                <div>
                  <p className="text-sm font-medium text-foreground mb-1">Visitas por mês</p>
                  <p className="text-sm text-muted-foreground">
                    Até {detailsPlano.maxVisitsPerMonth} visitas
                  </p>
                </div>
              )}
              {detailsPlano.benefits && detailsPlano.benefits.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-foreground mb-2">Benefícios</p>
                  <ul className="space-y-1.5">
                    {detailsPlano.benefits.map((b, i) => {
                      const label = getBenefitLabel(b);
                      if (!label) return null;
                      return (
                        <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                          <Check size={14} className="text-primary shrink-0 mt-0.5" />
                          <span>{label}</span>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-4 pt-4 border-t border-border">
              Use estas informações para orientar o aluno sobre o plano.
            </p>
          </div>
        </div>
      )}

      {/* Confirmação de exclusão */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
          <div className="bg-card border border-border rounded-xl w-full max-w-sm p-6 text-center">
            <h2 className="text-lg font-bold text-foreground mb-2">
              Excluir plano?
            </h2>
            <p className="text-sm text-muted-foreground mb-6">
              Esta ação não pode ser desfeita.
            </p>
            <div className="flex gap-3">
              <Button
                variant="secondary"
                className="flex-1"
                onClick={() => setDeleteId(null)}
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
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  "Excluir"
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Planos;
