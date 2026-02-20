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

type AuthContextValue = {
  state: AuthState;
  finishOAuthLogin: (accessToken: string) => Promise<{ ok: true } | { ok: false }>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

type ApiCurrentUserOkResponse = {
  data?: {
    user?: {
      email?: string;
    } | null;
  };
};

async function fetchCurrentUserEmail(accessToken: string): Promise<string | null> {
  try {
    const res = await fetch(`${getApiBaseUrl()}/auth/user`, {
      method: "GET",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
    });
    if (!res.ok) return null;
    const json = (await res.json()) as ApiCurrentUserOkResponse;
    const email = json?.data?.user?.email;
    return typeof email === "string" && email.length > 0 ? email : null;
  } catch {
    return null;
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
      finishOAuthLogin: async (accessToken) => {
        if (typeof accessToken !== "string" || accessToken.length === 0) return { ok: false };
        const email = await fetchCurrentUserEmail(accessToken);
        if (!email) return { ok: false };
        const session: AuthSession = { token: accessToken, user: { email } };
        await saveAuthSession(session);
        setState({ status: "authenticated", session });
        return { ok: true };
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

