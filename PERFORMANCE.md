# Performance budget and measurement protocol

These are engineering targets, not claimed results. Final laboratory measurements are recorded in the verification report and generated JSON.

## Budgets

- Home LCP <= 2,500 ms under the documented mobile laboratory profile.
- CLS <= 0.10 on home, atlas, comparison and mission pages.
- Non-3D editorial initial transferred JavaScript <= 300 KiB (compressed network bytes; prefetch reported separately where possible).
- First atlas transferred JavaScript <= 750 KiB. Only the atlas mounts the renderer.
- Initial home image payload <= 250 KiB; local texture files <= 300 KiB each.
- Canvas DPR <= 1.5; no postprocessing/shadow maps; demand rendering while static; no rendering while hidden/offscreen.
- No field INP claim. Event durations / laboratory click-to-paint probes are not field INP.

## Laboratory protocol

- Local **production** server (`next build`, then `next start`), not development.
- Chrome controlled by Playwright, real browser binary; version recorded per run.
- Actual host OS/CPU/RAM recorded by the measurement script.
- Mobile viewport 390 x 844, DPR 1; 4x CPU throttle, 1.6 Mbit/s download, 750 Kbit/s upload, 150 ms added latency using Chrome DevTools Protocol.
- Three independent browser contexts / cold cache per home route. Warm local server and image optimizer are stated explicitly. No CDN, geographic latency, field traffic or emulation of mobile GPU hardware.
- PerformanceObserver records LCP and layout shifts (excluding shifts following recent input). Resource Timing records transferred assets; a fixed post-load observation window includes actual lazy imports, not an artificial product loading delay.
- Atlas interactivity and WebGL fallback are tested separately. A reduced-motion run can confirm a stable visual layout without treating animation as required work.

## Architectural controls

The home and field-guide routes use static local images. The Three.js/Fiber/Drei renderer is imported only by a Client Component in the atlas. The UI renders before textures. The graphics scene uses 80 x 48 sphere segments, moderate local textures, local ring alpha, capped DPR, paused invalidation and explicit resource cleanup. The system diagram has simple colored spheres rather than fetching every planetary texture.

Locally hosted font subsets avoid runtime font-provider requests. Eager imagery is limited to above-the-fold planet portraits; lower-page images are lazy. Dimensions are reserved. GSAP imports progressively into editorial wrappers, whose content is readable before animation code executes.

Dependencies with heavy graphics code must not appear in the network requests of a fresh comparison or expedition visit. Internal Next.js link prefetching is reported if it changes transfer measurements.
