import type { Metadata } from "next";
import { connection } from "next/server";
import { Suspense } from "react";
import { MissionArchive } from "@/components/mission-archive";
export const metadata: Metadata = { title: "Mission archive", description: "Eight verified missions. Explore the spacecraft, encounters and patient observations that changed our understanding of the solar system." };
export default async function MissionsPage() {
  await connection();
  return <main id="main" className="page-shell"><div className="page-intro"><p className="eyebrow">THE MISSION ARCHIVE / MILESTONES IN CURIOSITY</p><h1>We sent our questions<br /><em>out into the dark.</em></h1><p>Flybys, orbiters, a lander and a rover. The journeys that turned distant worlds into places we could begin to understand.</p></div><Suspense fallback={<p role="status" className="py-16">Preparing the archive filters…</p>}><MissionArchive /></Suspense></main>;
}