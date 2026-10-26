"use client";

import { createContext, useContext, useSyncExternalStore } from "react";
import { MotionConfig } from "motion/react";
import { useLocalStore } from "@/lib/local-store";

const ReducedContext = createContext(false);
function subscribeSystem(callback: () => void) {
  const media = window.matchMedia("(prefers-reduced-motion: reduce)");
  media.addEventListener("change", callback);
  return () => media.removeEventListener("change", callback);
}
const systemSnapshot = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const serverSnapshot = () => false;
export function useReducedMotion() { return useContext(ReducedContext); }
export function Providers({ children }: { children: React.ReactNode }) {
  const { motion } = useLocalStore();
  const system = useSyncExternalStore(subscribeSystem, systemSnapshot, serverSnapshot);
  const reduce = motion === "reduce" || system;
  return <ReducedContext.Provider value={reduce}><MotionConfig reducedMotion={reduce ? "always" : "never"} transition={{ duration: reduce ? 0 : .22, ease: "easeOut" }}><div data-motion={reduce ? "reduce" : "full"}>{children}</div></MotionConfig></ReducedContext.Provider>;
}