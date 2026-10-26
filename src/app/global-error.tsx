"use client";
import Link from "next/link";
export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <html lang="en"><body style={{ margin: 0, background: "#eeeae1", color: "#101519", fontFamily: "system-ui, sans-serif" }}><main style={{ maxWidth: 640, padding: "80px 24px", margin: "auto" }}><p>AFTERLIGHT / SIGNAL INTERRUPTED</p><h1>The observatory needs another moment.</h1><p>A page error interrupted this visit. Try again; if it persists, reload the page. Your local journal has not been intentionally removed.</p><button onClick={reset} style={{ minHeight: 48, padding: "12px 24px" }}>Try again</button><Link href="/" style={{ marginLeft: 25 }}>Return home</Link></main></body></html>;
}