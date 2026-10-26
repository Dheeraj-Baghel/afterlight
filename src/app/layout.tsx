import type { Metadata } from "next";
import localFont from "next/font/local";
import { Providers } from "@/components/providers";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { SITE_URL } from "@/lib/site";
import "./globals.css";

const display = localFont({ src: [ { path: "../../public/fonts/instrument-serif.woff", style: "normal", weight: "400" }, { path: "../../public/fonts/instrument-serif-italic.woff", style: "italic", weight: "400" } ], variable: "--font-display", display: "swap" });
const sans = localFont({ src: "../../public/fonts/dm-sans.woff", variable: "--font-sans", weight: "100 900", display: "swap" });
const mono = localFont({ src: "../../public/fonts/ibm-plex-mono.woff", variable: "--font-mono", weight: "400", display: "swap", preload: false });

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: "AFTERLIGHT — Find your next world", template: "%s | AFTERLIGHT" },
  description: "An independent digital observatory. Explore eight planets, follow the missions that changed our perspective, and make an expedition of your own.",
  openGraph: { type: "website", siteName: "AFTERLIGHT", title: "AFTERLIGHT — Find your next world", description: "Eight planets. Countless ways to see them. An interactive atlas for the endlessly curious.", images: [{ url: "/images/social.jpg", width: 1200, height: 630, alt: "AFTERLIGHT — Find your next world. Illustrative Saturn portrait." }] },
  twitter: { card: "summary_large_image", title: "AFTERLIGHT — Find your next world", images: ["/images/social.jpg"] },
  icons: { icon: "/icon.svg" }
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en" className={`${display.variable} ${sans.variable} ${mono.variable}`}><body><Providers><SiteHeader />{children}<SiteFooter /></Providers></body></html>;
}