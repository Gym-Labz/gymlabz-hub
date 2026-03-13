import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff, LogIn } from "lucide-react";
import logo from "@/assets/gymlabz-logo.png";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setError("Preencha todos os campos");
      return;
    }
    // Demo login — any credentials work
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 bg-background">
      <div className="w-full max-w-sm space-y-8">
        <div className="flex flex-col items-center gap-4">
          <img src={logo} alt="GymLabz" className="w-24 h-24 object-contain" />
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Gym<span className="gym-text-gradient">Labz</span>
          </h1>
          <p className="text-muted-foreground text-sm">Acesse sua conta para continuar</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">Usuário</label>
            <Input
              value={username}
              onChange={(e) => { setUsername(e.target.value); setError(""); }}
              placeholder="Digite seu usuário"
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
            className="w-full h-12 gym-gradient text-primary-foreground font-semibold text-base hover:opacity-90 transition-opacity"
          >
            <LogIn className="mr-2 h-5 w-5" />
            Entrar
          </Button>

          <p className="text-center text-xs text-muted-foreground">
            Esqueceu sua senha? Entre em contato com o administrador.
          </p>
        </form>
      </div>
    </div>
  );
};

export default Login;
