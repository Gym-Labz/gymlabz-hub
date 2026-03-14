import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Login from "./pages/Login.tsx";
import Dashboard from "./pages/Dashboard.tsx";
import Comunicacao from "./pages/Comunicacao.tsx";
import Planos from "./pages/Planos.tsx";
import Alunos from "./pages/Alunos.tsx";
import Acesso from "./pages/Acesso.tsx";
import Financeiro from "./pages/Financeiro.tsx";
import Funcionarios from "./pages/Funcionarios.tsx";
import ControleAcesso from "./pages/ControleAcesso.tsx";
import Relatorios from "./pages/Relatorios.tsx";
import NotFound from "./pages/NotFound.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/comunicacao" element={<Comunicacao />} />
          <Route path="/planos" element={<Planos />} />
          <Route path="/alunos" element={<Alunos />} />
          <Route path="/acesso" element={<Acesso />} />
          <Route path="/financeiro" element={<Financeiro />} />
          <Route path="/funcionarios" element={<Funcionarios />} />
          <Route path="/controle-acesso" element={<ControleAcesso />} />
          <Route path="/relatorios" element={<Relatorios />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
