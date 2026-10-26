"use client";
import Link from "next/link";
import { Bookmark, Check, GitCompareArrows } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { useLocalStore, mutateExpedition } from "@/lib/local-store";
import { toggleDestination } from "@/lib/expedition";
import type { PlanetId } from "@/lib/types";
import { planetById } from "@/data/planets";
import { comparisonHref } from "@/lib/query";

export function SaveButton({ id, compact = false }: { id: PlanetId; compact?: boolean }) {
  const { expedition, storage } = useLocalStore();
  const [status, setStatus] = useState("");
  const saved = expedition.destinations.some(d => d.planetId === id);
  const name = planetById[id].name;
  return <span className="save-control"><motion.button type="button" whileTap={{ scale: .97 }} className={`btn-secondary save-button ${saved ? "is-saved" : ""} ${compact ? "compact" : ""}`} aria-pressed={saved} disabled={storage === "loading"} aria-label={`${saved ? "Unsave" : "Save"} ${name}`} onClick={() => {
    const persisted = mutateExpedition(current => toggleDestination(current, id));
    setStatus(`${name} ${saved ? "removed from" : "added to"} your expedition${persisted ? "." : " in this tab. Browser backup unavailable; export to keep changes."}`);
  }}>{saved ? <Check size={16} aria-hidden="true" /> : <Bookmark size={16} aria-hidden="true" />}<span>{saved ? storage === "saved" ? "Saved" : "In this tab" : "Save world"}</span></motion.button><span className="sr-only" role="status">{status}</span></span>;
}
export function WorldActions({ id }: { id: PlanetId }) {
  return <div className="flex flex-wrap gap-3"><SaveButton id={id} /><Link href={comparisonHref(id === "earth" ? ["earth", "mars"] : ["earth", id])} className="btn-secondary"><GitCompareArrows size={16} aria-hidden="true" />Compare with {id === "earth" ? "Mars" : "Earth"}</Link></div>;
}