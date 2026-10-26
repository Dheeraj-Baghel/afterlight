"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Bookmark, Menu, SlidersHorizontal, ArrowUpRight } from "lucide-react";
import { Modal } from "@/components/dialog";
import { setMotionPreference, useLocalStore } from "@/lib/local-store";
import { useReducedMotion } from "@/components/providers";

const nav = [{ href: "/atlas", label: "The atlas" }, { href: "/#worlds", label: "Worlds" }, { href: "/missions", label: "Missions" }, { href: "/compare", label: "Compare" }, { href: "/about", label: "About" }];
export function Wordmark() {
  return <span className="wordmark"><svg viewBox="0 0 32 32" width="27" height="27" fill="none" aria-hidden="true"><circle cx="16" cy="16" r="10.5" stroke="currentColor" /><ellipse cx="16" cy="16" rx="16" ry="5" transform="rotate(-42 16 16)" stroke="currentColor" /><circle cx="23" cy="7" r="2" fill="currentColor" /></svg>AFTERLIGHT<span className="wordmark-dot" aria-hidden="true">✳</span></span>;
}
export function SiteHeader() {
  const path = usePathname();
  const [menu, setMenu] = useState(false);
  const [preferences, setPreferences] = useState(false);
  const store = useLocalStore();
  const reduced = useReducedMotion();
  return <>
    <a className="skip-link" href="#main">Skip to content</a>
    <header className="site-header"><div className="header-inner">
      <Link href="/" className="brand-link" aria-label="AFTERLIGHT home"><Wordmark /></Link>
      <nav aria-label="Main navigation" className="desktop-nav">{nav.map(item => <Link key={item.href} href={item.href} aria-current={path === item.href ? "page" : undefined}>{item.label}</Link>)}</nav>
      <div className="header-actions">
        <Link href="/expedition" className="expedition-nav" aria-current={path === "/expedition" ? "page" : undefined}><Bookmark size={16} aria-hidden="true" /><span>My expedition</span><span className="nav-count" aria-label={`${store.expedition.destinations.length} saved worlds`}>{String(store.expedition.destinations.length).padStart(2, "0")}</span></Link>
        <Modal open={preferences} onOpenChange={setPreferences} title="A quieter kind of discovery." description="Choose how AFTERLIGHT moves. Every feature works with movement reduced." trigger={<button className="icon-button preferences-trigger" aria-label="Motion preferences"><SlidersHorizontal size={18} /></button>}>
          <label className="field-label mt-7" htmlFor="motion-pref">Motion preference</label>
          <select id="motion-pref" value={store.motion} onChange={e => setMotionPreference(e.target.value === "reduce" ? "reduce" : "system")}>
            <option value="system">Follow my system</option><option value="reduce">Reduce motion</option>
          </select>
          <p className="small-copy mt-4" role="status">{reduced ? "Reduced motion is active. Automatic rotation and editorial movement are off." : "Full motion is available. You can also pause rotation in the atlas."}</p>
          <p className="small-copy mt-3">Stored on this browser only. Your system’s reduced-motion setting is always respected.</p>
          {store.preferenceMessage && <p className="notice mt-3">{store.preferenceMessage}</p>}
        </Modal>
        <Modal open={menu} onOpenChange={setMenu} title="Go somewhere new." description="Your field guide to eight remarkable worlds." className="mobile-menu-dialog" trigger={<button className="icon-button mobile-menu-trigger" aria-label="Open navigation"><Menu size={22} /></button>}>
          <nav aria-label="Mobile navigation" className="mobile-nav">{[...nav, { href: "/expedition", label: "My expedition" }].map(item => <Link key={item.href} href={item.href} onClick={() => setMenu(false)}>{item.label}<ArrowUpRight size={22} aria-hidden="true" /></Link>)}</nav>
        </Modal>
      </div>
    </div></header>
  </>;
}