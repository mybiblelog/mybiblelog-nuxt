import {
  type ReactNode,
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  type AuthSession,
  clearAuthSession,
  loadAuthSession,
  saveAuthSession,
} from "./authStorage";

type AuthState =
  | { status: "loading" }
  | { status: "unauthenticated" }
  | { status: "authenticated"; session: AuthSession };

type LoginResult =
  | { ok: true }
  | { ok: false; error: { code: "unauthorized" } };

type AuthContextValue = {
  state: AuthState;
  login: (email: string, password: string) => Promise<LoginResult>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

function mockLoginApi(email: string, password: string): Promise<LoginResult & { session?: AuthSession }> {
  return new Promise((resolve) => {
    setTimeout(() => {
      if (email === "test@example.com" && password === "test") {
        resolve({
          ok: true,
          session: {
            token: "_mock_token",
            user: { email: "test@example.com" },
          },
        });
        return;
      }
      resolve({ ok: false, error: { code: "unauthorized" } });
    }, 300);
  });
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({ status: "loading" });

  useEffect(() => {
    let isMounted = true;
    (async () => {
      const session = await loadAuthSession();
      if (!isMounted) return;
      if (session) setState({ status: "authenticated", session });
      else setState({ status: "unauthenticated" });
    })();
    return () => {
      isMounted = false;
    };
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      state,
      login: async (email, password) => {
        const result = await mockLoginApi(email, password);
        if (result.ok && result.session) {
          await saveAuthSession(result.session);
          setState({ status: "authenticated", session: result.session });
          return { ok: true };
        }
        return { ok: false, error: { code: "unauthorized" } };
      },
      logout: async () => {
        await clearAuthSession();
        setState({ status: "unauthenticated" });
      },
    }),
    [state]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

