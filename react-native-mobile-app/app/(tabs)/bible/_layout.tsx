import { Stack } from "expo-router";
import { useTheme } from "@/src/theme/ThemeProvider";

export default function BibleLayout() {
  const { colors } = useTheme();
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: colors.surface },
        headerTintColor: colors.text,
        headerShadowVisible: false,
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen name="index" options={{ title: "Bible Books" }} />
      <Stack.Screen name="[book]" options={{ title: "Book" }} />
    </Stack>
  );
}

