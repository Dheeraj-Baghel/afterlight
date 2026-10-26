import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { missions, getMission, MISSION_TYPE_LABELS } from "@/data/missions";
import { planetById } from "@/data/planets";
import { dateLabel } from "@/lib/format";
import { PlanetImage } from "@/components/planet-image";
import { safeReturn } from "@/lib/query";
import { SectionLabel, Sources, ArrowLink } from "@/components/ui";
import { EditorialMotion } from "@/components/editorial-motion";
import { MissionTrajectory } from "@/components/mission-trajectory";

export const dynamicParams = false;
export function generateStaticParams() { return missions.map(m => ({ slug: m.id })); }
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params; const mission = getMission(slug);
  return mission ? { title: `${mission.name} — mission story`, description: mission.summary, alternates: { canonical: `/missions/${slug}` }, openGraph: { title: `${mission.name} | AFTERLIGHT`, description: mission.summary, images: ["/images/social.jpg"] } } : { title: "Mission not found" };
}
export default async function MissionPage({ params, searchParams }: { params: Promise<{ slug: string }>; searchParams: Promise<{ from?: string | string[] }> }) {
  const { slug } = await params; const mission = getMission(slug);
  if (!mission) notFound();
  const { from } = await searchParams;
  const returnHref = safeReturn(typeof from === "string" ? from : null, "/missions");
  return <main id="main"><section className="mission-hero dark-section"><div className="page-shell pt-6"><Link className="back-link" href={returnHref}><ArrowLeft size={15} aria-hidden="true" />Back to mission archive</Link><div className="mission-hero-grid"><div><p className="eyebrow text-orange">MISSION FILE / {mission.name}</p><h1>{mission.headline}</h1><p className="mission-summary">{mission.summary}</p></div><div><PlanetImage id={mission.cover} priority /><p className="figure-note text-center">Destination illustration, not spacecraft photography<br />Solar System Scope textures / CC BY 4.0</p></div></div><dl className="mission-facts"><div><dt>Mission</dt><dd>{mission.name}</dd></div><div><dt>Agency partnership</dt><dd>{mission.agency}</dd></div><div><dt>Launch</dt><dd>{dateLabel(mission.launchDate)}</dd></div><div><dt>Approach</dt><dd>{MISSION_TYPE_LABELS[mission.type]}</dd></div></dl></div></section>
    <EditorialMotion kind="story" className="page-shell section-pad"><div className="mission-story-layout"><aside><SectionLabel>THE MILESTONES</SectionLabel><ol className="mission-timeline">{mission.timeline.map(event => <li key={event.date}><time dateTime={event.date}>{dateLabel(event.date,true)}</time><h3>{event.title}</h3><p>{event.description}</p></li>)}</ol><p className="figure-note">A dated historical record, not a current mission-status feed. Verified {mission.verified}.</p></aside><div className="reading-prose">{mission.sections.map((section,index) => <section className="story-section" key={section.title} data-editorial-reveal><SectionLabel number={String(index+1).padStart(2,"0")}>FIELD NOTES</SectionLabel><h2 className="mt-5">{section.title}</h2>{section.paragraphs.map(p => <p key={p}>{p}</p>)}</section>)}</div></div></EditorialMotion>
    {mission.featured && <section className="dark-section"><EditorialMotion kind="story" className="page-shell py-10"><SectionLabel light>THE JOURNEY, IN OUTLINE</SectionLabel><MissionTrajectory variant={mission.id === "voyager-2" ? "voyager" : mission.id === "perseverance" ? "mars" : "cassini"} /></EditorialMotion></section>}
    <section className="page-shell py-12"><SectionLabel>KEEP EXPLORING</SectionLabel><div className="flex flex-wrap gap-8 mt-4">{mission.destinations.map(id => <ArrowLink href={`/worlds/${id}`} key={id}>Explore {planetById[id].name}</ArrowLink>)}</div>{mission.additionalDestinations && <p className="small-copy mt-6">Also encountered: {mission.additionalDestinations.join(", ")}. Moons and small bodies have no separate world pages in this eight-planet edition.</p>}</section><div className="page-shell"><Sources sources={mission.sources} verified={mission.verified} /></div>
  </main>;
}