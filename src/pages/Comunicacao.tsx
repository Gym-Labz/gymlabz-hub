import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Plus, Pencil, Trash2, X, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import logo from "@/assets/gymlabz-logo.png";

interface Comunicado {
  id: string;
  titulo: string;
  mensagem: string;
  data: string;
}

const initialData: Comunicado[] = [
  { id: "1", titulo: "Horário de Carnaval", mensagem: "A academia funcionará em horário reduzido durante o Carnaval: 8h às 14h.", data: "2026-03-10" },
  { id: "2", titulo: "Novo equipamento", mensagem: "Chegaram novos equipamentos na sala de musculação. Venham conferir!", data: "2026-03-08" },
  { id: "3", titulo: "Manutenção piscina", mensagem: "A piscina ficará em manutenção no dia 15/03. Pedimos desculpas pelo transtorno.", data: "2026-03-05" },
];

const Comunicacao = () => {
  const navigate = useNavigate();
  const [comunicados, setComunicados] = useState<Comunicado[]>(initialData);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [titulo, setTitulo] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const resetForm = () => {
    setTitulo("");
    setMensagem("");
    setEditingId(null);
    setShowForm(false);
  };

  const handleEdit = (c: Comunicado) => {
    setTitulo(c.titulo);
    setMensagem(c.mensagem);
    setEditingId(c.id);
    setShowForm(true);
  };

  const handleSave = () => {
    if (!titulo.trim() || !mensagem.trim()) return;

    if (editingId) {
      setComunicados((prev) =>
        prev.map((c) => (c.id === editingId ? { ...c, titulo, mensagem } : c))
      );
    } else {
      const novo: Comunicado = {
        id: Date.now().toString(),
        titulo,
        mensagem,
        data: new Date().toISOString().split("T")[0],
      };
      setComunicados((prev) => [novo, ...prev]);
    }
    resetForm();
  };

  const handleDelete = (id: string) => {
    setComunicados((prev) => prev.filter((c) => c.id !== id));
    setDeleteConfirm(null);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-card/80 backdrop-blur-lg border-b border-border">
        <div className="flex items-center justify-between px-4 h-14 max-w-5xl mx-auto">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate("/dashboard")} className="text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft size={20} />
            </button>
            <img src={logo} alt="GymLabz" className="w-8 h-8 object-contain" />
            <span className="text-base font-bold">Comunicação</span>
          </div>
          <Button
            size="sm"
            onClick={() => { resetForm(); setShowForm(true); }}
            className="gym-gradient text-primary-foreground font-semibold hover:opacity-90"
          >
            <Plus size={16} className="mr-1" /> Novo
          </Button>
        </div>
      </header>

      <main className="px-4 py-4 max-w-5xl mx-auto space-y-3">
        {/* Form modal */}
        {showForm && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-card border border-border rounded-xl w-full max-w-md p-5 space-y-4 animate-in slide-in-from-bottom-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-foreground">
                  {editingId ? "Editar Comunicado" : "Novo Comunicado"}
                </h2>
                <button onClick={resetForm} className="text-muted-foreground hover:text-foreground">
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-3">
                <Input
                  placeholder="Título"
                  value={titulo}
                  onChange={(e) => setTitulo(e.target.value)}
                  className="h-11 bg-secondary border-border text-foreground placeholder:text-muted-foreground focus-visible:ring-primary"
                />
                <Textarea
                  placeholder="Mensagem"
                  value={mensagem}
                  onChange={(e) => setMensagem(e.target.value)}
                  rows={4}
                  className="bg-secondary border-border text-foreground placeholder:text-muted-foreground focus-visible:ring-primary resize-none"
                />
              </div>

              <Button
                onClick={handleSave}
                disabled={!titulo.trim() || !mensagem.trim()}
                className="w-full h-11 gym-gradient text-primary-foreground font-semibold hover:opacity-90 disabled:opacity-50"
              >
                <Send size={16} className="mr-2" />
                {editingId ? "Salvar Alterações" : "Publicar"}
              </Button>
            </div>
          </div>
        )}

        {/* Delete confirmation */}
        {deleteConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-card border border-border rounded-xl w-full max-w-sm p-5 space-y-4">
              <h2 className="text-lg font-bold text-foreground">Excluir comunicado?</h2>
              <p className="text-sm text-muted-foreground">Esta ação não pode ser desfeita.</p>
              <div className="flex gap-3">
                <Button variant="outline" className="flex-1 border-border text-foreground hover:bg-secondary" onClick={() => setDeleteConfirm(null)}>
                  Cancelar
                </Button>
                <Button className="flex-1 bg-destructive text-destructive-foreground hover:bg-destructive/90" onClick={() => handleDelete(deleteConfirm)}>
                  Excluir
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* List */}
        {comunicados.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
            <p className="text-sm">Nenhum comunicado ainda.</p>
          </div>
        ) : (
          comunicados.map((c) => (
            <div
              key={c.id}
              className="bg-card border border-border rounded-xl p-4 space-y-2 hover:border-primary/30 transition-colors"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-foreground text-sm truncate">{c.titulo}</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">{new Date(c.data).toLocaleDateString("pt-BR")}</p>
                </div>
                <div className="flex gap-1 shrink-0">
                  <button
                    onClick={() => handleEdit(c)}
                    className="p-2 rounded-lg text-muted-foreground hover:text-primary hover:bg-secondary transition-colors"
                  >
                    <Pencil size={16} />
                  </button>
                  <button
                    onClick={() => setDeleteConfirm(c.id)}
                    className="p-2 rounded-lg text-muted-foreground hover:text-destructive hover:bg-secondary transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">{c.mensagem}</p>
            </div>
          ))
        )}
      </main>
    </div>
  );
};

export default Comunicacao;
