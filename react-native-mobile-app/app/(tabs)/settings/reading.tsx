import { useMemo, useState } from "react";
import { useAuth } from "@/src/auth/AuthProvider";
import { SelectSheet } from "@/src/components/SelectSheet";
import { useT } from "@/src/i18n/LocaleProvider";
import { useUserSettings } from "@/src/settings/UserSettingsProvider";
import { useTheme } from "@/src/theme/ThemeProvider";
import { BibleApps, BibleVersions } from "@mybiblelog/shared";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

export default function ReadingSettings() {
  const t = useT();
  const { colors } = useTheme();
  const { state: authState } = useAuth();
  const { state: settingsState, setLocalSettings, updateServerSettings } = useUserSettings();

  const [bibleVersionOpen, setBibleVersionOpen] = useState(false);
  const [bibleAppOpen, setBibleAppOpen] = useState(false);

  const bibleVersionOptions = useMemo(() => {
    const names: Record<string, string> = {
      [BibleVersions.NASB2020]: "New American Standard Bible (NASB)",
      [BibleVersions.NASB1995]: "New American Standard Bible 1995 (NASB 1995)",
      [BibleVersions.AMP]: "Amplified Bible (AMP)",
      [BibleVersions.KJV]: "King James Version (KJV)",
      [BibleVersions.NKJV]: "New King James Version (NKJV)",
      [BibleVersions.NIV]: "New International Version (NIV)",
      [BibleVersions.ESV]: "English Standard Version (ESV)",
      [BibleVersions.NABRE]: "New American Bible Revised Edition (NABRE)",
      [BibleVersions.NLT]: "New Living Translation (NLT)",
      [BibleVersions.TPT]: "The Passion Translation (TPT)",
      [BibleVersions.MSG]: "The Message (MSG)",
      [BibleVersions.RVR1960]: "Reina-Valera 1960 (RVR1960)",
      [BibleVersions.RVR2020]: "Reina-Valera 2020 (RVR2020)",
      [BibleVersions.UKR]: "українська (UKRK)",
      [BibleVersions.BDS]: "Bible du Semeur (BDS)",
      [BibleVersions.LSG]: "Louis Segond (LSG)",
      [BibleVersions.ARC]: "Almeida Revista e Corrigida (ARC)",
      [BibleVersions.LUT]: "Luther 1545 (LUT)",
    };

    return Object.keys(names).map((value) => ({ value, label: names[value] }));
  }, []);

  const bibleAppOptions = useMemo(() => {
    const names: Record<string, string> = {
      [BibleApps.BIBLEGATEWAY]: "Bible Gateway",
      [BibleApps.YOUVERSIONAPP]: "YouVersion App",
      [BibleApps.BIBLECOM]: "Bible.com (YouVersion)",
      [BibleApps.BLUELETTERBIBLE]: "Blue Letter Bible",
      [BibleApps.OLIVETREE]: "Olive Tree App",
    };
    return Object.keys(names).map((value) => ({ value, label: names[value] }));
  }, []);

  if (settingsState.status !== "ready") {
    return (
      <View style={[styles.loading, { backgroundColor: colors.background }]}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  const settings = settingsState.settings;
  const canUseServer = authState.status === "authenticated";
  const bibleVersionLabel =
    bibleVersionOptions.find((o) => o.value === settings.preferredBibleVersion)?.label ??
    settings.preferredBibleVersion;
  const bibleAppLabel =
    bibleAppOptions.find((o) => o.value === settings.preferredBibleApp)?.label ??
    settings.preferredBibleApp;

  async function saveDailyGoal() {
    const value = settings.dailyVerseCountGoal;
    if (!Number.isFinite(value) || value < 1 || value > 1111) return;
    if (canUseServer) {
      const ok = await updateServerSettings({ dailyVerseCountGoal: value });
      if (ok) return;
    }
    await setLocalSettings({ dailyVerseCountGoal: value });
  }

  async function saveLookBackDate() {
    const value = settings.lookBackDate;
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return;
    if (canUseServer) {
      const ok = await updateServerSettings({ lookBackDate: value });
      if (ok) return;
    }
    await setLocalSettings({ lookBackDate: value });
  }

  async function savePreferredBibleVersion() {
    const value = settings.preferredBibleVersion;
    if (!value) return;
    if (canUseServer) {
      const ok = await updateServerSettings({ preferredBibleVersion: value });
      if (ok) return;
    }
    await setLocalSettings({ preferredBibleVersion: value });
  }

  async function savePreferredBibleApp() {
    // Device-only (API does not currently store this).
    await setLocalSettings({ preferredBibleApp: settings.preferredBibleApp });
  }

  return (
    <>
      <ScrollView
        style={{ flex: 1, backgroundColor: colors.background }}
        contentContainerStyle={styles.content}
      >
        <Text style={[styles.sectionLabel, { color: colors.mutedText }]}>
          {t("settings_reading_daily_goal_title")}
        </Text>
        <View style={[styles.rowCard, { backgroundColor: colors.surfaceAlt }]}>
          <TextInput
            value={String(settings.dailyVerseCountGoal ?? "")}
            onChangeText={(text) => {
              const n = Number(text);
              if (!Number.isFinite(n)) {
                void setLocalSettings({ dailyVerseCountGoal: 0 });
                return;
              }
              void setLocalSettings({ dailyVerseCountGoal: Math.floor(n) });
            }}
            keyboardType="number-pad"
            placeholder="86"
            placeholderTextColor={colors.placeholder}
            style={[styles.input, { borderColor: colors.border, color: colors.text }]}
          />
          <Pressable
            style={[styles.saveButton, { backgroundColor: colors.primary }]}
            onPress={() => void saveDailyGoal()}
          >
            <Text style={[styles.saveButtonText, { color: colors.onPrimary }]}>
              {t("save")}
            </Text>
          </Pressable>
        </View>

        <Text style={[styles.sectionLabel, { color: colors.mutedText }]}>
          {t("settings_reading_look_back_date_title")}
        </Text>
        <View style={[styles.rowCard, { backgroundColor: colors.surfaceAlt }]}>
          <TextInput
            value={settings.lookBackDate}
            onChangeText={(text) => void setLocalSettings({ lookBackDate: text })}
            placeholder="YYYY-MM-DD"
            placeholderTextColor={colors.placeholder}
            style={[styles.input, { borderColor: colors.border, color: colors.text }]}
          />
          <Pressable
            style={[styles.saveButton, { backgroundColor: colors.primary }]}
            onPress={() => void saveLookBackDate()}
          >
            <Text style={[styles.saveButtonText, { color: colors.onPrimary }]}>
              {t("save")}
            </Text>
          </Pressable>
        </View>

        <Text style={[styles.sectionLabel, { color: colors.mutedText }]}>
          {t("settings_reading_preferred_bible_version_title")}
        </Text>
        <View style={[styles.card, { backgroundColor: colors.surfaceAlt }]}>
          <Pressable
            style={[styles.selectRow, { borderColor: colors.border }]}
            onPress={() => setBibleVersionOpen(true)}
          >
            <Text style={[styles.selectText, { color: colors.text }]}>
              {bibleVersionLabel || t("settings_select_option")}
            </Text>
          </Pressable>

          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          <Pressable
            style={[styles.actionRow, { backgroundColor: colors.primary }]}
            onPress={() => void savePreferredBibleVersion()}
          >
            <Text style={[styles.actionText, { color: colors.onPrimary }]}>
              {t("save")}
            </Text>
          </Pressable>
        </View>

        <Text style={[styles.sectionLabel, { color: colors.mutedText }]}>
          {t("settings_reading_preferred_bible_app_title")}
        </Text>
        <View style={[styles.card, { backgroundColor: colors.surfaceAlt }]}>
          <Pressable
            style={[styles.selectRow, { borderColor: colors.border }]}
            onPress={() => setBibleAppOpen(true)}
          >
            <Text style={[styles.selectText, { color: colors.text }]}>
              {bibleAppLabel || t("settings_select_option")}
            </Text>
          </Pressable>

          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          <Pressable
            style={[styles.actionRow, { backgroundColor: colors.primary }]}
            onPress={() => void savePreferredBibleApp()}
          >
            <Text style={[styles.actionText, { color: colors.onPrimary }]}>
              {t("save")}
            </Text>
          </Pressable>
        </View>

        {authState.status !== "authenticated" && (
          <Text style={[styles.help, { color: colors.mutedText }]}>
            {t("settings_reading_local_only_notice")}
          </Text>
        )}
      </ScrollView>

      <SelectSheet
        visible={bibleVersionOpen}
        title={t("settings_reading_preferred_bible_version_title")}
        options={bibleVersionOptions}
        selectedValue={settings.preferredBibleVersion || null}
        onSelect={(v) => void setLocalSettings({ preferredBibleVersion: String(v) })}
        onClose={() => setBibleVersionOpen(false)}
      />

      <SelectSheet
        visible={bibleAppOpen}
        title={t("settings_reading_preferred_bible_app_title")}
        options={bibleAppOptions}
        selectedValue={settings.preferredBibleApp || null}
        onSelect={(v) => void setLocalSettings({ preferredBibleApp: String(v) })}
        onClose={() => setBibleAppOpen(false)}
      />
    </>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    padding: 16,
    paddingBottom: 24,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: "800",
    opacity: 0.7,
    marginBottom: 8,
    marginTop: 14,
  },
  rowCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderRadius: 16,
    padding: 12,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    fontWeight: "700",
  },
  saveButton: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
  },
  saveButtonText: {
    fontSize: 14,
    fontWeight: "900",
  },
  card: {
    borderRadius: 16,
    overflow: "hidden",
  },
  selectRow: {
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  selectText: {
    fontSize: 16,
    fontWeight: "700",
  },
  divider: {
    height: StyleSheet.hairlineWidth,
  },
  actionRow: {
    paddingHorizontal: 14,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  actionText: {
    fontSize: 16,
    fontWeight: "900",
  },
  help: {
    marginTop: 14,
    fontSize: 13,
    opacity: 0.75,
  },
});

