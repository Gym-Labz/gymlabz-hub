import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Plus, Pencil, Trash2, X, Send, Eye, ThumbsUp, BarChart2, Loader2, ImagePlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import logo from "@/assets/gymlabz-logo.png";
import { useAuth } from "@/contexts/AuthContext";
import {
  getCommunicationsForEmployee,
  createCommunication,
  updateCommunication,
  deleteCommunication,
  type CommunicationForEmployee,
  type CommunicationType,
} from "@/lib/communication-api";

const TYPE_LABELS: Record<CommunicationType, string> = {
  notification: "Notificação",
  alert: "Alerta",
  information: "Informação",
  promotion: "Promoção",
  reminder: "Lembrete",
};

const STATUS_LABELS: Record<string, string> = {
  pending: "Pendente",
  sent: "Enviado",
  delivered: "Entregue",
  read: "Lido",
  failed: "Falhou",
};

const Comunicacao = () => {
  const navigate = useNavigate();
  const { token } = useAuth();
  const [comunicados, setComunicados] = useState<CommunicationForEmployee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [titulo, setTitulo] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [tipo, setTipo] = useState<CommunicationType>("notification");
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [detailId, setDetailId] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchComunicados = () => {
    if (!token) return;
    getCommunicationsForEmployee(token, { limit: 50 })
      .then((data) => setComunicados(data))
      .catch((err) => {
        setError((err as { message?: string }).message || "Erro ao carregar comunicados.");
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (!token) return;
    let cancelled = false;
    setLoading(true);
    getCommunicationsForEmployee(token, { limit: 50 })
      .then((data) => {
        if (!cancelled) setComunicados(data);
      })
      .catch((err) => {
        if (!cancelled) {
          setError((err as { message?: string }).message || "Erro ao carregar comunicados.");
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [token]);

  const resetForm = () => {
    setTitulo("");
    setMensagem("");
    setTipo("notification");
    setEditingId(null);
    setShowForm(false);
    setImageFile(null);
    setImagePreview(null);
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Selecione apenas arquivos de imagem (JPEG, PNG, WebP ou GIF).");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("A imagem deve ter no máximo 5MB.");
      return;
    }
    setError(null);
    setImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleEdit = (c: CommunicationForEmployee) => {
    setTitulo(c.title);
    setMensagem(c.content);
    setTipo(c.type);
    setEditingId(c.id);
    setImageFile(null);
    setImagePreview(null);
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!titulo.trim() || !mensagem.trim() || !token) return;
    setSaving(true);
    setError(null);
    try {
      if (editingId) {
        await updateCommunication(token, editingId, {
          title: titulo.trim(),
          content: mensagem.trim(),
          type: tipo,
        });
        setComunicados((prev) =>
          prev.map((c) =>
            c.id === editingId
              ? { ...c, title: titulo.trim(), content: mensagem.trim(), type: tipo }
              : c
          )
        );
      } else {
        await createCommunication(
          token,
          {
            title: titulo.trim(),
            content: mensagem.trim(),
            type: tipo,
            source: "gym",
            status: "pending",
          },
          imageFile
        );
        fetchComunicados();
      }
      resetForm();
    } catch (err: unknown) {
      setError((err as { message?: string }).message || "Erro ao salvar comunicado.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!token) return;
    setDeleting(true);
    setError(null);
    try {
      await deleteCommunication(token, id);
      setComunicados((prev) => prev.filter((c) => c.id !== id));
      setDeleteConfirm(null);
    } catch (err: unknown) {
      setError((err as { message?: string }).message || "Erro ao excluir comunicado.");
    } finally {
      setDeleting(false);
    }
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "-";
    return new Date(dateStr).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 bg-card/80 backdrop-blur-lg border-b border-border">
        <div className="flex items-center justify-between px-4 h-14 max-w-5xl mx-auto">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/dashboard")}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft size={20} />
            </button>
            <img src={logo} alt="GymLabz" className="w-8 h-8 object-contain" />
            <span className="text-base font-bold">Comunicação</span>
          </div>
          <Button
            size="sm"
            onClick={() => {
              resetForm();
              setShowForm(true);
            }}
            className="gym-gradient text-primary-foreground font-semibold hover:opacity-90"
          >
            <Plus size={16} className="mr-1" /> Novo
          </Button>
        </div>
      </header>

      <main className="px-4 py-4 max-w-5xl mx-auto space-y-3">
        {error && (
          <div className="p-3 rounded-lg bg-destructive/20 text-destructive text-sm">
            {error}
          </div>
        )}

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
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Tipo</label>
                  <Select value={tipo} onValueChange={(v) => setTipo(v as CommunicationType)}>
                    <SelectTrigger className="h-11 bg-secondary border-border">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {(Object.keys(TYPE_LABELS) as CommunicationType[]).map((k) => (
                        <SelectItem key={k} value={k}>
                          {TYPE_LABELS[k]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {!editingId && (
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Imagem (opcional)</label>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/gif"
                      onChange={handleImageSelect}
                      className="hidden"
                    />
                    {imagePreview ? (
                      <div className="relative rounded-lg overflow-hidden border border-border bg-secondary">
                        <img
                          src={imagePreview}
                          alt="Preview"
                          className="w-full h-32 object-cover"
                        />
                        <button
                          type="button"
                          onClick={removeImage}
                          className="absolute top-2 right-2 p-1.5 rounded-full bg-black/60 text-white hover:bg-black/80 transition-colors"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full h-12 rounded-lg border border-dashed border-border bg-secondary/50 hover:bg-secondary transition-colors flex items-center justify-center gap-2 text-muted-foreground text-sm"
                      >
                        <ImagePlus size={18} />
                        Adicionar imagem (máx. 5MB)
                      </button>
                    )}
                  </div>
                )}
              </div>

              <Button
                onClick={handleSave}
                disabled={!titulo.trim() || !mensagem.trim() || saving}
                className="w-full h-11 gym-gradient text-primary-foreground font-semibold hover:opacity-90 disabled:opacity-50"
              >
                {saving ? (
                  <Loader2 size={16} className="mr-2 animate-spin" />
                ) : (
                  <Send size={16} className="mr-2" />
                )}
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
                <Button
                  variant="outline"
                  className="flex-1 border-border text-foreground hover:bg-secondary"
                  onClick={() => setDeleteConfirm(null)}
                  disabled={deleting}
                >
                  Cancelar
                </Button>
                <Button
                  className="flex-1 bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  onClick={() => handleDelete(deleteConfirm)}
                  disabled={deleting}
                >
                  {deleting ? <Loader2 size={16} className="animate-spin" /> : "Excluir"}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* List */}
        {loading ? (
          <div className="flex items-center justify-center py-20 gap-2 text-muted-foreground">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span>Carregando comunicados...</span>
          </div>
        ) : comunicados.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
            <p className="text-sm">Nenhum comunicado ainda.</p>
            <p className="text-xs mt-1">Clique em &quot;Novo&quot; para criar o primeiro.</p>
          </div>
        ) : (
          comunicados.map((c) => (
            <div
              key={c.id}
              className="bg-card border border-border rounded-xl p-4 space-y-2 hover:border-primary/30 transition-colors"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-semibold text-foreground text-sm truncate">{c.title}</h3>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-primary/20 text-primary font-medium">
                      {TYPE_LABELS[c.type]}
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-secondary text-muted-foreground">
                      {STATUS_LABELS[c.status]}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {formatDate(c.sentDate || c.scheduledDate || null)}
                  </p>
                </div>
                <div className="flex gap-1 shrink-0">
                  <button
                    onClick={() => setDetailId(detailId === c.id ? null : c.id)}
                    className="p-2 rounded-lg text-muted-foreground hover:text-primary hover:bg-secondary transition-colors"
                    title="Estatísticas"
                  >
                    <BarChart2 size={16} />
                  </button>
                  <button
                    onClick={() => handleEdit(c)}
                    className="p-2 rounded-lg text-muted-foreground hover:text-primary hover:bg-secondary transition-colors"
                    title="Editar"
                  >
                    <Pencil size={16} />
                  </button>
                  <button
                    onClick={() => setDeleteConfirm(c.id)}
                    className="p-2 rounded-lg text-muted-foreground hover:text-destructive hover:bg-secondary transition-colors"
                    title="Excluir"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">{c.content}</p>

              {c.imageUrl && (
                <img
                  src={c.imageUrl}
                  alt={c.title}
                  className="w-full rounded-lg object-cover max-h-48"
                />
              )}

              {detailId === c.id && (
                <div className="flex items-center gap-4 pt-2 border-t border-border mt-2">
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <Eye size={14} className="text-primary" />
                    <span className="text-xs font-medium">
                      {c.readCount} / {c.recipientCount} leituras
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <ThumbsUp size={14} className="text-primary" />
                    <span className="text-xs font-medium">{c.likedCount} curtidas</span>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </main>
    </div>
  );
};

export default Comunicacao;
