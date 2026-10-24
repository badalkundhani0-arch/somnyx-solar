import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/brand";
import { getProducts } from "@/lib/products";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const pages = ["", "/products", "/technology", "/manufacturing", "/industries", "/about", "/request-quote", "/contact", "/resources", "/privacy", "/terms"];
  let products: { id: string; updatedAt: string }[] = [];
  try {
    products = await getProducts();
  } catch {}
  return [
    ...pages.map((p) => ({ url: `${SITE_URL}${p}`, lastModified: now, changeFrequency: "monthly" as const, priority: p === "" ? 1 : 0.7 })),
    ...products.map((p) => ({ url: `${SITE_URL}/products/${p.id}`, lastModified: new Date(p.updatedAt || now), changeFrequency: "monthly" as const, priority: 0.8 })),
  ];
}
