import type { Planet, PlanetCategory, PlanetId, Source } from "@/lib/types";

// Scientific data snapshot checked against JPL's physical-parameters table on 2026-10-17.
// Radius is volumetric mean, not equatorial. Rotation is sidereal and signed.
// Colors/textures are interpretive; they are not calibrated true-color observations.
export const VERIFIED = "2026-10-17";
export const PARAMETER_SOURCE: Source = { title: "NASA / JPL — Planetary Physical Parameters", url: "https://ssd.jpl.nasa.gov/planets/phys_par.html" };
export const FACT_NOTES: Source = { title: "NASA — Planetary Fact Sheet definitions", url: "https://nssdc.gsfc.nasa.gov/planetary/factsheet/planetfact_notes.html" };
const sourcesFor = (id: string): Source[] => [
  { title: `NASA Science — ${id[0].toUpperCase()}${id.slice(1)} facts`, url: `https://science.nasa.gov/${id}/facts/` }, PARAMETER_SOURCE, FACT_NOTES
];
export const CATEGORY_LABELS: Record<PlanetCategory, string> = { terrestrial: "Terrestrial", gas: "Gas giant", ice: "Ice giant" };

export const planets: Planet[] = [
  {
    id: "mercury", name: "Mercury", order: 1, category: "terrestrial", color: "#b1a99c",
    headline: "Small world.\nLong mornings.", shortFact: "Three rotations for every two orbits.",
    introduction: "Closest to the Sun, Mercury is a rocky world of ancient craters and extraordinary contrasts. A very thin exosphere offers almost no shelter from sunlight — or from the cold of its long night.",
    meanRadiusKm: 2439.4, massE24Kg: 0.330103, densityGcm3: 5.4289, rotationDaysSigned: 58.6462, orbitalYears: 0.2408467,
    environment: { title: "A landscape written in impacts", paragraphs: ["Mercury's heavily cratered surface records billions of years of collisions. Long cliffs, called scarps, formed as the planet's interior cooled and its crust contracted.", "There is no thick atmosphere to move heat from day to night. Its tenuous exosphere contains atoms released from the surface by sunlight, the solar wind and micrometeoroids. Water ice can persist in permanently shadowed polar craters, far from the fierce light falling on nearby ground."] },
    phenomenon: { title: "A sunrise that takes its time", paragraphs: ["Mercury turns three times on its axis in the time it takes to complete two orbits. This 3:2 spin–orbit resonance, together with its eccentric orbit, makes a solar day very different from a rotation measured against the stars.", "One sidereal rotation takes about 58.65 Earth days; the interval between solar noons is about 176 Earth days. 'A day on Mercury' is therefore a question that needs a definition."] },
    surface: { kind: "solid", description: "Cratered rock; a thin exosphere, not a substantial atmosphere." },
    missions: ["mariner-10", "messenger"], sources: sourcesFor("mercury"), verified: VERIFIED
  },
  {
    id: "venus", name: "Venus", order: 2, category: "terrestrial", color: "#d7ae75",
    headline: "A familiar size.\nAn alien sky.", shortFact: "A rotation lasts longer than its year.",
    introduction: "Nearly Earth's size, Venus shows how differently a rocky world can evolve. Beneath bright clouds lies a volcanic landscape wrapped in a dense, heat-trapping atmosphere.",
    meanRadiusKm: 6051.8, massE24Kg: 4.86731, densityGcm3: 5.243, rotationDaysSigned: -243.018, orbitalYears: 0.61519726,
    environment: { title: "Under the cloud ceiling", paragraphs: ["Venus's atmosphere is mostly carbon dioxide, with clouds of sulfuric acid. Its powerful greenhouse effect makes it hotter at the surface than Mercury, despite being farther from the Sun.", "Visible light cannot reveal most of the ground through that cloud cover. Radar, including Magellan's observations, has mapped plains, mountains and volcanoes. A cloud-textured globe is a view of the atmosphere, not a photograph of the surface."] },
    phenomenon: { title: "The planet that turns the other way", paragraphs: ["Venus rotates retrograde: opposite to its direction of travel around the Sun. Its sidereal rotation takes about 243 Earth days, longer than its roughly 225-day orbit.", "That does not mean a solar day lasts 243 days. Because rotation and orbital motion work in opposite directions, successive solar noons are separated by about 117 Earth days. The signed rotation value in this atlas preserves that distinction."] },
    surface: { kind: "solid", description: "Volcanic rock beneath a dense carbon-dioxide atmosphere." },
    missions: ["mariner-10", "magellan"], sources: sourcesFor("venus"), verified: VERIFIED
  },
  {
    id: "earth", name: "Earth", order: 3, category: "terrestrial", color: "#88b5c6",
    headline: "The extraordinary\nworld we call home.", shortFact: "The only world known to support life.",
    introduction: "Earth is our reference point, not the solar system's default. Liquid surface oceans, an active rocky crust and a life-shaped atmosphere make this small world an exceptional place to begin.",
    meanRadiusKm: 6371.0084, massE24Kg: 5.97217, densityGcm3: 5.5134, rotationDaysSigned: 0.99726968, orbitalYears: 1.0000174,
    environment: { title: "A planet that keeps remaking itself", paragraphs: ["Earth's atmosphere is chiefly nitrogen and oxygen. Water moves between ocean, ice, land and air, while tectonic plates carry continents and recycle parts of the crust.", "These systems are connected rather than separate. Ocean and atmosphere redistribute heat; the carbon cycle links rocks, water and living things. Earth remains the only place where life has been confirmed."] },
    phenomenon: { title: "Our everyday unit is not quite one turn", paragraphs: ["A mean solar day is 24 hours. Earth completes a rotation relative to distant stars in about 23 hours 56 minutes. During that turn, it also moves along its orbit and must rotate a little farther for the Sun to return to the same direction.", "Throughout this atlas, rotation means sidereal rotation. The familiar solar day is explained separately, so comparisons do not quietly change the definition of time."] },
    surface: { kind: "solid", description: "Rock, liquid oceans and ice; a nitrogen–oxygen atmosphere." },
    missions: [], sources: sourcesFor("earth"), verified: VERIFIED
  },
  {
    id: "mars", name: "Mars", order: 4, category: "terrestrial", color: "#c98563",
    headline: "Follow the water.\nRead the rocks.", shortFact: "A cold desert with a wetter past.",
    introduction: "Mars is a world of rust-red dust, immense volcanoes and river-shaped landscapes. Its rocks preserve evidence of environments very different from the cold, dry planet we see today.",
    meanRadiusKm: 3389.5, massE24Kg: 0.641691, densityGcm3: 3.934, rotationDaysSigned: 1.02595676, orbitalYears: 1.8808476,
    environment: { title: "A thin sky over an immense landscape", paragraphs: ["The Martian atmosphere is thin and mostly carbon dioxide. Dust can be lifted into regional storms and, at times, storms that envelop much of the planet. Water is present as ice, including at the poles and beneath the ground.", "Olympus Mons and the Valles Marineris canyon system reveal the scale of Mars's geological history. Ancient river channels and lake deposits are evidence that liquid water once shaped parts of its surface."] },
    phenomenon: { title: "A delta as a time capsule", paragraphs: ["At Jezero Crater, a fan-shaped deposit records a river entering an ancient lake. Sediments can preserve information about the water and environment in which they formed — and are promising places to investigate past habitability.", "Perseverance examines rocks and collects samples there. Evidence that an environment could have supported life is not the same as a detection of life; this atlas does not claim the latter."] },
    surface: { kind: "solid", description: "Basaltic rock and iron-rich dust beneath a thin carbon-dioxide sky." },
    missions: ["perseverance"], sources: [...sourcesFor("mars"), { title: "NASA — Jezero Crater", url: "https://science.nasa.gov/mission/mars-2020-perseverance/" }], verified: VERIFIED
  },
  {
    id: "jupiter", name: "Jupiter", order: 5, category: "gas", color: "#bdaa96",
    headline: "A world made\nof weather.", shortFact: "The largest planet. A rotation under ten hours.",
    introduction: "Jupiter holds more mass than all the other planets combined. Its bright zones, dark belts and vast storms are the visible edge of a deep hydrogen-and-helium world.",
    meanRadiusKm: 69911, massE24Kg: 1898.125, densityGcm3: 1.3262, rotationDaysSigned: 0.41354, orbitalYears: 11.862615,
    environment: { title: "No ground beneath the clouds", paragraphs: ["Jupiter has no solid surface like Earth's. Descending through its atmosphere means encountering increasing pressure and temperature, with hydrogen behaving very differently deep inside.", "Its visible bands are cloud systems moving at different speeds. A giant planet does not rotate as a rigid painted ball: the table's reference sidereal rotation is not a promise that every cloud follows the same clock."] },
    phenomenon: { title: "A storm with a long memory", paragraphs: ["The Great Red Spot is a giant, long-lived anticyclonic storm. Its shape, color and size change, making a fixed texture a visual introduction rather than a current weather map.", "Juno's close passes have given researchers a way to investigate below the cloud tops using gravity, magnetic-field and microwave measurements. The attractive stripes are only the beginning of the story."] },
    surface: { kind: "not-applicable", description: "No solid surface. A temperature at a specified pressure is not a rocky surface temperature." },
    missions: ["voyager-2", "juno", "new-horizons"], sources: sourcesFor("jupiter"), verified: VERIFIED
  },
  {
    id: "saturn", name: "Saturn", order: 6, category: "gas", color: "#d8c195",
    headline: "Some worlds\nchange your perspective.", shortFact: "A world encircled by countless pieces of ice.",
    introduction: "Saturn's rings look impossibly continuous from afar. Look closer and that elegant line becomes a vast collection of separate particles, each following its own orbit around a gas giant.",
    meanRadiusKm: 58232, massE24Kg: 568.317, densityGcm3: 0.6871, rotationDaysSigned: 0.44401, orbitalYears: 29.447498,
    environment: { title: "Lightness on a planetary scale", paragraphs: ["Saturn is composed mainly of hydrogen and helium. Its average density is less than that of liquid water, a useful comparison of density — not a suggestion that there is a real ocean large enough to float a planet.", "Cloud layers conceal a high-pressure interior. The listed radius describes the planet, excluding its rings. As with Jupiter, the reference rotation period does not represent every moving cloud, and estimates of Saturn's deep rotation have evolved."] },
    phenomenon: { title: "The rings are not a single thing", paragraphs: ["Saturn's rings consist largely of water-ice particles, with some rocky material. Gaps, waves and sharp edges reveal gravitational interactions with the planet's moons and with the particles themselves.", "Cassini watched this system at close range for more than 13 years. Its final orbits passed between the planet and the innermost rings, before a deliberate descent into Saturn's atmosphere protected potentially habitable moons from contamination."] },
    surface: { kind: "not-applicable", description: "No solid surface; visible cloud layers above a deep hydrogen–helium interior." },
    missions: ["voyager-2", "cassini-huygens"], sources: [...sourcesFor("saturn"), { title: "NASA — Cassini", url: "https://science.nasa.gov/mission/cassini/" }], verified: VERIFIED
  },
  {
    id: "uranus", name: "Uranus", order: 7, category: "ice", color: "#a4c8cd",
    headline: "A different\nway to turn.", shortFact: "An ice giant tipped almost onto its side.",
    introduction: "Uranus rolls through its long orbit with an extraordinary axial tilt. Its pale blue-green appearance gives little away about the extreme seasons and complex interior underneath.",
    meanRadiusKm: 25362, massE24Kg: 86.8099, densityGcm3: 1.27, rotationDaysSigned: -0.71833, orbitalYears: 84.016846,
    environment: { title: "What makes an ice giant?", paragraphs: ["The term 'ice giant' refers to a composition richer in substances such as water, ammonia and methane than that of Jupiter and Saturn. It does not mean Uranus is a solid ball of familiar freezer ice.", "Hydrogen and helium dominate the outer atmosphere; methane absorbs red light and contributes to the blue-green appearance. Pressure and heat at depth produce states of matter unlike those on Earth's surface."] },
    phenomenon: { title: "Seasons turned sideways", paragraphs: ["Uranus's axis is tilted about 98 degrees. For parts of its roughly 84-Earth-year orbit, a pole points approximately toward the Sun, producing very long periods of light or darkness at high latitudes.", "Voyager 2's 1986 encounter remains the only spacecraft flyby of Uranus in this historical mission collection. A single visit gives a remarkable close view, but not a complete record of an entire seasonal cycle."] },
    surface: { kind: "not-applicable", description: "No accessible solid surface; an atmosphere above a high-pressure, volatile-rich interior." },
    missions: ["voyager-2"], sources: sourcesFor("uranus"), verified: VERIFIED
  },
  {
    id: "neptune", name: "Neptune", order: 8, category: "ice", color: "#719cc4",
    headline: "Far from the Sun.\nAnything but still.", shortFact: "A distant world driven by powerful winds.",
    introduction: "Neptune is the outermost of the eight planets. Faint sunlight reaches a dynamic atmosphere where bright clouds and dark storm systems reveal a world far from quiet.",
    meanRadiusKm: 24622, massE24Kg: 102.4092, densityGcm3: 1.638, rotationDaysSigned: 0.67125, orbitalYears: 164.79132,
    environment: { title: "Blue is a beginning, not a measurement", paragraphs: ["Neptune's atmosphere contains hydrogen, helium and methane. Methane absorbs red light, but images also depend on instrument filters and processing; familiar intensely blue portraits may have enhanced color.", "The local texture is an illustrative composite, not a calibrated color standard. Like Uranus, Neptune is classified as an ice giant and has no solid surface comparable to Earth's."] },
    phenomenon: { title: "Weather at the edge", paragraphs: ["Neptune's atmosphere supports extremely fast winds and changing dark vortices. The Great Dark Spot seen by Voyager 2 in 1989 was not a permanent feature; later observations showed other evolving systems.", "One orbit takes about 165 Earth years. Our spacecraft record is much shorter: Voyager 2 made the first, and so far only, close spacecraft encounter represented in this atlas. A globe is a snapshot of an idea, not live weather."] },
    surface: { kind: "not-applicable", description: "No solid surface; a dynamic atmosphere and volatile-rich deep interior." },
    missions: ["voyager-2"], sources: sourcesFor("neptune"), verified: VERIFIED
  }
];

export const planetById = Object.fromEntries(planets.map(p => [p.id, p])) as Record<PlanetId, Planet>;