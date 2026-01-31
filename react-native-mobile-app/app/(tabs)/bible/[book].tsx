import { useLocalSearchParams } from "expo-router";
import { useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Bible } from "@mybiblelog/shared";
import { useLocale } from "@/src/i18n/LocaleProvider";
import { useTheme } from "@/src/theme/ThemeProvider";

export default function BibleBookScreen() {
  const { colors } = useTheme();
  const { locale } = useLocale();
  const params = useLocalSearchParams<{ book?: string }>();

  const bookIndex = useMemo(() => Number(params.book), [params.book]);
  const title = useMemo(() => {
    if (!Number.isFinite(bookIndex) || bookIndex < 1) return "Book";
    return Bible.getBookName(bookIndex, locale) || "Book";
  }, [bookIndex, locale]);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
      <Text style={[styles.subtitle, { color: colors.mutedText }]}>
        Book details coming soon.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 22,
    fontWeight: "900",
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 14,
    fontWeight: "700",
    opacity: 0.8,
    textAlign: "center",
  },
});

