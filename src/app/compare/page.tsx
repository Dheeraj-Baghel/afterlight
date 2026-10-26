import type { Metadata } from "next";
import { connection } from "next/server";
import { Suspense } from "react";
import { ComparisonWorkspace } from "@/components/comparison-workspace";
export const metadata: Metadata = { title: "Compare worlds", description: "Put two or three planets in perspective with a proportional diameter diagram and carefully defined, source-backed measurements." };
export default async function ComparePage() {
  await connection();
  return <main id="main" className="page-shell"><div className="page-intro"><p className="eyebrow">SIDE BY SIDE / A QUESTION OF PERSPECTIVE</p><h1>Worlds, <em>in context.</em></h1><p>Size is only the beginning. Compare two or three planets and discover just how different neighbors can be.</p></div><Suspense fallback={<p className="py-16" role="status">Preparing the comparison controls…</p>}><ComparisonWorkspace /></Suspense></main>;
}