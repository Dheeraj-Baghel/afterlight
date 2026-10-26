# Scientific provenance and editorial review

Content snapshot reviewed **2026-10-17**. Later automated URL-availability checks carry their own actual timestamps in [source-links.json](artifacts/testing/source-links.json). A successful HTTP response is **not**, by itself, a verification of a scientific statement.

## Quantitative data

The eight records in [planets.ts](src/data/planets.ts) transcribe the following columns from [NASA/JPL Solar System Dynamics — Planetary Physical Parameters](https://ssd.jpl.nasa.gov/planets/phys_par.html):

- Volumetric mean radius, km: Mercury 2439.4; Venus 6051.8; Earth 6371.0084; Mars 3389.50; Jupiter 69911; Saturn 58232; Uranus 25362; Neptune 24622.
- Mass in 10²⁴ kg and bulk density in g/cm³, with displayed precision deliberately rounded.
- Signed sidereal rotation in Earth days. Venus and Uranus retain negative source signs; the UI displays a magnitude and an explicit retrograde label.
- Sidereal orbital period in source-table years. No calendar-date propagation or ephemeris is calculated.

The actual source table was fetched and its columns/definitions inspected during implementation. Mean radius is the equivalent-volume-sphere radius; equatorial radius is a separate column and is not used for size comparisons. JPL's listed uncertainties and references remain at the original source; the app is a field guide, not engineering ephemeris data.

[NASA Planetary Fact Sheet notes](https://nssdc.gsfc.nasa.gov/planetary/factsheet/planetfact_notes.html) support the explanation of sidereal rotation vs solar day and pressure-level vs surface definitions. The app does **not** manufacture a universal temperature ranking, updated moon counts, live weather, precise future flight dates or an unknown scientific value to fill a card.

Conversion: international miles use exactly 1.609344 km per mile, verified against [NIST's SI conversion table](https://www.nist.gov/pml/special-publication-811/nist-guide-si-appendix-b-conversion-factors/nist-guide-si-appendix-b8), not the former US survey mile; one Earth day converts to 24 hours. Radius ratios also equal diameter ratios. The source-signed direction is never lost in the record. Unit tests exercise the transformations separately from rendering.

## Planet editorial sources

Every record links its own [NASA Science planet facts](https://science.nasa.gov/solar-system/) page, plus the quantitative table and definition notes:

- [Mercury](https://science.nasa.gov/mercury/facts/): cratered terrain, exosphere, polar ice, contraction scarps, 3:2 spin/orbit relationship and approximately 176-Earth-day solar day.
- [Venus](https://science.nasa.gov/venus/facts/): dense CO₂ atmosphere, sulfuric-acid clouds, greenhouse heating, retrograde rotation and distinction between a roughly 243-day sidereal turn and roughly 117-day solar day.
- [Earth](https://science.nasa.gov/earth/facts/): oceans, nitrogen/oxygen atmosphere, active geology and the only confirmed life-bearing world. A sidereal rotation is about 23 h 56 m, not the 24 h mean solar day.
- [Mars](https://science.nasa.gov/mars/facts/): thin atmosphere, iron-rich dust, geological scale, water-formed landscapes. [Perseverance](https://science.nasa.gov/mission/mars-2020-perseverance/) supports Jezero context; habitability is explicitly not claimed to be life detection.
- [Jupiter](https://science.nasa.gov/jupiter/facts/): mass, gas composition, lack of a solid surface, weather bands and Great Red Spot. No fixed modern storm diameter is asserted.
- [Saturn](https://science.nasa.gov/saturn/facts/): gas composition, low bulk density, rings composed of particles and distinction between planet and ring radius. [Cassini](https://science.nasa.gov/mission/cassini/) supplies the exploration context.
- [Uranus](https://science.nasa.gov/uranus/facts/): near-sideways tilt, methane, ice-giant terminology and long seasons.
- [Neptune](https://science.nasa.gov/neptune/facts/): changing storms, winds, composition and long orbital period. The texture is explicitly not calibrated color or current weather.

## Mission records

[missions.ts](src/data/missions.ts) contains eight coherent historical records, not a live-status service. The three longer editorial features are Cassini–Huygens, Voyager 2 and Perseverance. Source URLs, verification dates, chronologically ordered milestones, agencies, destinations, launch dates and type are stored with each record.

- [Mariner 10](https://science.nasa.gov/mission/mariner-10/): 1973-11-03 launch; 1974-02-05 Venus flyby; 1974-03-29 first Mercury flyby; 1975-03-16 third Mercury flyby.
- [MESSENGER](https://science.nasa.gov/mission/messenger/): 2004-08-03 launch; 2011-03-18 UTC orbit insertion (March 17 in US civil time); 2015-04-30 final impact.
- [Magellan](https://science.nasa.gov/mission/magellan/) and [NASA PDS archive](https://pds-imaging.jpl.nasa.gov/portal/magellan_mission.html): 1989-05-04 launch; 1990-08-10 arrival; 1994-10-13 UTC loss of contact. A preliminary search result gave October 12; primary-source checking corrected it before release.
- [Voyager fact sheet](https://science.nasa.gov/mission/voyager/fact-sheet/): Voyager 2 launch 1977-08-20; Jupiter 1979-07-09; Saturn 1981-08-25; Uranus 1986-01-24; Neptune 1989-08-25.
- [Cassini quick facts](https://science.nasa.gov/mission/cassini/quick-facts/) and [ESA Cassini–Huygens](https://www.esa.int/Science_Exploration/Space_Science/Cassini-Huygens_overview): 1997-10-15 launch; 2004-07-01 UTC Saturn orbit; 2005-01-14 Huygens Titan landing; 2017-09-15 deliberate final entry.
- [New Horizons](https://science.nasa.gov/mission/new-horizons/): 2006-01-19 launch; 2007-02-28 Jupiter assist; 2015-07-14 **flyby**, not orbit insertion, of Pluto; 2019-01-01 Arrokoth flyby. Pluto remains explicitly a dwarf planet outside the eight-world index.
- [Juno](https://science.nasa.gov/mission/juno/) and [orbit-insertion release](https://www.nasa.gov/news-release/nasas-juno-spacecraft-in-orbit-around-mighty-jupiter/): 2011-08-05 launch; 2016-07-05 UTC Jupiter insertion (July 4 US Pacific); Ganymede 2021-06-07; Europa 2022-09-29. No unverified current operating-status badge.
- [Mars 2020](https://science.nasa.gov/mission/mars-2020-perseverance/), [Ingenuity](https://science.nasa.gov/mission/mars-2020-perseverance/ingenuity-mars-helicopter/) and [NASA first-sample release](https://www.nasa.gov/news-release/nasas-perseverance-rover-collects-first-mars-rock-sample/): 2020-07-30 launch; 2021-02-18 landing; 2021-04-19 first powered controlled flight on another planet; first successful core sealed 2021-09-06. The news release was published September 7 but describes September 6 collection. A JPL mirror rejected automated requests with 403, so the record uses the equivalent official NASA release.

“Earth” is not treated as a destination filter for every launch. Additional moon and small-body destinations are named but are not counterfeit planet pages. Links in timelines and prose do not imply endorsement by an agency. No fabricated quotations are used.

## Images, textures and fonts

The app deliberately uses **no unverified NASA image-credit assumption**. The local planetary maps come from [Solar System Scope's explicit CC BY 4.0 library](https://www.solarsystemscope.com/textures/). Its actual page states: “You may use, adapt, and share these textures for any purpose, even commercially.” The [license](https://creativecommons.org/licenses/by/4.0/) requires attribution, license link and disclosure of changes; all appear in the app and [asset manifest](asset-manifest.json).

Original maps are 2048 x 1024; local scene maps are 1536 x 768 WebP. Portraits are illustrative orthographic projections with lighting and, for Saturn, schematic ring compositing. They are **not spacecraft photographs**, true-color standards, or scientific camera products. Rings have a separate licensed alpha/color map. The comparison portrait of Saturn excludes rings.

Instrument Serif, DM Sans and IBM Plex Mono are sourced from Google Fonts' upstream repository with the original OFL texts. The Latin-only IBM derivative is internally renamed **AFTERLIGHT Journal Mono** because “Plex” is a Reserved Font Name; see the [official OFL webfont guidance](https://openfontlicense.org/webfonts-and-reserved-font-names/). Original copyright and attribution remain. The application still uses three type families, with Instrument Serif normal and italic as one family.

Local filenames, source URLs, creators, licenses, required attribution, modifications, byte sizes and SHA-256 values are in the manifest. Generated assets can be reproduced with [prepare-assets.py](scripts/prepare-assets.py); they are committed runtime assets and require no external downloads during normal browsing.
