import type { LogEntry } from "@/src/types/log-entry";
import { ConfirmDialog } from "@/src/components/ConfirmDialog";
import { LogEntryEditorModal } from "@/src/components/LogEntryEditorModal";
import { LogEntryMenu } from "@/src/components/LogEntryMenu";
import { LogEntryRow } from "@/src/components/LogEntryRow";
import { useT } from "@/src/i18n/LocaleProvider";
import { loadLogEntries, saveLogEntries } from "@/src/storage/logEntries";
import { useTheme } from "@/src/theme/ThemeProvider";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

// const LOG_ENTRIES: LogEntry[] = [
//   { startVerseId: 1001001, endVerseId: 1001005, date: "2026-01-10" },
//   { startVerseId: 1902301, endVerseId: 1902306, date: "2026-01-12" },
//   { startVerseId: 4300101, endVerseId: 4300103, date: "2026-01-15" },
// ];

export default function Log() {
  const t = useT();
  const { colors } = useTheme();
  const [entries, setEntries] = useState<LogEntry[]>([]);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [menuIndex, setMenuIndex] = useState<number | null>(null);
  const [confirmDeleteIndex, setConfirmDeleteIndex] = useState<number | null>(
    null
  );

  useEffect(() => {
    let isMounted = true;

    (async () => {
      const stored = await loadLogEntries();
      if (!isMounted) return;

      // Note: stored can legitimately be an empty array.
      setEntries(stored ?? []);
      // else {
      //   // FIXME: for development only
      //   // First run (or cleared storage): keep defaults and persist them once.
      //   setEntries(LOG_ENTRIES);
      //   void saveLogEntries(LOG_ENTRIES);
      // }

      setHasLoaded(true);
    })();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!hasLoaded) return;
    void saveLogEntries(entries);
  }, [entries, hasLoaded]);

  if (!hasLoaded) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.mutedText }]}>
          {t("loading_log_entries")}
        </Text>
      </View>
    );
  }

  function openAdd() {
    setIsAddOpen(true);
  }

  function closeAdd() {
    setIsAddOpen(false);
  }

  function closeEdit() {
    setEditingIndex(null);
  }

  function openEntryMenu(index: number) {
    setMenuIndex(index);
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>{t("log_title")}</Text>
        <Pressable
          style={[styles.addButton, { backgroundColor: colors.primary }]}
          onPress={openAdd}
          hitSlop={8}
        >
          <Text style={[styles.addButtonText, { color: colors.onPrimary }]}>
            {t("add")}
          </Text>
        </Pressable>
      </View>

      <FlatList
        data={entries}
        contentContainerStyle={[
          styles.listContent,
          entries.length === 0 && styles.listContentEmpty,
        ]}
        keyExtractor={(item) =>
          `${item.date}-${item.startVerseId}-${item.endVerseId}`
        }
        renderItem={({ item, index }) => (
          <LogEntryRow entry={item} onPressMenu={() => openEntryMenu(index)} />
        )}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={[styles.emptyTitle, { color: colors.text }]}>
              {t("empty_title")}
            </Text>
            <Text style={[styles.emptyText, { color: colors.mutedText }]}>
              {t("empty_text")}
            </Text>
            <Pressable
              style={[styles.emptyCta, { backgroundColor: colors.primary }]}
              onPress={openAdd}
            >
              <Text style={[styles.emptyCtaText, { color: colors.onPrimary }]}>
                {t("empty_cta")}
              </Text>
            </Pressable>
          </View>
        }
      />

      <LogEntryEditorModal
        visible={isAddOpen}
        onClose={closeAdd}
        title={t("add_log_entry_title")}
        submitLabel={t("save")}
        onSubmit={(entry) => setEntries((prev) => [entry, ...prev])}
      />

      <LogEntryEditorModal
        visible={editingIndex !== null && entries[editingIndex] !== undefined}
        onClose={closeEdit}
        title={t("edit_log_entry_title")}
        submitLabel={t("save")}
        initialEntry={editingIndex !== null ? entries[editingIndex] : undefined}
        onSubmit={(entry) => {
          setEntries((prev) =>
            prev.map((e, i) => (i === editingIndex ? entry : e))
          );
          setEditingIndex(null);
        }}
      />

      <LogEntryMenu
        visible={menuIndex !== null && entries[menuIndex] !== undefined}
        onClose={() => setMenuIndex(null)}
        onEdit={() => {
          if (menuIndex === null) return;
          setEditingIndex(menuIndex);
        }}
        onDelete={() => {
          if (menuIndex === null) return;
          setConfirmDeleteIndex(menuIndex);
        }}
      />

      <ConfirmDialog
        visible={
          confirmDeleteIndex !== null &&
          entries[confirmDeleteIndex] !== undefined
        }
        title={t("delete_confirm_title")}
        message={t("delete_confirm_message")}
        confirmLabel={t("menu_delete")}
        cancelLabel={t("cancel")}
        onCancel={() => setConfirmDeleteIndex(null)}
        onConfirm={() => {
          if (confirmDeleteIndex === null) return;
          setEntries((prev) =>
            prev.filter((_, i) => i !== confirmDeleteIndex)
          );
          setConfirmDeleteIndex(null);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
  },
  addButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: "black",
  },
  addButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "700",
  },
  listContent: {
    paddingBottom: 24,
  },
  listContentEmpty: {
    flexGrow: 1,
  },
  separator: {
    height: 10,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 16,
  },
  loadingText: {
    fontSize: 14,
    opacity: 0.7,
  },
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "800",
    marginBottom: 6,
  },
  emptyText: {
    fontSize: 14,
    opacity: 0.75,
    textAlign: "center",
    marginBottom: 14,
  },
  emptyCta: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: "black",
  },
  emptyCtaText: {
    color: "white",
    fontSize: 16,
    fontWeight: "700",
  },
});

