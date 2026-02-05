import { useAuth } from "@/src/auth/AuthProvider";
import { useT } from "@/src/i18n/LocaleProvider";
import { useTheme } from "@/src/theme/ThemeProvider";
import { router } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import * as Google from "expo-auth-session/providers/google";
import { makeRedirectUri } from "expo-auth-session";
import { useEffect, useMemo, useState } from "react";
import { Platform } from "react-native";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useLocale } from "@/src/i18n/LocaleProvider";

WebBrowser.maybeCompleteAuthSession();

export default function Login() {
  const t = useT();
  const { locale } = useLocale();
  const { colors } = useTheme();
  const { login, loginWithGoogleIdToken } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [isGoogleSubmitting, setIsGoogleSubmitting] = useState(false);

  const [request, response, promptAsync] = Google.useAuthRequest({
    clientId: process.env.EXPO_PUBLIC_GOOGLE_EXPO_CLIENT_ID,
    webClientId:
      process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID ??
      process.env.EXPO_PUBLIC_GOOGLE_EXPO_CLIENT_ID,
    scopes: ["profile", "email"],
    responseType: "id_token",
  });

  // Log redirect URI on web so you can add it to Google Cloud Console (fixes redirect_uri_mismatch).
  useEffect(() => {
    if (Platform.OS === "web" && __DEV__) {
      const uri = makeRedirectUri();
      // eslint-disable-next-line no-console
      console.log(
        "[Google Sign-In] Add this exact URL to Google Cloud Console → Credentials → Your Web client → Authorized redirect URIs:",
        uri
      );
    }
  }, []);

  const canSubmit = useMemo(
    () => email.trim().length > 0 && password.length > 0 && !isSubmitting,
    [email, isSubmitting, password]
  );

  useEffect(() => {
    if (response?.type !== "success") return;
    const idToken =
      // most common
      (response as any)?.params?.id_token ??
      (response as any)?.authentication?.idToken ??
      (response as any)?.authentication?.id_token ??
      null;
    if (typeof idToken !== "string" || idToken.length === 0) {
      setError(t("auth_generic_error"));
      setIsGoogleSubmitting(false);
      return;
    }

    void (async () => {
      setError(null);
      const result = await loginWithGoogleIdToken(idToken, locale);
      setIsGoogleSubmitting(false);
      if (result.ok) {
        router.back();
        return;
      }
      setError(t("auth_generic_error"));
    })();
  }, [locale, loginWithGoogleIdToken, response, t]);

  async function onSubmit() {
    if (!canSubmit) return;
    setIsSubmitting(true);
    setError(null);
    const result = await login(email.trim(), password);
    setIsSubmitting(false);

    if (result.ok) {
      router.back();
      return;
    }

    if (result.error.code === "unauthorized") {
      setError(t("auth_invalid_credentials"));
    } else {
      setError(t("auth_generic_error"));
    }
  }

  async function onGoogle() {
    if (!request) return;
    setIsGoogleSubmitting(true);
    setError(null);
    try {
      await promptAsync();
      // result handled by useEffect above
    } catch {
      setIsGoogleSubmitting(false);
      setError(t("auth_generic_error"));
    }
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.title, { color: colors.text }]}>{t("login_title")}</Text>

      <View style={styles.field}>
        <Text style={[styles.label, { color: colors.mutedText }]}>
          {t("auth_email")}
        </Text>
        <TextInput
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          placeholder="test@example.com"
          placeholderTextColor={colors.placeholder}
          style={[
            styles.input,
            { borderColor: colors.border, color: colors.text },
          ]}
        />
      </View>

      <View style={styles.field}>
        <Text style={[styles.label, { color: colors.mutedText }]}>
          {t("auth_password")}
        </Text>
        <TextInput
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          placeholder="test"
          placeholderTextColor={colors.placeholder}
          style={[
            styles.input,
            { borderColor: colors.border, color: colors.text },
          ]}
        />
      </View>

      {!!error && <Text style={[styles.error, { color: colors.destructive }]}>{error}</Text>}

      <Pressable
        style={[
          styles.button,
          { backgroundColor: colors.primary },
          !canSubmit && { opacity: 0.5 },
        ]}
        disabled={!canSubmit}
        onPress={onSubmit}
      >
        {isSubmitting ? (
          <ActivityIndicator color={colors.onPrimary} />
        ) : (
          <Text style={[styles.buttonText, { color: colors.onPrimary }]}>
            {t("login_button")}
          </Text>
        )}
      </Pressable>

      <Pressable
        style={[
          styles.googleButton,
          { borderColor: colors.border, backgroundColor: colors.surface },
          (!request || isGoogleSubmitting) && { opacity: 0.65 },
        ]}
        disabled={!request || isGoogleSubmitting}
        onPress={onGoogle}
      >
        {isGoogleSubmitting ? (
          <ActivityIndicator color={colors.primary} />
        ) : (
          <>
            <Ionicons name="logo-google" size={18} color={colors.text} />
            <Text style={[styles.googleButtonText, { color: colors.text }]}>
              {t("login_with_google")}
            </Text>
          </>
        )}
      </Pressable>

      <Text style={[styles.hint, { color: colors.mutedText }]}>
        {t("auth_login_hint")}
      </Text>
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
  field: {
    marginBottom: 12,
  },
  label: {
    fontSize: 13,
    fontWeight: "700",
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
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
  googleButton: {
    marginTop: 10,
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 10,
  },
  googleButtonText: {
    fontSize: 16,
    fontWeight: "800",
  },
  hint: {
    marginTop: 10,
    fontSize: 13,
    opacity: 0.8,
  },
});

