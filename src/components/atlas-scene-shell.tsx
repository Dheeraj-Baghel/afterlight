"use client";
import dynamic from "next/dynamic";
import { useCallback, useEffect, useRef, useState } from "react";
import { Pause, Play, RotateCcw, ZoomIn, ZoomOut, RotateCw, MoveLeft, MoveRight } from "lucide-react";
import type { PlanetId } from "@/lib/types";
import { planetById } from "@/data/planets";
import { PlanetImage } from "@/components/planet-image";
import { useReducedMotion } from "@/components/providers";

// Heavy browser-only graphics live behind a Client Component boundary, never in
// the server shell or other routes. A static poster is visible before this loads.
const PlanetScene = dynamic(() => import("@/components/planet-scene"), { ssr: false, loading: () => null });
export type SceneCommand = { serial: number; action: "reset" | "in" | "out" | "left" | "right" };
export function AtlasSceneShell({ world, scene, onSceneChange, onSelect }: { world: PlanetId; scene: "planet" | "system"; onSceneChange: (view: "planet" | "system") => void; onSelect: (id: PlanetId) => void }) {
  const reduced = useReducedMotion();
  const [autoRotate, setAutoRotate] = useState(true);
  const [active, setActive] = useState(false);
  const [capability, setCapability] = useState<"checking" | "ready" | "unavailable">("checking");
  const [readyFor, setReadyFor] = useState<string | null>(null);
  const ready = readyFor === `${world}:${scene}`;
  const [failure, setFailure] = useState("");
  const [command, setCommand] = useState<SceneCommand>({ serial: 0, action: "reset" });
  const [retry, setRetry] = useState(0);
  const root = useRef<HTMLDivElement>(null);
  const handleReady = useCallback(() => setReadyFor(`${world}:${scene}`), [world, scene]);
  const handleFailure = useCallback((message: string) => { setReadyFor(null); setFailure(message); }, []);
  useEffect(() => {
    // Capability probing uses an isolated context and releases it immediately.
    // This is a one-time browser-capability synchronization, not derived UI state.
    const probe = document.createElement("canvas");
    let gl: WebGLRenderingContext | WebGL2RenderingContext | null = null;
    try { gl = probe.getContext("webgl2") || probe.getContext("webgl"); } catch { /* fallback */ }
    const supported = Boolean(gl);
    gl?.getExtension("WEBGL_lose_context")?.loseContext();
    // eslint-disable-next-line react-hooks/set-state-in-effect -- WebGL cannot be probed during SSR.
    setCapability(supported ? "ready" : "unavailable");
    if (!supported) setFailure("3D is unavailable on this device. The poster, world selectors and 2D list are fully usable.");
  }, []);
  useEffect(() => {
    const element = root.current;
    if (!element) return;
    let visible = false;
    const sync = () => setActive(visible && document.visibilityState === "visible");
    const observer = new IntersectionObserver(entries => { visible = entries[0]?.isIntersecting ?? false; sync(); }, { threshold: .08 });
    observer.observe(element);
    document.addEventListener("visibilitychange", sync);
    return () => { observer.disconnect(); document.removeEventListener("visibilitychange", sync); };
  }, []);
  function send(action: SceneCommand["action"]) { setCommand(current => ({ serial: current.serial + 1, action })); }
  const interactive = capability === "ready" && !failure;
  return <>
    <div className="scene-shell" ref={root}>
      {(!ready || failure || capability !== "ready") && <div className={`scene-poster ${world === "saturn" ? "ringed" : ""}`}><PlanetImage id={world} priority sizes="(max-width: 639px) 90vw, 60vw" /></div>}
      <div className="scene-watermark" aria-hidden="true"><span className="scene-ordinal">{String(planetById[world].order).padStart(2,"0")}</span><span className="eyebrow">{scene === "system" ? "SCHEMATIC SYSTEM" : "OBSERVATION VIEW"}</span></div>
      {interactive && <div className="scene-canvas" role="img" aria-label={scene === "system" ? "Schematic solar system. Use the planet selector buttons below for the same choices." : `Interactive illustrative globe of ${planetById[world].name}. Use HTML buttons below to rotate, zoom and reset.`}><PlanetScene key={retry} world={world} scene={scene} active={active} autoRotate={autoRotate && !reduced} reduced={reduced} command={command} onReady={handleReady} onFailure={handleFailure} onSelect={onSelect} /></div>}
      {(!ready || failure) && <div className="scene-status" role="status"><span>{failure || (capability === "checking" ? "Checking 3D support. All world links are ready." : "Loading the selected world. Explore with the controls below.")}</span>{failure && capability === "ready" && <button onClick={() => { setFailure(""); setReadyFor(null); setRetry(v => v + 1); }}>Retry 3D</button>}</div>}
    </div>
    <div className="scene-controls" role="group" aria-label="Scene controls">
      <button className="icon-button" onClick={() => send("left")} aria-label="Rotate planet left" disabled={!interactive || scene === "system"}><MoveLeft size={16} /></button>
      <button className="icon-button" onClick={() => send("right")} aria-label="Rotate planet right" disabled={!interactive || scene === "system"}><MoveRight size={16} /></button>
      <button className="icon-button" onClick={() => send("in")} aria-label="Zoom in" disabled={!interactive}><ZoomIn size={16} /></button>
      <button className="icon-button" onClick={() => send("out")} aria-label="Zoom out" disabled={!interactive}><ZoomOut size={16} /></button>
      <button className="icon-button" onClick={() => send("reset")} aria-label="Reset camera" disabled={!interactive}><RotateCcw size={16} /></button>
      <button className="text-control" onClick={() => setAutoRotate(value => !value)} aria-pressed={!autoRotate || reduced} disabled={!interactive || reduced || scene === "system"}>{autoRotate && !reduced ? <Pause size={14} aria-hidden="true" /> : <Play size={14} aria-hidden="true" />}{reduced ? "Motion reduced" : autoRotate ? "Pause rotation" : "Resume rotation"}</button>
      <label className="sr-only" htmlFor="scene-view">Scene view</label><select id="scene-view" value={scene} onChange={e => onSceneChange(e.target.value === "system" ? "system" : "planet")}><option value="planet">Planet focus</option><option value="system">System schematic</option></select>
    </div>
    <p className="figure-note scene-notes">{scene === "system" ? "Distances, orbit shapes and planet sizes are schematic. This is not a live orbital simulation." : "Drag with a mouse to orbit. On touch, use the buttons; swipe vertically to scroll."}<br />Illustrative lighting · {reduced ? "automatic movement disabled" : "automatic rotation is illustrative, not to time scale"} <RotateCw size={10} className="inline ml-1" aria-hidden="true" /></p>
  </>;
}