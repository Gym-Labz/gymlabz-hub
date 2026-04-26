import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff, LogIn, Loader2 } from "lucide-react";
import logo from "@/assets/gymlabz-logo.png";
import { useAuth } from "@/contexts/AuthContext";
import { employeeSignIn, type MultipleGymsResponse } from "@/lib/auth-api";

const Login = () => {
  const [document, setDocument] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [gymSelection, setGymSelection] = useState<MultipleGymsResponse | null>(null);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!document.trim() || !password.trim()) {
      setError("Preencha CPF e senha");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const res = await employeeSignIn({
        document: document.replace(/\D/g, ""),
        password,
        gymId: gymSelection ? undefined : undefined,
      });

      if (res.type === "multiple_gyms") {
        setGymSelection(res);
        setLoading(false);
        return;
      }

      login(res.access_token);
      navigate("/dashboard");
    } catch (err: unknown) {
      const apiErr = err as { message?: string };
      setError(apiErr.message || "Credenciais inválidas. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const handleGymSelect = async (gymId: string) => {
    if (!document.trim() || !password.trim()) return;
    setError("");
    setLoading(true);
    try {
      const res = await employeeSignIn({
        document: document.replace(/\D/g, ""),
        password,
        gymId,
      });
      if (res.type === "success") {
        login(res.access_token, gymId);
        navigate("/dashboard");
      }
    } catch (err: unknown) {
      const apiErr = err as { message?: string };
      setError(apiErr.message || "Erro ao selecionar academia.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 bg-background">
      <div className="w-full max-w-sm space-y-8">
        <div className="flex flex-col items-center gap-4">
          {/* <img src={logo} alt="GymLabz" className="w-24 h-24 object-contain" /> */}
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Gym<span className="gym-text-gradient">Labz</span>
          </h1>
          <p className="text-muted-foreground text-sm">Acesse sua conta para continuar</p>
        </div>

        {gymSelection ? (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground text-center">
              Selecione a academia para acessar:
            </p>
            <div className="space-y-2">
              {gymSelection.gyms.map((gym) => (
                <button
                  key={gym.id}
                  type="button"
                  onClick={() => handleGymSelect(gym.id)}
                  disabled={loading}
                  className="w-full p-4 rounded-xl bg-card border border-border hover:border-primary/40 hover:bg-gym-card-hover transition-all text-left font-medium text-foreground disabled:opacity-50"
                >
                  {loading ? (
                    <Loader2 className="h-5 w-5 animate-spin mx-auto" />
                  ) : (
                    gym.name
                  )}
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={() => setGymSelection(null)}
              className="w-full text-sm text-muted-foreground hover:text-foreground"
            >
              Voltar
            </button>
          </div>
        ) : (
        <form onSubmit={handleLogin} className="space-y-5">
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">CPF</label>
            <Input
              value={document}
              onChange={(e) => { setDocument(e.target.value.replace(/\D/g, "")); setError(""); }}
              placeholder="Apenas números (11 dígitos)"
              maxLength={11}
              className="h-12 bg-card border-border text-foreground placeholder:text-muted-foreground focus-visible:ring-primary"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">Senha</label>
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError(""); }}
                placeholder="Digite sua senha"
                className="h-12 bg-card border-border text-foreground placeholder:text-muted-foreground pr-12 focus-visible:ring-primary"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          {error && <p className="text-destructive text-sm">{error}</p>}

          <Button
            type="submit"
            disabled={loading}
            className="w-full h-12 gym-gradient text-primary-foreground font-semibold text-base hover:opacity-90 transition-opacity disabled:opacity-70"
          >
            {loading ? (
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            ) : (
              <LogIn className="mr-2 h-5 w-5" />
            )}
            Entrar
          </Button>

          <p className="text-center text-xs text-muted-foreground">
            Esqueceu sua senha? Entre em contato com o administrador.
          </p>
        </form>
        )}
      </div>
    </div>
  );
};

export default Login;
