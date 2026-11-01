import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/brand";
import { getProducts } from "@/lib/products";
import { ARTICLES } from "@/lib/insights";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const pages = ["", "/products", "/technology", "/manufacturing", "/industries", "/about", "/request-quote", "/contact", "/resources", "/quality", "/insights", "/faq", "/careers", "/privacy", "/terms"];
  let products: { id: string; updatedAt: string }[] = [];
  try {
    products = await getProducts();
  } catch {}
  return [
    ...pages.map((p) => ({ url: `${SITE_URL}${p}`, lastModified: now, changeFrequency: "monthly" as const, priority: p === "" ? 1 : 0.7 })),
    ...ARTICLES.map((a) => ({ url: `${SITE_URL}/insights/${a.slug}`, lastModified: new Date(a.date), changeFrequency: "yearly" as const, priority: 0.6 })),
    ...products.map((p) => ({ url: `${SITE_URL}/products/${p.id}`, lastModified: new Date(p.updatedAt || now), changeFrequency: "monthly" as const, priority: 0.8 })),
  ];
}
