import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from "react";
import { decodeJwtPayload } from "@/lib/jwt";

const TOKEN_KEY = "gymlabz_token";
const GYM_ID_KEY = "gymlabz_gym_id";

export type ProfileEmployee = "MANAGER" | "TEACHER" | "RECEPTIONIST";

interface AuthState {
  token: string | null;
  gymId: string | null;
  profile: ProfileEmployee | null;
  isAuthenticated: boolean;
}

interface AuthContextValue extends AuthState {
  login: (token: string, gymId?: string) => void;
  logout: () => void;
  setGymId: (gymId: string) => void;
  hasRole: (...roles: ProfileEmployee[]) => boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function getProfileFromToken(token: string | null): ProfileEmployee | null {
  if (!token) return null;
  const payload = decodeJwtPayload(token);
  if (payload.type !== "employee" || !payload.profile) return null;
  const p = String(payload.profile).toUpperCase();
  if (p === "MANAGER" || p === "TEACHER" || p === "RECEPTIONIST") {
    return p as ProfileEmployee;
  }
  return null;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() =>
    localStorage.getItem(TOKEN_KEY)
  );
  const [gymId, setGymIdState] = useState<string | null>(() =>
    localStorage.getItem(GYM_ID_KEY)
  );
  const [profile, setProfile] = useState<ProfileEmployee | null>(() =>
    getProfileFromToken(localStorage.getItem(TOKEN_KEY))
  );

  useEffect(() => {
    setProfile(getProfileFromToken(token));
  }, [token]);

  const login = useCallback((newToken: string, newGymId?: string) => {
    setToken(newToken);
    localStorage.setItem(TOKEN_KEY, newToken);
    if (newGymId) {
      setGymIdState(newGymId);
      localStorage.setItem(GYM_ID_KEY, newGymId);
    }
  }, []);

  const logout = useCallback(() => {
    setToken(null);
    setGymIdState(null);
    setProfile(null);
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(GYM_ID_KEY);
  }, []);

  const setGymId = useCallback((newGymId: string) => {
    setGymIdState(newGymId);
    localStorage.setItem(GYM_ID_KEY, newGymId);
  }, []);

  const hasRole = useCallback(
    (...roles: ProfileEmployee[]) => {
      if (!profile) return false;
      return roles.includes(profile);
    },
    [profile]
  );

  const value: AuthContextValue = {
    token,
    gymId,
    profile,
    isAuthenticated: !!token,
    login,
    logout,
    setGymId,
    hasRole,
  };

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}
