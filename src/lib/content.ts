import "server-only";
import { cache } from "react";
import { query, run } from "./db";

/** The official tagline. Locked: not editable through the admin interface. */
export { TAGLINE } from "./brand";

type Field = { label: string; group: string; value: string; multiline?: boolean; photo?: boolean };

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
  "photo.hero.1": { group: "Photos", label: "Home hero, slide 1", value: "https://images.unsplash.com/photo-1698752821927-776ac6cb0e91", photo: true },
  "photo.hero.2": { group: "Photos", label: "Home hero, slide 2", value: "https://images.unsplash.com/photo-1698752821919-e9771f0b0bcb", photo: true },
  "photo.hero.3": { group: "Photos", label: "Home hero, slide 3", value: "https://images.unsplash.com/photo-1508514177221-188b1cf16e9d", photo: true },
  "photo.home.capacity": { group: "Photos", label: "Home capacity band", value: "https://images.unsplash.com/photo-1770936994282-8811fb7129ac", photo: true },
  "photo.home.manufacturing": { group: "Photos", label: "Home manufacturing banner", value: "https://images.unsplash.com/photo-1717386255773-1e3037c81788", photo: true },
  "photo.home.cta": { group: "Photos", label: "Call-to-action background", value: "https://images.unsplash.com/photo-1613665813446-82a78c468a1d", photo: true },
  "photo.industries.module-manufacturers": { group: "Photos", label: "Industry: module manufacturers", value: "https://images.unsplash.com/photo-1717386255767-52643970d483", photo: true },
  "photo.industries.utility": { group: "Photos", label: "Industry: utility-scale", value: "https://images.unsplash.com/photo-1629726797843-618688139f5a", photo: true },
  "photo.industries.commercial": { group: "Photos", label: "Industry: commercial and industrial", value: "https://images.unsplash.com/photo-1786913508408-7dfb8ae2d937", photo: true },
  "photo.industries.oem-odm": { group: "Photos", label: "Industry: OEM and ODM", value: "https://images.unsplash.com/photo-1761195696590-3490ea770aa1", photo: true },
  "photo.industries.procurement": { group: "Photos", label: "Industry: procurement and supply", value: "https://images.unsplash.com/photo-1781330191153-f7b5f2634511", photo: true },
  "photo.technology.hero": { group: "Photos", label: "Technology page header", value: "https://images.unsplash.com/photo-1679046411615-d84b3f4ae6e5", photo: true },
  "photo.manufacturing.hero": { group: "Photos", label: "Manufacturing page header", value: "https://images.unsplash.com/photo-1717386255773-a456c611dc4e", photo: true },
  "photo.manufacturing.1": { group: "Photos", label: "Manufacturing gallery 1", value: "https://images.unsplash.com/photo-1716191299980-a6e8827ba10b", photo: true },
  "photo.manufacturing.2": { group: "Photos", label: "Manufacturing gallery 2", value: "https://images.unsplash.com/photo-1717386255893-59c0846cdef0", photo: true },
  "photo.manufacturing.3": { group: "Photos", label: "Manufacturing gallery 3", value: "https://images.unsplash.com/photo-1717386255777-ce60792a2a56", photo: true },
  "photo.manufacturing.4": { group: "Photos", label: "Manufacturing gallery 4", value: "https://images.unsplash.com/photo-1651340550839-3b295d930048", photo: true },
  "photo.manufacturing.5": { group: "Photos", label: "Manufacturing gallery 5", value: "https://images.unsplash.com/photo-1717386255767-52643970d483", photo: true },
  "photo.industries.hero": { group: "Photos", label: "Industries page header", value: "https://images.unsplash.com/photo-1629726797843-618688139f5a", photo: true },
  "photo.about.hero": { group: "Photos", label: "About page header", value: "https://images.unsplash.com/photo-1698752821934-28bd5ce6fd42", photo: true },
  "photo.about.band": { group: "Photos", label: "About page photo band", value: "https://images.unsplash.com/photo-1648135327756-b606e2eb8caa", photo: true },
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
    // Photo slots only accept web addresses served over https, or files uploaded to this site.
    if ((CONTENT_FIELDS as Record<string, Field>)[key].photo && value && !/^(https:\/\/|\/api\/files\?k=)/.test(value.trim())) continue;
    await run(
      "INSERT INTO content (key, value, updated_at) VALUES (?, ?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at",
      [key, value.slice(0, 5000), now],
    );
  }
}
