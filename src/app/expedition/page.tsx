import type { Metadata } from "next";
import { ExpeditionWorkspace } from "@/components/expedition-workspace";

export const metadata: Metadata = { title: "My expedition", description: "Your browser-local field journal. Save worlds, keep questions, reorder destinations, and export or restore your personal reading expedition.", robots: { index: false, follow: true } };
export default function ExpeditionPage() {
  return <main id="main" className="page-shell"><div className="page-intro"><p className="eyebrow">PERSONAL FIELD JOURNAL / DEVICE-LOCAL</p><h1>Your expedition.<br /><em>Your perspective.</em></h1><p>A collection of worlds, questions and things worth coming back to.<br />Saved in this browser. No account, no actual travel — just curiosity.</p></div><ExpeditionWorkspace /></main>;
}