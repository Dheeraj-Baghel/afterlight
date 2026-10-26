"use client";

import { Component, Suspense, useEffect, useMemo, useRef, useState, useSyncExternalStore, type ReactNode } from "react";
import { Canvas, useFrame, useThree, type ThreeEvent } from "@react-three/fiber";
import { OrbitControls, Line } from "@react-three/drei";
import * as THREE from "three";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import type { PlanetId } from "@/lib/types";
import type { SceneCommand } from "@/components/atlas-scene-shell";
import { planets, planetById } from "@/data/planets";

type Props = {
  world: PlanetId; scene: "planet" | "system"; active: boolean; autoRotate: boolean;
  reduced: boolean; command: SceneCommand; onReady: () => void;
  onFailure: (message: string) => void; onSelect: (id: PlanetId) => void;
};
class SceneBoundary extends Component<{ children: ReactNode; onFailure: Props["onFailure"] }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch() { this.props.onFailure("The 3D renderer could not start. Continue with the poster and 2D list, or retry 3D."); }
  render() { return this.state.failed ? null : this.props.children; }
}
function coarseSubscribe(callback: () => void) {
  const query = window.matchMedia("(pointer: coarse)");
  query.addEventListener("change", callback);
  return () => query.removeEventListener("change", callback);
}
const isCoarse = () => window.matchMedia("(pointer: coarse)").matches;
const isNotCoarse = () => false;

function useLocalTexture(url: string, failure: Props["onFailure"], ready?: Props["onReady"]) {
  const [texture, setTexture] = useState<THREE.Texture | null>(null);
  const invalidate = useThree(state => state.invalidate);
  const failureRef = useRef(failure);
  const readyRef = useRef(ready);
  useEffect(() => { failureRef.current = failure; readyRef.current = ready; }, [failure, ready]);
  useEffect(() => {
    let cancelled = false;
    let owned: THREE.Texture | undefined;
    const loader = new THREE.TextureLoader();
    loader.load(url, loaded => {
      if (cancelled) { loaded.dispose(); return; }
      loaded.colorSpace = THREE.SRGBColorSpace;
      loaded.anisotropy = 2;
      owned = loaded;
      setTexture(loaded);
      invalidate();
    }, undefined, () => {
      if (!cancelled) failureRef.current("A planet texture could not be loaded. The local poster and 2D controls are still available. Retry when ready.");
    });
    return () => { cancelled = true; owned?.dispose(); };
  }, [url, invalidate]);
  useEffect(() => {
    if (texture) { invalidate(); readyRef.current?.(); }
  }, [texture, invalidate]);
  return texture;
}

function SaturnRings({ onFailure }: { onFailure: Props["onFailure"] }) {
  const texture = useLocalTexture("/textures/saturn-rings.webp", onFailure);
  const geometry = useMemo(() => {
    const ring = new THREE.RingGeometry(1.52, 2.52, 160);
    const position = ring.attributes.position;
    const uv = ring.attributes.uv;
    for (let i = 0; i < position.count; i++) {
      const radius = Math.hypot(position.getX(i), position.getY(i));
      uv.setXY(i, (radius - 1.52) / (2.52 - 1.52), .5);
    }
    return ring;
  }, []);
  useEffect(() => () => geometry.dispose(), [geometry]);
  return <mesh geometry={geometry} rotation={[-Math.PI / 2, 0, 0]}><meshStandardMaterial key={texture?.uuid ?? "untextured-ring"} map={texture} color={texture ? "white" : "#bfb397"} side={THREE.DoubleSide} transparent opacity={.9} roughness={1} metalness={0} depthWrite={false} /></mesh>;
}

function WorldModel({ world, active, autoRotate, command, onReady, onFailure }: Pick<Props, "world" | "active" | "autoRotate" | "command" | "onReady" | "onFailure">) {
  const mesh = useRef<THREE.Mesh>(null);
  const texture = useLocalTexture(`/textures/${world}.webp`, onFailure, onReady);
  const invalidate = useThree(state => state.invalidate);
  useFrame((_, delta) => {
    if (!active || !autoRotate || !mesh.current) return;
    // Deliberately illustrative angular speed, never claimed to be a simulation.
    mesh.current.rotation.y += Math.min(delta, .05) * .10 * (planetById[world].rotationDaysSigned < 0 ? -1 : 1);
    invalidate();
  });
  useEffect(() => { if (active) invalidate(); }, [active, autoRotate, invalidate]);
  useEffect(() => {
    if (!mesh.current) return;
    if (command.action === "left") mesh.current.rotation.y -= Math.PI / 8;
    if (command.action === "right") mesh.current.rotation.y += Math.PI / 8;
    if (command.action === "reset") mesh.current.rotation.y = .3;
    invalidate();
  }, [command, invalidate]);
  return <group rotation={[world === "saturn" ? .44 : .12, 0, -.28]}>
    <mesh ref={mesh} rotation={[0, .3, 0]} scale={world === "saturn" ? [1, .92, 1] : world === "jupiter" ? [1, .94, 1] : 1}>
      <sphereGeometry args={[1.22, 80, 48]} />
      {/* A map changes shader defines: recreate the material when the async map
          arrives, rather than retaining a shader compiled for a null texture. */}
      <meshStandardMaterial key={texture?.uuid ?? "untextured-world"} map={texture} color={texture ? "white" : planetById[world].color} roughness={1} metalness={0} />
    </mesh>
    {world === "saturn" && <SaturnRings onFailure={onFailure} />}
  </group>;
}

function SystemModel({ selected, onSelect }: { selected: PlanetId; onSelect: Props["onSelect"] }) {
  // Deliberately expanded terrestrial sizes and compressed distances. No ephemeris.
  const positions = useMemo(() => planets.map((p, i) => {
    const radius = 1.2 + i * .65;
    const angle = -.7 + i * .63;
    return { planet: p, radius, x: Math.cos(angle) * radius, z: Math.sin(angle) * radius };
  }), []);
  function pick(event: ThreeEvent<MouseEvent>, id: PlanetId) { event.stopPropagation(); onSelect(id); }
  return <group rotation={[.15, 0, 0]}>
    <mesh><sphereGeometry args={[.3, 32, 24]} /><meshBasicMaterial color="#efb879" /></mesh>
    {positions.map(({ planet, radius, x, z }, i) => <group key={planet.id}>
      <Line points={Array.from({ length: 97 }, (_, n): [number, number, number] => [Math.cos(n/96*Math.PI*2)*radius, 0, Math.sin(n/96*Math.PI*2)*radius])} color={selected === planet.id ? "#af8b69" : "#27343e"} lineWidth={1} />
      <group position={[x, 0, z]}>
        <mesh onClick={event => pick(event, planet.id)}><sphereGeometry args={[i < 4 ? .16 : .29, 32, 24]} /><meshStandardMaterial color={planet.color} roughness={1} /></mesh>
        {/* Expanded invisible hit volume; matching HTML buttons are always available. */}
        <mesh onClick={event => pick(event, planet.id)}><sphereGeometry args={[.43, 12, 8]} /><meshBasicMaterial transparent opacity={0} depthWrite={false} /></mesh>
        {selected === planet.id && <Line points={Array.from({ length: 49 }, (_, n): [number, number, number] => [Math.cos(n/48*Math.PI*2)*.43, .01, Math.sin(n/48*Math.PI*2)*.43])} color="#e89159" lineWidth={1.6} />}
        {planet.id === "saturn" && <mesh rotation={[-Math.PI/2, .2, 0]}><ringGeometry args={[.36, .53, 48]} /><meshBasicMaterial color="#b8a587" side={THREE.DoubleSide} /></mesh>}
      </group>
    </group>)}
  </group>;
}

function CameraRig({ scene, command, active, reduced, coarse, onFailure }: Pick<Props, "scene" | "command" | "active" | "reduced" | "onFailure"> & { coarse: boolean }) {
  const controls = useRef<OrbitControlsImpl>(null);
  const { camera, invalidate, gl } = useThree();
  const target = useRef(new THREE.Vector3(0, .2, 5.9));
  const pending = useRef(false);
  const minimum = scene === "system" ? 9 : 3.7;
  const maximum = scene === "system" ? 27 : 10;
  useEffect(() => {
    const position = scene === "system" ? new THREE.Vector3(0, 12, 9) : new THREE.Vector3(0, .2, 5.9);
    target.current.copy(position);
    // Reset is immediate; only explicit zoom steps interpolate when motion is allowed.
    camera.position.copy(position);
    controls.current?.target.set(0, 0, 0);
    controls.current?.update();
    pending.current = false;
    invalidate();
  }, [scene, camera, invalidate]);
  useEffect(() => {
    const lost = (event: Event) => {
      event.preventDefault();
      onFailure("The graphics context was lost. Your selection is safe; continue in 2D or use Retry 3D to rebuild the scene.");
    };
    const element = gl.domElement;
    element.addEventListener("webglcontextlost", lost, false);
    return () => element.removeEventListener("webglcontextlost", lost, false);
  }, [gl, onFailure]);
  useEffect(() => {
    if (command.action === "reset") {
      if (scene === "system") target.current.set(0, 12, 9);
      else target.current.set(0, .2, 5.9);
      controls.current?.target.set(0,0,0);
    } else if (command.action === "in" || command.action === "out") {
      const distance = THREE.MathUtils.clamp(camera.position.length() * (command.action === "in" ? .83 : 1.2), minimum, maximum);
      target.current.copy(camera.position).normalize().multiplyScalar(distance);
    } else return;
    pending.current = !reduced;
    if (reduced) { camera.position.copy(target.current); controls.current?.update(); }
    invalidate();
  }, [command, scene, camera, minimum, maximum, reduced, invalidate]);
  useFrame((_, delta) => {
    if (!active || !pending.current) return;
    camera.position.lerp(target.current, 1 - Math.exp(-Math.min(delta,.05) * 16));
    if (camera.position.distanceTo(target.current) < .004) { camera.position.copy(target.current); pending.current = false; }
    controls.current?.update();
    invalidate();
  });
  useEffect(() => { if (active) invalidate(); }, [active, invalidate]);
  return <OrbitControls ref={controls} makeDefault enablePan={false} enableZoom={false} enableRotate={!coarse} enableDamping={!reduced} dampingFactor={.12} minDistance={minimum} maxDistance={maximum} minPolarAngle={.12} maxPolarAngle={Math.PI-.12} onStart={() => { pending.current = false; }} />;
}

function SceneContents(props: Props & { coarse: boolean }) {
  const { scene, onReady } = props;
  useEffect(() => { if (scene === "system") onReady(); }, [scene, onReady]);
  return <>
    <ambientLight intensity={.24} />
    <directionalLight position={[-4, 4.2, 5]} intensity={2.5} color="#fff2df" />
    <directionalLight position={[4, -1, -3]} intensity={.28} color="#9fc4e5" />
    <CameraRig scene={props.scene} command={props.command} active={props.active} reduced={props.reduced} coarse={props.coarse} onFailure={props.onFailure} />
    {props.scene === "planet" ? <WorldModel key={props.world} {...props} /> : <SystemModel selected={props.world} onSelect={props.onSelect} />}
  </>;
}
export default function PlanetScene(props: Props) {
  const coarse = useSyncExternalStore(coarseSubscribe, isCoarse, isNotCoarse);
  return <SceneBoundary onFailure={props.onFailure}><Canvas
    frameloop={props.active ? "demand" : "never"} dpr={[1, 1.5]}
    camera={{ position: [0,.2,5.9], fov: 42, near: .1, far: 100 }}
    gl={{ antialias: true, alpha: true, powerPreference: "low-power", preserveDrawingBuffer: false }}
    style={{ touchAction: "pan-y", pointerEvents: coarse ? "none" : "auto" }}
    fallback={<span>3D unavailable. Use the 2D list and world selectors.</span>}
    onCreated={({ gl }) => { gl.outputColorSpace = THREE.SRGBColorSpace; gl.toneMapping = THREE.ACESFilmicToneMapping; gl.toneMappingExposure = 1.1; }}
  ><Suspense fallback={null}><SceneContents {...props} coarse={coarse} /></Suspense></Canvas></SceneBoundary>;
}
