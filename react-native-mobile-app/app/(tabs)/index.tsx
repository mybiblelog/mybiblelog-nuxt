import dayjs from "dayjs";
import { useEffect, useMemo, useState } from "react";
import type { LogEntry } from "@/src/types/log-entry";
import { ConfirmDialog } from "@/src/components/ConfirmDialog";
import { LogEntryEditorModal } from "@/src/components/LogEntryEditorModal";
import { LogEntryMenu } from "@/src/components/LogEntryMenu";
import { LogEntryRow } from "@/src/components/LogEntryRow";
import { useLogEntries } from "@/src/log-entries/LogEntriesProvider";
import { useUserSettings } from "@/src/settings/UserSettingsProvider";
import { useTheme } from "@/src/theme/ThemeProvider";
import { openPassageInBible } from "@/src/bible/openInBible";
import { useToast } from "@/src/toast/ToastProvider";
import { Bible } from "@mybiblelog/shared";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

function formatLongDate(date: string): string {
  const parts = date.split("-").map((p) => Number(p));
  if (parts.length !== 3 || parts.some((n) => !Number.isFinite(n))) return date;
  const [year, month, day] = parts;
  const d = new Date(year, month - 1, day);
  if (Number.isNaN(d.getTime())) return date;
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(d);
}

function entryKey(e: LogEntry): string {
  return e.clientId ?? e.id ?? `${e.date}-${e.startVerseId}-${e.endVerseId}`;
}

export default function Index() {
  const { colors } = useTheme();
  const { state: logState, createEntry, updateEntry, deleteEntry } = useLogEntries();
  const { state: settingsState } = useUserSettings();
  const { showToast } = useToast();

  const today = useMemo(() => dayjs().format("YYYY-MM-DD"), []);
  const todayDisplay = useMemo(() => formatLongDate(today), [today]);

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [menuIndex, setMenuIndex] = useState<number | null>(null);
  const [confirmDeleteIndex, setConfirmDeleteIndex] = useState<number | null>(null);

  const todayEntries = useMemo(() => {
    if (logState.status !== "ready") return [];
    return logState.entries.filter((e) => e.date === today);
  }, [logState, today]);

  // Keep indices valid if list changes (sync/reload).
  useEffect(() => {
    if (menuIndex !== null && !todayEntries[menuIndex]) setMenuIndex(null);
    if (editingIndex !== null && !todayEntries[editingIndex]) setEditingIndex(null);
    if (confirmDeleteIndex !== null && !todayEntries[confirmDeleteIndex]) setConfirmDeleteIndex(null);
  }, [confirmDeleteIndex, editingIndex, menuIndex, todayEntries]);

  const goal =
    settingsState.status === "ready"
      ? settingsState.settings.dailyVerseCountGoal
      : 0;
  const lookBackDate =
    settingsState.status === "ready" ? settingsState.settings.lookBackDate : "0000-00-00";

  const perEntryVerseStats = useMemo(() => {
    if (logState.status !== "ready") return new Map<string, { total: number; newSinceLookBack: number }>();
    if (settingsState.status !== "ready") return new Map<string, { total: number; newSinceLookBack: number }>();

    const all = logState.entries.slice();

    // Sort chronologically so "new verses" matches Nuxt's cumulative delta behavior.
    all.sort((a, b) => {
      if (a.date < b.date) return -1;
      if (a.date > b.date) return 1;
      // deterministic tie-breaker for same date
      if (a.startVerseId !== b.startVerseId) return a.startVerseId - b.startVerseId;
      return a.endVerseId - b.endVerseId;
    });

    const map = new Map<string, { total: number; newSinceLookBack: number }>();

    const cumulative: Array<{ startVerseId: number; endVerseId: number }> = [];
    let totalVersesToDate = 0;

    for (const e of all) {
      const key = entryKey(e);
      const total = Bible.countRangeVerses(e.startVerseId, e.endVerseId);

      if (e.date < lookBackDate) {
        map.set(key, { total, newSinceLookBack: 0 });
        continue;
      }

      // Like Nuxt `date-verse-counts`: uniqueAfter - uniqueBefore is the incremental "new verses".
      cumulative.push({ startVerseId: e.startVerseId, endVerseId: e.endVerseId });
      const totalVersesThroughDate = Bible.countUniqueRangeVerses(cumulative);
      const newSinceLookBack = totalVersesThroughDate - totalVersesToDate;
      totalVersesToDate = totalVersesThroughDate;

      map.set(key, { total, newSinceLookBack });
    }

    return map;
  }, [logState, lookBackDate, settingsState.status]);

  const versesReadToday = useMemo(() => {
    const ranges = todayEntries.map((e) => ({
      startVerseId: e.startVerseId,
      endVerseId: e.endVerseId,
    }));
    return Bible.countUniqueRangeVerses(ranges);
  }, [todayEntries]);

  const progress = goal > 0 ? Math.min(1, versesReadToday / goal) : 0;
  const progressPct = Math.round(progress * 100);

  if (logState.status !== "ready" || settingsState.status !== "ready") {
    return (
      <View style={[styles.loading, { backgroundColor: colors.background }]}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={[styles.title, { color: colors.text }]}>Today</Text>
          <Text style={[styles.subtitle, { color: colors.mutedText }]}>
            {todayDisplay}
          </Text>
        </View>
        <Pressable
          style={[styles.addButton, { backgroundColor: colors.primary }]}
          onPress={() => setIsAddOpen(true)}
          hitSlop={8}
        >
          <Text style={[styles.addButtonText, { color: colors.onPrimary }]}>Add</Text>
        </Pressable>
      </View>

      <View style={[styles.progressCard, { backgroundColor: colors.surfaceAlt }]}>
        <View style={styles.progressTopRow}>
          <Text style={[styles.progressLabel, { color: colors.text }]}>
            Daily goal
          </Text>
          <Text style={[styles.progressMeta, { color: colors.mutedText }]}>
            {goal > 0
              ? `${progressPct}% • ${versesReadToday} / ${goal} verses`
              : `${versesReadToday} verses`}
          </Text>
        </View>
        <View style={[styles.progressTrack, { backgroundColor: colors.border }]}>
          <View
            style={[
              styles.progressFill,
              { backgroundColor: colors.primary, width: `${progressPct}%` },
            ]}
          />
        </View>
      </View>

      <FlatList
        data={todayEntries}
        contentContainerStyle={[
          styles.listContent,
          todayEntries.length === 0 && styles.listContentEmpty,
        ]}
        keyExtractor={(item) => item.clientId ?? item.id ?? `${item.date}-${item.startVerseId}-${item.endVerseId}`}
        renderItem={({ item, index }) => (
          <LogEntryRow
            entry={item}
            meta={(() => {
              const stats = perEntryVerseStats.get(entryKey(item));
              if (!stats) return undefined;
              return `${stats.newSinceLookBack} new • ${stats.total} total verses`;
            })()}
            onPressMenu={() => setMenuIndex(index)}
          />
        )}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={[styles.emptyTitle, { color: colors.text }]}>
              No entries yet
            </Text>
            <Text style={[styles.emptyText, { color: colors.mutedText }]}>
              Add what you read today to track your progress.
            </Text>
            <Pressable
              style={[styles.emptyCta, { backgroundColor: colors.primary }]}
              onPress={() => setIsAddOpen(true)}
            >
              <Text style={[styles.emptyCtaText, { color: colors.onPrimary }]}>
                Add
              </Text>
            </Pressable>
          </View>
        }
      />

      <LogEntryEditorModal
        visible={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        title="Add Log Entry"
        submitLabel="Save"
        onSubmit={(entry) => {
          void createEntry({ ...entry, date: today });
        }}
      />

      <LogEntryEditorModal
        visible={editingIndex !== null && todayEntries[editingIndex] !== undefined}
        onClose={() => setEditingIndex(null)}
        title="Edit Log Entry"
        submitLabel="Save"
        initialEntry={editingIndex !== null ? todayEntries[editingIndex] : undefined}
        onSubmit={(entry) => {
          if (editingIndex === null) return;
          const existing = todayEntries[editingIndex];
          if (!existing?.clientId) return;
          void updateEntry(existing.clientId, { ...entry, date: today });
          setEditingIndex(null);
        }}
      />

      <LogEntryMenu
        visible={menuIndex !== null && todayEntries[menuIndex] !== undefined}
        onClose={() => setMenuIndex(null)}
        onOpenInBible={() => {
          if (menuIndex === null) return;
          const entry = todayEntries[menuIndex];
          if (!entry) return;
          void (async () => {
            const ok = await openPassageInBible(entry.startVerseId, {
              preferredBibleApp: settingsState.status === "ready" ? settingsState.settings.preferredBibleApp : undefined,
              preferredBibleVersion: settingsState.status === "ready" ? settingsState.settings.preferredBibleVersion : undefined,
            });
            if (!ok) {
              showToast({ type: "error", message: "Unable to open Bible app." });
            }
          })();
        }}
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
        visible={confirmDeleteIndex !== null && todayEntries[confirmDeleteIndex] !== undefined}
        title="Delete log entry?"
        message="This cannot be undone."
        confirmLabel="Delete"
        cancelLabel="Cancel"
        onCancel={() => setConfirmDeleteIndex(null)}
        onConfirm={() => {
          if (confirmDeleteIndex === null) return;
          const existing = todayEntries[confirmDeleteIndex];
          if (existing?.clientId) void deleteEntry(existing.clientId);
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
  title: {
    fontSize: 28,
    fontWeight: "700",
  },
  subtitle: {
    fontSize: 13,
    fontWeight: "700",
    opacity: 0.75,
    marginTop: 2,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    marginBottom: 12,
  },
  addButton: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
  },
  addButtonText: {
    fontSize: 14,
    fontWeight: "900",
  },
  progressCard: {
    borderRadius: 16,
    padding: 14,
    marginBottom: 14,
  },
  progressTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "baseline",
    marginBottom: 10,
  },
  progressLabel: {
    fontSize: 14,
    fontWeight: "900",
  },
  progressMeta: {
    fontSize: 13,
    fontWeight: "700",
    opacity: 0.8,
  },
  progressTrack: {
    height: 10,
    borderRadius: 999,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 999,
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
  },
  emptyCtaText: {
    fontSize: 16,
    fontWeight: "800",
  },
  loading: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});

