import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type User = { name: string; email: string };

type Ctx = {
  user: User | null;
  login: (email: string, _password: string) => void;
  signup: (name: string, email: string, _password: string) => void;
  logout: () => void;
};

const AuthContext = createContext<Ctx | null>(null);
const KEY = "bb_user_v1";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setUser(JSON.parse(raw));
    } catch {}
  }, []);

  const persist = (u: User | null) => {
    setUser(u);
    if (u) localStorage.setItem(KEY, JSON.stringify(u));
    else localStorage.removeItem(KEY);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login: (email) => persist({ name: email.split("@")[0] || "Friend", email }),
        signup: (name, email) => persist({ name, email }),
        logout: () => persist(null),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be inside AuthProvider");
  return ctx;
}
