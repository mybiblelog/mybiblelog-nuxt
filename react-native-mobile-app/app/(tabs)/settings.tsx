import { useLocale, useT } from "@/src/i18n/LocaleProvider";
import { useTheme } from "@/src/theme/ThemeProvider";
import { useAuth } from "@/src/auth/AuthProvider";
import { router } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useNetInfo } from "@react-native-community/netinfo";

export default function Settings() {
  const { locale, setLocale } = useLocale();
  const t = useT();
  const { mode, setMode, colors } = useTheme();
  const { state: authState, logout } = useAuth();
  const netInfo = useNetInfo();
  const isOnline =
    netInfo.isInternetReachable === null
      ? netInfo.isConnected
      : netInfo.isInternetReachable;

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={styles.content}
    >
      <Text style={[styles.title, { color: colors.text }]}>{t("settings_title")}</Text>

      <Text style={[styles.sectionLabel, { color: colors.mutedText }]}>
        {t("settings_connectivity_label")}
      </Text>
      <View style={[styles.card, { backgroundColor: colors.surfaceAlt }]}>
        <View style={styles.infoRow}>
          <Text style={[styles.infoText, { color: colors.text }]}>
            {isOnline === true
              ? t("connectivity_online")
              : isOnline === false
                ? t("connectivity_offline")
                : t("connectivity_unknown")}
          </Text>
        </View>
      </View>

      <Text style={[styles.sectionLabel, { color: colors.mutedText }]}>
        {t("settings_auth_label")}
      </Text>

      <View style={[styles.card, { backgroundColor: colors.surfaceAlt }]}>
        {authState.status === "loading" ? (
          <View style={styles.authRow}>
            <Text style={[styles.help, { color: colors.mutedText, marginTop: 0 }]}>
              {t("auth_loading")}
            </Text>
          </View>
        ) : authState.status === "authenticated" ? (
          <View style={styles.authRow}>
            <Text style={[styles.authText, { color: colors.text }]}>
              {t("auth_logged_in_as")} {authState.session.user.email}
            </Text>
            <Pressable
              style={[styles.authButton, { backgroundColor: colors.destructive }]}
              onPress={() => void logout()}
            >
              <Text style={[styles.authButtonText, { color: colors.onDestructive }]}>
                {t("auth_logout")}
              </Text>
            </Pressable>
          </View>
        ) : (
          <View style={styles.authRow}>
            <Text style={[styles.authText, { color: colors.mutedText }]}>
              {t("auth_login")}
            </Text>
            <Pressable
              style={[styles.authButton, { backgroundColor: colors.primary }]}
              onPress={() => router.push("/login")}
            >
              <Text style={[styles.authButtonText, { color: colors.onPrimary }]}>
                {t("auth_login")}
              </Text>
            </Pressable>
          </View>
        )}
      </View>

      <Text style={[styles.sectionLabel, { color: colors.mutedText }]}>
        {t("settings_language_label")}
      </Text>

      <View style={[styles.card, { backgroundColor: colors.surfaceAlt }]}>
        <Pressable
          style={[
            styles.row,
            locale === "en" && styles.rowSelected,
            locale === "en" && { backgroundColor: colors.border },
          ]}
          onPress={() => setLocale("en")}
        >
          <Text style={[styles.rowText, { color: colors.text }]}>
            {t("language_english")}
          </Text>
          <Text style={[styles.check, { color: colors.text }]}>
            {locale === "en" ? "✓" : ""}
          </Text>
        </Pressable>

        <View style={[styles.divider, { backgroundColor: colors.border }]} />

        <Pressable
          style={[
            styles.row,
            locale === "es" && styles.rowSelected,
            locale === "es" && { backgroundColor: colors.border },
          ]}
          onPress={() => setLocale("es")}
        >
          <Text style={[styles.rowText, { color: colors.text }]}>
            {t("language_spanish")}
          </Text>
          <Text style={[styles.check, { color: colors.text }]}>
            {locale === "es" ? "✓" : ""}
          </Text>
        </Pressable>
      </View>

      <Text style={[styles.help, { color: colors.mutedText }]}>
        {t("settings_language_help")}
      </Text>

      <Text style={[styles.sectionLabel, { color: colors.mutedText, marginTop: 18 }]}>
        {t("settings_theme_label")}
      </Text>

      <View style={[styles.card, { backgroundColor: colors.surfaceAlt }]}>
        <Pressable
          style={[
            styles.row,
            mode === "system" && styles.rowSelected,
            mode === "system" && { backgroundColor: colors.border },
          ]}
          onPress={() => setMode("system")}
        >
          <Text style={[styles.rowText, { color: colors.text }]}>
            {t("theme_system")}
          </Text>
          <Text style={[styles.check, { color: colors.text }]}>
            {mode === "system" ? "✓" : ""}
          </Text>
        </Pressable>

        <View style={[styles.divider, { backgroundColor: colors.border }]} />

        <Pressable
          style={[
            styles.row,
            mode === "light" && styles.rowSelected,
            mode === "light" && { backgroundColor: colors.border },
          ]}
          onPress={() => setMode("light")}
        >
          <Text style={[styles.rowText, { color: colors.text }]}>
            {t("theme_light")}
          </Text>
          <Text style={[styles.check, { color: colors.text }]}>
            {mode === "light" ? "✓" : ""}
          </Text>
        </Pressable>

        <View style={[styles.divider, { backgroundColor: colors.border }]} />

        <Pressable
          style={[
            styles.row,
            mode === "dark" && styles.rowSelected,
            mode === "dark" && { backgroundColor: colors.border },
          ]}
          onPress={() => setMode("dark")}
        >
          <Text style={[styles.rowText, { color: colors.text }]}>
            {t("theme_dark")}
          </Text>
          <Text style={[styles.check, { color: colors.text }]}>
            {mode === "dark" ? "✓" : ""}
          </Text>
        </Pressable>
      </View>

      <Text style={[styles.help, { color: colors.mutedText }]}>
        {t("settings_theme_help")}
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 16,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: "700",
    opacity: 0.7,
    marginBottom: 8,
  },
  authRow: {
    paddingHorizontal: 14,
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  authText: {
    flex: 1,
    fontSize: 14,
    fontWeight: "700",
  },
  authButton: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
  },
  authButtonText: {
    fontSize: 14,
    fontWeight: "800",
  },
  infoRow: {
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  infoText: {
    fontSize: 14,
    fontWeight: "800",
  },
  card: {
    borderRadius: 16,
    overflow: "hidden",
    backgroundColor: "rgba(0,0,0,0.06)",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  rowSelected: {
    backgroundColor: "rgba(0,0,0,0.08)",
  },
  rowText: {
    fontSize: 16,
    fontWeight: "700",
  },
  check: {
    width: 24,
    textAlign: "right",
    fontSize: 18,
    fontWeight: "900",
    opacity: 0.9,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: "rgba(0,0,0,0.12)",
  },
  help: {
    marginTop: 10,
    fontSize: 13,
    opacity: 0.7,
  },
});

