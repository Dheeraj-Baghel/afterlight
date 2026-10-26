# AFTERLIGHT — implementation and verification report

## Delivery

A complete independent Next.js App Router application is running in **production mode** at [http://127.0.0.1:4324](http://127.0.0.1:4324). No public deployment, account, payment, backend or credential is involved. Other workspace applications were left unchanged.

The product includes the complete six-section homepage; eight-world textured 3D atlas and 2D alternative; eight distinct planet guides; two/three-world comparison; eight source-backed mission records with three substantial features; local expedition notes/reorder/import/export/recovery; methodology; metadata; sitemap/robots; accessible navigation; real 404s and recoverable error states.

**Final status (2026-10-18):** clean lockfile install, lint, strict types, **42 unit tests**, production build and **32 production browser tests** passed. The browser run had **0 skips, 0 unexpected failures and 0 flaky results**, with retries disabled. Source-link and site audits passed. The documented laboratory timing, layout-stability and transfer budgets were met. Production preview remains running locally; no deployment occurred.

## Environment and reproducibility

- Node **24.13.0**, npm **11.6.2**.
- Next **16.4.2**, React **19.3.1**, TypeScript **5.9.3**; exact direct versions and lockfile.
- Real Google Chrome **155.0.8059.80**, controlled by Playwright **1.64.1**.
- Apple M1, 8 logical CPUs, 8 GiB RAM, macOS **27.2**.
- All final browser journeys use `next build` + `next start`, not the development server.
- Tests use fresh browser contexts, temporary downloaded JSON and synthetic personal notes. No external account or service is mocked as a real backend; the application needs none.

Commands are in the [README](README.md). [Dependency decisions](DEPENDENCIES.md), [architecture](ARCHITECTURE.md), [scientific review](SOURCES.md) and [performance methodology](PERFORMANCE.md) document the boundaries.

## Build and logic checks

| Check | Result | Evidence |
| --- | --- | --- |
| `npm ci --no-fund` | Pass | [Clean-install log](artifacts/testing/build/clean-install.log) |
| ESLint | Pass, no lint errors/warnings | [Lint log](artifacts/testing/build/lint.log) |
| Strict TypeScript | Pass | [Typecheck log](artifacts/testing/build/typecheck.log) |
| Vitest | **42 passed** | [Unit log](artifacts/testing/build/unit.log) |
| Production build | Pass | [Build log](artifacts/testing/build/build.log) |
| Production dependency audit | **0 known vulnerabilities** | [Production audit](artifacts/testing/audit-production.json) |
| Full development dependency audit | 5 high-severity entries in one lint-tool dependency chain; not resolved | [Full audit](artifacts/testing/audit-full.json), [explanation](DEPENDENCIES.md) |

Unit tests cover exact conversion semantics, retrograde sign handling, filtering/sorting, query normalization and maximums, safe return URLs, import schemas and byte limits, duplicate/unknown identifiers, note limits, untrusted markup, reorder continuity, merge preservation and serialization round-trips. Content checks verify record counts, source/date fields, timeline ordering, mission links and local assets.

The first clean-install attempt exposed an inconsistent optional transitive lock entry for `@emnapi/wasi-threads`. The lockfile was reconciled using npm, then a real clean install succeeded. No `--force` or legacy peer-dependency bypass was used. The latest compatible ESLint 9 emits an upstream deprecation message at install time; ESLint 10 is outside the current React plugin's declared peer range.

## Production browser journeys

The [Playwright JSON](artifacts/testing/playwright-results.json) and [HTML report](artifacts/testing/playwright-report/index.html) are the authoritative full-run results: **32 passed**. The suite covers:

1. Home → atlas → Saturn → detail → atlas; category/selection restored; back and forward restore discrete selections.
2. Direct shared atlas URLs restore selected planet, query, category, list mode and comparison list.
3. Earth/Mars/Neptune comparison; duplicate options disabled, fourth world explicitly rejected in atlas; replace/remove/reset and units survive reload.
4. Mission query/destination/type/sort survive opening and returning from a story, reload and browser history; no-results recovery works.
5. Saving three worlds, notes, accessible reordering, reload, removal and undo preserve the correct destination/note association.
6. Actual JSON download → clear confirmation/cancel → clear → import preview → replace restores exact order and notes. Merge preserves existing notes/order and appends new worlds.
7. Malformed JSON, oversized files, unknown identifiers, duplicates and unsupported versions produce useful errors **without changing current data**. Imported HTML is text, not DOM or executable code.
8. Corrupt storage preserves original bytes, offers their actual download, requires explicit reset; blocked storage and quota failure retain a recoverable in-tab draft and offer retry/export.
9. Reduced motion freezes automatic movement while rotation buttons, saving and list navigation remain functional. Preferences persist; dialogs close with Escape and return focus.
10. WebGL unavailable, failed textures and actual `WEBGL_lose_context` injection retain a poster/HTML interface and permit recovery. Textured render rotation/zoom/pause is checked by real canvas screenshots, not just button labels.
11. Keyboard-only selection, search, saving, comparison and dialog focus trapping; real clipboard copy; responsive teaser changes explanation and destination URL.
12. Widths **360, 390, 768, 1280 and 1536 px**: no accidental page overflow on primary routes; dialogs fit. Touch events over the canvas produce normal page scrolling. A **640 CSS-pixel viewport** exercises the reflow equivalent of a 1280-pixel desktop at 200% zoom.
13. All eight planet and eight mission routes, about, invalid query parameters and missing routes. Invalid paths return actual HTTP 404, not a streamed soft-404.
14. Actual WebGL draw counts stop when offscreen or when a hidden-document event is simulated, and resume on visibility. Essential home/world content and request-rendered comparison remain readable with JavaScript disabled.
15. A deliberately held-open texture request does not block HTML planet selection, saving or navigation to a complete world page. No simulated loading timer is used in the product.

The automated `visibilitychange` test simulates the browser visibility state; it is not a physical-device battery benchmark. Headless viewport reflow is not a direct test of Chrome's native zoom UI. These distinctions are intentional.

## Accessibility and route audit

[axe results](artifacts/testing/axe-results.json): **zero detected violations** across **nine surfaces** (eight routes plus the open preferences dialog), using WCAG 2 A/AA and 2.1 AA tags. These automated scans do not certify all WCAG criteria or replace a screen-reader/user evaluation.

[Site audit](artifacts/testing/site-audit.json): **23 route visits**, **61 internal URLs**, one visible primary heading per tested route, **0 broken internal links**, **0 broken images**, **0 page/console errors**, and **0 failed requests** during the ordinary route sweep. Sitemap, robots, manifest, icon, social image and asset manifest endpoints respond successfully. Deliberately injected texture failures are exercised separately and are not counted as unexplained normal-navigation network errors.

[Source-link check](artifacts/testing/source-links.json): **25 primary-source URLs returned HTTP 200**. Availability checking is separate from the factual review in [SOURCES.md](SOURCES.md). The asset manifest records 23 local derived/third-party assets plus original artwork and icon-library licensing. The modified IBM font's internal family was inspected as `AFTERLIGHT Journal Mono`, preserving original OFL copyright/license and avoiding its reserved name.

## Laboratory performance

The final preload-inclusive [performance JSON](artifacts/testing/performance.json) is the raw evidence. It records every measured resource, initiator, transfer/encoded size, errors, LCP element, layout shifts, long tasks, browser version, host and profile. Fonts and preloaded images are local.

**Profile:** production server on this Mac; 390 × 844 CSS pixels; DPR 1; 4× CPU throttle; CDP 1.6 Mbit/s download, 750 Kbit/s upload, 150 ms added latency; new context and disabled browser cache for each run. The local server and image optimizer are warmed. The home is measured three times; the other routes once each. Initial resource totals include any actual Next.js prefetch during the observation window.

| Route / profile | LCP | CLS | Transferred JavaScript | Transferred images |
| --- | --- | --- | --- | --- |
| Home, median of 3 cold contexts | **0.836 s** (range 0.836–0.840) | 0.000039 | 287.0 KiB | 34.0 KiB |
| Saturn atlas | **0.824 s** | 0.000505 | 508.7 KiB | 46.6 KiB |
| Earth / Mars / Neptune comparison | **0.836 s** | 0.000708 | 258.4 KiB | 11.7 KiB |
| Cassini story | **0.844 s** | 0.000388 | 247.2 KiB | 6.0 KiB |

Resource totals include preloaded images/scripts even when Resource Timing labels their initiator as `link`, plus any initial prefetch. Targets were LCP ≤2.5 s, CLS ≤0.1, non-3D initial JavaScript ≤300 KiB and atlas JavaScript ≤750 KiB; all measured cases met them. Home image transfer was below the 250 KiB budget; each local scene texture is below 300 KiB. These are **laboratory results**, not real-user field guarantees. LCP here is the useful poster/editorial content, not a claim that the entire 3D scene is ready at that timestamp.

The emitted heavy renderer chunk was requested by the atlas and **not** requested on fresh home, comparison or mission-detail visits. The static scene uses demand rendering; draw-counter tests verify offscreen/hidden suspension. The homepage's initially measured 304 KiB script payload fell to 287 KiB after deferring offscreen editorial imports (both figures rounded; the final aggregation includes preloads).

**No field INP is claimed.** The raw report includes an automation click-to-visible-heading duration that contains Playwright transport, actionability/scrolling and assertion overhead; it is not INP and is not used to claim a sub-200 ms field result. This host is not an isolated benchmark machine; other pre-existing workspace applications were not stopped. CDP throttling is not an emulation of a mobile GPU or a geographically distant CDN.

## Failures found and corrected

- A decorative orbit pseudo-element extended over atlas filters and intercepted clicks; it now ignores pointer input and is clipped inside the stage.
- Client-only fallback return links could be clicked before query hydration and lose the mission filters; validated return links now come from the server.
- Router-transition timing dropped characters during very rapid controlled search; synchronous URL subscriptions fixed it without duplicating query state.
- A root loading boundary committed a 200 before invalid dynamic slugs were checked; loading is now scoped appropriately and all tested missing routes return 404.
- A ring alpha-compositing bug erased part of the static Saturn globe; proper source-over composition fixed the poster, and the cached image derivatives were regenerated.
- An asynchronously applied map did not always rebuild a material compiled without a texture; keyed material recreation fixed the visibly white globe. Final textured Saturn was visually inspected.
- Comparison CLS initially measured about **0.461** when selected content replaced a client fallback. Request-rendering the URL state reduced the measured value below **0.001**.
- Initial editorial JavaScript marginally exceeded the 300 KiB budget. Offscreen ScrollTrigger code now loads only near the relevant chapter, and the opening imports GSAP core alone.
- Reduced-motion dialogs no longer fade through a low-contrast intermediate state. The final automated dialog scan passes.

## Screenshot inspection

Representative images were captured in production mode, then inspected rather than merely generated:

- [Desktop homepage](artifacts/screenshots/home-desktop.png) and [desktop opening](artifacts/screenshots/home-desktop-opening.png)
- [Mobile homepage](artifacts/screenshots/home-mobile.png) and [mobile opening](artifacts/screenshots/home-mobile-opening.png)
- [Tablet homepage](artifacts/screenshots/home-tablet.png)
- [Selected Saturn atlas](artifacts/screenshots/atlas-saturn.png) and [mobile atlas](artifacts/screenshots/atlas-mobile.png)
- [Comparison](artifacts/screenshots/comparison.png) and [mobile comparison](artifacts/screenshots/comparison-mobile.png)
- [Cassini detail](artifacts/screenshots/mission-cassini.png)
- [Expedition with notes](artifacts/screenshots/expedition-notes.png)

Observed ring artifacts and a crowded mobile caption were corrected. Desktop, phone and tablet compositions are intentionally different. The comparison's narrow-screen table scrolls within its labeled region, not the whole page.

## Known limits and what was not verified

- Browser automation covers Chrome on macOS, not Safari/Firefox, a real phone GPU, VoiceOver/NVDA, or native browser-toolbar 200% zoom. Equivalent viewport reflow, touch emulation and keyboard operation were checked.
- The historical science snapshot is dated; this is not a live mission/weather/ephemeris service. Scientific source uncertainties take precedence over rounded display values.
- Images, lighting, rotation and system spacing are illustrative. Planetary size diagrams use proportional mean diameters only where explicitly labeled. No real travel, orbital mechanics, habitability verdict or agency endorsement is implied.
- LocalStorage is device/browser-local, finite and removable. A denied/full store cannot make data durable; export is the recovery mechanism. Undo is page-local. Two simultaneously editing tabs do not have collaborative conflict resolution.
- No offline service worker is installed. Local assets eliminate fragile third-party runtime requests, but a server connection is still needed to visit uncached routes.
- Five development-only audit entries remain in the Next lint dependency chain; the production dependency graph is clean. This is disclosed, not bypassed by a major-version downgrade.
- The real unexpected-server-error boundary is implemented but not exercised by intentionally shipping a failing production route. The explicitly required route/query/texture/WebGL/storage/import failure cases are exercised.
- No public deployment, DNS, hosting, real-user field metrics or load-at-scale claims. The application is left running locally for review.

No benchmark score is assigned. The source and evidence are provided for independent evaluation.
