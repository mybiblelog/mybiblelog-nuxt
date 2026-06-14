import Constants from "expo-constants";

export type EnvConfig = {
  apiBaseUrl: string;
};

function getConfig(): EnvConfig {
  const expoExtra = (Constants.expoConfig?.extra ?? {}) as Partial<EnvConfig>;
  const manifest2Extra = ((Constants as any).manifest2?.extra ?? {}) as Partial<EnvConfig>;
  return { ...manifest2Extra, ...expoExtra } as EnvConfig;
}

const config = getConfig();

if (!config.apiBaseUrl || config.apiBaseUrl.trim() === "") {
  throw new Error(
    "EXPO_PUBLIC_API_BASE_URL is not set. Add it to mobile/.env and rebuild."
  );
}

export const API_BASE_URL = config.apiBaseUrl;
