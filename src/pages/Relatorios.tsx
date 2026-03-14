import { useNavigate } from "react-router-dom";
import { ArrowLeft, Users, CreditCard, DollarSign, TrendingUp, DoorOpen } from "lucide-react";
import logo from "@/assets/gymlabz-logo.png";

const stats = [
  { label: "Total de Alunos", valor: "127", icon: Users, variacao: "+12 este mês" },
  { label: "Planos Ativos", valor: "98", icon: CreditCard, variacao: "77% dos alunos" },
  { label: "Receita Mensal", valor: "R$ 11.430", icon: DollarSign, variacao: "+8% vs mês anterior" },
  { label: "Acessos Hoje", valor: "43", icon: DoorOpen, variacao: "Média: 38/dia" },
];

const topPlanos = [
  { nome: "Mensal", alunos: 52, porcentagem: 53 },
  { nome: "Trimestral", alunos: 24, porcentagem: 24 },
  { nome: "Semestral", alunos: 13, porcentagem: 13 },
  { nome: "Anual", alunos: 9, porcentagem: 9 },
];

const Relatorios = () => {
  const navigate = useNavigate();

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
        <h1 className="text-2xl font-bold text-foreground mb-1">Relatórios</h1>
        <p className="text-sm text-muted-foreground mb-6">Visão geral e estatísticas</p>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
          {stats.map((s) => (
            <div key={s.label} className="p-4 rounded-xl bg-card border border-border">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
                  <s.icon size={16} className="text-primary" />
                </div>
              </div>
              <p className="text-2xl font-bold text-foreground">{s.valor}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
              <div className="flex items-center gap-1 mt-2">
                <TrendingUp size={12} className="text-primary" />
                <span className="text-xs text-primary font-medium">{s.variacao}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="rounded-xl bg-card border border-border p-5">
          <h2 className="text-lg font-bold text-foreground mb-4">Distribuição por Plano</h2>
          <div className="space-y-4">
            {topPlanos.map((p) => (
              <div key={p.nome}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm font-medium text-foreground">{p.nome}</span>
                  <span className="text-sm text-muted-foreground">{p.alunos} alunos ({p.porcentagem}%)</span>
                </div>
                <div className="h-2 rounded-full bg-secondary overflow-hidden">
                  <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${p.porcentagem}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Relatorios;
