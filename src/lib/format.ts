export type RadiusUnit = "km" | "mi";
export type RotationUnit = "hours" | "days";
export const KM_PER_MILE = 1.609344;
export const EARTH_MEAN_RADIUS_KM = 6371.0084;

export function convertDistance(km: number, unit: RadiusUnit): number {
  return unit === "mi" ? km / KM_PER_MILE : km;
}
export function convertRotation(days: number, unit: RotationUnit): number {
  return Math.abs(days) * (unit === "hours" ? 24 : 1);
}
export function number(value: number, decimals = 0): string {
  return new Intl.NumberFormat("en-US", { maximumFractionDigits: decimals }).format(value);
}
export function earthRadii(radiusKm: number): number { return radiusKm / EARTH_MEAN_RADIUS_KM; }
export function dateLabel(date: string, short = false): string {
  return new Intl.DateTimeFormat("en-US", { day: "numeric", month: short ? "short" : "long", year: "numeric", timeZone: "UTC" }).format(new Date(`${date}T12:00:00Z`));
}