import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Plus, Pencil, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import logo from "@/assets/gymlabz-logo.png";

interface Plano {
  id: string;
  nome: string;
  preco: number;
  criadoEm: string;
}

const initialPlanos: Plano[] = [
  { id: "1", nome: "Mensal", preco: 89.9, criadoEm: "2025-01-10" },
  { id: "2", nome: "Trimestral", preco: 239.9, criadoEm: "2025-02-05" },
  { id: "3", nome: "Semestral", preco: 449.9, criadoEm: "2025-03-01" },
  { id: "4", nome: "Anual", preco: 799.9, criadoEm: "2025-03-10" },
];

const Planos = () => {
  const navigate = useNavigate();
  const [planos, setPlanos] = useState<Plano[]>(initialPlanos);
  const [modalOpen, setModalOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [nome, setNome] = useState("");
  const [preco, setPreco] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const openNew = () => {
    setEditId(null);
    setNome("");
    setPreco("");
    setModalOpen(true);
  };

  const openEdit = (plano: Plano) => {
    setEditId(plano.id);
    setNome(plano.nome);
    setPreco(plano.preco.toString());
    setModalOpen(true);
  };

  const handleSave = () => {
    if (!nome.trim() || !preco.trim()) return;
    if (editId) {
      setPlanos((prev) =>
        prev.map((p) =>
          p.id === editId ? { ...p, nome, preco: parseFloat(preco) } : p
        )
      );
    } else {
      const novo: Plano = {
        id: Date.now().toString(),
        nome,
        preco: parseFloat(preco),
        criadoEm: new Date().toISOString().split("T")[0],
      };
      setPlanos((prev) => [novo, ...prev]);
    }
    setModalOpen(false);
  };

  const handleDelete = () => {
    if (deleteId) {
      setPlanos((prev) => prev.filter((p) => p.id !== deleteId));
      setDeleteId(null);
    }
  };

  const formatCurrency = (value: number) =>
    value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  const formatDate = (date: string) =>
    new Date(date + "T00:00:00").toLocaleDateString("pt-BR");

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-card/80 backdrop-blur-lg border-b border-border">
        <div className="flex items-center justify-between px-4 h-16 max-w-5xl mx-auto">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate("/dashboard")} className="text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft size={20} />
            </button>
            <img src={logo} alt="GymLabz" className="w-9 h-9 object-contain" />
            <span className="text-lg font-bold tracking-tight">
              Gym<span className="gym-text-gradient">Labz</span>
            </span>
          </div>
          <Button onClick={openNew} size="sm" className="gap-1.5">
            <Plus size={16} />
            Novo Plano
          </Button>
        </div>
      </header>

      {/* Content */}
      <main className="px-4 py-6 max-w-5xl mx-auto">
        <h1 className="text-2xl font-bold text-foreground mb-1">Planos</h1>
        <p className="text-sm text-muted-foreground mb-6">Gerencie os planos da academia</p>

        {planos.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            <p>Nenhum plano cadastrado.</p>
          </div>
        ) : (
          <div className="grid gap-3">
            {planos.map((plano) => (
              <div
                key={plano.id}
                className="flex items-center justify-between p-4 rounded-xl bg-card border border-border hover:border-primary/30 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-foreground truncate">{plano.nome}</p>
                  <div className="flex items-center gap-4 mt-1">
                    <span className="text-sm font-medium text-primary">{formatCurrency(plano.preco)}</span>
                    <span className="text-xs text-muted-foreground">Criado em {formatDate(plano.criadoEm)}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1 ml-3">
                  <button onClick={() => openEdit(plano)} className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors">
                    <Pencil size={16} />
                  </button>
                  <button onClick={() => setDeleteId(plano.id)} className="p-2 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors">
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
          <div className="bg-card border border-border rounded-xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-foreground">{editId ? "Editar Plano" : "Novo Plano"}</h2>
              <button onClick={() => setModalOpen(false)} className="text-muted-foreground hover:text-foreground">
                <X size={20} />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">Nome do plano</label>
                <Input value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Ex: Mensal, Trimestral..." />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">Preço (R$)</label>
                <Input type="number" step="0.01" value={preco} onChange={(e) => setPreco(e.target.value)} placeholder="0.00" />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <Button variant="secondary" className="flex-1" onClick={() => setModalOpen(false)}>Cancelar</Button>
              <Button className="flex-1" onClick={handleSave}>Salvar</Button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmação de exclusão */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
          <div className="bg-card border border-border rounded-xl w-full max-w-sm p-6 text-center">
            <h2 className="text-lg font-bold text-foreground mb-2">Excluir plano?</h2>
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

export default Planos;
