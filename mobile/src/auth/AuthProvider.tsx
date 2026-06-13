import {
  type ReactNode,
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useNetInfo } from "@react-native-community/netinfo";
import {
  type AuthSession,
  clearAuthSession,
  clearLastLoggedInEmail,
  loadAuthSession,
  loadLastLoggedInEmail,
  saveAuthSession,
  saveLastLoggedInEmail,
} from "./authStorage";
import { getApiBaseUrl } from "../api/apiBase";

type AuthState =
  | { status: "loading" }
  | { status: "unauthenticated"; lastLoggedInEmail?: string | null }
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

function computeIsOnline(netInfo: ReturnType<typeof useNetInfo>): boolean | null {
  return netInfo.isInternetReachable === null ? netInfo.isConnected : netInfo.isInternetReachable;
}

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

/**
 * Validate token when online. Returns true if valid, false if invalid (e.g. 401).
 * Network errors are treated as "assume valid" (fail gracefully).
 */
async function validateStoredToken(token: string): Promise<boolean> {
  try {
    const res = await fetch(`${getApiBaseUrl()}/auth/user`, {
      method: "GET",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    return res.ok;
  } catch {
    return true;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const netInfo = useNetInfo();
  const isOnline = computeIsOnline(netInfo);
  const [state, setState] = useState<AuthState>({ status: "loading" });

  useEffect(() => {
    let isMounted = true;
    (async () => {
      const [session, lastEmail] = await Promise.all([
        loadAuthSession(),
        loadLastLoggedInEmail(),
      ]);
      if (!isMounted) return;

      if (!session) {
        setState({ status: "unauthenticated", lastLoggedInEmail: lastEmail ?? undefined });
        return;
      }

      if (isOnline !== true) {
        setState({ status: "authenticated", session });
        return;
      }

      const valid = await validateStoredToken(session.token);
      if (!isMounted) return;

      if (!valid) {
        await clearAuthSession();
        await saveLastLoggedInEmail(session.user.email);
        setState({ status: "unauthenticated", lastLoggedInEmail: session.user.email });
        return;
      }

      setState({ status: "authenticated", session });
    })();
    return () => {
      isMounted = false;
    };
  }, [isOnline]);

  const value = useMemo<AuthContextValue>(
    () => ({
      state,
      finishOAuthLogin: async (accessToken) => {
        if (typeof accessToken !== "string" || accessToken.length === 0) return { ok: false };
        const email = await fetchCurrentUserEmail(accessToken);
        if (!email) return { ok: false };
        const session: AuthSession = { token: accessToken, user: { email } };
        await clearLastLoggedInEmail();
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
        await clearLastLoggedInEmail();
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

