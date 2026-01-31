import type { LogEntry } from "@/src/types/log-entry";
import { useLocale } from "@/src/i18n/LocaleProvider";
import { useTheme } from "@/src/theme/ThemeProvider";
import { Ionicons } from "@expo/vector-icons";
import { Bible } from "@mybiblelog/shared";
import { useMemo } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

export function LogEntryRow({
  entry,
  onPressMenu,
}: {
  entry: LogEntry;
  onPressMenu: () => void;
}) {
  const { locale } = useLocale();
  const { colors } = useTheme();
  const range = useMemo(
    () => Bible.displayVerseRange(entry.startVerseId, entry.endVerseId, locale),
    [entry.endVerseId, entry.startVerseId, locale]
  );
  return (
    <View style={[styles.row, { backgroundColor: colors.surfaceAlt }]}>
      <View style={styles.rowMain}>
        <Text style={[styles.rowDate, { color: colors.text }]}>{entry.date}</Text>
        <Text style={[styles.rowRange, { color: colors.mutedText }]}>
          {range}
        </Text>
      </View>

      <Pressable style={styles.menuButton} onPress={onPressMenu} hitSlop={10}>
        <Ionicons name="ellipsis-vertical" size={18} color={colors.mutedText} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: "rgba(0,0,0,0.06)",
  },
  rowMain: {
    flex: 1,
    paddingRight: 8,
  },
  rowDate: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  rowRange: {
    fontSize: 14,
    opacity: 0.85,
  },
  menuButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
});

