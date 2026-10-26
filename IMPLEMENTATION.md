# AFTERLIGHT implementation checklist

Independent Next.js application. No deployment is authorized. Existing workspace projects must remain unchanged.

## Product and visual direction
An observatory field journal: ink-blue atlas, warm-paper editorial pages, oversized planetary imagery, fine rules, orange wayfinding. Promise: **Find your next world.** Scientific records are sourced; scene scales and lighting are illustrative; personal expeditions are fictional and device-local.

## Outcomes
- [x] Inspect repository instructions and verify a stable, compatible dependency set.
- [x] Establish typed, dated planet and mission records and a rights-checked local asset manifest.
- [x] Complete home -> atlas -> world -> saved expedition vertical slice; production journey verified.
- [x] Implement URL-driven comparison and mission archive/detail routes.
- [x] Implement validated local persistence, notes, reorder, recovery, import preview and export.
- [x] Add progressively loaded R3F scene, 2D/WebGL fallback, motion preference and restrained editorial animation.
- [x] Verify clean installation, 42 unit tests, strict types, production build and 32 production browser tests with no skips/failures/retries.
- [x] Inspect desktop/mobile representative screenshots; responsive five-width and axe checks pass. Measure and fix the observed comparison layout shift.
- [x] Deliver a running local production preview, architecture/setup documentation and evidence-backed verification report.

## State contract
- URL: atlas selection/view/search/category, comparison planets/units, mission search/filters/sort.
- Versioned local storage: expedition destinations/order/notes and motion preference; corrupt data is never silently overwritten.
- Component state: dialogs, import previews, camera controls, transient status.
- Derived state: filtered results, comparison measurements and counts.

## Motion ownership
R3F owns scene transforms/rendering. GSAP owns selected editorial reveals. Motion owns interface transitions/layout. CSS owns hover/focus/color. Native scroll; no exit-animation navigation delays.

## Final verification
32 production browser tests pass, including keyboard operation, exact import/export, failure recovery, actual clipboard, no-JS editorial/compare content, blocked-texture responsiveness, touch scroll and actual WebGL draw-loop pause. The site audit checked 23 route visits and 61 internal URLs with no errors. All 25 scientific source URLs returned HTTP 200; factual review is separate. Nine axe surfaces have zero detected violations. Initial comparison CLS of 0.461 was fixed by request-rendering the selected comparison; the final value is 0.000708. An asynchronous texture-material issue was found by image-difference tests and fixed; final screenshots were inspected. Clean-lockfile installation passed after reconciling an optional transitive entry. Final mobile-profile home LCP median is 0.836 s; non-3D and atlas transfer budgets pass. These are lab observations, not field INP or real-device certification. See VERIFICATION.md for raw evidence and remaining limitations. No deployment; production preview runs on localhost:4324.
