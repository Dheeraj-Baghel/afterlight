import Link from "next/link";
import { ArrowDown, ArrowUpRight, Bookmark, MoveUpRight } from "lucide-react";
import { planets, CATEGORY_LABELS } from "@/data/planets";
import { PlanetImage } from "@/components/planet-image";
import { SectionLabel, ArrowLink, ButtonLink } from "@/components/ui";
import { EditorialMotion } from "@/components/editorial-motion";
import { ComparisonTeaser } from "@/components/comparison-teaser";
import { MissionTrajectory } from "@/components/mission-trajectory";

export default function HomePage() {
  return <main id="main">
    <section className="home-opening dark-section" aria-labelledby="opening-title">
      <EditorialMotion kind="opening" className="opening-inner page-shell">
        <div className="hero-orbit" aria-hidden="true" />
        <div className="hero-heading" data-opening-type><p className="eyebrow hero-eyebrow"><span className="signal-dot" />AN ATLAS FOR THE ENDLESSLY CURIOUS</p><h1 id="opening-title">Find your<br /><em>next world.</em></h1><p className="hero-description">Eight planets. Countless ways to see them.<br />Step outside the familiar.</p><div className="hero-links"><ButtonLink href="/atlas?world=saturn">Explore the atlas</ButtonLink><a className="hero-secondary" href="#worlds">Choose a world<ArrowDown size={16} aria-hidden="true" /></a></div></div>
        <div className="hero-planet" data-opening-planet><PlanetImage id="saturn" priority sizes="(max-width: 767px) 125vw, 77vw" /><div className="planet-coordinate"><span className="crosshair" aria-hidden="true">+</span><span>06 / SATURN<br /><span className="text-steel">THE RINGED WORLD</span></span></div></div>
        <div className="hero-bottom"><span className="eyebrow"><span className="small-cross" aria-hidden="true">✳</span> A LITTLE DISTANCE. A NEW PERSPECTIVE.</span><span className="figure-note">Illustrative portrait · not to scale</span><a href="#worlds" aria-label="Scroll to the world index" className="scroll-cue"><ArrowDown size={18} /></a></div>
      </EditorialMotion>
    </section>

    <section id="worlds" className="world-index page-shell section-pad" aria-labelledby="world-index-title">
      <div className="section-heading"><div><SectionLabel number="01">THE NEIGHBORHOOD</SectionLabel><h2 id="world-index-title">Eight worlds.<br /><em>No two alike.</em></h2></div><div className="section-intro"><p>From sun-scorched rock to distant ice giants.<br />Start with a name. Leave with a question.</p><ArrowLink href="/atlas?view=list">View the full atlas</ArrowLink></div></div>
      <div className="world-index-grid">{planets.map(p => <Link href={`/worlds/${p.id}`} key={p.id} className="world-index-item"><div className="world-index-top"><span className="eyebrow">{String(p.order).padStart(2,"0")}</span><ArrowUpRight size={17} aria-hidden="true" /></div><div className="world-index-image"><PlanetImage id={p.id} sizes="(max-width: 767px) 40vw, 21vw" decorative /></div><div className="world-index-name"><h3>{p.name}</h3><span className="eyebrow">{CATEGORY_LABELS[p.category]}</span></div><p>{p.shortFact}</p></Link>)}</div>
    </section>

    <section className="comparison-section" aria-labelledby="scale-heading"><div className="page-shell section-pad"><SectionLabel number="02"><span id="scale-heading">A QUESTION OF SCALE</span></SectionLabel><ComparisonTeaser /></div></section>

    <section className="mission-spotlight dark-section" aria-labelledby="spotlight-title"><EditorialMotion kind="story" className="page-shell section-pad"><SectionLabel number="03" light>FIELD NOTES FROM THE FRONTIER</SectionLabel><div className="spotlight-grid"><div className="spotlight-art" data-editorial-reveal><PlanetImage id="saturn" sizes="(max-width: 767px) 95vw, 50vw" /><span className="spotlight-stamp eyebrow">MISSION FILE<br /><strong>006—CSN</strong><br />1997 — 2017</span></div><div className="spotlight-copy" data-editorial-reveal><p className="eyebrow text-orange">CASSINI–HUYGENS / NASA · ESA · ASI</p><h2 id="spotlight-title">We went to Saturn.<br /><em>We found a system<br />of worlds.</em></h2><p>Rings with structure. A moon with weather. Another with an ocean beneath its ice. Thirteen years in orbit changed a distant planet into a place full of possibilities.</p><ArrowLink href="/missions/cassini-huygens" className="text-paper">Read the mission story</ArrowLink></div></div><MissionTrajectory /></EditorialMotion></section>

    <section className="expedition-home page-shell section-pad" aria-labelledby="expedition-title"><div><SectionLabel number="04">MAKE IT PERSONAL</SectionLabel><h2 id="expedition-title">Every expedition<br />begins with <em>curiosity.</em></h2><p>Save the worlds that stay with you. Collect questions, keep your own notes, and create a route through the things you want to understand.</p><ButtonLink href="/expedition">Build your expedition</ButtonLink><p className="figure-note mt-5">A personal reading journey, not actual space travel.<br />No account. Saved only in this browser. Yours to export.</p></div><div className="expedition-preview"><div className="preview-heading"><Bookmark size={17} /><span className="eyebrow">A FIELD JOURNAL OF YOUR OWN</span><span className="preview-label">EXAMPLE</span></div>{[{ id: "saturn" as const, note: "What keeps the rings so remarkably thin?" }, { id: "mars" as const, note: "Follow the story of the ancient river delta." }].map((item, i) => <div className="preview-destination" key={item.id}><span className="eyebrow">0{i+1}</span><PlanetImage id={item.id} decorative sizes="90px" /><div><h3>{item.id === "saturn" ? "Saturn" : "Mars"}</h3><p>{item.note}</p></div><MoveUpRight size={16} aria-hidden="true" /></div>)}<p className="figure-note">Illustrative notes. Your expedition starts empty.</p></div></section>

    <section className="perspective-section"><div className="page-shell perspective-inner"><SectionLabel number="05">GROUNDED IN SCIENCE.<br />OPEN TO WONDER.</SectionLabel><p>Real observations. Thoughtful interpretation.<br /><span>Our facts come from NASA, JPL and ESA. Our visuals make room for perspective — sizes, spacing and lighting may be adjusted for clarity.</span></p><ArrowLink href="/about">Our sources & approach</ArrowLink></div></section>
  </main>;
}