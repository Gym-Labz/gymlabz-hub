import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Plus, Pencil, Trash2, X, TrendingUp, TrendingDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import logo from "@/assets/gymlabz-logo.png";

interface Transacao {
  id: string;
  descricao: string;
  valor: number;
  tipo: "receita" | "despesa";
  data: string;
}

const initialTransacoes: Transacao[] = [
  { id: "1", descricao: "Mensalidade - Carlos Silva", valor: 89.9, tipo: "receita", data: "2025-03-10" },
  { id: "2", descricao: "Conta de energia", valor: 450.0, tipo: "despesa", data: "2025-03-08" },
  { id: "3", descricao: "Mensalidade - Ana Souza", valor: 239.9, tipo: "receita", data: "2025-03-05" },
  { id: "4", descricao: "Manutenção equipamentos", valor: 320.0, tipo: "despesa", data: "2025-03-03" },
];

const Financeiro = () => {
  const navigate = useNavigate();
  const [transacoes, setTransacoes] = useState<Transacao[]>(initialTransacoes);
  const [modalOpen, setModalOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [descricao, setDescricao] = useState("");
  const [valor, setValor] = useState("");
  const [tipo, setTipo] = useState<"receita" | "despesa">("receita");
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const totalReceitas = transacoes.filter((t) => t.tipo === "receita").reduce((s, t) => s + t.valor, 0);
  const totalDespesas = transacoes.filter((t) => t.tipo === "despesa").reduce((s, t) => s + t.valor, 0);
  const fmt = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  const fmtDate = (d: string) => new Date(d + "T00:00:00").toLocaleDateString("pt-BR");

  const openNew = () => { setEditId(null); setDescricao(""); setValor(""); setTipo("receita"); setModalOpen(true); };
  const openEdit = (t: Transacao) => { setEditId(t.id); setDescricao(t.descricao); setValor(t.valor.toString()); setTipo(t.tipo); setModalOpen(true); };

  const handleSave = () => {
    if (!descricao.trim() || !valor.trim()) return;
    if (editId) {
      setTransacoes((prev) => prev.map((t) => t.id === editId ? { ...t, descricao, valor: parseFloat(valor), tipo } : t));
    } else {
      setTransacoes((prev) => [{ id: Date.now().toString(), descricao, valor: parseFloat(valor), tipo, data: new Date().toISOString().split("T")[0] }, ...prev]);
    }
    setModalOpen(false);
  };

  const handleDelete = () => { if (deleteId) { setTransacoes((prev) => prev.filter((t) => t.id !== deleteId)); setDeleteId(null); } };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 bg-card/80 backdrop-blur-lg border-b border-border">
        <div className="flex items-center justify-between px-4 h-16 max-w-5xl mx-auto">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate("/dashboard")} className="text-muted-foreground hover:text-foreground transition-colors"><ArrowLeft size={20} /></button>
            <img src={logo} alt="GymLabz" className="w-9 h-9 object-contain" />
            <span className="text-lg font-bold tracking-tight">Gym<span className="gym-text-gradient">Labz</span></span>
          </div>
          <Button onClick={openNew} size="sm" className="gap-1.5"><Plus size={16} />Nova Transação</Button>
        </div>
      </header>
      <main className="px-4 py-6 max-w-5xl mx-auto">
        <h1 className="text-2xl font-bold text-foreground mb-1">Financeiro</h1>
        <p className="text-sm text-muted-foreground mb-5">Receitas e despesas da academia</p>

        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="p-4 rounded-xl bg-card border border-border">
            <div className="flex items-center gap-2 mb-1"><TrendingUp size={16} className="text-primary" /><span className="text-xs text-muted-foreground">Receitas</span></div>
            <p className="text-lg font-bold text-primary">{fmt(totalReceitas)}</p>
          </div>
          <div className="p-4 rounded-xl bg-card border border-border">
            <div className="flex items-center gap-2 mb-1"><TrendingDown size={16} className="text-destructive" /><span className="text-xs text-muted-foreground">Despesas</span></div>
            <p className="text-lg font-bold text-destructive">{fmt(totalDespesas)}</p>
          </div>
        </div>

        <div className="grid gap-3">
          {transacoes.map((t) => (
            <div key={t.id} className="flex items-center justify-between p-4 rounded-xl bg-card border border-border hover:border-primary/30 transition-colors">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${t.tipo === "receita" ? "bg-primary/20" : "bg-destructive/20"}`}>
                  {t.tipo === "receita" ? <TrendingUp size={18} className="text-primary" /> : <TrendingDown size={18} className="text-destructive" />}
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-foreground truncate">{t.descricao}</p>
                  <span className="text-xs text-muted-foreground">{fmtDate(t.data)}</span>
                </div>
              </div>
              <div className="flex items-center gap-2 ml-3">
                <span className={`text-sm font-bold ${t.tipo === "receita" ? "text-primary" : "text-destructive"}`}>{t.tipo === "receita" ? "+" : "-"}{fmt(t.valor)}</span>
                <button onClick={() => openEdit(t)} className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"><Pencil size={16} /></button>
                <button onClick={() => setDeleteId(t.id)} className="p-2 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"><Trash2 size={16} /></button>
              </div>
            </div>
          ))}
        </div>
      </main>
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
          <div className="bg-card border border-border rounded-xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-foreground">{editId ? "Editar Transação" : "Nova Transação"}</h2>
              <button onClick={() => setModalOpen(false)} className="text-muted-foreground hover:text-foreground"><X size={20} /></button>
            </div>
            <div className="space-y-4">
              <div><label className="text-sm font-medium text-foreground mb-1.5 block">Descrição</label><Input value={descricao} onChange={(e) => setDescricao(e.target.value)} placeholder="Ex: Mensalidade, Conta de luz..." /></div>
              <div><label className="text-sm font-medium text-foreground mb-1.5 block">Valor (R$)</label><Input type="number" step="0.01" value={valor} onChange={(e) => setValor(e.target.value)} placeholder="0.00" /></div>
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">Tipo</label>
                <div className="flex gap-2">
                  <button onClick={() => setTipo("receita")} className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${tipo === "receita" ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"}`}>Receita</button>
                  <button onClick={() => setTipo("despesa")} className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${tipo === "despesa" ? "bg-destructive text-destructive-foreground" : "bg-secondary text-secondary-foreground"}`}>Despesa</button>
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <Button variant="secondary" className="flex-1" onClick={() => setModalOpen(false)}>Cancelar</Button>
              <Button className="flex-1" onClick={handleSave}>Salvar</Button>
            </div>
          </div>
        </div>
      )}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
          <div className="bg-card border border-border rounded-xl w-full max-w-sm p-6 text-center">
            <h2 className="text-lg font-bold text-foreground mb-2">Excluir transação?</h2>
            <p className="text-sm text-muted-foreground mb-6">Esta ação não pode ser desfeita.</p>
            <div className="flex gap-3">
              <Button variant="secondary" className="flex-1" onClick={() => setDeleteId(null)}>Cancelar</Button>
              <Button variant="destructive" className="flex-1" onClick={handleDelete}>Excluir</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Financeiro;
