import { createContext, useContext, useState, ReactNode, useEffect } from "react"

interface SidebarContextType {
  isMobileOpen: boolean
  toggleMobile: () => void
  closeMobile: () => void
  isCollapsed: boolean
  toggleCollapse: () => void
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined)

export function SidebarProvider({ children }: { children: ReactNode }) {
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  
  const [isCollapsed, setIsCollapsed] = useState(() => {
    return localStorage.getItem("sidebarCollapsed") === "true"
  })

  useEffect(() => {
    localStorage.setItem("sidebarCollapsed", String(isCollapsed))
  }, [isCollapsed])

  const toggleMobile = () => setIsMobileOpen(prev => !prev)
  const closeMobile = () => setIsMobileOpen(false)
  const toggleCollapse = () => setIsCollapsed(prev => !prev)

  return (
    <SidebarContext.Provider
      value={{
        isMobileOpen,
        toggleMobile,
        closeMobile,
        isCollapsed,
        toggleCollapse,
      }}
    >
      {children}
    </SidebarContext.Provider>
  )
}

export function useSidebar() {
  const context = useContext(SidebarContext)
  if (context === undefined) {
    throw new Error("useSidebar must be used within a SidebarProvider")
  }
  return context
}
