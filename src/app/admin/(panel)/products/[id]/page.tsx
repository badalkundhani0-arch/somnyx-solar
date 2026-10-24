import Link from "next/link";
import { notFound } from "next/navigation";
import { getProduct } from "@/lib/products";
import { saveProduct } from "@/app/admin/actions";
import { STATUS_LABELS, STATUS_ORDER } from "@/lib/seed";
import { H1, Saved } from "@/components/admin/ui";
import { SpecEditor } from "@/components/admin/SpecEditor";
import { AssetUploader } from "@/components/admin/AssetUploader";
import { storageMode } from "@/lib/storage";

export default async function EditProduct({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ saved?: string }> }) {
  const [{ id }, sp] = await Promise.all([params, searchParams]);
  const p = await getProduct(id);
  if (!p) notFound();
  const mode = storageMode();
  return (
    <>
      <Link href="/admin/products" className="text-sm text-silver hover:text-white">All products</Link>
      <div className="mt-3 flex flex-wrap items-start justify-between gap-4">
        <H1 sub={`Code ${p.code}, ${p.currentRating} A. Code and rating are fixed identifiers.`}>{p.name}</H1>
        <Link href={`/products/${p.id}`} target="_blank" className="btn btn-ghost btn-sm">View on website</Link>
      </div>
      <Saved show={sp.saved === "1"} />
      <div className="grid gap-10 xl:grid-cols-[1.5fr_1fr]">
        <form action={saveProduct.bind(null, p.id)} className="space-y-6">
          <div className="grid gap-5 md:grid-cols-2">
            <div>
              <label className="field-label" htmlFor="name">Display name</label>
              <input id="name" name="name" defaultValue={p.name} required className="field" />
            </div>
            <div>
              <label className="field-label" htmlFor="tagline">Short description</label>
              <input id="tagline" name="tagline" defaultValue={p.tagline} className="field" />
            </div>
          </div>
          <div>
            <label className="field-label" htmlFor="summary">Summary</label>
            <textarea id="summary" name="summary" rows={4} defaultValue={p.summary} className="field" />
          </div>
          <div className="grid gap-5 md:grid-cols-2">
            <div>
              <label className="field-label" htmlFor="status">Development status</label>
              <select id="status" name="status" defaultValue={p.status} className="field">
                {STATUS_ORDER.map((s) => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
              </select>
              <p className="mt-1.5 text-xs text-steel">Choose &ldquo;Available for supply&rdquo; only when the product is certified and released.</p>
            </div>
            <div>
              <label className="field-label" htmlFor="statusNote">Status disclosure shown on the product page</label>
              <textarea id="statusNote" name="statusNote" rows={3} defaultValue={p.statusNote} className="field" />
            </div>
          </div>
          <div>
            <p className="field-label">Specifications</p>
            <SpecEditor initial={p.specs} />
          </div>
          <button className="btn btn-primary">Save product</button>
        </form>
        <div className="space-y-4">
          <AssetUploader productId={p.id} target="product-image" label="Product image" help="Approved photography or render. PNG, JPG, WebP or AVIF, up to 8 MB." current={p.imageUrl} accept=".png,.jpg,.jpeg,.webp,.avif" kind="images" mode={mode} />
          <AssetUploader productId={p.id} target="product-model" label="3D model (GLB)" help="Replaces the conceptual model. Name nodes after part ids to keep the exploded view working (see README)." current={p.modelUrl} accept=".glb" kind="models" mode={mode} />
          <AssetUploader productId={p.id} target="product-datasheet" label="Datasheet (PDF)" help="Shown on the product page and in Technical Resources." current={p.datasheetUrl} accept=".pdf" kind="datasheets" mode={mode} />
        </div>
      </div>
    </>
  );
}
