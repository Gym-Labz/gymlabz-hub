import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth, type ProfileEmployee } from "@/contexts/AuthContext";
import Login from "./pages/Login.tsx";
import Dashboard from "./pages/Dashboard.tsx";
import Comunicacao from "./pages/Comunicacao.tsx";
import Planos from "./pages/Planos.tsx";
import Alunos from "./pages/Alunos.tsx";
import EditarAluno from "./pages/EditarAluno.tsx";
import EditarTreino from "./pages/EditarTreino.tsx";
import Aulas from "./pages/Aulas.tsx";
import Financeiro from "./pages/Financeiro.tsx";
import Funcionarios from "./pages/Funcionarios.tsx";
import ControleAcesso from "./pages/ControleAcesso.tsx";
import DadosAcademia from "./pages/DadosAcademia.tsx";
import NotFound from "./pages/NotFound.tsx";
import Layout from "./components/Layout.tsx";

const queryClient = new QueryClient();

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }
  return <>{children}</>;
}

function RoleProtectedRoute({
  children,
  roles,
}: {
  children: React.ReactNode;
  roles: ProfileEmployee[];
}) {
  const { isAuthenticated, hasRole } = useAuth();
  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }
  if (!hasRole(...roles)) {
    return <Navigate to="/dashboard" replace />;
  }
  return <>{children}</>;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Login />} />
            <Route element={<Layout />}>
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/comunicacao"
                element={
                  <RoleProtectedRoute roles={["MANAGER", "RECEPTIONIST"]}>
                    <Comunicacao />
                  </RoleProtectedRoute>
                }
              />
              <Route
                path="/planos"
                element={
                  <RoleProtectedRoute roles={["MANAGER", "RECEPTIONIST"]}>
                    <Planos />
                  </RoleProtectedRoute>
                }
              />
              <Route
                path="/aulas"
                element={
                  <RoleProtectedRoute roles={["MANAGER", "RECEPTIONIST"]}>
                    <Aulas />
                  </RoleProtectedRoute>
                }
              />
              <Route
                path="/alunos"
                element={
                  <RoleProtectedRoute roles={["MANAGER", "RECEPTIONIST"]}>
                    <Alunos />
                  </RoleProtectedRoute>
                }
              />
              <Route
                path="/alunos/novo"
                element={
                  <RoleProtectedRoute roles={["MANAGER", "RECEPTIONIST"]}>
                    <EditarAluno />
                  </RoleProtectedRoute>
                }
              />
              <Route
                path="/alunos/treino"
                element={
                  <RoleProtectedRoute roles={["MANAGER", "TEACHER"]}>
                    <EditarTreino />
                  </RoleProtectedRoute>
                }
              />
              <Route
                path="/alunos/:id"
                element={
                  <RoleProtectedRoute roles={["MANAGER", "RECEPTIONIST"]}>
                    <EditarAluno />
                  </RoleProtectedRoute>
                }
              />
              <Route
                path="/financeiro"
                element={
                  <RoleProtectedRoute roles={["MANAGER"]}>
                    <Financeiro />
                  </RoleProtectedRoute>
                }
              />
              <Route
                path="/funcionarios"
                element={
                  <RoleProtectedRoute roles={["MANAGER"]}>
                    <Funcionarios />
                  </RoleProtectedRoute>
                }
              />
              <Route
                path="/controle-acesso"
                element={
                  <RoleProtectedRoute roles={["MANAGER", "RECEPTIONIST"]}>
                    <ControleAcesso />
                  </RoleProtectedRoute>
                }
              />
              <Route
                path="/dados-academia"
                element={
                  <ProtectedRoute>
                    <DadosAcademia />
                  </ProtectedRoute>
                }
              />
            </Route>
            <Route path="/relatorios" element={<Navigate to="/financeiro" replace />} />
            <Route path="/acesso" element={<Navigate to="/controle-acesso" replace />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
