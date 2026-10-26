"use client";
import { useState } from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { planets, planetById } from "@/data/planets";
import { isPlanetId, type PlanetId } from "@/lib/types";
import { earthRadii, number } from "@/lib/format";
import { PlanetImage } from "@/components/planet-image";

export function ComparisonTeaser() {
  const [id, setId] = useState<PlanetId>("jupiter");
  const world = planetById[id];
  const ratio = earthRadii(world.meanRadiusKm);
  const max = Math.max(world.meanRadiusKm, planetById.earth.meanRadiusKm);
  return <div className="teaser-grid">
    <div className="teaser-copy"><h2>Familiar is<br /><em>not the same size.</em></h2><p>Our home is a useful starting point. Change the world beside it, and see your sense of scale shift.</p><label className="field-label" htmlFor="teaser-world">Compare Earth with</label><select id="teaser-world" value={id} onChange={e => { if (isPlanetId(e.target.value)) setId(e.target.value); }}>{planets.filter(p => p.id !== "earth").map(p => <option key={p.id} value={p.id}>{p.name}</option>)}</select><Link href={`/compare?worlds=earth,${id}`} className="arrow-link mt-7">Look a little closer<ArrowUpRight size={18} aria-hidden="true" /></Link></div>
    <div><div className="size-teaser-diagram" role="img" aria-label={`${world.name}'s mean diameter is ${number(ratio, 2)} times Earth's. Circle diameters are proportional; rings excluded.`}>
      {[planetById.earth, world].map(p => <div className="size-teaser-world" key={p.id}><div className="size-teaser-stage"><div style={{ width: `${p.meanRadiusKm / max * 100}%` }}><PlanetImage id={p.id} globeOnly decorative sizes="(max-width: 767px) 38vw, 24vw" /></div></div><span className="eyebrow">{p.name}</span></div>)}
    </div><div className="teaser-insight" aria-live="polite"><strong>{number(ratio, 2)}<span>×</span></strong><p>{world.name}’s mean diameter relative to Earth.<br /><span>Diameters to scale. Spacing illustrative. Rings excluded.</span></p></div></div>
  </div>;
}