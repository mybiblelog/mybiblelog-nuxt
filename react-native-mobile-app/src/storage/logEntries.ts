import AsyncStorage from "@react-native-async-storage/async-storage";
import type { LogEntry } from "@/src/types/log-entry";

const STORAGE_KEY = "logEntries.v1";

function isLogEntry(value: unknown): value is LogEntry {
  if (!value || typeof value !== "object") return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.startVerseId === "number" &&
    Number.isFinite(v.startVerseId) &&
    typeof v.endVerseId === "number" &&
    Number.isFinite(v.endVerseId) &&
    typeof v.date === "string"
  );
}

export async function loadLogEntries(): Promise<LogEntry[] | null> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return null;

    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return null;

    const entries = parsed.filter(isLogEntry);
    return entries;
  } catch (err) {
    console.warn("Failed to load log entries", err);
    return null;
  }
}

export async function saveLogEntries(entries: LogEntry[]): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  } catch (err) {
    console.warn("Failed to save log entries", err);
  }
}

