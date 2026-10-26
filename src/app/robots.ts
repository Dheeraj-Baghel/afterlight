import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";
export default function robots(): MetadataRoute.Robots {
  // A localhost preview is not a public deployment. Set an actual SITE_URL only
  // when deployment has been separately authorized; private journals stay unindexed.
  const local = new URL(SITE_URL).hostname === "127.0.0.1" || new URL(SITE_URL).hostname === "localhost";
  return { rules: { userAgent: "*", allow: local ? undefined : "/", disallow: local ? "/" : "/expedition" }, sitemap: `${SITE_URL}/sitemap.xml` };
}