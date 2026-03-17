import { useNavigate } from "react-router-dom"
import { useAuth, type ProfileEmployee } from "@/contexts/AuthContext"
import {
  MessageSquare,
  CreditCard,
  Users,
  DollarSign,
  UserCog,
  ShieldCheck,
  GraduationCap,
} from "lucide-react"

interface MenuItem {
  title: string
  icon: typeof MessageSquare
  description: string
  route: string
  roles: ProfileEmployee[]
}

const menuItems: MenuItem[] = [
  {
    title: "Comunicação",
    icon: MessageSquare,
    description: "Mensagens e avisos",
    route: "/comunicacao",
    roles: ["MANAGER", "RECEPTIONIST"],
  },
  {
    title: "Planos",
    icon: CreditCard,
    description: "Gerenciar planos",
    route: "/planos",
    roles: ["MANAGER", "RECEPTIONIST"],
  },
  {
    title: "Aulas",
    icon: GraduationCap,
    description: "Cadastro de aulas e matrículas",
    route: "/aulas",
    roles: ["MANAGER", "RECEPTIONIST"],
  },
  {
    title: "Alunos",
    icon: Users,
    description: "Cadastro de alunos",
    route: "/alunos",
    roles: ["MANAGER", "RECEPTIONIST"],
  },
  {
    title: "Financeiro",
    icon: DollarSign,
    description: "Receitas, pagamentos e relatórios",
    route: "/financeiro",
    roles: ["MANAGER"],
  },
  {
    title: "Funcionários",
    icon: UserCog,
    description: "Equipe da academia",
    route: "/funcionarios",
    roles: ["MANAGER"],
  },
  {
    title: "Controle de Acesso",
    icon: ShieldCheck,
    description: "Registros e regras",
    route: "/controle-acesso",
    roles: ["MANAGER", "RECEPTIONIST"],
  },
]

const Dashboard = () => {
  const navigate = useNavigate()
  const { profile, hasRole } = useAuth()

  return (
    <>
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground">
            Painel de Controle
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Selecione uma opção para gerenciar
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
          {menuItems
            .filter((item) => {
              if (item.route === "/financeiro" && profile === "RECEPTIONIST")
                return false
              return hasRole(...item.roles)
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
                  <p className="text-sm font-semibold text-foreground">
                    {item.title}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5 hidden sm:block">
                    {item.description}
                  </p>
                </div>
              </button>
            ))}
        </div>
    </>
  )
}

export default Dashboard
