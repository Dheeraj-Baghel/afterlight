import type { Mission, MissionType } from "@/lib/types";
import { VERIFIED } from "@/data/planets";

// Historical milestones, not a live operational-status feed. Dates are UTC where noted.
// Destination lists distinguish planetary encounters from additional small-body targets.
export const MISSION_TYPE_LABELS: Record<MissionType, string> = { flyby: "Flyby", orbiter: "Orbiter", rover: "Rover", "orbiter-probe": "Orbiter + probe" };
export const missions: Mission[] = [
  {
    id: "cassini-huygens", name: "Cassini–Huygens", agency: "NASA / ESA / ASI", launchDate: "1997-10-15", destinations: ["saturn"], additionalDestinations: ["Titan", "Enceladus"], type: "orbiter-probe", cover: "saturn", featured: true,
    headline: "Thirteen years.\nA new sense of wonder.",
    summary: "An orbiter, a lander and a new perspective on Saturn. Cassini–Huygens revealed an intricate system of rings, ocean worlds and a moon with weather of its own.",
    sections: [
      { title: "A destination became a system", paragraphs: ["Cassini–Huygens left Earth in 1997 as a collaboration between NASA, the European Space Agency and the Italian Space Agency. After a long interplanetary journey, Cassini entered orbit around Saturn on July 1, 2004 UTC. It did not simply pass through: it stayed to observe changes, return to moons and ask follow-up questions.", "Repeated encounters transformed familiar points of light into distinct worlds. Titan had a dense atmosphere and surface liquids made of hydrocarbons. Enceladus expelled water-rich material from its south polar region. The rings were full of structure rather than a smooth, unchanging disk."] },
      { title: "A landing beyond the asteroid belt", paragraphs: ["ESA's Huygens probe separated from Cassini and descended through Titan's atmosphere on January 14, 2005. Its instruments measured the atmosphere during the descent, and images revealed channels and a landscape shaped by flowing liquid.", "Huygens reached Titan's surface and transmitted data through Cassini. It was the first landing in the outer solar system. The achievement connected an overhead view to a place on the ground — a reminder that every way of observing reveals something different."] },
      { title: "An ending chosen with care", paragraphs: ["In 2017, Cassini's Grand Finale carried the spacecraft repeatedly between Saturn and the inner edge of the rings. These orbits brought it into a region that earlier in the mission had been too risky to traverse.", "On September 15, 2017, Cassini entered Saturn's atmosphere and ended its mission. The deliberate disposal prevented a future uncontrolled collision with a moon such as Enceladus or Titan, where questions about habitability made planetary protection especially important. The spacecraft is gone; its measurements remain a scientific archive."] }
    ],
    timeline: [
      { date: "1997-10-15", title: "Departure", description: "Cassini–Huygens launches from Cape Canaveral." },
      { date: "2004-07-01", title: "Saturn orbit", description: "Orbit insertion begins the close study of Saturn's system (UTC date)." },
      { date: "2005-01-14", title: "On the surface of Titan", description: "Huygens descends through the atmosphere and lands." },
      { date: "2017-09-15", title: "The Grand Finale", description: "A deliberate atmospheric entry ends Cassini's mission." }
    ],
    sources: [{ title: "NASA — Cassini mission", url: "https://science.nasa.gov/mission/cassini/" }, { title: "NASA — Cassini quick facts", url: "https://science.nasa.gov/mission/cassini/quick-facts/" }, { title: "ESA — Cassini–Huygens overview", url: "https://www.esa.int/Science_Exploration/Space_Science/Cassini-Huygens_overview" }], verified: VERIFIED
  },
  {
    id: "voyager-2", name: "Voyager 2", agency: "NASA / JPL", launchDate: "1977-08-20", destinations: ["jupiter", "saturn", "uranus", "neptune"], type: "flyby", cover: "neptune", featured: true,
    headline: "One spacecraft.\nFour giant worlds.",
    summary: "A rare planetary arrangement made an extraordinary journey possible. Voyager 2 visited Jupiter, Saturn, Uranus and Neptune, linking four encounters into one outer-planet tour.",
    sections: [
      { title: "A journey shaped by gravity", paragraphs: ["Voyager 2 launched on August 20, 1977, before Voyager 1. Its route took advantage of an alignment of the giant planets, allowing gravitational encounters to redirect the spacecraft toward the next destination without carrying fuel for every change in course.", "The mission's name can suggest a straight line outward, but each encounter was a carefully arranged exchange of momentum. Gravity assists made a multi-planet tour achievable with the technology of the time. The route diagram in this atlas communicates the sequence, not calculated spacecraft positions."] },
      { title: "Beyond the familiar giants", paragraphs: ["The Jupiter encounter in July 1979 and Saturn encounter in August 1981 revealed dynamic atmospheres, structured rings and diverse moons. Each flyby left only a brief window for the closest observations, making planning and communication essential.", "In January 1986, Voyager 2 reached Uranus. In August 1989 it passed Neptune and its moon Triton. These remain uniquely valuable close-range records of the ice giants. The images are not live views; they capture the particular geometry and conditions of those encounters."] },
      { title: "The limits of a glimpse", paragraphs: ["A flyby is powerful but incomplete. It can transform knowledge in hours while leaving whole hemispheres, seasons or processes poorly sampled. Later telescopic observations complement the spacecraft record, revealing change over time.", "The four encounters also make a useful comparison of observing methods. A spacecraft can see details from close range that Earth-based instruments cannot resolve, but a telescope can return to a planet repeatedly. A complete picture needs both the close encounter and the longer view.", "This story focuses on the completed planetary encounters. It does not infer today's spacecraft health or instruments from historical milestones. For operational updates, use the mission's dated NASA reporting rather than a static status badge."] }
    ],
    timeline: [
      { date: "1977-08-20", title: "Launch", description: "Voyager 2 begins its journey from Earth." },
      { date: "1979-07-09", title: "Jupiter", description: "Closest approach to the largest planet." },
      { date: "1981-08-25", title: "Saturn", description: "A gravity assist sets the course toward Uranus." },
      { date: "1986-01-24", title: "Uranus", description: "The first close spacecraft encounter with Uranus." },
      { date: "1989-08-25", title: "Neptune", description: "The final planetary flyby of the grand tour." }
    ],
    sources: [{ title: "NASA — Voyager fact sheet", url: "https://science.nasa.gov/mission/voyager/fact-sheet/" }, { title: "NASA — Voyager", url: "https://science.nasa.gov/mission/voyager/" }], verified: VERIFIED
  },
  {
    id: "perseverance", name: "Perseverance", agency: "NASA / JPL", launchDate: "2020-07-30", destinations: ["mars"], type: "rover", cover: "mars", featured: true,
    headline: "A patient search,\none rock at a time.",
    summary: "At Jezero Crater, the Mars 2020 rover investigates an ancient lake environment and collects rock samples to help reconstruct the planet's history.",
    sections: [
      { title: "Why this crater?", paragraphs: ["Perseverance landed in Jezero Crater on February 18, 2021. The site contains a river delta and evidence of an ancient lake, making it a compelling place to investigate environments that could once have supported microbial life.", "The distinction matters: habitability is not a discovery of life. The rover measures rock chemistry, textures and geological relationships to test explanations about past environments. The scientific value lies in the context connecting many observations, not one spectacular image."] },
      { title: "A field laboratory on wheels", paragraphs: ["Perseverance studies the surface with cameras and instruments, abrades selected rock surfaces and drills cores that can be sealed in sample tubes. It completed the collection of its first successful rock sample on September 6, 2021.", "A sample's location and relationship to surrounding layers are part of its meaning. A rock examined in isolation can tell a different story from one understood as part of a delta, a crater floor or a sequence of deposits. Field observations preserve that context alongside measurements.", "A stored sample is not already on Earth. This atlas describes the rover's documented collection work without promising a return date or treating a changing sample-return architecture as settled. Source links provide the place to check later developments."] },
      { title: "Another way to explore", paragraphs: ["The small Ingenuity helicopter traveled to Mars with Perseverance. On April 19, 2021, it made the first powered, controlled flight on another planet, testing a new way of surveying terrain in a thin atmosphere.", "The rover and helicopter illustrate complementary kinds of exploration: close contact with rocks and a perspective from above. Neither is a human travel itinerary. Saving Mars in AFTERLIGHT is a personal reading plan, not a reservation to go there."] }
    ],
    timeline: [
      { date: "2020-07-30", title: "Launch", description: "Mars 2020 departs Earth carrying Perseverance and Ingenuity." },
      { date: "2021-02-18", title: "Jezero landing", description: "Perseverance lands in the ancient lake basin." },
      { date: "2021-04-19", title: "A first flight", description: "Ingenuity achieves powered, controlled flight on Mars." },
      { date: "2021-09-06", title: "First rock sample", description: "The first successful core is sealed in a sample tube." }
    ],
    sources: [{ title: "NASA — Mars 2020 Perseverance", url: "https://science.nasa.gov/mission/mars-2020-perseverance/" }, { title: "NASA — Ingenuity", url: "https://science.nasa.gov/mission/mars-2020-perseverance/ingenuity-mars-helicopter/" }, { title: "NASA — First Mars rock sample", url: "https://www.nasa.gov/news-release/nasas-perseverance-rover-collects-first-mars-rock-sample/" }], verified: VERIFIED
  },
  {
    id: "mariner-10", name: "Mariner 10", agency: "NASA / JPL", launchDate: "1973-11-03", destinations: ["venus", "mercury"], type: "flyby", cover: "mercury",
    headline: "An assist from Venus.\nA first look at Mercury.",
    summary: "Mariner 10 used Venus's gravity to reach Mercury, becoming the first spacecraft to visit the innermost planet.",
    sections: [
      { title: "Two worlds on one route", paragraphs: ["Mariner 10 launched in November 1973 and passed Venus in February 1974. The encounter was both a scientific opportunity and a gravity assist that reshaped the route toward Mercury.", "The spacecraft photographed Venus in ultraviolet light, where patterns in its cloud cover were easier to distinguish than in ordinary visible-light views."] },
      { title: "Mercury enters the picture", paragraphs: ["Three Mercury encounters in 1974 and 1975 revealed a cratered landscape and detected a magnetic field. The flyby geometry meant that only part of the surface could be imaged.", "That incomplete map was a beginning rather than a failure. Decades later, MESSENGER would enter orbit and revisit Mercury from many more viewing angles."] }
    ],
    timeline: [
      { date: "1973-11-03", title: "Launch", description: "Mariner 10 departs Earth." },
      { date: "1974-02-05", title: "Venus flyby", description: "A gravity assist redirects the spacecraft inward." },
      { date: "1974-03-29", title: "First Mercury encounter", description: "The first close spacecraft observations of Mercury." },
      { date: "1975-03-16", title: "Third Mercury encounter", description: "The last of three flybys." }
    ],
    sources: [{ title: "NASA — Mariner 10", url: "https://science.nasa.gov/mission/mariner-10/" }], verified: VERIFIED
  },
  {
    id: "messenger", name: "MESSENGER", agency: "NASA / APL", launchDate: "2004-08-03", destinations: ["mercury"], type: "orbiter", cover: "mercury",
    headline: "The innermost world,\nseen all around.",
    summary: "The first spacecraft to orbit Mercury turned an incomplete portrait into a global investigation of its geology, chemistry and magnetic environment.",
    sections: [
      { title: "Slowing down toward the Sun", paragraphs: ["Reaching Mercury is not simply a matter of falling inward. MESSENGER used a sequence of planetary flybys to shape its trajectory and reduce the speed needed for orbit insertion.", "It entered Mercury orbit on March 18, 2011 UTC — March 17 in the United States. This atlas uses the UTC date to avoid making the same event appear to happen on two different days."] },
      { title: "A global perspective", paragraphs: ["From orbit, MESSENGER mapped terrain and measured surface composition and Mercury's magnetic field. Its observations supported the presence of water ice in permanently shadowed polar regions.", "The mission ended with an impact on Mercury on April 30, 2015. Its data made the closest planet to the Sun a more chemically and geologically complex place than the earlier flybys alone could show."] }
    ],
    timeline: [
      { date: "2004-08-03", title: "Launch", description: "MESSENGER begins its journey." },
      { date: "2011-03-18", title: "Mercury orbit", description: "First Mercury orbit insertion; date is UTC." },
      { date: "2015-04-30", title: "Final impact", description: "The mission ends on Mercury's surface." }
    ],
    sources: [{ title: "NASA — MESSENGER", url: "https://science.nasa.gov/mission/messenger/" }], verified: VERIFIED
  },
  {
    id: "magellan", name: "Magellan", agency: "NASA / JPL", launchDate: "1989-05-04", destinations: ["venus"], type: "orbiter", cover: "venus",
    headline: "Seeing through\nan unbroken sky.",
    summary: "Magellan's radar mapped the surface of cloud-covered Venus, revealing volcanic plains, mountains and a landscape hidden from ordinary cameras.",
    sections: [
      { title: "A different kind of vision", paragraphs: ["Magellan launched aboard Space Shuttle Atlantis in May 1989 and arrived at Venus on August 10, 1990. Its synthetic-aperture radar could investigate the surface beneath the planet's opaque cloud layers.", "Radar images describe how the ground reflects radio signals. Brightness does not correspond directly to what human eyes would see; familiar colorized Venus maps are processed interpretations, not natural-color surface photographs."] },
      { title: "A map that keeps giving", paragraphs: ["The mission revealed a world of extensive volcanism, deformed terrain and relatively few impact craters. Repeated observations also created an archive that researchers could revisit with new questions and analysis techniques.", "Near the end of the mission, Magellan was lowered into the atmosphere. NASA's mission history records loss of contact on October 13, 1994 UTC. This story follows that documented date, not an undated operational status."] }
    ],
    timeline: [
      { date: "1989-05-04", title: "Shuttle launch", description: "Magellan launches aboard Atlantis." },
      { date: "1990-08-10", title: "Venus arrival", description: "The spacecraft enters orbit." },
      { date: "1994-10-13", title: "Final contact", description: "Contact is lost after atmospheric descent (UTC)." }
    ],
    sources: [{ title: "NASA — Magellan", url: "https://science.nasa.gov/mission/magellan/" }, { title: "NASA PDS — Magellan mission archive", url: "https://pds-imaging.jpl.nasa.gov/portal/magellan_mission.html" }], verified: VERIFIED
  },
  {
    id: "juno", name: "Juno", agency: "NASA / JPL", launchDate: "2011-08-05", destinations: ["jupiter"], additionalDestinations: ["Ganymede", "Europa"], type: "orbiter", cover: "jupiter",
    headline: "Beneath the bands.\nBeyond the familiar.",
    summary: "Juno's close passes investigate Jupiter's gravity, magnetic field and deep atmosphere, connecting visible weather to the planet underneath.",
    sections: [
      { title: "Reading a giant from orbit", paragraphs: ["Juno launched in August 2011 and entered Jupiter orbit in July 2016. A polar orbit gave it a perspective unlike the familiar equatorial portraits of Jupiter's belts.", "Gravity and magnetic measurements probe the interior indirectly, while microwave observations investigate the atmosphere below the visible clouds. No instrument simply takes a photograph of Jupiter's core."] },
      { title: "The planet has neighbors", paragraphs: ["Documented close encounters included Ganymede on June 7, 2021 and Europa on September 29, 2022. These observations linked the study of Jupiter to the varied worlds orbiting it.", "This record is a historical selection. For changing mission operations and later discoveries, consult the linked NASA mission page; the atlas does not present an unverified 'active now' badge."] }
    ],
    timeline: [
      { date: "2011-08-05", title: "Launch", description: "Juno begins its flight to Jupiter." },
      { date: "2016-07-05", title: "Jupiter orbit", description: "Orbit insertion; July 5 UTC, July 4 US Pacific time." },
      { date: "2021-06-07", title: "Ganymede flyby", description: "Close observations of Jupiter's largest moon." },
      { date: "2022-09-29", title: "Europa flyby", description: "A close view of the ice-covered moon." }
    ],
    sources: [{ title: "NASA — Juno", url: "https://science.nasa.gov/mission/juno/" }, { title: "NASA — Juno orbit insertion", url: "https://www.nasa.gov/news-release/nasas-juno-spacecraft-in-orbit-around-mighty-jupiter/" }], verified: VERIFIED
  },
  {
    id: "new-horizons", name: "New Horizons", agency: "NASA / APL / SwRI", launchDate: "2006-01-19", destinations: ["jupiter"], additionalDestinations: ["Pluto", "Arrokoth"], type: "flyby", cover: "jupiter",
    headline: "The horizon\nkeeps moving.",
    summary: "A Jupiter gravity assist helped carry New Horizons to Pluto and then Arrokoth, extending close exploration into the Kuiper Belt.",
    sections: [
      { title: "Jupiter was a stepping stone", paragraphs: ["New Horizons launched in January 2006. It passed Jupiter on February 28, 2007, gaining speed while observing the giant planet and its surroundings.", "The principal destination was Pluto, which is classified as a dwarf planet rather than one of the eight planets in this atlas. Its inclusion here is a mission connection, not a change to the planet index."] },
      { title: "An encounter, not an arrival into orbit", paragraphs: ["On July 14, 2015, New Horizons flew past Pluto and its moons. It was a high-speed encounter, not an orbit insertion or landing. The images revealed a varied landscape including mountains and expansive icy plains.", "The spacecraft later flew past the small Kuiper Belt object Arrokoth on January 1, 2019. These historical milestones show how a mission can carry its original question outward, from one remote world to another."] }
    ],
    timeline: [
      { date: "2006-01-19", title: "Launch", description: "New Horizons leaves Earth." },
      { date: "2007-02-28", title: "Jupiter assist", description: "A flyby provides a boost toward the outer solar system." },
      { date: "2015-07-14", title: "Pluto flyby", description: "First close exploration of the Pluto system." },
      { date: "2019-01-01", title: "Arrokoth flyby", description: "A close encounter with a small Kuiper Belt object." }
    ],
    sources: [{ title: "NASA — New Horizons", url: "https://science.nasa.gov/mission/new-horizons/" }], verified: VERIFIED
  }
];
export function getMission(id: string): Mission | undefined { return missions.find(m => m.id === id); }