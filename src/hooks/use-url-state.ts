"use client";
import { usePathname, useSearchParams } from "next/navigation";
import { useSyncExternalStore } from "react";
import { updateQuery } from "@/lib/query";

const QUERY_EVENT = "afterlight:querychange";
const getQuerySnapshot = () => window.location.search;
function subscribeQuery(callback: () => void) {
  window.addEventListener("popstate", callback);
  window.addEventListener(QUERY_EVENT, callback);
  return () => { window.removeEventListener("popstate", callback); window.removeEventListener(QUERY_EVENT, callback); };
}
export function useUrlState() {
  const pathname = usePathname();
  const serverSearch = useSearchParams();
  // The URL itself is the sole source of truth. Subscribe synchronously so a
  // controlled search input does not lose fast keystrokes to Router transitions.
  // useSearchParams supplies the SSR snapshot and follows cross-route navigation.
  const raw = useSyncExternalStore(subscribeQuery, getQuerySnapshot, () => serverSearch.toString());
  const search = new URLSearchParams(raw);
  function setQuery(changes: Record<string, string | null>, mode: "push" | "replace" = "push") {
    // Next App Router integrates the native History API with useSearchParams.
    // No server round-trip for a filter; inputs replace, discrete selections push.
    const next = `${pathname}${updateQuery(new URLSearchParams(window.location.search), changes)}`;
    if (next === window.location.pathname + window.location.search) return;
    if (mode === "replace") window.history.replaceState(null, "", next);
    else window.history.pushState(null, "", next);
    window.dispatchEvent(new Event(QUERY_EVENT));
  }
  return { search, setQuery };
}