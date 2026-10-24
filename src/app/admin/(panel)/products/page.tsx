import Link from "next/link";
import { getProducts } from "@/lib/products";
import { STATUS_LABELS } from "@/lib/seed";
import { H1, fmtDate } from "@/components/admin/ui";

export default async function AdminProducts() {
  const products = await getProducts();
  return (
    <>
      <H1 sub="Edit specifications, development status, imagery, 3D models and datasheets.">Products</H1>
      <ul className="grid gap-3 md:grid-cols-3">
        {products.map((p) => (
          <li key={p.id}>
            <Link href={`/admin/products/${p.id}`} className="block rounded-2xl border border-line bg-graphite p-6 hover:border-cyan">
              <p className="font-display text-4xl tracking-tight">{p.currentRating} A</p>
              <p className="mt-2 font-display">{p.name}</p>
              <p className="mt-1 text-sm text-warn">{STATUS_LABELS[p.status]}</p>
              <p className="mt-4 text-xs text-steel">Updated {fmtDate(p.updatedAt)}</p>
              <p className="mt-2 text-xs text-steel">
                {[p.imageUrl && "Image", p.modelUrl && "3D model", p.datasheetUrl && "Datasheet"].filter(Boolean).join(", ") || "No uploaded assets"}
              </p>
            </Link>
          </li>
        ))}
      </ul>
    </>
  );
}
