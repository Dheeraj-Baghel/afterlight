# AFTERLIGHT — deployment

The user explicitly asked for the GitHub push and Vercel deployment (26 October 2026).

- **Live site:** https://afterlight-softtech10.vercel.app
- **GitHub repository:** https://github.com/Dheeraj-Baghel/afterlight — **private**
  (same default as the other workspace apps).
- **Production branch:** `main`, connected to Vercel's GitHub integration; every push
  to `main` deploys to production automatically.
- **Vercel project:** `afterlight-softtech10`, existing `softtech10` Hobby scope
  (personal/non-commercial use; free-tier quotas apply).

## Build and environment

- Framework **Next.js**, Node **24.x** (package `engines` and Vercel project setting).
- Root Directory: repository root. Install **`npm ci`**, build **`npm run build`**.
- Production-only variable: `SITE_URL=https://afterlight-softtech10.vercel.app`
  (metadata base, canonical/OG URLs, sitemap and robots). Not a secret.
- No secrets, backend, database, API provider, paid upgrade or add-on.
- Git excludes `node_modules`, `.next`, `.env*` (except the example) and `.vercel/`.
  `.vercelignore` keeps screenshots, test reports and Markdown docs out of build uploads.

## Issues fixed during the first deployment

1. **Blocked build:** the first commits used the Mac's local hostname email, which
   Vercel Hobby could not match to the GitHub account. The commits were re-authored
   with the GitHub noreply address (repository-local git config) and force-pushed
   before anything else depended on them.
2. **`npm ci` failure on Linux:** the macOS-generated lockfile was missing
   `@emnapi/core` / `@emnapi/runtime` records needed by optional WebAssembly packages.
   The lockfile was regenerated from `package.json` alone (direct dependency versions
   unchanged; some transitive patch versions moved). Locally a clean `npm ci`, lint,
   typecheck, 42 unit tests and production build passed before pushing; Vercel then
   installed 482 packages and built all 27 static pages.

## Live verification (anonymous, no Vercel login or bypass token)

- **32/32 Playwright browser tests passed** against the public URL
  (`TEST_BASE_URL=https://afterlight-softtech10.vercel.app npx playwright test`):
  journeys, URL-restored state, comparison, missions, expedition import/export and
  recovery, responsive layouts, touch, reflow, axe scans, WebGL rendering pause/resume,
  no-JavaScript server rendering and texture-loading resilience.
- HTTP: all 21 sitemap URLs return 200; unknown routes 404; all 26 public fonts,
  images, textures and licence files return 200; security headers (nosniff,
  referrer, permissions, X-Frame-Options DENY, HSTS) present; robots allows `/`
  and disallows `/expedition`; OG image points at the production origin.

Not verified: real Safari/Firefox, physical phones/GPUs, field performance (INP)
and manual screen-reader review.

## Updating

Commit and push to `main` from this folder; Vercel deploys automatically. Run
`npm run verify` first. Expedition data is browser-local, so notes saved on
`127.0.0.1:4324` do not appear on the live origin — use the in-app JSON
export/import to move them.