"use client";

import { useSyncExternalStore } from "react";
import { emptyExpedition, parseExpedition, serializeExpedition, STORAGE_KEY, PREFERENCE_KEY, type Expedition } from "@/lib/expedition";

type StorageState = "loading" | "saved" | "corrupt" | "unavailable" | "write-error";
export type MotionPreference = "system" | "reduce";
type Snapshot = { expedition: Expedition; storage: StorageState; message: string; motion: MotionPreference; preferenceMessage: string };
const INITIAL: Snapshot = { expedition: emptyExpedition(), storage: "loading", message: "", motion: "system", preferenceMessage: "" };
let snapshot = INITIAL;
let initialized = false;
let corruptRaw: string | null = null;
const listeners = new Set<() => void>();
const notify = () => listeners.forEach(listener => listener());
const getSnapshot = () => snapshot;
const getServerSnapshot = () => INITIAL;

function readStorage() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const result = raw === null ? { ok: true as const, data: emptyExpedition() } : parseExpedition(raw);
    if (result.ok) {
      snapshot = { ...snapshot, expedition: result.data, storage: "saved", message: "" };
      corruptRaw = null;
    } else {
      corruptRaw = raw;
      snapshot = { ...snapshot, storage: "corrupt", message: `Saved data could not be read. ${result.error} The original has not been overwritten.` };
    }
  } catch {
    snapshot = { ...snapshot, storage: "unavailable", message: "Browser storage is unavailable. You can still explore and build an expedition in this tab. Export it before leaving." };
  }
  try {
    const raw = window.localStorage.getItem(PREFERENCE_KEY);
    if (raw) {
      const value: unknown = JSON.parse(raw);
      if (typeof value === "object" && value !== null && "version" in value && value.version === 1 && "motion" in value && (value.motion === "system" || value.motion === "reduce")) {
        snapshot = { ...snapshot, motion: value.motion };
      } else { snapshot = { ...snapshot, preferenceMessage: "Unreadable motion preference; following your system. Choose a preference to replace it." }; }
    }
  } catch { snapshot = { ...snapshot, preferenceMessage: "Motion preference will apply to this tab only." }; }
  notify();
}

function onStorage(event: StorageEvent) {
  if (event.key === STORAGE_KEY || event.key === PREFERENCE_KEY || event.key === null) {
    // Do not silently overwrite an in-memory expedition that failed to save.
    if (snapshot.storage === "write-error" || snapshot.storage === "unavailable") return;
    readStorage();
  }
}
function subscribe(listener: () => void) {
  listeners.add(listener);
  if (listeners.size === 1) window.addEventListener("storage", onStorage);
  if (!initialized) { initialized = true; readStorage(); }
  return () => {
    listeners.delete(listener);
    if (!listeners.size) window.removeEventListener("storage", onStorage);
  };
}
export function useLocalStore() { return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot); }

export function commitExpedition(next: Expedition): boolean {
  snapshot = { ...snapshot, expedition: next };
  // Preserve corrupt persisted bytes until explicit reset, but allow an in-memory draft/export.
  if (snapshot.storage === "corrupt") { notify(); return false; }
  try {
    window.localStorage.setItem(STORAGE_KEY, serializeExpedition(next));
    snapshot = { ...snapshot, storage: "saved", message: "" };
    notify(); return true;
  } catch {
    snapshot = { ...snapshot, storage: "write-error", message: "Your latest changes could not be saved to this browser. They are still in this tab. Export a backup, or retry saving." };
    notify(); return false;
  }
}
export function mutateExpedition(change: (current: Expedition) => Expedition) { return commitExpedition(change(snapshot.expedition)); }
export function retryStorage() { return commitExpedition(snapshot.expedition); }
export function resetUnreadableStorage() {
  // Called only after the recovery dialog's explicit destructive confirmation.
  snapshot = { ...snapshot, storage: "saved", message: "" };
  corruptRaw = null;
  return commitExpedition(emptyExpedition());
}
export function unreadableBackup(): string | null { return corruptRaw; }
export function setMotionPreference(motion: MotionPreference) {
  snapshot = { ...snapshot, motion, preferenceMessage: "" };
  try { window.localStorage.setItem(PREFERENCE_KEY, JSON.stringify({ version: 1, motion })); }
  catch { snapshot = { ...snapshot, preferenceMessage: "Motion preference applies to this tab; browser storage is unavailable." }; }
  notify();
}