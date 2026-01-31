import { Platform } from "react-native";
import * as SecureStore from "expo-secure-store";

export type AuthSession = {
  token: string;
  user: {
    email: string;
  };
};

const STORAGE_KEY = "auth.session.v1";

export async function loadAuthSession(): Promise<AuthSession | null> {
  try {
    const raw =
      Platform.OS === "web"
        ? globalThis.sessionStorage?.getItem(STORAGE_KEY) ?? null
        : await SecureStore.getItemAsync(STORAGE_KEY);

    if (!raw) return null;
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== "object") return null;
    const s = parsed as any;
    if (
      typeof s.token === "string" &&
      s.user &&
      typeof s.user.email === "string"
    ) {
      return { token: s.token, user: { email: s.user.email } };
    }
    return null;
  } catch {
    return null;
  }
}

export async function saveAuthSession(session: AuthSession): Promise<void> {
  const raw = JSON.stringify(session);
  if (Platform.OS === "web") {
    globalThis.sessionStorage?.setItem(STORAGE_KEY, raw);
    return;
  }
  await SecureStore.setItemAsync(STORAGE_KEY, raw);
}

export async function clearAuthSession(): Promise<void> {
  if (Platform.OS === "web") {
    globalThis.sessionStorage?.removeItem(STORAGE_KEY);
    return;
  }
  await SecureStore.deleteItemAsync(STORAGE_KEY);
}

