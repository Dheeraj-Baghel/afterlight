import { isPlanetId, type PlanetId } from "@/lib/types";

export const STORAGE_KEY = "afterlight.expedition.v1";
export const PREFERENCE_KEY = "afterlight.preferences.v1";
export const MAX_NOTE_LENGTH = 600;
export const MAX_IMPORT_BYTES = 32 * 1024;
export type Destination = { planetId: PlanetId; note: string };
export type Expedition = { version: 1; destinations: Destination[] };
export type ParseResult = { ok: true; data: Expedition } | { ok: false; error: string };
export const emptyExpedition = (): Expedition => ({ version: 1, destinations: [] });

function isRecord(value: unknown): value is Record<string, unknown> { return typeof value === "object" && value !== null && !Array.isArray(value); }
export function parseExpedition(text: string): ParseResult {
  if (new TextEncoder().encode(text).length > MAX_IMPORT_BYTES) return { ok: false, error: "This file is too large. Choose an AFTERLIGHT JSON file of 32 KB or less." };
  let value: unknown;
  try { value = JSON.parse(text); } catch { return { ok: false, error: "This is not valid JSON. Choose an unedited AFTERLIGHT expedition export." }; }
  if (!isRecord(value)) return { ok: false, error: "Expected an expedition object, not a list or plain value." };
  if (value.version !== 1) return { ok: false, error: "Unsupported expedition version. This atlas reads schema version 1; your current expedition is unchanged." };
  if (!Array.isArray(value.destinations) || value.destinations.length > 8) return { ok: false, error: "An expedition must contain a destinations list with no more than eight worlds." };
  const destinations: Destination[] = [];
  const seen = new Set<PlanetId>();
  for (const row of value.destinations) {
    if (!isRecord(row) || !isPlanetId(row.planetId)) return { ok: false, error: "A destination has an unknown planet identifier. Only the eight planets in this atlas are accepted." };
    if (seen.has(row.planetId)) return { ok: false, error: "The file contains a duplicate world. Each planet can appear only once." };
    if (typeof row.note !== "string" || row.note.length > MAX_NOTE_LENGTH) return { ok: false, error: `Each personal note must be text of ${MAX_NOTE_LENGTH} characters or fewer.` };
    seen.add(row.planetId);
    // Explicit field selection: imported prototype keys / unknown fields are never applied.
    destinations.push({ planetId: row.planetId, note: row.note });
  }
  return { ok: true, data: { version: 1, destinations } };
}
export function serializeExpedition(data: Expedition): string { return JSON.stringify({ version: 1, destinations: data.destinations.map(d => ({ planetId: d.planetId, note: d.note })) }, null, 2); }
export function moveDestination(data: Expedition, id: PlanetId, direction: -1 | 1): Expedition {
  const index = data.destinations.findIndex(d => d.planetId === id);
  const target = index + direction;
  if (index < 0 || target < 0 || target >= data.destinations.length) return data;
  const destinations = [...data.destinations];
  [destinations[index], destinations[target]] = [destinations[target], destinations[index]];
  return { version: 1, destinations };
}
export function toggleDestination(data: Expedition, id: PlanetId): Expedition {
  return { version: 1, destinations: data.destinations.some(d => d.planetId === id) ? data.destinations.filter(d => d.planetId !== id) : [...data.destinations, { planetId: id, note: "" }] };
}
export function setNote(data: Expedition, id: PlanetId, note: string): Expedition {
  return { version: 1, destinations: data.destinations.map(d => d.planetId === id ? { ...d, note: note.slice(0, MAX_NOTE_LENGTH) } : d) };
}
// Merge keeps existing order AND notes, then appends new worlds in imported order.
export function mergeExpedition(current: Expedition, incoming: Expedition): Expedition {
  const existing = new Set(current.destinations.map(d => d.planetId));
  return { version: 1, destinations: [...current.destinations, ...incoming.destinations.filter(d => !existing.has(d.planetId))] };
}