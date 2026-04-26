import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth, type ProfileEmployee } from "@/contexts/AuthContext";
import { useSidebar } from "@/contexts/SidebarContext";
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
  ChevronLeft,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface MenuItem {
  title: string;
  icon: typeof MessageSquare;
  route: string;
  roles: ProfileEmployee[];
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
];

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { hasRole } = useAuth();
  const { isMobileOpen, closeMobile, isCollapsed, toggleCollapse } = useSidebar();

  // Fecha o menu mobile ao navegar
  useEffect(() => {
    closeMobile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  const filteredItems = menuItems.filter((item) => hasRole(...item.roles));

  return (
    <>
      {/* ── Desktop sidebar ── */}
      <aside
        className={cn(
          "border-r border-border bg-card/50 hidden md:flex flex-col shrink-0 transition-all duration-300 sticky top-16 h-[calc(100vh-4rem)]",
          isCollapsed ? "w-20" : "w-64"
        )}
      >
        <div className="p-4 flex flex-col h-full">
          <div
            className={cn(
              "flex items-center mb-6",
              isCollapsed ? "justify-center" : "justify-between"
            )}
          >
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
              const isActive = location.pathname.startsWith(item.route);
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
                  <item.icon
                    size={20}
                    className={cn(
                      !isActive && "text-muted-foreground",
                      isCollapsed ? "" : "shrink-0"
                    )}
                  />
                  {!isCollapsed && <span className="truncate">{item.title}</span>}
                </button>
              );
            })}
          </nav>
        </div>
      </aside>

      {/* ── Mobile overlay (backdrop) ── */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm md:hidden"
          onClick={closeMobile}
        />
      )}

      {/* ── Mobile drawer ── */}
      <aside
        className={cn(
          "fixed top-16 left-0 z-50 h-[calc(100vh-4rem)] w-72 bg-card border-r border-border flex flex-col md:hidden transition-transform duration-300 ease-in-out",
          isMobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="p-4 flex flex-col h-full">
          <span className="text-xs uppercase tracking-wider font-bold text-muted-foreground mb-6">
            Menu Principal
          </span>

          <nav className="space-y-1.5 flex-1 overflow-y-auto overflow-x-hidden scrollbar-none">
            {filteredItems.map((item) => {
              const isActive = location.pathname.startsWith(item.route);
              return (
                <button
                  key={item.title}
                  onClick={() => {
                    navigate(item.route);
                    closeMobile();
                  }}
                  className={cn(
                    "flex items-center w-full gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-colors cursor-pointer",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                  )}
                >
                  <item.icon size={20} className="shrink-0" />
                  <span className="truncate">{item.title}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </aside>
    </>
  );
}
