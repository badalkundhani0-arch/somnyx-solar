import "server-only";
import { cache } from "react";
import { query, run } from "./db";

/** The official tagline. Locked: not editable through the admin interface. */
export { TAGLINE } from "./brand";

type Field = { label: string; group: string; value: string; multiline?: boolean };

/**
 * Every piece of editable website copy, with its default.
 * The admin "Website copy" screen is generated from this list; saved values
 * override these defaults.
 */
export const CONTENT_FIELDS = {
  "home.hero.subheadline": { group: "Home", label: "Hero supporting headline", value: "Advanced Solar PV Junction Box Solutions" },
  "home.hero.description": {
    group: "Home",
    label: "Hero description",
    multiline: true,
    value: "Precision-engineered photovoltaic interconnection solutions for the next generation of solar energy.",
  },
  "home.intro.heading": { group: "Home", label: "Introduction heading", value: "The smallest component on a solar module carries all of its power." },
  "home.intro.body": {
    group: "Home",
    label: "Introduction body",
    multiline: true,
    value:
      "Every watt a photovoltaic module produces leaves through its junction box. Inside sit the terminations of the cell strings, the bypass diodes that protect shaded substrings, and the cable assemblies that join the module to the rest of the array. Somnyx Solar manufactures 3-split junction boxes for this job, engineered for 1500 V systems and the higher currents of today's large-format modules.",
  },
  "products.intro": {
    group: "Products",
    label: "Products page introduction",
    multiline: true,
    value:
      "Three current ratings, one 3-split platform. Every variant shares the same enclosures, sealing system and cable assemblies, and differs in diode selection and thermal design to match the short-circuit current of the module it serves.",
  },
  "technology.intro": {
    group: "Technology",
    label: "Technology page introduction",
    multiline: true,
    value:
      "A junction box spends twenty-five years or more on a module roof, through heat, ultraviolet light, rain, frost and continuous electrical stress. Our engineering is organised around the six areas that decide whether it lasts.",
  },
  "manufacturing.intro": {
    group: "Manufacturing",
    label: "Manufacturing page introduction",
    multiline: true,
    value:
      "Somnyx Solar manufactures photovoltaic junction boxes in Gujarat, close to one of India's largest concentrations of module manufacturing, with 3.6 GW of annual production capacity.",
  },
  "industries.intro": {
    group: "Industries",
    label: "Industries page introduction",
    multiline: true,
    value:
      "Junction boxes are specified by module manufacturers and judged by everyone downstream. We are building our products and partnerships around the needs of each part of the solar value chain.",
  },
  "about.lead": {
    group: "About",
    label: "About page lead paragraph",
    multiline: true,
    value:
      "Somnyx Solar is a photovoltaic junction box manufacturer based in Surat, Gujarat, operating under Somnyx Industries. We supply 3-split junction boxes to module manufacturers from our Gujarat facility, with 3.6 GW of annual production capacity.",
  },
  "about.body": {
    group: "About",
    label: "About page body",
    multiline: true,
    value:
      "Our products are built around one idea: the junction box is the smallest component on a module, but it carries all of its power. We design for thermal margin, long-term sealing and repeatable assembly, and we work with module manufacturers on the cable lengths, connectors and ratings their lines need.\n\nWith 3.6 GW of annual capacity in Gujarat, we are a nearby, dependable source of junction boxes for India's module makers, and a growing supplier to international markets.",
  },
  "contact.intro": {
    group: "Contact",
    label: "Contact page introduction",
    multiline: true,
    value: "Tell us what you are working on. Choose the right team below and your message will reach the people who can answer it.",
  },
  "rfq.intro": {
    group: "Request a Quote",
    label: "RFQ page introduction",
    multiline: true,
    value:
      "Share your module and volume requirements, and our sales team will come back with pricing, lead times and the right configuration for your line.",
  },
  "resources.intro": {
    group: "Technical Resources",
    label: "Resources page introduction",
    multiline: true,
    value: "Datasheets, drawings and technical notes for Somnyx junction boxes.",
  },
} satisfies Record<string, Field>;

export type ContentKey = keyof typeof CONTENT_FIELDS;
export type ContentMap = Record<ContentKey, string>;

export const getContent = cache(async (): Promise<ContentMap> => {
  const map = Object.fromEntries(Object.entries(CONTENT_FIELDS).map(([k, f]) => [k, f.value])) as ContentMap;
  try {
    const rows = await query<{ key: string; value: string }>("SELECT key, value FROM content");
    for (const r of rows) if (r.key in map) map[r.key as ContentKey] = r.value;
  } catch (e) {
    console.error("content load failed, using defaults", e);
  }
  return map;
});

export async function saveContent(values: Partial<Record<string, string>>) {
  const now = new Date().toISOString();
  for (const [key, value] of Object.entries(values)) {
    if (!(key in CONTENT_FIELDS) || typeof value !== "string") continue;
    await run(
      "INSERT INTO content (key, value, updated_at) VALUES (?, ?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at",
      [key, value.slice(0, 5000), now],
    );
  }
}
