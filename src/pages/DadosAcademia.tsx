import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import logo from "@/assets/gymlabz-logo.png";
import { useAuth } from "@/contexts/AuthContext";
import { getGym, updateGym, type GymData, type UpdateGymData } from "@/lib/gym-api";

const formatPhone = (v: string) => {
  const n = v.replace(/\D/g, "");
  if (n.length <= 2) return n;
  if (n.length <= 6) return `(${n.slice(0, 2)}) ${n.slice(2)}`;
  return `(${n.slice(0, 2)}) ${n.slice(2, 7)}-${n.slice(7, 11)}`;
};

const DadosAcademia = () => {
  const navigate = useNavigate();
  const { token } = useAuth();
  const [gym, setGym] = useState<GymData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<UpdateGymData & { maxCapacityStr: string }>({
    name: "",
    email: "",
    phone: "",
    address: "",
    socialMedia: "",
    schedule: "",
    maxCapacityStr: "",
    manager: {},
  });

  const loadGym = useCallback(() => {
    if (!token) return;
    setLoading(true);
    setError(null);
    getGym(token)
      .then((data) => {
        setGym(data);
        setForm({
          name: data.name,
          email: data.email,
          phone: data.phone,
          address: data.address,
          socialMedia: data.socialMedia || "",
          schedule: data.schedule,
          maxCapacityStr: data.maxCapacity != null ? String(data.maxCapacity) : "",
          manager: data.manager
            ? {
                name: (data.manager.name as string) || "",
                email: (data.manager.email as string) || "",
                phone: (data.manager.phone as string) || "",
                position: (data.manager.position as string) || "",
              }
            : {},
        });
      })
      .catch((err) => {
        setError((err as { message?: string }).message || "Erro ao carregar dados da academia.");
      })
      .finally(() => setLoading(false));
  }, [token]);

  useEffect(() => {
    loadGym();
  }, [loadGym]);

  const handleSave = async () => {
    if (!token) return;
    setSaving(true);
    setError(null);
    const phoneDigits = form.phone?.replace(/\D/g, "") || "";
    const managerPhone = form.manager?.phone?.replace(/\D/g, "") || "";
    const updateData: UpdateGymData = {
      name: form.name?.trim() || undefined,
      email: form.email?.trim() || undefined,
      phone: phoneDigits.length >= 10 ? phoneDigits : undefined,
      address: form.address?.trim() || undefined,
      socialMedia: form.socialMedia?.trim() || undefined,
      schedule: form.schedule?.trim() || undefined,
      maxCapacity:
        form.maxCapacityStr === ""
          ? null
          : form.maxCapacityStr
            ? parseInt(form.maxCapacityStr, 10)
            : undefined,
    };
    if (form.manager) {
      const mgr: UpdateGymData["manager"] = {};
      if (form.manager.name !== undefined) mgr.name = form.manager.name.trim() || undefined;
      if (form.manager.email !== undefined) mgr.email = form.manager.email.trim() || undefined;
      if (managerPhone.length >= 10) mgr.phone = managerPhone;
      if (form.manager.position !== undefined)
        mgr.position = form.manager.position.trim() || undefined;
      if (Object.keys(mgr).length > 0) updateData.manager = mgr;
    }
    try {
      const updated = await updateGym(token, updateData);
      setGym(updated);
    } catch (err) {
      setError((err as { message?: string }).message || "Erro ao salvar dados.");
    } finally {
      setSaving(false);
    }
  };

  const hasChanges = () => {
    if (!gym) return false;
    const phoneDigits = form.phone?.replace(/\D/g, "") || "";
    const maxCap =
      form.maxCapacityStr === ""
        ? null
        : form.maxCapacityStr
          ? parseInt(form.maxCapacityStr, 10)
          : null;
    return (
      form.name !== gym.name ||
      form.email !== gym.email ||
      phoneDigits !== gym.phone.replace(/\D/g, "") ||
      form.address !== gym.address ||
      (form.socialMedia || "") !== (gym.socialMedia || "") ||
      form.schedule !== gym.schedule ||
      maxCap !== (gym.maxCapacity ?? null) ||
      (form.manager?.name || "") !== ((gym.manager?.name as string) || "") ||
      (form.manager?.email || "") !== ((gym.manager?.email as string) || "") ||
      (form.manager?.phone?.replace(/\D/g, "") || "") !==
        ((gym.manager?.phone as string) || "").replace(/\D/g, "") ||
      (form.manager?.position || "") !== ((gym.manager?.position as string) || "")
    );
  };

  return (
    <div className="w-full">
        <div className="flex items-center justify-between mb-4 mt-2">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <button
                onClick={() => navigate("/dashboard")}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <ArrowLeft size={20} />
              </button>
              <h1 className="text-2xl font-bold text-foreground">Dados da Academia</h1>
            </div>
            <p className="text-sm text-muted-foreground">
              Informações cadastrais da academia
            </p>
          </div>
          <Button
            onClick={handleSave}
            disabled={saving || !hasChanges()}
            size="sm"
            className="gap-1.5"
          >
            {saving ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              "Salvar"
            )}
          </Button>
        </div>

        {error && (
          <div className="p-3 rounded-lg bg-destructive/20 text-destructive text-sm mb-4">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-20 gap-2 text-muted-foreground">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span>Carregando dados...</span>
          </div>
        ) : gym ? (
          <div className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase mb-1.5 block">
                Nome
              </label>
              <Input
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="Nome da academia"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase mb-1.5 block">
                E-mail
              </label>
              <Input
                type="email"
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                placeholder="contato@academia.com"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase mb-1.5 block">
                Telefone
              </label>
              <Input
                value={form.phone}
                onChange={(e) => {
                  const v = e.target.value.replace(/\D/g, "").slice(0, 11);
                  setForm((f) => ({ ...f, phone: formatPhone(v) }));
                }}
                placeholder="(00) 00000-0000"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase mb-1.5 block">
                Endereço
              </label>
              <Input
                value={form.address}
                onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
                placeholder="Endereço completo"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase mb-1.5 block">
                Redes sociais
              </label>
              <Input
                value={form.socialMedia}
                onChange={(e) => setForm((f) => ({ ...f, socialMedia: e.target.value }))}
                placeholder="@academia"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase mb-1.5 block">
                CNPJ
              </label>
              <Input value={gym.cnpj} readOnly className="bg-muted" />
              <p className="text-xs text-muted-foreground mt-0.5">CNPJ não pode ser alterado</p>
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase mb-1.5 block">
                Horário de funcionamento
              </label>
              <Input
                value={form.schedule}
                onChange={(e) => setForm((f) => ({ ...f, schedule: e.target.value }))}
                placeholder="Ex: Segunda a Sexta: 6h às 22h"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase mb-1.5 block">
                Capacidade máxima
              </label>
              <Input
                type="number"
                min={1}
                value={form.maxCapacityStr}
                onChange={(e) => setForm((f) => ({ ...f, maxCapacityStr: e.target.value }))}
                placeholder="Ex: 200"
              />
            </div>

            {/* Gerente */}
            <div className="pt-4 border-t border-border space-y-3">
              <p className="text-xs font-semibold text-muted-foreground uppercase">
                Dados do gerente
              </p>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">
                  Nome do gerente
                </label>
                <Input
                  value={form.manager?.name || ""}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      manager: { ...f.manager, name: e.target.value },
                    }))
                  }
                  placeholder="Nome completo"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">
                  E-mail do gerente
                </label>
                <Input
                  type="email"
                  value={form.manager?.email || ""}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      manager: { ...f.manager, email: e.target.value },
                    }))
                  }
                  placeholder="gerente@academia.com"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">
                  Telefone do gerente
                </label>
                <Input
                  value={form.manager?.phone || ""}
                  onChange={(e) => {
                    const v = e.target.value.replace(/\D/g, "").slice(0, 11);
                    setForm((f) => ({
                      ...f,
                      manager: { ...f.manager, phone: formatPhone(v) },
                    }));
                  }}
                  placeholder="(00) 00000-0000"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">
                  Cargo
                </label>
                <Input
                  value={form.manager?.position || ""}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      manager: { ...f.manager, position: e.target.value },
                    }))
                  }
                  placeholder="Gerente Geral"
                />
              </div>
            </div>
          </div>
        ) : null}

    </div>
  );
};

export default DadosAcademia;
