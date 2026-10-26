import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ArrowRight, ArrowUpRight } from "lucide-react";
import { planets, planetById, CATEGORY_LABELS } from "@/data/planets";
import { getMission } from "@/data/missions";
import { isPlanetId } from "@/lib/types";
import { number, earthRadii } from "@/lib/format";
import { PlanetImage } from "@/components/planet-image";
import { WorldActions } from "@/components/save-button";
import { safeReturn } from "@/lib/query";
import { SectionLabel, Sources, ArrowLink } from "@/components/ui";
import { EditorialMotion } from "@/components/editorial-motion";

export const dynamicParams = false;
export function generateStaticParams() { return planets.map(p => ({ slug: p.id })); }
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  if (!isPlanetId(slug)) return { title: "World not found" };
  const world = planetById[slug];
  return { title: `${world.name} — ${world.shortFact}`, description: world.introduction, alternates: { canonical: `/worlds/${slug}` }, openGraph: { title: `${world.name} | AFTERLIGHT`, description: world.introduction, images: ["/images/social.jpg"] } };
}
export default async function WorldPage({ params, searchParams }: { params: Promise<{ slug: string }>; searchParams: Promise<{ from?: string | string[] }> }) {
  const { slug } = await params;
  if (!isPlanetId(slug)) notFound();
  const world = planetById[slug];
  const { from } = await searchParams;
  const returnHref = typeof from === "string" ? safeReturn(from, "/atlas") : `/atlas?world=${world.id}`;
  const previous = planets[(world.order + 6) % planets.length];
  const next = planets[world.order % planets.length];
  const relevant = world.missions.map(getMission).filter(m => m !== undefined);
  const reference = world.id === "earth" ? planetById.jupiter : planetById.earth;
  const maxRadius = Math.max(reference.meanRadiusKm, world.meanRadiusKm);
  return <main id="main">
    <section className="detail-hero dark-section"><div className="page-shell">
      <Link className="back-link" href={returnHref}><ArrowLeft size={15} aria-hidden="true" />Back to the atlas</Link>
      <div className="world-hero-grid"><div className="world-hero-copy"><p className="eyebrow world-name">{String(world.order).padStart(2,"0")} / {world.name} / {CATEGORY_LABELS[world.category]}</p><h1>{world.headline}</h1><p>{world.introduction}</p><WorldActions id={world.id} /></div><div className={`world-hero-art ${world.id === "saturn" ? "ringed" : ""}`}><PlanetImage id={world.id} priority /><p className="figure-note">{world.name} · illustrative composite, not calibrated true color<br />Texture: Solar System Scope / CC BY 4.0</p></div></div>
      <dl className="measurement-band"><div><dt>Volumetric mean radius</dt><dd>{number(world.meanRadiusKm,1)}<span>km</span></dd></div><div><dt>Sidereal rotation</dt><dd>{number(Math.abs(world.rotationDaysSigned)*24,2)}<span>hours{world.rotationDaysSigned<0 ? " ↶" : ""}</span></dd></div><div><dt>Sidereal orbital period</dt><dd>{number(world.orbitalYears,2)}<span>years</span></dd></div><div><dt>Mass relative to Earth</dt><dd>{number(world.massE24Kg / planetById.earth.massE24Kg,3)}<span>× Earth</span></dd></div></dl>
      <p className="figure-note pb-6">Reference values: NASA / JPL. Sidereal = relative to distant stars, not a solar day. {world.rotationDaysSigned < 0 && "↶ Retrograde rotation."} Radius excludes rings. Values rounded; see definitions below.</p>
    </div></section>
    <div className="page-shell section-pad reading-grid"><aside className="reading-aside"><SectionLabel number="01">A SENSE OF PLACE</SectionLabel><div className="world-size-block"><div className="size-pair" role="img" aria-label={`${world.name}'s mean diameter is ${number(world.meanRadiusKm/reference.meanRadiusKm,3)} times ${reference.name}'s. Diameters are proportional; rings excluded.`}>{[reference,world].map(p => <div key={p.id}><div className="h-28 flex items-center justify-center"><div style={{ width: `${p.meanRadiusKm/maxRadius*100}%` }}><PlanetImage id={p.id} globeOnly decorative sizes="150px" /></div></div><span>{p.name}</span></div>)}</div><p>{world.id === "earth" ? `Jupiter's mean diameter is ${number(earthRadii(planetById.jupiter.meanRadiusKm),2)} times Earth's.` : `${world.name}'s mean diameter is ${number(earthRadii(world.meanRadiusKm),2)} times Earth's.`}</p><p className="figure-note">Mean diameters to scale. Spacing illustrative; rings excluded.</p><ArrowLink href={`/compare?worlds=${reference.id},${world.id}`}>Compare measurements</ArrowLink></div><p className="mt-6">{world.surface.description}</p></aside><article className="reading-prose"><h2>{world.environment.title}</h2>{world.environment.paragraphs.map(p => <p key={p}>{p}</p>)}<p className="figure-note !text-xs">Mean radius is the radius of a sphere with the same volume. The comparison workspace uses proportional diameters: {number(world.meanRadiusKm/maxRadius,3)} relative to the larger world in this pairing.</p></article></div>
    <section className="phenomenon-section"><EditorialMotion className="page-shell section-pad reading-grid"><div className="reading-aside"><SectionLabel number="02">LOOK A LITTLE CLOSER</SectionLabel><p>One phenomenon.<br />A different perspective.</p></div><article className="reading-prose" data-editorial-reveal><h2>{world.phenomenon.title}</h2>{world.phenomenon.paragraphs.map(p => <p key={p}>{p}</p>)}</article></EditorialMotion></section>
    <section className="page-shell section-pad !pb-10"><SectionLabel number="03">HOW WE CAME TO KNOW</SectionLabel><h2 className="mt-6">Visitors & <em>viewpoints.</em></h2>{relevant.length ? <div className="related-missions">{relevant.map(m => <Link href={`/missions/${m.id}`} className="related-mission" key={m.id}><p className="eyebrow">{m.agency} / {m.launchDate.slice(0,4)}</p><h3>{m.name}<ArrowUpRight className="inline ml-3" size={19} aria-hidden="true" /></h3><p>{m.summary}</p></Link>)}</div> : <div className="reading-prose mt-6"><p>This curated archive focuses on interplanetary missions, not Earth-observing spacecraft. Earth is the departure point for all eight stories in the collection.</p><ArrowLink href="/missions">Explore the mission archive</ArrowLink></div>}</section>
    <div className="page-shell"><Sources sources={world.sources} verified={world.verified} /><nav className="world-pager" aria-label="Previous and next worlds"><Link href={`/worlds/${previous.id}`}><ArrowLeft size={20} aria-hidden="true" /><PlanetImage id={previous.id} decorative sizes="66px" /><div><p className="eyebrow">PREVIOUS WORLD</p><h3>{previous.name}</h3></div></Link><Link href={`/worlds/${next.id}`}><div><p className="eyebrow">NEXT WORLD</p><h3>{next.name}</h3></div><PlanetImage id={next.id} decorative sizes="66px" /><ArrowRight size={20} aria-hidden="true" /></Link></nav></div>
  </main>;
}