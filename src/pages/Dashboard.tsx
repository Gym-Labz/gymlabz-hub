import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth, type ProfileEmployee } from "@/contexts/AuthContext";
import {
  MessageSquare,
  CreditCard,
  Users,
  DollarSign,
  UserCog,
  ShieldCheck,
  LogOut,
  Settings,
  GraduationCap,
} from "lucide-react";
import logo from "@/assets/gymlabz-logo.png";
import { getGym } from "@/lib/gym-api";

interface MenuItem {
  title: string;
  icon: typeof MessageSquare;
  description: string;
  route: string;
  roles: ProfileEmployee[];
}

const menuItems: MenuItem[] = [
  { title: "Comunicação", icon: MessageSquare, description: "Mensagens e avisos", route: "/comunicacao", roles: ["MANAGER", "RECEPTIONIST"] },
  { title: "Planos", icon: CreditCard, description: "Gerenciar planos", route: "/planos", roles: ["MANAGER", "RECEPTIONIST"] },
  { title: "Aulas", icon: GraduationCap, description: "Cadastro de aulas e matrículas", route: "/aulas", roles: ["MANAGER", "RECEPTIONIST"] },
  { title: "Alunos", icon: Users, description: "Cadastro de alunos", route: "/alunos", roles: ["MANAGER", "RECEPTIONIST"] },
  { title: "Financeiro", icon: DollarSign, description: "Receitas, pagamentos e relatórios", route: "/financeiro", roles: ["MANAGER"] },
  { title: "Funcionários", icon: UserCog, description: "Equipe da academia", route: "/funcionarios", roles: ["MANAGER"] },
  { title: "Controle de Acesso", icon: ShieldCheck, description: "Registros e regras", route: "/controle-acesso", roles: ["MANAGER", "RECEPTIONIST"] },
];

const Dashboard = () => {
  const navigate = useNavigate();
  const { token, logout, profile, hasRole } = useAuth();
  const [gymName, setGymName] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    let cancelled = false;
    getGym(token)
      .then((data) => {
        if (!cancelled) setGymName(data.name);
      })
      .catch(() => {
        if (!cancelled) setGymName(null);
      });
    return () => { cancelled = true; };
  }, [token]);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-card/80 backdrop-blur-lg border-b border-border">
        <div className="flex items-center justify-between px-4 h-16 max-w-5xl mx-auto">
          <div className="flex items-center gap-3">
            <img src={logo} alt="GymLabz" className="w-9 h-9 object-contain" />
            <span className="text-lg font-bold tracking-tight text-foreground truncate max-w-[180px] sm:max-w-none">
              {gymName || "GymLabz"}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate("/dados-academia")}
              className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-primary/10 transition-colors"
              title="Configurações"
            >
              <Settings size={20} />
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <LogOut size={18} />
              <span className="hidden sm:inline">Sair</span>
            </button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 px-4 py-6 max-w-5xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground">Painel de Controle</h1>
          <p className="text-sm text-muted-foreground mt-1">Selecione uma opção para gerenciar</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
          {menuItems
            .filter((item) => {
              if (item.route === "/financeiro" && profile === "RECEPTIONIST") return false;
              return hasRole(...item.roles);
            })
            .map((item) => (
              <button
                key={item.title}
                onClick={() => item.route && navigate(item.route)}
                className="group flex flex-col items-center gap-3 p-5 sm:p-6 rounded-xl bg-card border border-border hover:border-primary/40 hover:bg-gym-card-hover transition-all duration-200 gym-card-glow cursor-pointer"
              >
                <div className="w-12 h-12 rounded-lg gym-gradient flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                  <item.icon className="h-6 w-6 text-primary-foreground" />
                </div>
                <div className="text-center">
                  <p className="text-sm font-semibold text-foreground">{item.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5 hidden sm:block">{item.description}</p>
                </div>
              </button>
            ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="py-4 border-t border-border">
        <p className="text-center text-sm text-muted-foreground">
          Desenvolvido por <span className="font-semibold text-foreground">GymLabz</span>
        </p>
      </footer>
    </div>
  );
};

export default Dashboard;
