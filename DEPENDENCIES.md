# Dependency verification

Verified 2026-10-17 against the npm registry's stable dist-tags and official documentation **before installation**. Node on this machine: 24.13.0. No canary packages, no peer-dependency bypass flags.

- Next 16.4.2: Node >=20.9, supports React 19. [Official installation](https://nextjs.org/docs/app/getting-started/installation).
- React / React DOM 19.3.1. R3F 9.8.2 explicitly accepts React >=19 <19.4; Drei 10.7.9 accepts React 19, Fiber 9 and Three >=0.159. Three 0.186.1. [R3F installation](https://r3f.docs.pmnd.rs/getting-started/installation).
- Tailwind / PostCSS plugin 4.3.3. [Next CSS setup](https://nextjs.org/docs/app/getting-started/css).
- GSAP 3.15.0 with ScrollTrigger; Motion 14.3.0 accepts React 18 or 19. [Motion installation](https://motion.dev/docs/react-installation), [GSAP context cleanup](https://gsap.com/docs/v3/GSAP/gsap.context/).
- Radix Dialog 1.3.1; Lucide React 1.59.0.
- Playwright 1.64.1 needs Node >=20. Vitest 5.0.5 supports Node 24. ESLint 9.39.5 meets eslint-config-next 16.4.2's >=9 peer range.
- axe-core's Playwright integration 4.14.0 was verified separately in the registry before adding it for browser accessibility checks; it accepts playwright-core >=1.0.0.
- ESLint 10.13.0 is the newer stable major, but the installed `eslint-plugin-react` explicitly supports only through ESLint 9.7-compatible releases. ESLint 9.39.5 is therefore intentionally pinned despite its upstream deprecation warning. No `--force` / legacy peer resolution was used.
- TypeScript deliberately pinned to the mature stable 5.9.3 line rather than newly released 7.0.2; it meets Next's TypeScript requirements and the strict compiler is part of verification.
- Browser-only dynamic imports are contained in a Client Component; `ssr: false` is not used in Server Components. [Next lazy-loading contract](https://nextjs.org/docs/app/guides/lazy-loading).

All direct versions are exact. The dependency lockfile records the complete resolved set. See the verification report for the actual clean-install, build and audit outcomes; compatibility declarations alone are not test results.

## Audit caveat

The production-only audit reports **zero known vulnerabilities**. The full development graph reports **five high-severity entries** in a single `eslint-config-next -> @next/eslint-plugin-next -> fast-glob -> micromatch -> braces` chain (GHSA-vfj7-8cjw-p6xm, deeply nested glob denial of service). The registry's latest braces was still 3.0.3 when checked. npm's proposed automated fix downgrades Next's lint configuration across major versions; it was not applied. This affects development glob parsing, not shipped application runtime code. Treat unknown lint patterns as untrusted and revisit when a compatible upstream patch ships. The raw audit JSON is retained with verification artifacts.