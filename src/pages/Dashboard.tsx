import { useNavigate } from "react-router-dom";
import {
  MessageSquare,
  CreditCard,
  Users,
  DoorOpen,
  DollarSign,
  UserCog,
  ShieldCheck,
  BarChart3,
  LogOut,
  Menu,
} from "lucide-react";
import logo from "@/assets/gymlabz-logo.png";

const menuItems = [
  { title: "Comunicação", icon: MessageSquare, description: "Mensagens e avisos", route: "/comunicacao" },
  { title: "Planos", icon: CreditCard, description: "Gerenciar planos", route: "" },
  { title: "Alunos", icon: Users, description: "Cadastro de alunos", route: "" },
  { title: "Acesso", icon: DoorOpen, description: "Registros de entrada", route: "" },
  { title: "Financeiro", icon: DollarSign, description: "Receitas e despesas", route: "" },
  { title: "Funcionários", icon: UserCog, description: "Equipe da academia", route: "" },
  { title: "Controle de Acesso", icon: ShieldCheck, description: "Permissões e regras", route: "" },
  { title: "Relatórios", icon: BarChart3, description: "Dados e estatísticas", route: "" },
];

const Dashboard = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-card/80 backdrop-blur-lg border-b border-border">
        <div className="flex items-center justify-between px-4 h-16 max-w-5xl mx-auto">
          <div className="flex items-center gap-3">
            <img src={logo} alt="GymLabz" className="w-9 h-9 object-contain" />
            <span className="text-lg font-bold tracking-tight">
              Gym<span className="gym-text-gradient">Labz</span>
            </span>
          </div>
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <LogOut size={18} />
            <span className="hidden sm:inline">Sair</span>
          </button>
        </div>
      </header>

      {/* Content */}
      <main className="px-4 py-6 max-w-5xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground">Painel de Controle</h1>
          <p className="text-sm text-muted-foreground mt-1">Selecione uma opção para gerenciar</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
          {menuItems.map((item) => (
            <button
              key={item.title}
              className="group flex flex-col items-center gap-3 p-5 sm:p-6 rounded-xl bg-card border border-border hover:border-primary/40 hover:bg-gym-card-hover transition-all duration-200 gym-card-glow"
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
    </div>
  );
};

export default Dashboard;
