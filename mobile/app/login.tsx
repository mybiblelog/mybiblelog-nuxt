import { useAuth } from "@/src/auth/AuthProvider";
import { getApiBaseUrl } from "@/src/api/apiBase";
import { useT } from "@/src/i18n/LocaleProvider";
import { useTheme } from "@/src/theme/ThemeProvider";
import { router } from "expo-router";
import * as AuthSession from "expo-auth-session";
import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { savePendingOAuth } from "@/src/auth/pendingOAuth";

export default function Login() {
  const t = useT();
  const { colors } = useTheme();
  const { state: authState, finishOAuthLogin } = useAuth();
  const lastEmail =
    authState.status === "unauthenticated" ? authState.lastLoggedInEmail ?? null : null;

  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const oauthClientId = "mobile";
  const discovery = useMemo(
    () => ({
      authorizationEndpoint: `${getApiBaseUrl()}/oauth/authorize`,
      tokenEndpoint: `${getApiBaseUrl()}/oauth/token`,
    }),
    []
  );
  const redirectUri = useMemo(
    () => AuthSession.makeRedirectUri({ path: "oauth" }),
    []
  );

  const [request, response, promptAsync] = AuthSession.useAuthRequest(
    {
      clientId: oauthClientId,
      redirectUri,
      responseType: AuthSession.ResponseType.Code,
      usePKCE: true,
    },
    discovery
  );

  useEffect(() => {
    if (response?.type !== "success") return;
    void (async () => {
      const code = (response as any)?.params?.code;
      if (typeof code !== "string" || code.length === 0) {
        setError(t("auth_generic_error"));
        return;
      }
      const verifier = request?.codeVerifier;
      if (typeof verifier !== "string" || verifier.length === 0) {
        setError(t("auth_generic_error"));
        return;
      }

      setIsSubmitting(true);
      setError(null);
      try {
        const tokenResponse = await AuthSession.exchangeCodeAsync(
          {
            clientId: oauthClientId,
            code,
            redirectUri,
            extraParams: { code_verifier: verifier },
          },
          discovery
        );

        const accessToken =
          (tokenResponse as any)?.accessToken ??
          (tokenResponse as any)?.access_token ??
          null;
        if (typeof accessToken !== "string" || accessToken.length === 0) {
          setIsSubmitting(false);
          setError(t("auth_generic_error"));
          return;
        }

        const result = await finishOAuthLogin(accessToken);
        setIsSubmitting(false);
        if (result.ok) {
          router.back();
          return;
        }
        setError(t("auth_generic_error"));
      } catch {
        setIsSubmitting(false);
        setError(t("auth_generic_error"));
      }
    })();
  }, [discovery, finishOAuthLogin, redirectUri, request?.codeVerifier, response, t]);

  async function onOAuthLogin() {
    if (!request || isSubmitting) return;
    setError(null);
    try {
      const verifier = request?.codeVerifier;
      if (typeof verifier === "string" && verifier.length > 0) {
        // Persist PKCE details so the `/oauth` callback route can complete login
        // even if the web app reloads on return from the provider.
        await savePendingOAuth({
          clientId: oauthClientId,
          redirectUri,
          codeVerifier: verifier,
          state: (request as any)?.state,
          createdAt: Date.now(),
        });
      }
      await promptAsync();
      // Result handled in useEffect above
    } catch {
      setError(t("auth_generic_error"));
    }
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.title, { color: colors.text }]}>{t("login_title")}</Text>
      {lastEmail ? (
        <Text style={[styles.subtitle, { color: colors.mutedText }]}>
          {t("login_sign_in_again_as", { email: lastEmail })}
        </Text>
      ) : null}

      {!!error && <Text style={[styles.error, { color: colors.destructive }]}>{error}</Text>}

      <Pressable
        style={[
          styles.button,
          { backgroundColor: colors.primary },
          (!request || isSubmitting) && { opacity: 0.65 },
        ]}
        disabled={!request || isSubmitting}
        onPress={onOAuthLogin}
      >
        {isSubmitting ? (
          <ActivityIndicator color={colors.onPrimary} />
        ) : (
          <Text style={[styles.buttonText, { color: colors.onPrimary }]}>
            {t("login_button")}
          </Text>
        )}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    marginBottom: 14,
  },
  subtitle: {
    fontSize: 15,
    opacity: 0.85,
    marginBottom: 14,
  },
  error: {
    marginTop: 2,
    marginBottom: 10,
    fontSize: 14,
    fontWeight: "600",
  },
  button: {
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 4,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "800",
  },
});

