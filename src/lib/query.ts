import { isPlanetId, MISSION_TYPES, type Mission, type MissionType, type Planet, type PlanetCategory, type PlanetId } from "@/lib/types";
import type { RadiusUnit, RotationUnit } from "@/lib/format";

export function parseComparison(value: string | null): PlanetId[] {
  return [...new Set((value ?? "").split(",").filter(isPlanetId))].slice(0, 3);
}
export function comparisonHref(ids: PlanetId[]): string { return ids.length ? `/compare?worlds=${ids.join(",")}` : "/compare"; }
export function updateQuery(current: URLSearchParams, changes: Record<string, string | null>): string {
  const next = new URLSearchParams(current.toString());
  Object.entries(changes).forEach(([key, value]) => value ? next.set(key, value) : next.delete(key));
  const q = next.toString();
  return q ? `?${q}` : "";
}
export function parseAtlas(query: URLSearchParams) {
  const selected = query.get("world");
  const group = query.get("group");
  return {
    world: isPlanetId(selected) ? selected : "saturn" as PlanetId,
    group: (["terrestrial", "gas", "ice"].includes(group ?? "") ? group : "all") as PlanetCategory | "all",
    q: (query.get("q") ?? "").slice(0, 80),
    view: query.get("view") === "list" ? "list" as const : "3d" as const,
    scene: query.get("scene") === "system" ? "system" as const : "planet" as const,
    compare: parseComparison(query.get("compare"))
  };
}
export function filterPlanets(planets: Planet[], q: string, group: PlanetCategory | "all"): Planet[] {
  const term = q.trim().toLocaleLowerCase("en-US");
  return planets.filter(p => (group === "all" || p.category === group) && p.name.toLowerCase().includes(term));
}
export function parseUnits(query: URLSearchParams): { radius: RadiusUnit; rotation: RotationUnit } {
  return { radius: query.get("unit") === "mi" ? "mi" : "km", rotation: query.get("time") === "days" ? "days" : "hours" };
}
export type MissionFilters = { q: string; destination: PlanetId | "all"; type: MissionType | "all"; sort: "newest" | "oldest" | "name" };
export function parseMissionFilters(query: URLSearchParams): MissionFilters {
  const destination = query.get("destination");
  const type = query.get("type");
  const sort = query.get("sort");
  return {
    q: (query.get("q") ?? "").slice(0, 80),
    destination: isPlanetId(destination) ? destination : "all",
    type: MISSION_TYPES.includes(type as MissionType) ? type as MissionType : "all",
    sort: sort === "oldest" || sort === "name" ? sort : "newest"
  };
}
export function filterMissions(missions: Mission[], filters: MissionFilters): Mission[] {
  const term = filters.q.trim().toLowerCase();
  return missions.filter(m =>
    `${m.name} ${m.agency} ${m.summary} ${m.destinations.join(" ")} ${(m.additionalDestinations ?? []).join(" ")}`.toLowerCase().includes(term) &&
    (filters.destination === "all" || m.destinations.includes(filters.destination)) &&
    (filters.type === "all" || m.type === filters.type)
  ).sort((a, b) => filters.sort === "name" ? a.name.localeCompare(b.name, "en") : filters.sort === "oldest" ? a.launchDate.localeCompare(b.launchDate) : b.launchDate.localeCompare(a.launchDate));
}
// A return link is allowed only to its own internal archive, never an arbitrary URL.
export function safeReturn(value: string | null | undefined, base: "/atlas" | "/missions"): string {
  if (!value || value.length > 1800) return base;
  try {
    const url = new URL(value, "https://afterlight.local");
    return url.origin === "https://afterlight.local" && url.pathname === base ? `${base}${url.search}` : base;
  } catch { return base; }
}