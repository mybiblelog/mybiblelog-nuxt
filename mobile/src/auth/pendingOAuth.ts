import { Platform } from "react-native";
import * as SecureStore from "expo-secure-store";

export type PendingOAuth = {
  clientId: string;
  redirectUri: string;
  codeVerifier: string;
  state?: string;
  createdAt: number;
};

const STORAGE_KEY = "auth.oauth.pending.v1";

function isNonEmptyString(x: unknown): x is string {
  return typeof x === "string" && x.trim().length > 0;
}

export async function savePendingOAuth(pending: PendingOAuth): Promise<void> {
  const raw = JSON.stringify(pending);
  if (Platform.OS === "web") {
    globalThis.sessionStorage?.setItem(STORAGE_KEY, raw);
    return;
  }
  await SecureStore.setItemAsync(STORAGE_KEY, raw);
}

export async function loadPendingOAuth(): Promise<PendingOAuth | null> {
  try {
    const raw =
      Platform.OS === "web"
        ? globalThis.sessionStorage?.getItem(STORAGE_KEY) ?? null
        : await SecureStore.getItemAsync(STORAGE_KEY);

    if (!raw) return null;
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== "object") return null;
    const p = parsed as any;

    if (
      !isNonEmptyString(p.clientId) ||
      !isNonEmptyString(p.redirectUri) ||
      !isNonEmptyString(p.codeVerifier) ||
      typeof p.createdAt !== "number"
    ) {
      return null;
    }

    const out: PendingOAuth = {
      clientId: p.clientId,
      redirectUri: p.redirectUri,
      codeVerifier: p.codeVerifier,
      createdAt: p.createdAt,
    };
    if (isNonEmptyString(p.state)) out.state = p.state;
    return out;
  } catch {
    return null;
  }
}

export async function clearPendingOAuth(): Promise<void> {
  if (Platform.OS === "web") {
    globalThis.sessionStorage?.removeItem(STORAGE_KEY);
    return;
  }
  await SecureStore.deleteItemAsync(STORAGE_KEY);
}

