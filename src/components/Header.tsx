import logo from "@/assets/gymlabz-logo.png"
import { useAuth } from "@/contexts/AuthContext"
import { useEffect, useState } from "react"
import { getGym } from "@/lib/gym-api"
import { useNavigate } from "react-router-dom"
import { LogOut, Settings } from "lucide-react"

export default function Header() {
  const [gymName, setGymName] = useState<string | null>(null)
  const { token, logout, profile, hasRole } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!token) return
    let cancelled = false
    getGym(token)
      .then((data) => {
        if (!cancelled) setGymName(data.name)
      })
      .catch(() => {
        if (!cancelled) setGymName(null)
      })
    return () => {
      cancelled = true
    }
  }, [token])

  const handleLogout = () => {
    logout()
    navigate("/")
  }

  return (
    <header className="sticky top-0 z-50 bg-card/80 backdrop-blur-lg border-b border-border">
      <div className="flex items-center justify-between px-4 h-16 max-w-7xl mx-auto">
        <div className="flex items-center gap-3">
          <img src={logo} alt="GymLabz" className="w-20 h-20 object-contain" />
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
  )
}
