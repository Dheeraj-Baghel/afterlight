"use client";
import Link from "next/link";
export default function RouteError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <main id="main" className="page-shell route-loading"><p className="eyebrow">A TEMPORARY LOSS OF SIGNAL</p><h1>Let’s try that <em>again.</em></h1><p className="max-w-lg small-copy">This part of the atlas could not be displayed. Your browser-local expedition has not been intentionally cleared. Retry the page or return home.</p><div className="flex flex-wrap gap-3 mt-7"><button className="btn-primary" onClick={reset}>Try again</button><Link className="btn-secondary" href="/">Return home</Link></div></main>;
}