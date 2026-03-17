import { useState, useEffect } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { useAuth, type ProfileEmployee } from "@/contexts/AuthContext"
import {
  MessageSquare,
  CreditCard,
  Users,
  DollarSign,
  UserCog,
  ShieldCheck,
  GraduationCap,
  LayoutDashboard,
  Menu,
  ChevronLeft
} from "lucide-react"
import { cn } from "@/lib/utils"

interface MenuItem {
  title: string
  icon: typeof MessageSquare
  route: string
  roles: ProfileEmployee[]
}

const menuItems: MenuItem[] = [
  {
    title: "Dashboard",
    icon: LayoutDashboard,
    route: "/dashboard",
    roles: ["MANAGER", "RECEPTIONIST"],
  },
  {
    title: "Comunicação",
    icon: MessageSquare,
    route: "/comunicacao",
    roles: ["MANAGER", "RECEPTIONIST"],
  },
  {
    title: "Planos",
    icon: CreditCard,
    route: "/planos",
    roles: ["MANAGER", "RECEPTIONIST"],
  },
  {
    title: "Aulas",
    icon: GraduationCap,
    route: "/aulas",
    roles: ["MANAGER", "RECEPTIONIST"],
  },
  {
    title: "Alunos",
    icon: Users,
    route: "/alunos",
    roles: ["MANAGER", "RECEPTIONIST"],
  },
  {
    title: "Funcionários",
    icon: UserCog,
    route: "/funcionarios",
    roles: ["MANAGER"],
  },
  {
    title: "Controle de Acesso",
    icon: ShieldCheck,
    route: "/controle-acesso",
    roles: ["MANAGER", "RECEPTIONIST"],
  },
]

export default function Sidebar() {
  const navigate = useNavigate()
  const location = useLocation()
  const { profile, hasRole } = useAuth()
  const [isCollapsed, setIsCollapsed] = useState(() => {
    return localStorage.getItem("sidebarCollapsed") === "true"
  })

  const toggleCollapse = () => {
    const newVal = !isCollapsed
    setIsCollapsed(newVal)
    localStorage.setItem("sidebarCollapsed", String(newVal))
  }

  const filteredItems = menuItems.filter((item) => {
    return hasRole(...item.roles)
  })

  return (
    <aside className={cn(
      "border-r border-border bg-card/50 flex flex-col hidden md:flex shrink-0 transition-all duration-300 sticky top-16 h-[calc(100vh-4rem)]",
      isCollapsed ? "w-20" : "w-64"
    )}>
      <div className="p-4 flex flex-col h-full">
        <div className={cn("flex items-center mb-6", isCollapsed ? "justify-center" : "justify-between")}>
          {!isCollapsed && (
            <span className="text-xs uppercase tracking-wider font-bold text-muted-foreground whitespace-nowrap overflow-hidden">
              Menu Principal
            </span>
          )}
          <button 
            onClick={toggleCollapse}
            className="text-muted-foreground hover:text-foreground transition-colors p-1.5 rounded-md hover:bg-secondary flex-shrink-0"
            title={isCollapsed ? "Expandir menu" : "Recolher menu"}
          >
            {isCollapsed ? <Menu size={20} /> : <ChevronLeft size={20} />}
          </button>
        </div>

        <nav className="space-y-1.5 flex-1 overflow-y-auto overflow-x-hidden pt-2 scrollbar-none">
          {filteredItems.map((item) => {
            const isActive = location.pathname.startsWith(item.route)
            return (
              <button
                key={item.title}
                onClick={() => navigate(item.route)}
                title={isCollapsed ? item.title : undefined}
                className={cn(
                  "flex items-center rounded-lg text-sm font-medium transition-colors cursor-pointer",
                  isCollapsed ? "justify-center p-3" : "w-full gap-3 px-3 py-2.5",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                )}
              >
                <item.icon size={20} className={cn(!isActive && "text-muted-foreground", isCollapsed ? "" : "shrink-0")} />
                {!isCollapsed && <span className="truncate">{item.title}</span>}
              </button>
            )
          })}
        </nav>
      </div>
    </aside>
  )
}
