import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Plus, Pencil, Trash2, X, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import logo from "@/assets/gymlabz-logo.png";

interface Aluno {
  id: string;
  nome: string;
  email: string;
  plano: string;
  status: "ativo" | "inativo";
  criadoEm: string;
}

const initialAlunos: Aluno[] = [
  { id: "1", nome: "Carlos Silva", email: "carlos@email.com", plano: "Mensal", status: "ativo", criadoEm: "2025-01-15" },
  { id: "2", nome: "Ana Souza", email: "ana@email.com", plano: "Trimestral", status: "ativo", criadoEm: "2025-02-10" },
  { id: "3", nome: "Pedro Lima", email: "pedro@email.com", plano: "Anual", status: "inativo", criadoEm: "2025-01-20" },
  { id: "4", nome: "Maria Oliveira", email: "maria@email.com", plano: "Semestral", status: "ativo", criadoEm: "2025-03-01" },
];

const Alunos = () => {
  const navigate = useNavigate();
  const [alunos, setAlunos] = useState<Aluno[]>(initialAlunos);
  const [modalOpen, setModalOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [plano, setPlano] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [busca, setBusca] = useState("");

  const filtered = alunos.filter((a) => a.nome.toLowerCase().includes(busca.toLowerCase()));

  const openNew = () => { setEditId(null); setNome(""); setEmail(""); setPlano(""); setModalOpen(true); };
  const openEdit = (a: Aluno) => { setEditId(a.id); setNome(a.nome); setEmail(a.email); setPlano(a.plano); setModalOpen(true); };

  const handleSave = () => {
    if (!nome.trim() || !email.trim()) return;
    if (editId) {
      setAlunos((prev) => prev.map((a) => a.id === editId ? { ...a, nome, email, plano } : a));
    } else {
      setAlunos((prev) => [{ id: Date.now().toString(), nome, email, plano, status: "ativo", criadoEm: new Date().toISOString().split("T")[0] }, ...prev]);
    }
    setModalOpen(false);
  };

  const handleDelete = () => { if (deleteId) { setAlunos((prev) => prev.filter((a) => a.id !== deleteId)); setDeleteId(null); } };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 bg-card/80 backdrop-blur-lg border-b border-border">
        <div className="flex items-center justify-between px-4 h-16 max-w-5xl mx-auto">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate("/dashboard")} className="text-muted-foreground hover:text-foreground transition-colors"><ArrowLeft size={20} /></button>
            <img src={logo} alt="GymLabz" className="w-9 h-9 object-contain" />
            <span className="text-lg font-bold tracking-tight">Gym<span className="gym-text-gradient">Labz</span></span>
          </div>
          <Button onClick={openNew} size="sm" className="gap-1.5"><Plus size={16} />Novo Aluno</Button>
        </div>
      </header>
      <main className="px-4 py-6 max-w-5xl mx-auto">
        <h1 className="text-2xl font-bold text-foreground mb-1">Alunos</h1>
        <p className="text-sm text-muted-foreground mb-4">Gerencie os alunos da academia</p>
        <div className="relative mb-5">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input value={busca} onChange={(e) => setBusca(e.target.value)} placeholder="Buscar aluno..." className="pl-9" />
        </div>
        {filtered.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground"><p>Nenhum aluno encontrado.</p></div>
        ) : (
          <div className="grid gap-3">
            {filtered.map((aluno) => (
              <div key={aluno.id} className="flex items-center justify-between p-4 rounded-xl bg-card border border-border hover:border-primary/30 transition-colors">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-foreground truncate">{aluno.nome}</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${aluno.status === "ativo" ? "bg-primary/20 text-primary" : "bg-destructive/20 text-destructive"}`}>
                      {aluno.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 mt-1">
                    <span className="text-sm text-muted-foreground">{aluno.email}</span>
                    <span className="text-xs text-primary font-medium">{aluno.plano}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1 ml-3">
                  <button onClick={() => openEdit(aluno)} className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"><Pencil size={16} /></button>
                  <button onClick={() => setDeleteId(aluno.id)} className="p-2 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"><Trash2 size={16} /></button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
          <div className="bg-card border border-border rounded-xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-foreground">{editId ? "Editar Aluno" : "Novo Aluno"}</h2>
              <button onClick={() => setModalOpen(false)} className="text-muted-foreground hover:text-foreground"><X size={20} /></button>
            </div>
            <div className="space-y-4">
              <div><label className="text-sm font-medium text-foreground mb-1.5 block">Nome</label><Input value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Nome completo" /></div>
              <div><label className="text-sm font-medium text-foreground mb-1.5 block">E-mail</label><Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email@exemplo.com" /></div>
              <div><label className="text-sm font-medium text-foreground mb-1.5 block">Plano</label><Input value={plano} onChange={(e) => setPlano(e.target.value)} placeholder="Ex: Mensal, Trimestral..." /></div>
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
            <h2 className="text-lg font-bold text-foreground mb-2">Excluir aluno?</h2>
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

export default Alunos;
