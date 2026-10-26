export const PLANET_IDS = ["mercury", "venus", "earth", "mars", "jupiter", "saturn", "uranus", "neptune"] as const;
export type PlanetId = (typeof PLANET_IDS)[number];
export type PlanetCategory = "terrestrial" | "gas" | "ice";
export type Source = { title: string; url: string };
export type EditorialSection = { title: string; paragraphs: string[] };

export type Planet = {
  id: PlanetId;
  name: string;
  order: number;
  category: PlanetCategory;
  color: string;
  headline: string;
  shortFact: string;
  introduction: string;
  meanRadiusKm: number;
  massE24Kg: number;
  densityGcm3: number;
  rotationDaysSigned: number;
  orbitalYears: number;
  environment: EditorialSection;
  phenomenon: EditorialSection;
  surface: { kind: "solid"; description: string } | { kind: "not-applicable"; description: string };
  missions: string[];
  sources: Source[];
  verified: string;
};

export const MISSION_TYPES = ["flyby", "orbiter", "rover", "orbiter-probe"] as const;
export type MissionType = (typeof MISSION_TYPES)[number];
export type Mission = {
  id: string;
  name: string;
  agency: string;
  launchDate: string;
  destinations: PlanetId[];
  additionalDestinations?: string[];
  type: MissionType;
  cover: PlanetId;
  headline: string;
  summary: string;
  sections: EditorialSection[];
  timeline: { date: string; title: string; description: string }[];
  sources: Source[];
  verified: string;
  featured?: boolean;
};

export function isPlanetId(value: unknown): value is PlanetId {
  return typeof value === "string" && (PLANET_IDS as readonly string[]).includes(value);
}