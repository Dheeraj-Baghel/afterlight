import { describe, it, expect } from "vitest";
import { existsSync, readFileSync } from "node:fs";
import { planets } from "@/data/planets";
import { missions } from "@/data/missions";
import { PLANET_IDS } from "@/lib/types";
describe("content integrity", () => {
  it("includes exactly eight unique planets in solar order", () => { expect(planets.map(p=>p.id)).toEqual(PLANET_IDS); expect(planets.map(p=>p.order)).toEqual([1,2,3,4,5,6,7,8]); });
  it("keeps every scientific record dated and linked to primary sources", () => { for(const record of [...planets,...missions]) { expect(record.verified).toMatch(/^\d{4}-\d{2}-\d{2}$/); expect(record.sources.length).toBeGreaterThan(0); for(const source of record.sources) expect(new URL(source.url).hostname).toMatch(/(?:nasa\.gov|esa\.int)$/); } });
  it("mission cross-links resolve and timelines are chronological", () => { for(const planet of planets) for(const id of planet.missions) expect(missions.some(m=>m.id===id)).toBe(true); for(const mission of missions) { expect(mission.timeline.map(e=>e.date)).toEqual(mission.timeline.map(e=>e.date).sort()); expect(mission.timeline[0].date).toBe(mission.launchDate); } });
  it("has eight missions and three substantial features", () => { expect(missions).toHaveLength(8); const features=missions.filter(m=>m.featured); expect(features).toHaveLength(3); for(const m of features) expect(m.sections.flatMap(s=>s.paragraphs).join(" ").split(/\s+/).length).toBeGreaterThan(250); });
  it("preserves retrograde signs and does not invent solid giant surfaces", () => { expect(planets.filter(p=>p.rotationDaysSigned<0).map(p=>p.id)).toEqual(["venus","uranus"]); for(const p of planets) expect(p.surface.kind).toBe(p.category==="terrestrial" ? "solid" : "not-applicable"); });
  it("ships every local planet portrait, globe and texture", () => { for(const p of planets) { expect(existsSync(`public/images/${p.id}.webp`)).toBe(true); expect(existsSync(`public/textures/${p.id}.webp`)).toBe(true); } expect(existsSync("public/images/saturn-globe.webp")).toBe(true); });
  it("asset manifest references real files, explicit rights and modifications", () => { const manifest=JSON.parse(readFileSync("asset-manifest.json","utf8")); expect(manifest.assets.length).toBeGreaterThanOrEqual(23); for(const asset of manifest.assets) { expect(existsSync(asset.filename)).toBe(true); expect(asset.sourceUrl).toMatch(/^https:/); expect(asset.license.length).toBeGreaterThan(8); expect(asset.modifications.length).toBeGreaterThan(8); } });
});