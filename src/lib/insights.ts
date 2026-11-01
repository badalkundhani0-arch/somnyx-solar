/**
 * Knowledge articles for /insights. Plain data so pages stay static and fast.
 * Keep claims general and factual; product facts must match the specification tables.
 */
export type Article = {
  slug: string;
  title: string;
  description: string;
  date: string; // ISO date
  minutes: number;
  tag: string;
  sections: { heading?: string; paragraphs: string[]; points?: string[] }[];
  related: string[];
};

export const ARTICLES: Article[] = [
  {
    slug: "what-does-a-pv-junction-box-do",
    title: "What does a PV junction box actually do?",
    description: "The small box on the back of every solar module carries all of its power. Here is what sits inside it and why it matters for the module's whole life.",
    date: "2026-11-01",
    minutes: 5,
    tag: "Fundamentals",
    sections: [
      {
        paragraphs: [
          "Turn any crystalline solar module over and you will find a small, sealed box bonded to the backsheet or rear glass, with two cables coming out of it. It is one of the cheapest parts of the module, and one of the few parts every watt has to pass through.",
          "A junction box has four jobs. If any one of them fails, the module either stops producing or becomes a safety problem.",
        ],
      },
      {
        heading: "1. Terminate the cell strings",
        paragraphs: [
          "Inside the laminate, the cells are wired into strings with thin copper ribbons. The ends of those strings exit through the back of the module as bus ribbons. The junction box connects each ribbon to a terminal, with a joint that has to stay low in resistance for decades of daily heating and cooling.",
        ],
      },
      {
        heading: "2. Protect the module with bypass diodes",
        paragraphs: [
          "A module is normally split into three substrings, and each one has a bypass diode across it. When part of the module is shaded, the diode takes the current around the shaded substring instead of forcing it through cells that cannot carry it. Without that path, shaded cells can overheat and form hot spots that damage the module.",
        ],
      },
      {
        heading: "3. Deliver the power safely to the array",
        paragraphs: [
          "The box terminates the module's output cables and connectors, which join the module to its neighbours in the string. On modern systems that string can run at up to 1500 V DC, so insulation, creepage distances and the cable entry all have to be designed for that voltage.",
        ],
      },
      {
        heading: "4. Keep water, dust and UV out",
        paragraphs: [
          "The box spends 25 years or more outdoors through rain, condensation, dust, frost and ultraviolet light. Its housing materials, cover seal, potting and cable glands have to keep live parts dry and insulated for that whole time.",
        ],
      },
      {
        heading: "The standards behind it",
        paragraphs: [
          "Junction boxes for PV modules are covered by IEC/EN 62790, which sets safety requirements and tests for their construction. The connectors and the PV cable have their own standards. Module makers then qualify the complete module, junction box included, to the module standards.",
        ],
      },
      {
        heading: "Why it deserves attention",
        paragraphs: [
          "Because the junction box is small and inexpensive, it is easy to treat as a commodity. But it handles full module current continuously, it carries the heat of a conducting diode when part of the module is shaded, and it has to stay sealed for the module's whole life. Choosing it well is one of the simplest ways to protect a module's long-term output.",
        ],
      },
    ],
    related: ["bypass-diodes-explained", "choosing-a-junction-box-current-rating"],
  },
  {
    slug: "bypass-diodes-explained",
    title: "Bypass diodes explained: what happens when a module is shaded",
    description: "Why every module has three bypass diodes, what they do under partial shade, and why diode heat is a key design question for the junction box.",
    date: "2026-11-01",
    minutes: 6,
    tag: "Engineering",
    sections: [
      {
        paragraphs: [
          "Solar cells in a module are connected in series, so the same current has to flow through every cell. That works well in full sun. Under partial shade it creates a problem that the bypass diodes in the junction box exist to solve.",
        ],
      },
      {
        heading: "Three substrings, three diodes",
        paragraphs: [
          "Most crystalline modules are wired as three substrings. Each substring has one bypass diode connected across it, in the opposite direction to the current. In full sun the diode is reverse-biased and carries almost no current.",
        ],
      },
      {
        heading: "What shading does",
        paragraphs: [
          "When a leaf, a pole or a strip of soiling shades some cells, those cells can no longer carry the current the rest of the string is pushing through them. Without protection they are driven into reverse bias and start to dissipate power as heat. That localised heating is a hot spot, and it can damage the cells and the materials around them.",
          "With a bypass diode in place, the diode across the shaded substring becomes forward-biased and the string current flows through it instead. The module loses roughly that substring's share of its voltage, but the other two substrings keep producing and the shaded cells are protected.",
        ],
      },
      {
        heading: "Why diode heat matters",
        paragraphs: [
          "A conducting diode dissipates power roughly equal to its forward voltage multiplied by the current through it. At the currents of today's large-format modules that is a steady source of heat, sealed inside a small box on the back of a module that may already be hot in the sun.",
          "That is why junction box design pays so much attention to:",
        ],
        points: [
          "Diode selection, favouring low forward voltage to reduce heat",
          "Keeping diode junction temperature within limits at worst-case ambient",
          "Spreading heat away from the diode through terminals and potting",
          "Rating the box with margin above the module's short-circuit current",
        ],
      },
      {
        heading: "How a 3-split box helps",
        paragraphs: [
          "In a 3-split junction box, each of the three diodes sits in its own small box. The heat of a conducting diode is generated in a separate enclosure rather than next to two other diodes, which makes thermal design easier. You can see the effect in the interactive diagram on our Technology page.",
        ],
      },
    ],
    related: ["three-split-vs-single-junction-box", "choosing-a-junction-box-current-rating"],
  },
  {
    slug: "choosing-a-junction-box-current-rating",
    title: "25 A, 30 A or 35 A: choosing a junction box current rating",
    description: "How module short-circuit current, bifacial gain and design margin decide which junction box rating a module needs.",
    date: "2026-11-01",
    minutes: 5,
    tag: "Buying guide",
    sections: [
      {
        paragraphs: [
          "The current rating is the first number on any junction box specification. Picking it correctly protects the module. Picking it too low risks overheating diodes when the module is shaded. Picking it far higher than needed adds cost without adding value.",
        ],
      },
      {
        heading: "Start from the module's short-circuit current",
        paragraphs: [
          "When a substring is bypassed, its diode carries the full string current, which can approach the module's short-circuit current (Isc). The junction box rating therefore has to sit comfortably above the highest Isc the module will see in the field, not just the figure on the datasheet at standard test conditions.",
        ],
      },
      {
        heading: "Account for what raises current in the field",
        paragraphs: ["Several things push real operating current above the datasheet Isc:"],
        points: [
          "Bifacial gain: light reaching the rear side of a bifacial module adds current",
          "Irradiance above 1000 W/m², for example from cloud-edge effects or reflective surroundings",
          "Larger wafer and module formats, which carry more current per cell",
        ],
      },
      {
        heading: "Then apply your design margin",
        paragraphs: [
          "Module manufacturers apply their own safety factor when they match a junction box to a module, and module qualification tests the bypass diodes above rated current. Your engineering team's design rules decide the margin. Our job is to give you a box rated clearly above it.",
        ],
      },
      {
        heading: "How our three ratings map to modules",
        paragraphs: [],
        points: [
          "SJB-1525 (25 A): mainstream crystalline-silicon modules whose short-circuit current, including any bifacial gain, sits comfortably below 25 A",
          "SJB-1530 (30 A): higher-current, large-format modules, with extra margin for bifacial rear-side gain and higher operating temperatures",
          "SJB-1535 (35 A): the highest-current module formats, with the most thermal margin",
        ],
      },
      {
        heading: "When in doubt, send us the datasheet",
        paragraphs: [
          "All three ratings share the same 3-split enclosure, sealing and 1500 V DC system rating, so moving between them does not change how the box fits your line. Send your module datasheet to our technical team and we will recommend a rating against your design rules.",
        ],
      },
    ],
    related: ["bypass-diodes-explained", "three-split-vs-single-junction-box"],
  },
  {
    slug: "three-split-vs-single-junction-box",
    title: "3-split vs single junction boxes: why modules moved to split designs",
    description: "Why many modern module layouts use three small junction boxes instead of one, and what that changes for heat, materials and assembly.",
    date: "2026-11-01",
    minutes: 4,
    tag: "Engineering",
    sections: [
      {
        paragraphs: [
          "Older modules usually carried one junction box containing all three bypass diodes. Many current module designs use a 3-split arrangement instead: three small boxes, each with one diode and its terminals, placed where the string connections leave the module.",
        ],
      },
      {
        heading: "What changes with a split design",
        paragraphs: [],
        points: [
          "Heat is spread across three enclosures. A conducting diode warms its own box rather than sharing a small space with two other diodes.",
          "Shorter connections. Each box sits close to the point where its ribbons exit the module, which suits layouts where the string connections come out at separate points across the module, as in many half-cut cell designs.",
          "Less material per box. Each enclosure only has to house one diode, its terminals and, for the outer boxes, one cable.",
          "Simple, repeatable assembly. Three identical sealing and bonding steps rather than one larger, more complex box.",
        ],
      },
      {
        heading: "What stays the same",
        paragraphs: [
          "The electrical job is identical. There are still three substrings and three bypass diodes, the outer boxes still carry the module's output cables and connectors, and the boxes still have to be sealed, insulated and rated for the system voltage. A split design does not relax any of the requirements of IEC/EN 62790.",
        ],
      },
      {
        heading: "Our approach",
        paragraphs: [
          "Every Somnyx junction box is a 3-split design. The three ratings share the same enclosures, sealing system and cable assemblies, and differ in diode selection and thermal design. That keeps the fit on your line identical whichever rating your module needs.",
        ],
      },
    ],
    related: ["what-does-a-pv-junction-box-do", "choosing-a-junction-box-current-rating"],
  },
  {
    slug: "ip68-sealing-explained",
    title: "IP68 and junction box sealing: keeping water out for 25 years",
    description: "What an IP68 rating means, where water tries to get into a junction box, and how the seal is designed to last.",
    date: "2026-11-01",
    minutes: 4,
    tag: "Fundamentals",
    sections: [
      {
        paragraphs: [
          "Water is the long-term enemy of anything electrical outdoors. A junction box on a solar module sees rain, condensation, frost and, on some sites, standing water, every day for decades. Its seal has to outlast all of that.",
        ],
      },
      {
        heading: "What IP68 means",
        paragraphs: [
          "IP ratings come from IEC 60529. The first digit describes protection against solids, and 6 means dust-tight. The second digit describes protection against water, and 8 means protection against continuous immersion under conditions more severe than the IPX7 test. In short, dust cannot get in, and the enclosure is built to keep water out even when submerged.",
        ],
      },
      {
        heading: "Where water tries to get in",
        paragraphs: ["A junction box has three main sealing paths, and each needs its own solution:"],
        points: [
          "The cover: a gasket and lid retention that stay tight through years of thermal cycling",
          "The cable entries: sealed glands or overmoulding where the PV cable leaves the box",
          "The base: the adhesive bond to the module and potting that covers live parts",
        ],
      },
      {
        heading: "Why the rating on day one is not the whole story",
        paragraphs: [
          "Seals age. Daily heating and cooling makes materials expand and contract, ultraviolet light attacks polymers, and humidity tests every interface. That is why material selection and ageing resistance matter as much as the initial rating, and why sealing is checked as part of production rather than assumed.",
          "Each Somnyx split box is sealed to IP68 with a cover gasket, potting and sealed cable entries, using housing and potting materials selected for UV, heat and humidity at 1500 V.",
        ],
      },
    ],
    related: ["what-does-a-pv-junction-box-do", "three-split-vs-single-junction-box"],
  },
];

export const getArticle = (slug: string) => ARTICLES.find((a) => a.slug === slug);

export const fmtArticleDate = (iso: string) => new Date(iso + "T00:00:00Z").toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });
