import "server-only";
import { cache } from "react";
import { query, run } from "./db";
import type { ProductStatus, Spec } from "./seed";

export type Product = {
  id: string;
  code: string;
  name: string;
  currentRating: number;
  tagline: string;
  summary: string;
  status: ProductStatus;
  statusNote: string;
  specs: Spec[];
  imageUrl: string | null;
  modelUrl: string | null;
  datasheetUrl: string | null;
  sortOrder: number;
  updatedAt: string;
};

type Row = Record<string, unknown>;

function map(r: Row): Product {
  let specs: Spec[] = [];
  try {
    specs = JSON.parse(String(r.specs ?? "[]"));
  } catch {}
  return {
    id: String(r.id),
    code: String(r.code),
    name: String(r.name),
    currentRating: Number(r.current_rating),
    tagline: String(r.tagline ?? ""),
    summary: String(r.summary ?? ""),
    status: String(r.status) as ProductStatus,
    statusNote: String(r.status_note ?? ""),
    specs,
    imageUrl: (r.image_url as string) || null,
    modelUrl: (r.model_url as string) || null,
    datasheetUrl: (r.datasheet_url as string) || null,
    sortOrder: Number(r.sort_order ?? 0),
    updatedAt: String(r.updated_at ?? ""),
  };
}

export const getProducts = cache(async (): Promise<Product[]> => {
  const rows = await query("SELECT * FROM products ORDER BY sort_order, current_rating");
  return rows.map(map);
});

export const getProduct = cache(async (id: string): Promise<Product | null> => {
  const rows = await query("SELECT * FROM products WHERE id = ?", [id]);
  return rows[0] ? map(rows[0]) : null;
});

export async function updateProduct(id: string, p: Partial<Omit<Product, "id" | "updatedAt">>) {
  const cur = await getProduct(id);
  if (!cur) throw new Error("Product not found");
  const n = { ...cur, ...p };
  await run(
    `UPDATE products SET name=?, tagline=?, summary=?, status=?, status_note=?, specs=?, image_url=?, model_url=?, datasheet_url=?, updated_at=? WHERE id=?`,
    [n.name, n.tagline, n.summary, n.status, n.statusNote, JSON.stringify(n.specs), n.imageUrl, n.modelUrl, n.datasheetUrl, new Date().toISOString(), id],
  );
}
