import Constants from "expo-constants";

type Extra = {
  apiBaseUrl?: string;
};

function getExtra(): Extra {
  // expoConfig is present in most modern Expo runtimes; manifest2 covers some older paths.
  const expoExtra = (Constants.expoConfig?.extra ?? {}) as Extra;
  const manifest2Extra = ((Constants as any).manifest2?.extra ?? {}) as Extra;
  return { ...manifest2Extra, ...expoExtra };
}

const extra = getExtra();

export const API_BASE_URL =
  extra.apiBaseUrl ??
  process.env.EXPO_PUBLIC_API_BASE_URL ??
  "http://localhost:3000";

