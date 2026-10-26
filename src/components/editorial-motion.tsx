"use client";
import { useEffect, useRef } from "react";
import { useReducedMotion } from "@/components/providers";

// GSAP owns only this wrapper's explicitly marked editorial elements. Content is
// visible in source/CSS; an import/setup failure cannot hide essential reading.
export function EditorialMotion({ children, kind = "reveal", className = "" }: { children: React.ReactNode; kind?: "opening" | "story" | "reveal"; className?: string }) {
  const root = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  useEffect(() => {
    if (reduced || !root.current) return;
    let cancelled = false;
    let started = false;
    let revert: (() => void) | undefined;
    const install = async () => {
      if (started) return;
      started = true;
      const { gsap } = await import("gsap");
      if (kind !== "opening") {
        const { ScrollTrigger } = await import("gsap/ScrollTrigger");
        if (cancelled) return;
        gsap.registerPlugin(ScrollTrigger);
      }
      if (cancelled || !root.current) return;
      const context = gsap.context(() => {
        if (kind === "opening") {
          gsap.fromTo("[data-opening-type]", { y: 14 }, { y: 0, duration: .65, ease: "power2.out", clearProps: "transform" });
          gsap.fromTo("[data-opening-planet]", { rotation: -3, scale: 1.025 }, { rotation: 0, scale: 1, duration: 1.1, ease: "power2.out", clearProps: "transform" });
        } else {
          gsap.utils.toArray<HTMLElement>("[data-editorial-reveal]").forEach(el => gsap.fromTo(el, { y: 18 }, { y: 0, duration: .6, ease: "power2.out", clearProps: "transform", scrollTrigger: { trigger: el, start: "top 90%", once: true } }));
          if (kind === "story") gsap.fromTo("[data-trajectory-line]", { strokeDashoffset: 500 }, { strokeDashoffset: 0, duration: 1, ease: "none", scrollTrigger: { trigger: root.current, start: "top 75%", end: "bottom 40%", scrub: .3 } });
        }
      }, root);
      revert = () => context.revert();
    };
    const start = () => { void install().catch(() => { /* Static content is already usable. */ }); };
    // Do not download scroll-animation code for chapters the reader never visits.
    // The opening needs GSAP core only, not ScrollTrigger.
    const observer = kind === "opening" ? null : new IntersectionObserver(entries => {
      if (entries.some(entry => entry.isIntersecting)) { observer?.disconnect(); start(); }
    }, { rootMargin: "100px" });
    if (observer) observer.observe(root.current);
    else start();
    return () => { cancelled = true; observer?.disconnect(); revert?.(); };
  }, [kind, reduced]);
  return <div ref={root} className={className}>{children}</div>;
}