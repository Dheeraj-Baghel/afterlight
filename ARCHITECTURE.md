# AFTERLIGHT architecture

## Product boundary

An independent Next.js App Router application inside its own folder. No backend, account, API credentials, database, payments or deployment. Eight planets and eight missions are local typed records. Scientific information, illustrative imagery and fictional personal exploration are explicitly distinguished throughout the product.

## Rendering boundaries

- App layout, home composition, planet/mission prose, source lists, methodology and metadata are **Server Components**.
- Atlas, comparison and mission archive use request-time `connection()` so `useSearchParams` has an actual request and the fully selected view is included in initial HTML. This avoids a large client-only replacement and layout shift. No live external API is involved.
- Detail-page return URLs are validated **on the server**, not inside a client-only Suspense fallback. A user clicking immediately after navigation receives a correct link even before hydration. Other detail content is server prepared from local data.
- Detail slugs use `generateStaticParams` and `dynamicParams = false`. An invalid planet or mission receives a useful real 404. There is no top-level streaming loading boundary that commits a 200 before an invalid slug can be checked; the atlas has its own appropriate route loading state.
- Client boundaries: URL workspaces, local journal, preference/menu dialogs, comparison teaser, editorial animation wrapper and progressively imported 3D.
- Three.js, Fiber and Drei are imported only by [planet-scene.tsx](src/components/planet-scene.tsx), loaded with `next/dynamic({ ssr: false })` from a Client Component. The homepage intentionally uses a lightweight local poster rather than mounting a second hidden scene.

## State sources of truth

### URL: exploration state

- Atlas: `world`, `group`, `q`, `view`, `scene`, `compare`.
- Compare: `worlds` (at most three distinct ids), `unit` (`km`/`mi`), `time` (`hours`/`days`).
- Missions: `q`, `destination`, `type`, `sort`.
- Detail links carry a validated `from` URL pointing only to their own archive.

[query.ts](src/lib/query.ts) normalizes malformed input and computes filtered/sorted collections. [use-url-state.ts](src/hooks/use-url-state.ts) reads the **URL itself** through `useSyncExternalStore`, using `useSearchParams` as the SSR/router snapshot. It listens to `popstate` and one synchronous local notification after a History API mutation. This avoids lost characters when a controlled text input updates faster than an App Router transition. There is no duplicated query state or syncing-effect chain.

Text input uses `replaceState`; discrete choices use `pushState`. Camera animation never writes history. History updates preserve unrelated query fields. Back/forward are real restoration paths, not mocked state.

### Versioned browser persistence: personal data

[expedition.ts](src/lib/expedition.ts) defines pure schema and transformation logic. The payload is:

```json
{
  "version": 1,
  "destinations": [
    { "planetId": "saturn", "note": "What keeps the rings thin?" }
  ]
}
```

- Storage key: `afterlight.expedition.v1`.
- Preferences key: `afterlight.preferences.v1`, with `{ "version": 1, "motion": "system" | "reduce" }`.
- At most eight known, unique planet identifiers; 600 UTF-16 code units per note; 32,768 UTF-8 bytes per imported file. UI calls these “characters” and 32 KB for brevity.
- Parser validates unknown external data, constructs only known fields, rejects unsupported versions and treats all note strings as text.
- Merge preserves existing destination order **and notes**, then appends new destinations in file order. Replace uses the exact imported sequence. Nothing applies before preview confirmation.
- Clear/remove/import keep a one-step in-memory undo snapshot. Undo is page-local, not durable across reloads. Removal moves focus to the journal heading rather than leaving it on a deleted control.
- [local-store.ts](src/lib/local-store.ts) is a small subscription store with a stable SSR snapshot, not a global effect-driven React context tree. It synchronizes `storage` events when persistence is healthy.
- Unreadable saved bytes are held intact; automatic writes are blocked until an explicit recovery reset. Original bytes can be downloaded. Read/write failures keep the working copy in memory and display export/retry instructions. No quota error is presented as successful persistence.
- No local journal contents enter shared URLs, server logs through app requests, or network analytics.

### Component state

Import previews, pending files, dialogs, camera commands, pause, renderer capability and transient status stay local to their owners. Filtered records, saved counts, comparison diagrams and ratios are derived.

## Motion ownership

- **R3F** alone changes model rotation/camera and owns the graphics loop.
- **GSAP + ScrollTrigger** only touches marked editorial elements and the trajectory stroke. Context cleanup reverts on route unmount or reduced-motion changes. Content starts readable in CSS; failure to load GSAP leaves a static page.
- **Motion** owns dialog visibility, list/filter opacity/layout, journal reorder continuity and save feedback. Reduced motion suppresses significant movement and uses immediate dialog states.
- **CSS** handles hover/focus/color and static graphic composition. Native scrolling remains native; no Lenis or scroll hijacking.

A system reduced-motion request always wins; the app preference can additionally reduce movement. No custom cursor, particle field, postprocessing or ornamental continuous counters.

## Graphics lifecycle

- Local WebP textures, maximum 1536 x 768; a selected planet loads independently. System view uses schematic colored markers, not eight texture downloads.
- Cap DPR at 1.5, use moderate sphere segments, no shadows/postprocessing. Explicit low-power preference.
- `frameloop="demand"` for a visible scene; auto-rotation requests another frame only while allowed. Pausing rotation leaves a static demand-rendered scene. `IntersectionObserver` plus `visibilitychange` switches offscreen/hidden rendering to `never`.
- HTML rotate, zoom, reset, pause and view commands work with a keyboard. OrbitControls manages mouse camera rotation, not wheel zoom. Coarse-pointer canvas input is disabled and `touch-action: pan-y` preserves ordinary touch scrolling; buttons provide camera access.
- Texture loading owns and disposes each texture. Material identity changes when an asynchronously loaded map changes shader defines, preventing a map-free material from remaining white. Ring geometry is disposed; R3F disposes owned scene objects on unmount.
- A local poster appears before renderer/texture readiness. A selected-world readiness key avoids calling an old world “ready.” No texture wait blocks the page controls.
- A renderer error boundary, texture failure callback and `webglcontextlost` listener keep the poster and HTML interface useful; Retry rebuilds a fresh canvas.
- All scenes are explicitly illustrative. The system's radii and spacing are not ephemerides, and rotation is not physical time.

## Accessible interaction

Semantic landmarks, skip link, one page heading, visible focus, labels, live status and text equivalents. Radix Dialog owns focus trapping, Escape and restoration; Motion wraps its visual surface without replacing its semantics. Native selects avoid custom inaccessible listboxes. Comparison tables use real headers/captions and a named focusable horizontal-scroll region. Reduced motion, non-WebGL mode and keyboard routes are tested.

Headless automation checks 200%-equivalent **CSS viewport reflow**, not a misleading `style.zoom` test (CSS zoom does not trigger the media queries that actual desktop zoom does). Native browser zoom and real assistive-technology review remain explicitly separate manual checks.

## Assets and source reproducibility

[asset-manifest.json](asset-manifest.json) records remote provenance, local derivatives, rights and hashes. [prepare-assets.py](scripts/prepare-assets.py) reproduces portraits and font subsets. Runtime requires no Python and downloads no third-party images/fonts. The IBM subset is renamed internally to respect the reserved font name. Local asset source maps remain illustrative rather than claiming scientific camera fidelity.

## Testing and operations

- Vitest: conversions, query normalization, compound filters, safe returns, schema limits, malicious text, byte size, round-trip, merge/reorder/note behavior and dataset/asset integrity.
- Playwright against production: complete cross-route journeys, actual downloads/import previews, invalid persistence/imports, keyboard, reduced motion, context/texture failure, touch scroll, real draw-loop pause, responsive widths, no-JS editorial content, metadata/route integrity and axe scans.
- [audit-site.mjs](scripts/audit-site.mjs) checks successful routes, visible headings, images, internal links, metadata endpoints, console/page errors and failed requests.
- [measure-performance.mjs](scripts/measure-performance.mjs) records real browser lab timings, resource bytes and graphics-chunk isolation under documented throttling. No field INP claim.
- The production server binds localhost:4324. Public deployment requires separate authorization and a real `SITE_URL`; the local preview's robots configuration disallows indexing.
