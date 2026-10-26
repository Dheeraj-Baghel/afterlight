import Image from "next/image";
import type { PlanetId } from "@/lib/types";
import { planetById } from "@/data/planets";

export function PlanetImage({ id, className = "", priority = false, sizes = "(max-width: 767px) 80vw, 45vw", globeOnly = false, decorative = false }: { id: PlanetId; className?: string; priority?: boolean; sizes?: string; globeOnly?: boolean; decorative?: boolean }) {
  const rings = id === "saturn" && !globeOnly;
  return <Image src={`/images/${id}${id === "saturn" && globeOnly ? "-globe" : ""}.webp`} width={rings ? 1200 : 900} height={rings ? 912 : 900} alt={decorative ? "" : `${planetById[id].name}, illustrative globe${rings ? " with schematic rings" : ""}`} className={`planet-image ${className}`} sizes={sizes} priority={priority} />;
}