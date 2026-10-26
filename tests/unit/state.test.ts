import { describe, it, expect } from "vitest";
import { convertDistance, convertRotation, earthRadii, EARTH_MEAN_RADIUS_KM, dateLabel } from "@/lib/format";
import { parseAtlas, parseComparison, parseMissionFilters, parseUnits, filterPlanets, filterMissions, safeReturn, updateQuery } from "@/lib/query";
import { planets } from "@/data/planets";
import { missions } from "@/data/missions";

describe("measurement definitions and conversions", () => {
  it("converts international miles without changing source kilometres", () => { expect(convertDistance(1.609344,"mi")).toBeCloseTo(1,8); expect(convertDistance(6371,"km")).toBe(6371); });
  it("displays rotation magnitude while the source keeps retrograde sign", () => { expect(convertRotation(-243.018,"hours")).toBeCloseTo(5832.432); expect(convertRotation(-243.018,"days")).toBe(243.018); });
  it("calculates diameter ratios from mean radii", () => { expect(earthRadii(EARTH_MEAN_RADIUS_KM)).toBe(1); expect(earthRadii(EARTH_MEAN_RADIUS_KM*2)).toBe(2); });
  it("formats dates independent of machine timezone", () => expect(dateLabel("2017-09-15")).toBe("September 15, 2017"));
});
describe("shareable query state", () => {
  it("restores a meaningful atlas link", () => expect(parseAtlas(new URLSearchParams("world=neptune&group=ice&view=list&q=nep&scene=system&compare=earth,mars"))).toEqual({ world:"neptune",group:"ice",view:"list",q:"nep",scene:"system",compare:["earth","mars"] }));
  it("falls back for invalid parameters without throwing", () => { const parsed=parseAtlas(new URLSearchParams("world=pluto&group=banana&view=vr&scene=real")); expect(parsed.world).toBe("saturn"); expect(parsed.group).toBe("all"); expect(parsed.view).toBe("3d"); expect(parsed.scene).toBe("planet"); });
  it("deduplicates, rejects unknown worlds and limits comparison", () => expect(parseComparison("earth,earth,nonsense,mars,neptune,jupiter")).toEqual(["earth","mars","neptune"]));
  it("supports a truly empty comparison", () => expect(parseComparison(null)).toEqual([]));
  it("preserves unrelated URL state when changing one field", () => expect(updateQuery(new URLSearchParams("world=saturn&group=gas"),{ q:"Sat", group:null })).toBe("?world=saturn&q=Sat"));
  it("defaults invalid units without guessing", () => expect(parseUnits(new URLSearchParams("unit=lightyears&time=venus"))).toEqual({ radius:"km",rotation:"hours" }));
  it("combines name search and category filtering", () => { expect(filterPlanets(planets," NEP ","ice").map(p=>p.id)).toEqual(["neptune"]); expect(filterPlanets(planets,"earth","gas")).toEqual([]); });
  it("allows no-result mission searches", () => expect(filterMissions(missions, { q:"not-a-mission",destination:"all",type:"all",sort:"newest" })).toEqual([]));
  it("combines mission text/destination/type and sorts consistently", () => { const filtered=filterMissions(missions,{ q:"voyager",destination:"neptune",type:"flyby",sort:"oldest" }); expect(filtered.map(m=>m.id)).toEqual(["voyager-2"]); const sorted=filterMissions(missions,{ q:"",destination:"all",type:"all",sort:"oldest" }); expect(sorted[0].id).toBe("mariner-10"); expect(sorted.at(-1)?.id).toBe("perseverance"); });
  it("resets invalid mission filters to safe defaults", () => expect(parseMissionFilters(new URLSearchParams("type=lander&destination=pluto&sort=launches"))).toEqual({ q:"",destination:"all",type:"all",sort:"newest" }));
  it("limits search input length", () => expect(parseMissionFilters(new URLSearchParams({ q:"a".repeat(1000) })).q.length).toBe(80));
  it("only allows internal archive return URLs", () => { expect(safeReturn("/missions?q=ice&sort=oldest","/missions")).toBe("/missions?q=ice&sort=oldest"); for(const input of ["https://evil.test/missions","//evil.test/missions","javascript:alert(1)","/expedition","/missions/../atlas"]) expect(safeReturn(input,"/missions")).toBe("/missions"); });
});