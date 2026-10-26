import type { MetadataRoute } from "next";
import { planets, VERIFIED } from "@/data/planets";
import { missions } from "@/data/missions";
import { SITE_URL } from "@/lib/site";
export default function sitemap(): MetadataRoute.Sitemap {
  return ["/", "/atlas", "/compare", "/missions", "/about", ...planets.map(p => `/worlds/${p.id}`), ...missions.map(m => `/missions/${m.id}`)].map(path => ({ url: `${SITE_URL}${path}`, lastModified: VERIFIED, changeFrequency: "monthly", priority: path === "/" ? 1 : .7 }));
}