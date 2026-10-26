import Link from "next/link";
import { planets } from "@/data/planets";
export default function AtlasLoading() {
  return <main id="main" className="dark-section"><div className="page-shell route-loading"><p className="eyebrow">THE OBSERVATORY</p><h1>Eight worlds.<br /><em>Within reach.</em></h1><p role="status">Loading the atlas. The field-guide pages are already available:</p><nav className="flex flex-wrap gap-5 mt-6" aria-label="World pages">{planets.map(p => <Link className="arrow-link" key={p.id} href={`/worlds/${p.id}`}>{p.name}</Link>)}</nav></div></main>;
}