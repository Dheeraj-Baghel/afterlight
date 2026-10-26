import type { Metadata } from "next";
import { connection } from "next/server";
import { Suspense } from "react";
import Link from "next/link";
import { AtlasExplorer } from "@/components/atlas-explorer";
import { planets } from "@/data/planets";

export const metadata: Metadata = { title: "The atlas", description: "Explore all eight planets in an accessible 3D atlas or a simple 2D world index. Select, compare and save your next destination." };
export default async function AtlasPage() {
  // Render the requested URL's controls/poster into the initial HTML. Avoid a
  // client-only Suspense replacement shifting the page during graphics loading.
  await connection();
  return <main id="main" className="atlas-page dark-section"><div className="page-shell"><div className="atlas-heading"><div><p className="eyebrow text-orange">THE OBSERVATORY / INTERACTIVE ATLAS</p><h1>A world of <em>possibilities.</em></h1></div><p>Choose a world. Change your perspective.<br />Everything in the scene is also within keyboard reach.</p></div><Suspense fallback={<div className="py-12"><p>Preparing the atlas controls. Start with a world:</p><nav aria-label="Worlds" className="flex flex-wrap gap-4 mt-5">{planets.map(p => <Link className="arrow-link" href={`/worlds/${p.id}`} key={p.id}>{p.name}</Link>)}</nav></div>}><AtlasExplorer /></Suspense></div></main>;
}