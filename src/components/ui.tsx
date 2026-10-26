import Link from "next/link";
import { ArrowUpRight, ArrowRight } from "lucide-react";
import type { Source } from "@/lib/types";

export function SectionLabel({ number, children, light = false }: { number?: string; children: React.ReactNode; light?: boolean }) {
  return <p className={`eyebrow ${light ? "text-steel" : ""}`}>{number && <span className="section-number">{number}</span>}{children}</p>;
}
export function ArrowLink({ href, children, className = "" }: { href: string; children: React.ReactNode; className?: string }) {
  return <Link href={href} className={`arrow-link ${className}`}>{children}<ArrowUpRight size={18} aria-hidden="true" /></Link>;
}
export function ButtonLink({ href, children, secondary = false, className = "" }: { href: string; children: React.ReactNode; secondary?: boolean; className?: string }) {
  return <Link href={href} className={`${secondary ? "btn-secondary" : "btn-primary"} ${className}`}>{children}<ArrowUpRight size={18} aria-hidden="true" /></Link>;
}
export function Sources({ sources, verified }: { sources: Source[]; verified: string }) {
  return <section className="sources-block" aria-label="Scientific sources"><SectionLabel>Sources & field notes</SectionLabel><p className="small-copy">Local record verified {verified}. Measurements are rounded for reading; source definitions take precedence. No agency endorsement is implied.</p><ul>{sources.map(source => <li key={source.url}><a href={source.url} target="_blank" rel="noreferrer">{source.title}<ArrowUpRight size={14} aria-hidden="true" /><span className="sr-only"> (opens in a new tab)</span></a></li>)}</ul></section>;
}
export function EmptyState({ title, children, href, label }: { title: string; children: React.ReactNode; href?: string; label?: string }) {
  return <div className="empty-state"><span className="empty-orbit" aria-hidden="true" /><h2>{title}</h2><p>{children}</p>{href && <Link href={href} className="btn-primary">{label}<ArrowRight size={18} aria-hidden="true" /></Link>}</div>;
}