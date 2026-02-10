import Constants from "expo-constants";

export type EnvConfig = {
  apiBaseUrl: string;
  googleExpoClientId: string;
  googleWebClientId: string;
};

function getConfig(): EnvConfig {
  const expoExtra = (Constants.expoConfig?.extra ?? {}) as Partial<EnvConfig>;
  const manifest2Extra = ((Constants as any).manifest2?.extra ?? {}) as Partial<EnvConfig>;
  return { ...manifest2Extra, ...expoExtra } as EnvConfig;
}

const config = getConfig();

export const API_BASE_URL = config.apiBaseUrl;
export const GOOGLE_EXPO_CLIENT_ID = config.googleExpoClientId;
export const GOOGLE_WEB_CLIENT_ID = config.googleWebClientId;
