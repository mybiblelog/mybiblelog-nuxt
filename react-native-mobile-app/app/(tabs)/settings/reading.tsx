import { useTheme } from "@/src/theme/ThemeProvider";
import { StyleSheet, Text, View } from "react-native";

export default function ReadingSettings() {
  const { colors } = useTheme();
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.title, { color: colors.text }]}>Reading</Text>
      <Text style={[styles.subtitle, { color: colors.mutedText }]}>
        Coming soon.
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
    fontWeight: "800",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    fontWeight: "600",
    opacity: 0.8,
  },
});

