import { useAuth } from "@/src/auth/AuthProvider";
import { useT } from "@/src/i18n/LocaleProvider";
import { useTheme } from "@/src/theme/ThemeProvider";
import { router } from "expo-router";
import { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

export default function Login() {
  const t = useT();
  const { colors } = useTheme();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSubmit = useMemo(
    () => email.trim().length > 0 && password.length > 0 && !isSubmitting,
    [email, isSubmitting, password]
  );

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
  hint: {
    marginTop: 10,
    fontSize: 13,
    opacity: 0.8,
  },
});

