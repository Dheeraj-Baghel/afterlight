# AFTERLIGHT — An Interactive Atlas of Worlds

**Find your next world.**

A complete, standalone Next.js application: an independent digital observatory with a progressively enhanced 3D atlas, eight planetary field guides, a comparison workspace, eight mission stories, and a browser-local expedition journal. Ink-blue observation spaces meet a warm-paper editorial system. No account, backend, API key or paid service is required.

**Live site:** [https://afterlight-softtech10.vercel.app](https://afterlight-softtech10.vercel.app) · **Source (private):** [Dheeraj-Baghel/afterlight](https://github.com/Dheeraj-Baghel/afterlight) · **Local preview:** [http://127.0.0.1:4324](http://127.0.0.1:4324). See [deployment notes](DEPLOYMENT.md).

The brand and personal expeditions are fictional. Planetary facts and historical mission milestones have primary-source references. Visual lighting, colors, ring proportions and system distances are clearly illustrative. AFTERLIGHT does not offer space travel or imply agency endorsement.

## Run locally

Use **Node 24** (validated with 24.13.0) and npm. Work from this application folder, not the workspace root.

```sh
npm ci
npm run dev
```

Development binds **127.0.0.1:4324**. To run the production application instead, stop the development server on that port, then:

```sh
npm run build
npm run start
```

No environment file is needed. [The environment example](.env.example) documents the optional `SITE_URL`, which defaults to the local preview. With the user's authorization the site is deployed on Vercel, where production sets `SITE_URL=https://afterlight-softtech10.vercel.app`. The local robots configuration blocks indexing; the public origin enables ordinary crawling except the personal expedition route.

## What is included

- **Home:** an immediate local Saturn poster, complete eight-world index, live size-comparison teaser, Cassini editorial feature and encounter diagram, honest expedition preview and sourcing note.
- **Atlas:** real Three.js through React Three Fiber; textured planetary focus and schematic system modes; accessible selection, mouse rotation, HTML rotate/zoom/reset, pause/resume, name search, planet-class filters, save/unsave, comparison selection and permanent 2D alternative. Renderer, texture and context failures retain a useful fallback.
- **Planet guides:** eight distinct narratives, precise measurement definitions, proportional size inset, environment, phenomenon, relevant missions, source references, save/compare, previous/next and a preserved atlas return URL.
- **Compare:** two or three unique worlds, add/replace/remove, proportional mean-diameter diagram, semantic mobile-scrollable table, kilometre/mile and hour/day conversion, contextual explanation, reset and share URL.
- **Missions:** eight local verified records, three substantial features, text/destination/type filters, sorting, result counts, no-results recovery, historical timelines and preserved archive returns. No fragile live API or undated operating-status claims.
- **Expedition:** saving, accessible move-up/down, plain-text notes, remove/clear with recovery, actual JSON download, runtime-validated file import with merge/replace preview, corrupt-storage preservation and explicit write-failure recovery.
- **Application shell:** responsive navigation, keyboard-focus-managed Radix dialogs, motion preferences, useful real 404s, atlas route loading, recoverable error boundaries, page metadata, social image, sitemap and robots configuration.

## Routes and shareable examples

- [Home](http://127.0.0.1:4324/)
- [Saturn, filtered to gas giants](http://127.0.0.1:4324/atlas?world=saturn&group=gas)
- [Neptune in the 2D ice-giant index](http://127.0.0.1:4324/atlas?world=neptune&group=ice&view=list)
- [Saturn field guide](http://127.0.0.1:4324/worlds/saturn)
- [Earth / Mars / Neptune comparison](http://127.0.0.1:4324/compare?worlds=earth,mars,neptune)
- [Mission archive](http://127.0.0.1:4324/missions)
- [Cassini–Huygens story](http://127.0.0.1:4324/missions/cassini-huygens)
- [Your local expedition](http://127.0.0.1:4324/expedition)
- [About, methodology and credits](http://127.0.0.1:4324/about)

Search input replaces the current URL entry; meaningful discrete choices push an entry. Browser back/forward and reload restore state. Shared URLs never include private expedition notes.

## Verification commands

```sh
npm run lint
npm run typecheck
npm run test
npm run build
npm run start
# In another terminal, against that production server:
npm run test:e2e
node scripts/audit-site.mjs
node scripts/measure-performance.mjs
node scripts/check-sources.mjs
```

`npm run verify` combines lint, strict types, unit tests and production build. Playwright uses **Google Chrome** via `channel: 'chrome'`; install Chrome if it is unavailable. It can start a prebuilt production server automatically if the port is free. Do not leave a development server on 4324 for final verification. To use an already-running different local server, set `TEST_BASE_URL` for Playwright; the audit/performance scripts intentionally target the documented local production origin.

Test results, environment, performance profiles, screenshots and honest limitations are recorded in [VERIFICATION.md](VERIFICATION.md). No field INP or self-awarded benchmark score is claimed.

## Persistence: important boundaries

The expedition is stored under `afterlight.expedition.v1` in **this browser's localStorage**, and motion preferences under `afterlight.preferences.v1`. It does not sync through a server or across devices. Clearing browser data clears it. A healthy store follows local `storage` events between open tabs, but this is not a cloud service or conflict-resolved collaboration.

- Export creates a version-1 JSON file containing order and notes.
- Import permits at most 32 KB, eight unique known worlds and 600 characters per note.
- **Merge** keeps current order and existing notes, then appends only new worlds in imported order.
- **Replace** exactly restores imported order and notes.
- Clear/removal/import have one-step undo while you remain on the journal page.
- Corrupt original data is not silently overwritten; download it or explicitly reset it.
- If storage is unavailable/full, the working copy remains in this tab and can be exported. It will not survive a reload unless saved or exported.

Nothing is uploaded. Imported strings are never executed or interpreted as HTML. Read the full [architecture](ARCHITECTURE.md) for the state and validation contracts.

## Engineering and design

- Next.js App Router, React 19, strict TypeScript, Tailwind 4 and CSS token primitives.
- React Three Fiber + Drei own rendering. GSAP/ScrollTrigger own selected editorial sequences. Motion owns UI state/layout transitions. CSS owns ordinary hover/focus/color feedback.
- Server-prepared local content; request-rendered URL workspaces to avoid late layout replacement. Only the atlas dynamically loads the heavy renderer. Font/image assets are local.
- Three type families: Instrument Serif, DM Sans and an OFL-compliant renamed IBM Plex Mono derivative. No remote font calls.
- Native scrolling, capped DPR, demand rendering, offscreen/hidden suspension, resource cleanup and non-WebGL fallback.
- [Design tokens and responsive rules](src/app/globals.css), [dependency compatibility](DEPENDENCIES.md), [performance budgets](PERFORMANCE.md).

## Scientific records and asset rights

- [Planet dataset](src/data/planets.ts)
- [Mission dataset](src/data/missions.ts)
- [Scientific sourcing review](SOURCES.md)
- [Asset provenance, licensing and modifications](asset-manifest.json)
- [Local font license texts](public/licenses/)

The main experience needs no external requests. To **regenerate** local assets only, [prepare-assets.py](scripts/prepare-assets.py) needs Python 3, Pillow, NumPy, fontTools, system curl and network access. This is a development-only script, not a runtime requirement. It downloads the explicitly CC BY 4.0 Solar System Scope maps, generates local illustrations, retains font licenses and renames the modified IBM subset internally to respect its reserved name.

## Evidence gallery

- [Desktop home](artifacts/screenshots/home-desktop.png)
- [Mobile home](artifacts/screenshots/home-mobile.png)
- [Saturn atlas](artifacts/screenshots/atlas-saturn.png)
- [Comparison workspace](artifacts/screenshots/comparison.png)
- [Cassini mission story](artifacts/screenshots/mission-cassini.png)
- [Expedition with notes](artifacts/screenshots/expedition-notes.png)

## Project map

- [Application routes](src/app/)
- [Interactive components](src/components/)
- [Typed local content](src/data/)
- [Query, conversion and persistence logic](src/lib/)
- [Unit tests](tests/unit/)
- [Browser journey tests](tests/e2e/)
- [Verification artifacts](artifacts/testing/)
- [Implementation checklist](IMPLEMENTATION.md)

This project is independent of the existing workspace applications. They are neither deployed nor changed as part of AFTERLIGHT.
