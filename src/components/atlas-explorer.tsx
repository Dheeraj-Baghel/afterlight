"use client";
import Link from "next/link";
import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ArrowUpRight, Search, List, Orbit, Plus, Check, X } from "lucide-react";
import { planets, planetById, CATEGORY_LABELS } from "@/data/planets";
import { parseAtlas, filterPlanets, comparisonHref } from "@/lib/query";
import { number } from "@/lib/format";
import type { PlanetId } from "@/lib/types";
import { useUrlState } from "@/hooks/use-url-state";
import { PlanetImage } from "@/components/planet-image";
import { SaveButton } from "@/components/save-button";
import { ShareButton } from "@/components/share-button";
import { AtlasSceneShell } from "@/components/atlas-scene-shell";

export function AtlasExplorer() {
  const { search, setQuery } = useUrlState();
  const state = parseAtlas(new URLSearchParams(search.toString()));
  const world = planetById[state.world];
  const results = filterPlanets(planets, state.q, state.group);
  const [status, setStatus] = useState("");
  const comparing = state.compare.includes(world.id);
  const selectedOutsideResults = !results.some(p => p.id === state.world);
  const atlasHref = `/atlas${search.size ? `?${search.toString()}` : ""}`;
  const detailHref = `/worlds/${world.id}?from=${encodeURIComponent(atlasHref)}`;
  function select(id: PlanetId) { setQuery({ world: id }); setStatus(`${planetById[id].name} selected.`); }
  function toggleCompare() {
    if (!comparing && state.compare.length === 3) { setStatus("Comparison is full: three worlds maximum. Remove a world below or open the comparison workspace to replace one."); return; }
    const next = comparing ? state.compare.filter(id => id !== world.id) : [...state.compare, world.id];
    setQuery({ compare: next.length ? next.join(",") : null });
    setStatus(`${world.name} ${comparing ? "removed from" : "added to"} comparison.`);
  }
  return <>
    <div className="atlas-toolbar">
      <div className="search-field"><label className="sr-only" htmlFor="planet-search">Search planets</label><Search size={16} aria-hidden="true" /><input id="planet-search" type="search" placeholder="Find a world…" value={state.q} maxLength={80} onChange={e => setQuery({ q: e.target.value || null }, "replace")} /></div>
      <div className="filter-chips" role="group" aria-label="Planet category">{[{ value: "all", label: "All worlds" }, { value: "terrestrial", label: "Terrestrial" }, { value: "gas", label: "Gas giants" }, { value: "ice", label: "Ice giants" }].map(group => <button key={group.value} className="filter-chip" aria-pressed={state.group === group.value} onClick={() => setQuery({ group: group.value === "all" ? null : group.value })}>{group.label}</button>)}</div>
      <div className="view-switch" role="group" aria-label="Atlas presentation"><button aria-pressed={state.view === "3d"} onClick={() => setQuery({ view: null })}><Orbit size={15} aria-hidden="true" />3D atlas</button><button aria-pressed={state.view === "list"} onClick={() => setQuery({ view: "list" })}><List size={15} aria-hidden="true" />2D list</button></div>
    </div>
    <div className="atlas-grid">
      <div className="atlas-stage">
        {state.view === "3d" ? <AtlasSceneShell world={world.id} scene={state.scene} onSceneChange={value => setQuery({ scene: value === "planet" ? null : value })} onSelect={select} /> : <div className="atlas-list" aria-label="Two-dimensional world index"><AnimatePresence initial={false} mode="popLayout">{results.map(p => <motion.article layout key={p.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="atlas-list-item"><PlanetImage id={p.id} sizes="100px" decorative /><div><p className="eyebrow">{String(p.order).padStart(2, "0")} / {CATEGORY_LABELS[p.category]}</p><h3>{p.name}</h3><p>{p.shortFact}</p><div className="flex flex-wrap items-center gap-3"><button className="btn-secondary" aria-pressed={state.world === p.id} onClick={() => select(p.id)}>{state.world === p.id ? "Selected" : "Select"}<span className="sr-only"> {p.name}</span></button><Link className="arrow-link" href={`/worlds/${p.id}?from=${encodeURIComponent(atlasHref)}`}>Explore {p.name}<ArrowUpRight size={14} aria-hidden="true" /></Link></div></div></motion.article>)}</AnimatePresence></div>}
        {results.length > 0 ? <div className="planet-picker" role="group" aria-label="Select a planet">{results.map(p => <button key={p.id} aria-label={`Select ${p.name}`} aria-pressed={state.world === p.id} onClick={() => select(p.id)}><PlanetImage id={p.id} sizes="50px" decorative /><span>{p.name}</span></button>)}</div> : <div className="empty-state"><h2>No worlds in view.</h2><p className="!text-steel">Try a planet name, or clear the category filter. Your selected world is still available in the information panel.</p><button className="btn-secondary mt-5" onClick={() => setQuery({ q: null, group: null })}>Clear atlas filters</button></div>}
        <p className="figure-note mt-3" role="status">{results.length} of 8 worlds{selectedOutsideResults && results.length > 0 ? ` · ${world.name} is outside these filtered results.` : ""}</p>
      </div>
      <aside className="atlas-info" aria-label="Selected world information">
        <p className="eyebrow text-orange">WORLD {String(world.order).padStart(2, "0")} / {CATEGORY_LABELS[world.category]}</p>
        <h2>{world.name}</h2><p>{world.introduction}</p>
        <dl><div><dt>Mean radius</dt><dd>{number(world.meanRadiusKm)} km</dd></div><div><dt>Sidereal rotation</dt><dd>{number(Math.abs(world.rotationDaysSigned) * 24, 2)} h{world.rotationDaysSigned < 0 ? " ↶" : ""}</dd></div><div><dt>Orbit around the Sun</dt><dd>{number(world.orbitalYears, 2)} Earth yr</dd></div></dl>
        <Link href={detailHref} className="btn-primary">Explore {world.name}<ArrowUpRight size={17} aria-hidden="true" /></Link>
        <div className="atlas-info-actions"><SaveButton id={world.id} compact /><button className="btn-secondary" aria-pressed={comparing} onClick={toggleCompare}>{comparing ? <Check size={14} aria-hidden="true" /> : <Plus size={14} aria-hidden="true" />}{comparing ? "In comparison" : "Compare"}</button></div>
        <p className="status-line mt-4" role="status">{status}</p>
        {state.compare.length > 0 && <div className="atlas-comparison-tray flex-wrap"><span className="eyebrow">COMPARISON {state.compare.length}/3</span><Link href={comparisonHref(state.compare)}>Open workspace<ArrowUpRight size={13} className="inline ml-1" aria-hidden="true" /></Link><div className="flex flex-wrap gap-2">{state.compare.map(id => <button className="filter-chip !border-white/20" key={id} aria-label={`Remove ${planetById[id].name} from comparison`} onClick={() => { const next = state.compare.filter(p => p !== id); setQuery({ compare: next.length ? next.join(",") : null }); }}>{planetById[id].name}<X size={11} className="inline ml-2" aria-hidden="true" /></button>)}</div></div>}
      </aside>
    </div>
    <div className="atlas-page-end"><p className="figure-note">Not a physical simulation. Sizes, spacing, rings and lighting are illustrative.<br />Rotation values are sidereal; ↶ denotes retrograde. Textures: Solar System Scope, CC BY 4.0.</p><ShareButton /></div>
  </>;
}