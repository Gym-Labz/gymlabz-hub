import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Search, DoorOpen, Clock } from "lucide-react";
import { Input } from "@/components/ui/input";
import logo from "@/assets/gymlabz-logo.png";

interface Registro {
  id: string;
  aluno: string;
  tipo: "entrada" | "saída";
  data: string;
  hora: string;
}

const initialRegistros: Registro[] = [
  { id: "1", aluno: "Carlos Silva", tipo: "entrada", data: "2025-03-14", hora: "06:30" },
  { id: "2", aluno: "Ana Souza", tipo: "entrada", data: "2025-03-14", hora: "07:15" },
  { id: "3", aluno: "Carlos Silva", tipo: "saída", data: "2025-03-14", hora: "08:00" },
  { id: "4", aluno: "Pedro Lima", tipo: "entrada", data: "2025-03-14", hora: "08:45" },
  { id: "5", aluno: "Maria Oliveira", tipo: "entrada", data: "2025-03-14", hora: "09:00" },
  { id: "6", aluno: "Ana Souza", tipo: "saída", data: "2025-03-14", hora: "08:30" },
];

const Acesso = () => {
  const navigate = useNavigate();
  const [busca, setBusca] = useState("");
  const registros = initialRegistros.filter((r) => r.aluno.toLowerCase().includes(busca.toLowerCase()));

  const formatDate = (d: string) => new Date(d + "T00:00:00").toLocaleDateString("pt-BR");

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 bg-card/80 backdrop-blur-lg border-b border-border">
        <div className="flex items-center justify-between px-4 h-16 max-w-5xl mx-auto">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate("/dashboard")} className="text-muted-foreground hover:text-foreground transition-colors"><ArrowLeft size={20} /></button>
            <img src={logo} alt="GymLabz" className="w-9 h-9 object-contain" />
            <span className="text-lg font-bold tracking-tight">Gym<span className="gym-text-gradient">Labz</span></span>
          </div>
        </div>
      </header>
      <main className="px-4 py-6 max-w-5xl mx-auto">
        <h1 className="text-2xl font-bold text-foreground mb-1">Registros de Acesso</h1>
        <p className="text-sm text-muted-foreground mb-4">Entradas e saídas dos alunos</p>
        <div className="relative mb-5">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input value={busca} onChange={(e) => setBusca(e.target.value)} placeholder="Buscar por aluno..." className="pl-9" />
        </div>
        {registros.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground"><p>Nenhum registro encontrado.</p></div>
        ) : (
          <div className="grid gap-3">
            {registros.map((r) => (
              <div key={r.id} className="flex items-center justify-between p-4 rounded-xl bg-card border border-border">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${r.tipo === "entrada" ? "bg-primary/20" : "bg-destructive/20"}`}>
                    <DoorOpen size={18} className={r.tipo === "entrada" ? "text-primary" : "text-destructive"} />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">{r.aluno}</p>
                    <span className={`text-xs font-medium ${r.tipo === "entrada" ? "text-primary" : "text-destructive"}`}>{r.tipo === "entrada" ? "Entrada" : "Saída"}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock size={14} />
                  <span>{r.hora}</span>
                  <span className="text-xs">• {formatDate(r.data)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Acesso;
