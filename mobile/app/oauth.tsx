import { useAuth } from "@/src/auth/AuthProvider";
import { clearPendingOAuth, loadPendingOAuth } from "@/src/auth/pendingOAuth";
import { getApiBaseUrl } from "@/src/api/apiBase";
import { useT } from "@/src/i18n/LocaleProvider";
import { useTheme } from "@/src/theme/ThemeProvider";
import * as AuthSession from "expo-auth-session";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";

type OAuthParams = {
  code?: string;
  state?: string;
  error?: string;
  error_description?: string;
};

export default function OAuthCallback() {
  const t = useT();
  const { colors } = useTheme();
  const { finishOAuthLogin } = useAuth();
  const params = useLocalSearchParams<OAuthParams>();

  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(true);

  const discovery = useMemo(
    () => ({
      authorizationEndpoint: `${getApiBaseUrl()}/oauth/authorize`,
      tokenEndpoint: `${getApiBaseUrl()}/oauth/token`,
    }),
    []
  );

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const urlError = typeof params.error === "string" ? params.error : null;
        if (urlError) {
          const desc = typeof params.error_description === "string" ? params.error_description : null;
          throw new Error(desc ? `${urlError}: ${desc}` : urlError);
        }

        const code = typeof params.code === "string" ? params.code : null;
        if (!code) throw new Error("missing_code");

        const pending = await loadPendingOAuth();
        if (!pending) throw new Error("missing_pending_oauth");

        const returnedState = typeof params.state === "string" ? params.state : null;
        if (pending.state && pending.state !== returnedState) {
          throw new Error("state_mismatch");
        }

        const tokenResponse = await AuthSession.exchangeCodeAsync(
          {
            clientId: pending.clientId,
            code,
            redirectUri: pending.redirectUri,
            extraParams: { code_verifier: pending.codeVerifier },
          },
          discovery
        );

        const accessToken =
          (tokenResponse as any)?.accessToken ??
          (tokenResponse as any)?.access_token ??
          null;
        if (typeof accessToken !== "string" || accessToken.length === 0) {
          throw new Error("missing_access_token");
        }

        const result = await finishOAuthLogin(accessToken);
        if (!result.ok) throw new Error("finish_login_failed");

        await clearPendingOAuth();
        if (!cancelled) {
          setIsSubmitting(false);
          router.replace("/");
        }
      } catch {
        await clearPendingOAuth();
        if (!cancelled) {
          setIsSubmitting(false);
          setError(t("auth_generic_error"));
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [discovery, finishOAuthLogin, params.code, params.error, params.error_description, params.state, t]);

  if (isSubmitting) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <ActivityIndicator color={colors.primary} />
        <Text style={[styles.text, { color: colors.mutedText }]}>{t("loading")}</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {!!error && <Text style={[styles.error, { color: colors.destructive }]}>{error}</Text>}
      <Pressable
        style={[styles.button, { backgroundColor: colors.primary }]}
        onPress={() => router.replace("/login")}
      >
        <Text style={[styles.buttonText, { color: colors.onPrimary }]}>{t("auth_login")}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 16,
    gap: 10,
  },
  text: {
    fontSize: 14,
    fontWeight: "700",
  },
  error: {
    fontSize: 14,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 2,
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "800",
  },
});

