import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Wordmark } from "@/components/site-header";

export function SiteFooter() {
  return <footer className="site-footer"><div className="page-shell">
    <div className="footer-top"><div><Link href="/" aria-label="AFTERLIGHT home"><Wordmark /></Link><p>An independent digital observatory.<br />For the endlessly curious.</p></div><p className="footer-thought">There is always<br /><em>more to see.</em></p><nav aria-label="Footer"><Link href="/atlas">Explore the atlas<ArrowUpRight size={15} /></Link><Link href="/about">Sources & methodology<ArrowUpRight size={15} /></Link><a href="/asset-manifest.json">Asset credits<ArrowUpRight size={15} /></a><Link href="/expedition">Your expedition<ArrowUpRight size={15} /></Link></nav></div>
    <div className="footer-bottom"><span>© 2026 AFTERLIGHT · A fictional observatory, a real solar system.</span><span>No tickets. No accounts. Just perspective.</span></div>
  </div></footer>;
}