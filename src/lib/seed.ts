export type Spec = { label: string; value: string; note?: string };

export type ProductStatus =
  | "concept"
  | "engineering"
  | "prototype"
  | "validation"
  | "certification"
  | "available";

export const STATUS_LABELS: Record<ProductStatus, string> = {
  concept: "Concept",
  engineering: "Under engineering development",
  prototype: "Prototype stage",
  validation: "In validation testing",
  certification: "Certification in progress",
  available: "In production",
};

export const STATUS_ORDER: ProductStatus[] = ["concept", "engineering", "prototype", "validation", "certification", "available"];

const commonSpecs = (current: string): Spec[] => [
  { label: "Configuration", value: "3-split junction box" },
  { label: "Maximum PV system voltage", value: "1500 V DC" },
  { label: "Rated current", value: current },
  { label: "Enclosure protection", value: "IP68" },
  { label: "Bypass diodes", value: "3", note: "One per split box" },
  { label: "PV cable cross-section", value: "4 mm²" },
  { label: "Typical cable length", value: "1400 mm per polarity", note: "Configurable per order" },
  { label: "Standard", value: "IEC/EN 62790" },
];

export const SEED_PRODUCTS = [
  {
    id: "sjb-1525",
    code: "SJB-1525",
    name: "SOMNYX SJB-1525",
    currentRating: 25,
    tagline: "25 A 3-split PV junction box",
    summary:
      "The 25 A variant is designed for mainstream crystalline-silicon modules whose short-circuit current, including any bifacial gain, sits comfortably below the box's rated current.",
    status: "available" as ProductStatus,
    statusNote: "",
    specs: commonSpecs("25 A"),
    sortOrder: 1,
  },
  {
    id: "sjb-1530",
    code: "SJB-1530",
    name: "SOMNYX SJB-1530",
    currentRating: 30,
    tagline: "30 A 3-split PV junction box",
    summary:
      "The 30 A variant is designed for higher-current large-format modules, giving additional margin for bifacial rear-side gain and elevated operating temperatures.",
    status: "available" as ProductStatus,
    statusNote: "",
    specs: commonSpecs("30 A"),
    sortOrder: 2,
  },
  {
    id: "sjb-1535",
    code: "SJB-1535",
    name: "SOMNYX SJB-1535",
    currentRating: 35,
    tagline: "35 A 3-split PV junction box",
    summary:
      "The 35 A variant is designed for the highest-current module formats, with diode selection and heat dissipation across the three split boxes sized for maximum thermal margin.",
    status: "available" as ProductStatus,
    statusNote: "",
    specs: commonSpecs("35 A"),
    sortOrder: 3,
  },
];
