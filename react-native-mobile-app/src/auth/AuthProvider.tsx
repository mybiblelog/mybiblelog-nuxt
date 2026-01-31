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
import { getApiBaseUrl } from "../api/apiBase";

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

type ApiErrorResponse = {
  error?: {
    code?: string;
    errors?: Array<{ code?: string; field?: string | null; properties?: Record<string, unknown> }>;
  };
};

type ApiLoginOkResponse = {
  data?: {
    token?: string;
    user?: {
      email?: string;
    };
  };
};

async function loginApi(email: string, password: string): Promise<LoginResult & { session?: AuthSession }> {
  try {
    const res = await fetch(`${getApiBaseUrl()}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    if (!res.ok) {
      // The API uses 403 ("unauthorized") for invalid login attempts.
      if (res.status === 401 || res.status === 403) {
        return { ok: false, error: { code: "unauthorized" } };
      }

      // Best-effort parsing, but don't depend on backend shape.
      try {
        const body = (await res.json()) as ApiErrorResponse;
        if (body?.error?.code === "unauthorized" || body?.error?.code === "unauthenticated") {
          return { ok: false, error: { code: "unauthorized" } };
        }
      } catch {
        // ignore
      }
      return { ok: false, error: { code: "unauthorized" } };
    }

    const json = (await res.json()) as ApiLoginOkResponse;
    const token = json?.data?.token;
    const userEmail = json?.data?.user?.email;

    if (typeof token !== "string" || token.length === 0 || typeof userEmail !== "string") {
      return { ok: false, error: { code: "unauthorized" } };
    }

    return {
      ok: true,
      session: {
        token,
        user: { email: userEmail },
      },
    };
  } catch {
    // Network / parsing errors
    return { ok: false, error: { code: "unauthorized" } };
  }
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
        const result = await loginApi(email, password);
        if (result.ok && result.session) {
          await saveAuthSession(result.session);
          setState({ status: "authenticated", session: result.session });
          return { ok: true };
        }
        return { ok: false, error: { code: "unauthorized" } };
      },
      logout: async () => {
        try {
          if (state.status === "authenticated") {
            await fetch(`${getApiBaseUrl()}/auth/logout`, {
              method: "POST",
              headers: {
                Accept: "application/json",
                Authorization: `Bearer ${state.session.token}`,
              },
            });
          }
        } catch {
          // ignore logout network errors; local logout still proceeds
        }
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

