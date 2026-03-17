import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Plus,
  Pencil,
  Trash2,
  X,
  ShieldCheck,
  ShieldOff,
  Search,
  DoorOpen,
  Clock,
  Loader2,
  Filter,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import logo from "@/assets/gymlabz-logo.png";
import { useAuth } from "@/contexts/AuthContext";
import { getAccessReports, type AccessReportItem } from "@/lib/access-api";

interface Regra {
  id: string;
  nome: string;
  descricao: string;
  ativa: boolean;
  criadoEm: string;
}

const initialRegras: Regra[] = [
  { id: "1", nome: "Horário VIP", descricao: "Acesso exclusivo das 6h às 8h para planos premium", ativa: true, criadoEm: "2025-01-10" },
  { id: "2", nome: "Bloqueio inadimplentes", descricao: "Bloquear entrada de alunos com pagamento atrasado", ativa: true, criadoEm: "2025-02-01" },
  { id: "3", nome: "Acesso fim de semana", descricao: "Permitir acesso sábado e domingo para todos os planos", ativa: false, criadoEm: "2025-03-01" },
];

const ControleAcesso = () => {
  const navigate = useNavigate();
  const { token, hasRole } = useAuth();
  const canManageRegras = hasRole("MANAGER");

  // Regras (mock - backend não possui CRUD de regras)
  const [regras, setRegras] = useState<Regra[]>(initialRegras);
  const [modalOpen, setModalOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [nome, setNome] = useState("");
  const [descricao, setDescricao] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Registros de acesso (integrados com API)
  const [registros, setRegistros] = useState<AccessReportItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busca, setBusca] = useState("");
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 7);
    return d.toISOString().split("T")[0];
  });
  const [endDate, setEndDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [summary, setSummary] = useState<{ totalAccess: number; successRate: number } | null>(null);

  const fetchRegistros = async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const res = await getAccessReports(token, {
        startDate,
        endDate,
        page,
        limit: 30,
      });
      setRegistros(res.data);
      setTotalPages(res.pagination.totalPages);
      setSummary(res.summary);
    } catch (err) {
      setError((err as { message?: string }).message || "Erro ao carregar registros de acesso.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRegistros();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, startDate, endDate, page]);

  const filtered = registros.filter((r) =>
    r.userName.toLowerCase().includes(busca.toLowerCase())
  );

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("pt-BR");
  };

  const formatTime = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
  };

  const getTipoLabel = (accessType: string) =>
    accessType === "entry" ? "Entrada" : "Saída";

  const isEntry = (accessType: string) => accessType === "entry";

  // Regras
  const openNew = () => {
    setEditId(null);
    setNome("");
    setDescricao("");
    setModalOpen(true);
  };
  const openEdit = (r: Regra) => {
    setEditId(r.id);
    setNome(r.nome);
    setDescricao(r.descricao);
    setModalOpen(true);
  };

  const toggleAtiva = (id: string) => {
    setRegras((prev) => prev.map((r) => (r.id === id ? { ...r, ativa: !r.ativa } : r)));
  };

  const handleSave = () => {
    if (!nome.trim()) return;
    if (editId) {
      setRegras((prev) =>
        prev.map((r) => (r.id === editId ? { ...r, nome, descricao } : r))
      );
    } else {
      setRegras((prev) => [
        {
          id: Date.now().toString(),
          nome,
          descricao,
          ativa: true,
          criadoEm: new Date().toISOString().split("T")[0],
        },
        ...prev,
      ]);
    }
    setModalOpen(false);
  };

  const handleDelete = () => {
    if (deleteId) {
      setRegras((prev) => prev.filter((r) => r.id !== deleteId));
      setDeleteId(null);
    }
  };

  return (
    <div className="space-y-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-2xl font-bold text-foreground">
                Controle de Acesso
              </h1>
            </div>
            <p className="text-sm text-muted-foreground">
              Registros de entrada/saída e regras de acesso
            </p>
          </div>
          {canManageRegras && (
            <Button onClick={openNew} size="sm" className="gap-1.5">
              <Plus size={16} />
              Nova Regra
            </Button>
          )}
        </div>

        {error && (
          <div className="p-3 rounded-lg bg-destructive/20 text-destructive text-sm">
            {error}
          </div>
        )}

        {/* Card: Registros de Acesso */}
        <section className="rounded-xl bg-card border border-border p-5">
          <h2 className="text-lg font-semibold text-foreground mb-1 flex items-center gap-2">
            <DoorOpen size={20} className="text-primary" />
            Registros de Acesso
          </h2>
          <p className="text-xs text-muted-foreground mb-4">
            Entradas e saídas dos alunos
          </p>

          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            <div className="relative flex-1">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              />
              <Input
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                placeholder="Buscar por aluno..."
                className="pl-9"
              />
            </div>
            <div className="flex gap-2 items-center flex-wrap">
              <div className="flex items-center gap-1">
                <Filter size={14} className="text-muted-foreground" />
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-[130px]"
                />
              </div>
              <span className="text-muted-foreground text-sm">até</span>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-[130px]"
              />
              <Button size="sm" variant="secondary" onClick={() => setPage(1)}>
                Filtrar
              </Button>
            </div>
          </div>

          {summary && (
            <div className="flex gap-6 mb-4 p-3 rounded-lg bg-secondary/50">
              <div>
                <span className="text-xs text-muted-foreground">Total no período</span>
                <p className="font-semibold text-foreground">{summary.totalAccess}</p>
              </div>
              <div>
                <span className="text-xs text-muted-foreground">Taxa de sucesso</span>
                <p className="font-semibold text-primary">{summary.successRate}%</p>
              </div>
            </div>
          )}

          {loading ? (
            <div className="flex items-center justify-center py-12 gap-2 text-muted-foreground">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span>Carregando registros...</span>
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <p>Nenhum registro encontrado.</p>
              <p className="text-xs mt-1">Ajuste os filtros ou o período.</p>
            </div>
          ) : (
            <>
              <div className="grid gap-2">
                {filtered.map((r) => (
                  <div
                    key={r.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-secondary/30 border border-border/50"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                          isEntry(r.accessType) ? "bg-primary/20" : "bg-muted"
                        }`}
                      >
                        <DoorOpen
                          size={16}
                          className={
                            isEntry(r.accessType)
                              ? "text-primary"
                              : "text-muted-foreground"
                          }
                        />
                      </div>
                      <div>
                        <p className="font-medium text-foreground text-sm">
                          {r.userName}
                        </p>
                        <span
                          className={`text-xs font-medium ${
                            isEntry(r.accessType)
                              ? "text-primary"
                              : "text-muted-foreground"
                          }`}
                        >
                          {getTipoLabel(r.accessType)}
                        </span>
                        {r.accessStatus !== "granted" && (
                          <span className="ml-2 text-xs text-destructive">
                            ({r.accessStatus})
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Clock size={12} />
                      <span>{formatTime(r.accessDate)}</span>
                      <span>• {formatDate(r.accessDate)}</span>
                    </div>
                  </div>
                ))}
              </div>

              {totalPages > 1 && (
                <div className="flex justify-center gap-2 mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page <= 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                  >
                    Anterior
                  </Button>
                  <span className="flex items-center text-sm text-muted-foreground">
                    Página {page} de {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page >= totalPages}
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  >
                    Próxima
                  </Button>
                </div>
              )}
            </>
          )}
        </section>

        {/* Regras de acesso */}
        <section>
          <h2 className="text-lg font-semibold text-foreground mb-1 flex items-center gap-2">
            <ShieldCheck size={20} className="text-primary" />
            Regras de Acesso
          </h2>
          <p className="text-xs text-muted-foreground mb-4">
            Permissões e configurações aplicadas na validação
          </p>

          <div className="grid gap-3">
            {regras.map((r) => (
              <div
                key={r.id}
                className="flex items-center justify-between p-4 rounded-xl bg-card border border-border hover:border-primary/30 transition-colors"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <button
                    onClick={() => canManageRegras && toggleAtiva(r.id)}
                    disabled={!canManageRegras}
                    className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${
                      r.ativa ? "bg-primary/20" : "bg-secondary"
                    } ${!canManageRegras ? "opacity-60 cursor-not-allowed" : ""}`}
                  >
                    {r.ativa ? (
                      <ShieldCheck size={18} className="text-primary" />
                    ) : (
                      <ShieldOff size={18} className="text-muted-foreground" />
                    )}
                  </button>
                  <div className="min-w-0">
                    <p
                      className={`font-semibold truncate ${
                        r.ativa ? "text-foreground" : "text-muted-foreground"
                      }`}
                    >
                      {r.nome}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {r.descricao}
                    </p>
                  </div>
                </div>
                {canManageRegras && (
                  <div className="flex items-center gap-1 ml-3">
                    <button
                      onClick={() => openEdit(r)}
                      className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                    >
                      <Pencil size={16} />
                    </button>
                    <button
                      onClick={() => setDeleteId(r.id)}
                      className="p-2 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>


      {/* Modal Nova/Editar Regra */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
          <div className="bg-card border border-border rounded-xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-foreground">
                {editId ? "Editar Regra" : "Nova Regra"}
              </h2>
              <button
                onClick={() => setModalOpen(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X size={20} />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">
                  Nome
                </label>
                <Input
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  placeholder="Nome da regra"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">
                  Descrição
                </label>
                <Input
                  value={descricao}
                  onChange={(e) => setDescricao(e.target.value)}
                  placeholder="Descreva a regra..."
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <Button
                variant="secondary"
                className="flex-1"
                onClick={() => setModalOpen(false)}
              >
                Cancelar
              </Button>
              <Button className="flex-1" onClick={handleSave}>
                Salvar
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Excluir Regra */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
          <div className="bg-card border border-border rounded-xl w-full max-w-sm p-6 text-center">
            <h2 className="text-lg font-bold text-foreground mb-2">
              Excluir regra?
            </h2>
            <p className="text-sm text-muted-foreground mb-6">
              Esta ação não pode ser desfeita.
            </p>
            <div className="flex gap-3">
              <Button
                variant="secondary"
                className="flex-1"
                onClick={() => setDeleteId(null)}
              >
                Cancelar
              </Button>
              <Button
                variant="destructive"
                className="flex-1"
                onClick={handleDelete}
              >
                Excluir
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ControleAcesso;
