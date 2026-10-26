"use client";
import Link from "next/link";
import { useState } from "react";
import { motion } from "motion/react";
import { X, RotateCcw, ArrowUpRight } from "lucide-react";
import { planets, planetById, CATEGORY_LABELS, PARAMETER_SOURCE, FACT_NOTES, VERIFIED } from "@/data/planets";
import { parseComparison, parseUnits } from "@/lib/query";
import { isPlanetId, type PlanetId } from "@/lib/types";
import { convertDistance, convertRotation, earthRadii, number } from "@/lib/format";
import { useUrlState } from "@/hooks/use-url-state";
import { PlanetImage } from "@/components/planet-image";
import { ShareButton } from "@/components/share-button";
import { EmptyState, Sources } from "@/components/ui";
import { useReducedMotion } from "@/components/providers";

export function ComparisonWorkspace() {
  const { search, setQuery } = useUrlState();
  const ids = parseComparison(search.get("worlds"));
  const units = parseUnits(new URLSearchParams(search.toString()));
  const selected = ids.map(id => planetById[id]);
  const reduced = useReducedMotion();
  const [status, setStatus] = useState("");
  const largest = [...selected].sort((a,b) => b.meanRadiusKm-a.meanRadiusKm)[0];
  const smallest = [...selected].sort((a,b) => a.meanRadiusKm-b.meanRadiusKm)[0];
  const fastest = [...selected].sort((a,b) => Math.abs(a.rotationDaysSigned)-Math.abs(b.rotationDaysSigned))[0];
  const malformed = search.has("worlds") && search.get("worlds") !== ids.join(",");
  function update(next: PlanetId[], message: string) { setQuery({ worlds: next.length ? next.join(",") : null }); setStatus(message); }
  function add(value: string) {
    if (!isPlanetId(value)) return;
    if (ids.includes(value)) { setStatus("That world is already in this comparison. Each world can appear once."); return; }
    if (ids.length >= 3) { setStatus("Three worlds maximum. Remove or replace a selected world first."); return; }
    update([...ids,value], `${planetById[value].name} added to comparison.`);
  }
  function replace(index: number, value: string) {
    if (!isPlanetId(value)) return;
    if (ids.some((id,i) => id === value && i !== index)) { setStatus("That world is already selected. Choose a different world."); return; }
    update(ids.map((id,i) => i === index ? value : id), `Position ${index+1} now compares ${planetById[value].name}.`);
  }
  return <>
    <div className="comparison-controls"><div className="control-field"><label className="field-label" htmlFor="radius-unit">Radius unit</label><select id="radius-unit" value={units.radius} onChange={e => setQuery({ unit: e.target.value === "km" ? null : "mi" })}><option value="km">Kilometres (km)</option><option value="mi">Miles (mi)</option></select></div><div className="control-field"><label className="field-label" htmlFor="rotation-unit">Rotation unit</label><select id="rotation-unit" value={units.rotation} onChange={e => setQuery({ time: e.target.value === "hours" ? null : "days" })}><option value="hours">Earth hours</option><option value="days">Earth days</option></select></div><div className="toolbar-actions"><ShareButton label="Share comparison" /><button className="btn-secondary" onClick={() => { setQuery({ worlds: null, unit: null, time: null }); setStatus("Comparison reset. Choose two or three worlds."); }}><RotateCcw size={15} aria-hidden="true" />Reset</button></div></div>
    {malformed && <p className="notice mt-5">Unknown or repeated worlds were ignored. A comparison holds at most three valid, different planets.</p>}
    <div className="compare-slots" aria-label="Comparison selections">{selected.map((p,index) => <motion.div layout={!reduced} key={`slot-${index}`} className="compare-slot"><label className="field-label" htmlFor={`compare-world-${index}`}>WORLD {String(index+1).padStart(2,"0")}</label><div className="compare-slot-top"><select id={`compare-world-${index}`} value={p.id} onChange={e => replace(index,e.target.value)}>{planets.map(option => <option key={option.id} value={option.id} disabled={ids.includes(option.id) && option.id !== p.id}>{option.name}{ids.includes(option.id) && option.id !== p.id ? " — already selected" : ""}</option>)}</select><button className="icon-button" aria-label={`Remove ${p.name} from comparison`} onClick={() => update(ids.filter(id => id !== p.id), `${p.name} removed from comparison.`)}><X size={18} /></button></div></motion.div>)}{ids.length < 3 && <div className="compare-empty-slot"><label htmlFor="add-compare-world">{ids.length === 0 ? "Start with a world" : "Add another perspective"}</label><select id="add-compare-world" value="" onChange={e => add(e.target.value)}><option value="" disabled>Choose a planet…</option>{planets.map(p => <option key={p.id} value={p.id} disabled={ids.includes(p.id)}>{p.name}{ids.includes(p.id) ? " — already selected" : ""}</option>)}</select></div>}</div>
    <p className="status-line mt-4" role="status">{status || (ids.length === 3 ? "Three worlds selected — maximum reached. Use a selector to replace a world, or remove one first." : ids.length === 1 ? "Add one more world for a meaningful comparison. You can compare up to three." : ids.length === 0 ? "Choose two or three distinct worlds. Your selection lives in the URL." : "Two perspectives. Add a third, or explore the differences below.")}</p>
    {ids.length === 3 && status && <p className="small-copy">Three worlds maximum. Replace or remove a selection to make room; duplicates are disabled.</p>}
    {!selected.length ? <EmptyState title="A little context changes everything.">Pick two or three worlds above, or begin with <button className="underline underline-offset-4 min-h-11" onClick={() => update(["earth","mars","neptune"], "Earth, Mars and Neptune selected.")}>Earth, Mars and Neptune</button>. Nothing is saved to your expedition unless you choose to save it.</EmptyState> : <>
      <figure><div className="comparison-diagram" role="img" aria-label={`Mean diameters to scale, rings excluded. ${selected.map(p => `${p.name}: ${number(earthRadii(p.meanRadiusKm),2)} times Earth's diameter`).join(". ")}.`}>
        {selected.map(p => <motion.div layout={!reduced} key={p.id} className="comparison-diagram-item"><div className="comparison-globe-stage"><div style={{ width: `${p.meanRadiusKm/largest.meanRadiusKm*100}%`, maxWidth: `${p.meanRadiusKm/largest.meanRadiusKm*270}px` }}><PlanetImage id={p.id} globeOnly decorative sizes="(max-width: 639px) 29vw, 270px" /></div></div><span className="eyebrow">{p.name}</span><p className="ratio">{number(earthRadii(p.meanRadiusKm),2)}× <span>EARTH’S DIAMETER</span></p></motion.div>)}
      </div><figcaption className="figure-note">FIG. 01 / Mean diameters are proportional. Spacing, lighting and colors are illustrative. Rings excluded. The numeric table is the full text alternative.</figcaption></figure>
      <p id="table-hint" className="small-copy mt-7">Planetary reference measurements. On a small screen, scroll the table horizontally to see every world.</p>
      <div className="table-scroller" role="region" aria-label="Scrollable planetary comparison" aria-describedby="table-hint" tabIndex={0}><table className="comparison-table"><caption className="sr-only">Comparison of {selected.map(p => p.name).join(", ")}. Mean radius in {units.radius}; sidereal rotation in Earth {units.rotation}.</caption><thead><tr><th scope="col">FIELD MEASUREMENT</th>{selected.map(p => <th scope="col" key={p.id}><Link href={`/worlds/${p.id}`}>{p.name}<ArrowUpRight size={14} className="inline ml-2" aria-hidden="true" /></Link></th>)}</tr></thead><tbody>
        <tr><th scope="row">Planetary class</th>{selected.map(p => <td key={p.id}>{CATEGORY_LABELS[p.category]}</td>)}</tr>
        <tr><th scope="row">Mean radius<small>Equivalent-volume sphere, not equatorial</small></th>{selected.map(p => <td key={p.id}>{number(convertDistance(p.meanRadiusKm,units.radius),1)} {units.radius}</td>)}</tr>
        <tr><th scope="row">Mass<small>In 10²⁴ kilograms</small></th>{selected.map(p => <td key={p.id}>{number(p.massE24Kg,3)}</td>)}</tr>
        <tr><th scope="row">Bulk density<small>Mass / volume, g/cm³</small></th>{selected.map(p => <td key={p.id}>{number(p.densityGcm3,3)} g/cm³</td>)}</tr>
        <tr><th scope="row">Sidereal rotation<small>One turn relative to fixed stars</small></th>{selected.map(p => <td key={p.id}>{number(convertRotation(p.rotationDaysSigned,units.rotation),2)} {units.rotation === "hours" ? "h" : "d"}<small>{p.rotationDaysSigned < 0 ? "Retrograde (opposite direction)" : "Prograde"}</small></td>)}</tr>
        <tr><th scope="row">Sidereal orbital period<small>One solar orbit, in source reference years</small></th>{selected.map(p => <td key={p.id}>{number(p.orbitalYears,3)} yr</td>)}</tr>
        <tr><th scope="row">Solid surface temperature<small>Intentionally not treated as a universal metric</small></th>{selected.map(p => <td key={p.id}>{p.surface.kind === "solid" ? "Not included" : "Not applicable"}<small>{p.surface.kind === "solid" ? "Varies by location, time and definition" : "No solid surface; pressure level matters"}</small></td>)}</tr>
      </tbody></table></div>
      {selected.length >= 2 && <section className="compare-explanation"><h2>Same system.<br /><em>Different stories.</em></h2><div><p><strong>{largest.name}</strong> has a mean diameter {number(largest.meanRadiusKm/smallest.meanRadiusKm,2)} times that of <strong>{smallest.name}</strong>. These are diameter ratios, not volume or mass ratios; doubling a sphere’s diameter multiplies its volume by eight.</p><p>Of these worlds, <strong>{fastest.name}</strong> has the shortest reference sidereal rotation: {number(Math.abs(fastest.rotationDaysSigned)*24,2)} Earth hours. A solar day is not the same quantity. Giant-planet atmospheres rotate differentially, so one reference period does not describe every cloud.</p><p>“Not included” means a metric was deliberately omitted, not zero or unknown. “Not applicable” means there is no comparable solid surface. A gas giant’s temperature at a pressure level should not be ranked against a rocky surface temperature.</p></div></section>}
      <Sources sources={[PARAMETER_SOURCE,FACT_NOTES]} verified={VERIFIED} />
    </>}
  </>;
}