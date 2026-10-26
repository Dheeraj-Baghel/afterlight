"use client";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { ArrowUpRight, Search, X } from "lucide-react";
import { missions, MISSION_TYPE_LABELS } from "@/data/missions";
import { planets, planetById } from "@/data/planets";
import { MISSION_TYPES } from "@/lib/types";
import { parseMissionFilters, filterMissions } from "@/lib/query";
import { dateLabel } from "@/lib/format";
import { useUrlState } from "@/hooks/use-url-state";
import { PlanetImage } from "@/components/planet-image";
import { useReducedMotion } from "@/components/providers";

export function MissionArchive() {
  const { search, setQuery } = useUrlState();
  const filters = parseMissionFilters(new URLSearchParams(search.toString()));
  const results = filterMissions(missions,filters);
  const reduced = useReducedMotion();
  const archiveHref = `/missions${search.size ? `?${search.toString()}` : ""}`;
  const clear = () => setQuery({ q: null, destination: null, type: null, sort: null });
  return <>
    <div className="mission-filters"><div className="search-field"><label className="field-label" htmlFor="mission-search">Search the archive</label><Search size={16} className="!top-[41px]" aria-hidden="true" /><input id="mission-search" type="search" maxLength={80} value={filters.q} onChange={e => setQuery({ q: e.target.value || null },"replace")} placeholder="A mission, a world, a question…" /></div><div><label className="field-label" htmlFor="mission-destination">Destination</label><select id="mission-destination" value={filters.destination} onChange={e => setQuery({ destination: e.target.value === "all" ? null : e.target.value })}><option value="all">All destinations</option>{planets.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}</select></div><div><label className="field-label" htmlFor="mission-type">Mission type</label><select id="mission-type" value={filters.type} onChange={e => setQuery({ type: e.target.value === "all" ? null : e.target.value })}><option value="all">Every approach</option>{MISSION_TYPES.map(type => <option key={type} value={type}>{MISSION_TYPE_LABELS[type]}</option>)}</select></div><div><label className="field-label" htmlFor="mission-sort">Sort by</label><select id="mission-sort" value={filters.sort} onChange={e => setQuery({ sort: e.target.value === "newest" ? null : e.target.value })}><option value="newest">Newest launch</option><option value="oldest">Oldest launch</option><option value="name">Mission name</option></select></div><button className="btn-secondary filter-clear" onClick={clear}><X size={14} aria-hidden="true" />Clear filters</button></div>
    <div className="mission-result-bar"><p className="eyebrow" role="status">{results.length} OF {missions.length} MISSION RECORDS</p><p className="figure-note">Historical archive · verified 2026-10-17</p></div>
    {results.length ? <div className="mission-list"><AnimatePresence initial={false} mode="popLayout">{results.map(m => <motion.article layout={!reduced} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="mission-card" key={m.id}>
      <Link href={`/missions/${m.id}?from=${encodeURIComponent(archiveHref)}`} className="block" aria-label={`Read ${m.name} mission story`}><div className={`mission-card-art ${m.cover === "saturn" ? "ringed" : ""}`}><span className="eyebrow">{m.agency}<br />{MISSION_TYPE_LABELS[m.type]}</span><PlanetImage id={m.cover} decorative sizes="(max-width: 639px) 75vw, 35vw" /><span className="mission-card-year">{m.launchDate.slice(0,4)}</span></div><div className="mission-card-content"><div className="mission-card-title"><h2>{m.name}</h2><ArrowUpRight size={22} aria-hidden="true" /></div><p>{m.summary}</p><div className="mission-card-meta"><span>LAUNCHED {dateLabel(m.launchDate,true)}</span><span>{m.destinations.map(id => planetById[id].name).join(" / ")}{m.additionalDestinations?.length ? ` / ${m.additionalDestinations.join(" / ")}` : ""}</span></div></div></Link>
    </motion.article>)}</AnimatePresence></div> : <div className="empty-state"><span className="empty-orbit" aria-hidden="true" /><h2>No signal. Try another angle.</h2><p>No records match all of these filters. This is a curated eight-mission archive, not a complete catalog of spaceflight.</p><button className="btn-primary mt-6" onClick={clear}>Show all missions</button></div>}
    <p className="figure-note py-9">Cover illustrations show a destination, not the spacecraft or a photograph of its flight. Texture maps: Solar System Scope (CC BY 4.0). Sources and dated milestones appear in each story. Planetary destination filters do not include the Earth departure point.</p>
  </>;
}