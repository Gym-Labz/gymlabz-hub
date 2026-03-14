import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Plus, Pencil, Trash2, X, ShieldCheck, ShieldOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import logo from "@/assets/gymlabz-logo.png";

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
  const [regras, setRegras] = useState<Regra[]>(initialRegras);
  const [modalOpen, setModalOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [nome, setNome] = useState("");
  const [descricao, setDescricao] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const openNew = () => { setEditId(null); setNome(""); setDescricao(""); setModalOpen(true); };
  const openEdit = (r: Regra) => { setEditId(r.id); setNome(r.nome); setDescricao(r.descricao); setModalOpen(true); };

  const toggleAtiva = (id: string) => {
    setRegras((prev) => prev.map((r) => r.id === id ? { ...r, ativa: !r.ativa } : r));
  };

  const handleSave = () => {
    if (!nome.trim()) return;
    if (editId) {
      setRegras((prev) => prev.map((r) => r.id === editId ? { ...r, nome, descricao } : r));
    } else {
      setRegras((prev) => [{ id: Date.now().toString(), nome, descricao, ativa: true, criadoEm: new Date().toISOString().split("T")[0] }, ...prev]);
    }
    setModalOpen(false);
  };

  const handleDelete = () => { if (deleteId) { setRegras((prev) => prev.filter((r) => r.id !== deleteId)); setDeleteId(null); } };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 bg-card/80 backdrop-blur-lg border-b border-border">
        <div className="flex items-center justify-between px-4 h-16 max-w-5xl mx-auto">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate("/dashboard")} className="text-muted-foreground hover:text-foreground transition-colors"><ArrowLeft size={20} /></button>
            <img src={logo} alt="GymLabz" className="w-9 h-9 object-contain" />
            <span className="text-lg font-bold tracking-tight">Gym<span className="gym-text-gradient">Labz</span></span>
          </div>
          <Button onClick={openNew} size="sm" className="gap-1.5"><Plus size={16} />Nova Regra</Button>
        </div>
      </header>
      <main className="px-4 py-6 max-w-5xl mx-auto">
        <h1 className="text-2xl font-bold text-foreground mb-1">Controle de Acesso</h1>
        <p className="text-sm text-muted-foreground mb-5">Permissões e regras de acesso</p>
        <div className="grid gap-3">
          {regras.map((r) => (
            <div key={r.id} className="flex items-center justify-between p-4 rounded-xl bg-card border border-border hover:border-primary/30 transition-colors">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <button onClick={() => toggleAtiva(r.id)} className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${r.ativa ? "bg-primary/20" : "bg-secondary"}`}>
                  {r.ativa ? <ShieldCheck size={18} className="text-primary" /> : <ShieldOff size={18} className="text-muted-foreground" />}
                </button>
                <div className="min-w-0">
                  <p className={`font-semibold truncate ${r.ativa ? "text-foreground" : "text-muted-foreground"}`}>{r.nome}</p>
                  <p className="text-xs text-muted-foreground truncate">{r.descricao}</p>
                </div>
              </div>
              <div className="flex items-center gap-1 ml-3">
                <button onClick={() => openEdit(r)} className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"><Pencil size={16} /></button>
                <button onClick={() => setDeleteId(r.id)} className="p-2 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"><Trash2 size={16} /></button>
              </div>
            </div>
          ))}
        </div>
      </main>
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
          <div className="bg-card border border-border rounded-xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-foreground">{editId ? "Editar Regra" : "Nova Regra"}</h2>
              <button onClick={() => setModalOpen(false)} className="text-muted-foreground hover:text-foreground"><X size={20} /></button>
            </div>
            <div className="space-y-4">
              <div><label className="text-sm font-medium text-foreground mb-1.5 block">Nome</label><Input value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Nome da regra" /></div>
              <div><label className="text-sm font-medium text-foreground mb-1.5 block">Descrição</label><Input value={descricao} onChange={(e) => setDescricao(e.target.value)} placeholder="Descreva a regra..." /></div>
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
            <h2 className="text-lg font-bold text-foreground mb-2">Excluir regra?</h2>
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

export default ControleAcesso;
