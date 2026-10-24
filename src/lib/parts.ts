export type PartId =
  | "enclosure"
  | "cover"
  | "terminals"
  | "diodes"
  | "cablePos"
  | "cableNeg"
  | "connectors"
  | "conductors"
  | "sealing";

export type PartInfo = {
  id: PartId;
  name: string;
  fn: string;
  considerations: string[];
  /** Offset applied at full explosion [x, y, z]. Cable parts use sign by side. */
  explode: [number, number, number];
};

/** Component descriptions for the exploded explorer. */
export const PARTS: PartInfo[] = [
  {
    id: "enclosure",
    name: "Split enclosures",
    fn: "Three compact housings sit along the module edge, one at each pair of bus ribbons. Splitting the box shortens ribbon runs on half-cut modules and spreads diode heat across three locations instead of one.",
    considerations: [
      "Creepage and clearance distances sized for 1500 V DC systems",
      "UV-stabilised polymer for long outdoor service",
      "Housing material with high tracking resistance and flame rating",
      "Bonding surface engineered for reliable adhesion to the module",
    ],
    explode: [0, 0, 0],
  },
  {
    id: "cover",
    name: "Covers",
    fn: "Each box is closed by its own cover after termination and potting, shielding the interior from light, water and touch.",
    considerations: [
      "Secure retention that resists accidental opening",
      "Sealing interface stable under thermal cycling",
      "Strength for module handling and installation",
    ],
    explode: [0, 1.75, 0],
  },
  {
    id: "terminals",
    name: "Electrical terminals",
    fn: "Tin-plated copper terminals receive the module's bus ribbons and connect them to the bypass diode. In the two end boxes they also carry the output cables. The terminal area doubles as a heat spreader for the diode.",
    considerations: [
      "Low, stable contact resistance at every ribbon joint",
      "Copper cross-section sized for rated current with low temperature rise",
      "Terminal area dimensioned to spread diode heat",
    ],
    explode: [0, 0.45, 0],
  },
  {
    id: "diodes",
    name: "Bypass diodes",
    fn: "Each split box holds one bypass diode across one module substring. When a substring is shaded or damaged, its diode conducts the string current around it, limiting power loss and preventing hot spots.",
    considerations: [
      "Low forward voltage to minimise heat while bypassing",
      "Junction temperature held within limits at full current and high ambient",
      "Stable reverse leakage at elevated temperature",
      "Current rating selected above module short-circuit current, including bifacial gain",
    ],
    explode: [0, 0.85, 0],
  },
  {
    id: "cablePos",
    name: "Positive cable assembly",
    fn: "The positive PV cable leaves the end box and carries module current to the next module or the string combiner.",
    considerations: [
      "4 mm² PV cable rated for 1500 V DC and outdoor exposure",
      "Strain relief at the cable entry against pull and twist",
      "Watertight gland where the cable enters the housing",
    ],
    explode: [0.55, 0, 0],
  },
  {
    id: "cableNeg",
    name: "Negative cable assembly",
    fn: "The negative PV cable leaves the opposite end box, completing the module's output circuit.",
    considerations: [
      "Clear polarity identification for installers",
      "Cable length matched to the module layout and string wiring",
      "Same strain-relief and sealing as the positive side",
    ],
    explode: [-0.55, 0, 0],
  },
  {
    id: "connectors",
    name: "Connectors",
    fn: "PV connectors terminate each cable so modules can be joined into a string on site.",
    considerations: [
      "Connector type matched to the module manufacturer's specification",
      "Low contact resistance when mated",
      "Ingress protection in the mated state",
    ],
    explode: [0.6, 0, 0.45],
  },
  {
    id: "conductors",
    name: "Bus ribbons",
    fn: "Flat bus ribbons from the module's cell strings pass through the backsheet into each split box, where they are joined to the terminals.",
    considerations: [
      "Terminal positions aligned to the ribbon layout for automated assembly",
      "Joints that stay reliable through thermal cycling",
    ],
    explode: [0, -0.55, 0],
  },
  {
    id: "sealing",
    name: "Sealing and potting",
    fn: "A gasket seals each cover to its housing, and silicone potting fills each box to encapsulate terminals and diode against moisture.",
    considerations: [
      "IP68 moisture ingress protection",
      "Strong adhesion of potting and bonding compounds",
      "Thermally conductive potting that helps cool the diode",
      "Cure behaviour matched to production line takt time",
    ],
    explode: [0, 1.25, 0],
  },
];

export const PART_MAP = Object.fromEntries(PARTS.map((p) => [p.id, p])) as Record<PartId, PartInfo>;
